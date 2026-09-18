import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { generateToken, hashToken } from "../auth/tokens.js";
import { sendPlacementReminderEmail } from "../auth/mailer.js";
import { submitAttemptSchema } from "./schemas.js";
import { gradeAttempt } from "./grading.js";
import { computeFluencySignals, summarizeSpeakingDelivery, isTrulyCorrect } from "./fluencySignals.js";
import { scoreAudioFluency } from "./geminiFluency.js";
import {
  CEFR_LEVELS,
  cefrRank,
  percentToCefr,
  assessSkillLevel,
  passThresholdForLevel,
  START_LEVEL,
  stepLevel,
  type CefrLevel,
} from "./cefr.js";
import { buildRoadmap, type AccessDuration, type SkillTag } from "./roadmap.js";

const ALL_SKILLS: SkillTag[] = ["listening", "speaking", "reading", "writing"];

export const placementRouter = Router();

const REMINDER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// 20 questions total, same mix as before — only *how* each type's questions
// get chosen changed (see the adaptive selection block above): each type
// still contributes this many questions, but which specific ones depends on
// how the learner answers, not a fixed upfront easy/medium/hard spread.
// Reading (Read Aloud) is included now that AI grading covers it — before
// that, Reading was carried by Reading Comprehension alone (thinner than
// every other skill's coverage). Repeats, Short Answer, and Sentence Builds
// each gave up one slot to make room for it without growing the test. Story
// Retelling, Speaking Situations, Typing, and Summary and Opinion are still
// not used here — Read Aloud already overlaps them for listening/speaking
// signal, and every skill now has reasonable coverage without adding more
// types.
//
// Passage Reconstruction was swapped out for Reading Comprehension: its
// real Versant mechanic (read-then-recall-from-memory) has no single
// correct rewording, so it can no longer fill a "graded" slot — Reading
// Comprehension (MCQ) is the new stand-in.
const ITEMS_PER_TYPE: Record<string, number> = {
  reading: 3,
  repeats: 2,
  short_answer: 2,
  sentence_builds: 2,
  dictation: 3,
  sentence_completion: 3,
  reading_comprehension: 3,
  open_questions: 1,
  email_writing: 1,
};

// Read Aloud opens the test, same as the real Versant English Test, then
// the rest of the Speaking/Listening types, then the Writing-test types.
const TYPE_ORDER = [
  "reading",
  "repeats",
  "short_answer",
  "sentence_builds",
  "open_questions",
  "dictation",
  "sentence_completion",
  "reading_comprehension",
  "email_writing",
];

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "attempts");

// Picks `count` rows spread evenly across the sorted difficulty range,
// rather than an arbitrary subset — with count=2 this always lands near the
// easiest and the hardest available item. A pair of similar-difficulty
// items can't tell a true beginner from a true advanced speaker; a
// deliberate easy+hard spread can.
//
// Each target position is picked from a small window of similarly-difficult
// candidates around it, not the single closest item — otherwise every
// first-time learner gets the exact same 20 questions, which makes the test
// memorizable if people compare notes instead of a real measure of ability.
// The spread itself (still easy/medium/hard) stays intentional; only which
// specific item fills each slot varies.
const SPREAD_WINDOW = 3;

export function pickDifficultySpread<T extends { id: string; difficulty: string | null }>(rows: T[], count: number): T[] {
  if (rows.length <= count) return rows;
  const sorted = [...rows].sort((a, b) => Number(a.difficulty ?? 0.5) - Number(b.difficulty ?? 0.5));
  const picks: T[] = [];
  const seen = new Set<string>();
  const step = (sorted.length - 1) / Math.max(count - 1, 1);
  for (let i = 0; i < count; i++) {
    const target = Math.round(i * step);
    const lo = Math.max(0, target - Math.floor(SPREAD_WINDOW / 2));
    const hi = Math.min(sorted.length - 1, lo + SPREAD_WINDOW - 1);
    const candidates = sorted.slice(lo, hi + 1).filter((r) => !seen.has(r.id));
    const row = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : sorted[target];
    if (!seen.has(row.id)) {
      seen.add(row.id);
      picks.push(row);
    }
  }
  for (const row of sorted) {
    if (picks.length >= count) break;
    if (!seen.has(row.id)) {
      seen.add(row.id);
      picks.push(row);
    }
  }
  return picks;
}

// ---------------------------------------------------------------------------
// Adaptive item selection for the placement test itself. Instead of building
// all 20 questions upfront with a fixed easy/medium/hard spread per type,
// each type now climbs one level at a time: right answer -> next question in
// that type is one level harder; wrong (or skipped) -> one level easier.
// Once a type's budget (ITEMS_PER_TYPE) is used up, the next type in
// TYPE_ORDER starts fresh at START_LEVEL.
//
// Two things this fixes on its own, just from how it selects items:
// - It can never leave an untested gap in the middle of what it covers,
//   since it only ever asks about the level right next to the last answer
//   (see the "capped by gap" case in cefr.ts, which this makes far rarer).
// - Two learners who answer differently naturally get different questions,
//   without needing a separate randomization pass.
// ---------------------------------------------------------------------------

type ItemPoolRow = {
  id: string;
  item_type_id: string;
  content: unknown;
  difficulty: string | null;
  cefr_level: string | null;
  skills: string[];
  input_method: string;
  instruction_text: string;
  question_instruction: string;
  timer_seconds: number | null;
  two_phase_read_seconds: number | null;
  two_phase_write_seconds: number | null;
  previously_attempted: boolean;
};

async function fetchTypePool(userId: string, typeId: string): Promise<ItemPoolRow[]> {
  const result = await pool.query(
    `SELECT i.id, i.item_type_id, i.content, i.difficulty, i.cefr_level, it.skills, it.input_method, it.instruction_text, it.question_instruction, it.timer_seconds, it.two_phase_read_seconds, it.two_phase_write_seconds,
       EXISTS (
         SELECT 1 FROM attempts a JOIN sessions s ON s.id = a.session_id
         WHERE s.user_id = $1 AND a.item_id = i.id
       ) AS previously_attempted
     FROM items i
     JOIN item_types it ON it.id = i.item_type_id
     WHERE i.status = 'approved' AND i.item_type_id = $2`,
    [userId, typeId],
  );
  return result.rows;
}

// Nearest-level match from a type's pool, excluding ids already shown this
// session — prefers a learner's unseen items, and among equally-good
// candidates picks randomly rather than always the same one.
function pickAdaptiveItem(rowPool: ItemPoolRow[], targetLevel: CefrLevel, excludeIds: Set<string>): ItemPoolRow | null {
  const candidates = rowPool.filter((r) => !excludeIds.has(r.id));
  if (candidates.length === 0) return null;
  const targetRank = cefrRank(targetLevel);
  const ranked = candidates
    .map((r) => ({
      row: r,
      distance: Math.abs(cefrRank((r.cefr_level as CefrLevel) ?? START_LEVEL) - targetRank),
    }))
    .sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.row.previously_attempted !== b.row.previously_attempted) return a.row.previously_attempted ? 1 : -1;
      return Math.random() - 0.5;
    });
  const closestDistance = ranked[0].distance;
  const tied = ranked.filter((r) => r.distance === closestDistance && r.row.previously_attempted === ranked[0].row.previously_attempted);
  return tied[Math.floor(Math.random() * tied.length)].row;
}

// Finds the first available item for TYPE_ORDER[startIndex] or, if that
// type's pool is empty, the next type after it — returns null only if
// nothing at all is left, across every remaining type.
async function pickFirstItemFrom(
  userId: string,
  startIndex: number,
): Promise<{ typeIndex: number; item: ItemPoolRow } | null> {
  for (let i = startIndex; i < TYPE_ORDER.length; i++) {
    const typeId = TYPE_ORDER[i];
    const rows = await fetchTypePool(userId, typeId);
    const item = pickAdaptiveItem(rows, START_LEVEL, new Set());
    if (item) return { typeIndex: i, item };
  }
  return null;
}

interface AdaptiveComposition {
  history: string[];
  currentTypeIndex: number;
  perType: Record<string, { budget: number; shown: string[] }>;
  pendingItemId: string | null;
}

function toItemPayload(row: {
  id: string;
  item_type_id: string;
  content: unknown;
  skills: string[];
  input_method: string;
  instruction_text: string;
  question_instruction: string;
  timer_seconds: number | null;
  two_phase_read_seconds: number | null;
  two_phase_write_seconds: number | null;
}) {
  return {
    id: row.id,
    itemTypeId: row.item_type_id,
    content: row.content,
    skills: row.skills,
    inputMethod: row.input_method,
    instructionText: row.instruction_text,
    questionInstruction: row.question_instruction,
    timerSeconds: row.timer_seconds,
    twoPhaseReadSeconds: row.two_phase_read_seconds,
    twoPhaseWriteSeconds: row.two_phase_write_seconds,
  };
}

// Skipped outside production, same reasoning as the auth limiters — local
// testing shouldn't get locked out by the same cooldown a real learner would
// only hit from actually spamming this button.
const scheduleLaterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== "production",
  handler: (_req, res) => {
    res.status(429).json({ error: "too_many_attempts" });
  },
});

async function activeReminder(userId: string) {
  const result = await pool.query(
    `SELECT expires_at FROM placement_reminder_tokens
     WHERE user_id = $1 AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

placementRouter.post("/schedule-later", requireAuth, scheduleLaterLimiter, async (req: AuthedRequest, res, next) => {
  try {
    // Already scheduled and still within its window — don't send a second
    // email or reset the cooldown just because the button got clicked twice
    // (e.g. a double click, or the client's disabled state was stale).
    const existing = await activeReminder(req.user!.id);
    if (existing) {
      return res.json({ scheduledUntil: existing.expires_at });
    }

    const userResult = await pool.query("SELECT email FROM users WHERE id = $1", [req.user!.id]);
    const email = userResult.rows[0].email;

    const token = generateToken();
    const expiresAt = new Date(Date.now() + REMINDER_TTL_MS);
    await pool.query(
      `INSERT INTO placement_reminder_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [req.user!.id, hashToken(token), expiresAt],
    );

    sendPlacementReminderEmail(email, token).catch((err) =>
      console.error("failed to send placement reminder email:", err),
    );

    res.status(201).json({ scheduledUntil: expiresAt });
  } catch (err) {
    next(err);
  }
});

// Reconstructs the full question history for an in-progress or completed
// adaptive session, in the order questions were actually shown — used both
// to resume a session (page refresh, POST /session reuse) and by GET
// /session/:id. The last entry is the still-unanswered current question
// unless the session is complete.
async function buildHistoryResponse(sessionId: string, composition: AdaptiveComposition, completed: boolean) {
  const itemIds = composition.history;
  const itemsResult = await pool.query(
    `SELECT i.id, i.item_type_id, i.content, it.skills, it.input_method, it.instruction_text, it.question_instruction, it.timer_seconds, it.two_phase_read_seconds, it.two_phase_write_seconds
     FROM items i JOIN item_types it ON it.id = i.item_type_id
     WHERE i.id = ANY($1::uuid[])`,
    [itemIds],
  );
  const byId = new Map(itemsResult.rows.map((r) => [r.id, r]));
  const attemptsResult = await pool.query(`SELECT item_id, response_text FROM attempts WHERE session_id = $1`, [
    sessionId,
  ]);
  const attemptByItem = new Map(attemptsResult.rows.map((r) => [r.item_id, r.response_text]));

  return {
    sessionId,
    completed,
    items: itemIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((row) => ({
        ...toItemPayload(row!),
        attempted: attemptByItem.has(row!.id),
        responseText: attemptByItem.get(row!.id) ?? null,
      })),
  };
}

// Starting a session reuses any already-in-progress one for this user
// instead of minting a new item set every time — a page refresh or an
// accidental double-click shouldn't hand the learner a different, half-done
// test.
placementRouter.post("/session", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const existing = await pool.query(
      `SELECT id, composition FROM sessions
       WHERE user_id = $1 AND session_type = 'placement' AND completed_at IS NULL
       ORDER BY started_at DESC LIMIT 1`,
      [req.user!.id],
    );
    // A session started before the adaptive engine existed carries the old
    // `{ itemIds }` shape instead of `{ history, perType, ... }` — trying to
    // resume it would crash. There's no meaningful way to convert a
    // fixed-spread-in-progress session into an adaptive one, so it's marked
    // abandoned (no attempts are lost — those stay in the attempts table
    // regardless) and a fresh adaptive session starts instead.
    if (existing.rows[0] && Array.isArray(existing.rows[0].composition?.history)) {
      const response = await buildHistoryResponse(existing.rows[0].id, existing.rows[0].composition, false);
      return res.json(response);
    }
    if (existing.rows[0]) {
      await pool.query(`UPDATE sessions SET completed_at = now() WHERE id = $1`, [existing.rows[0].id]);
    }

    const first = await pickFirstItemFrom(req.user!.id, 0);
    if (!first) return res.status(500).json({ error: "no_items_available" });

    const composition: AdaptiveComposition = {
      history: [first.item.id],
      currentTypeIndex: first.typeIndex,
      perType: { [TYPE_ORDER[first.typeIndex]]: { budget: ITEMS_PER_TYPE[TYPE_ORDER[first.typeIndex]], shown: [first.item.id] } },
      pendingItemId: first.item.id,
    };
    const sessionResult = await pool.query(
      `INSERT INTO sessions (user_id, session_type, mode, composition)
       VALUES ($1, 'placement', 'exam', $2) RETURNING id`,
      [req.user!.id, JSON.stringify(composition)],
    );

    res.status(201).json({ sessionId: sessionResult.rows[0].id, items: [toItemPayload(first.item)] });
  } catch (err) {
    next(err);
  }
});

placementRouter.get("/session/:sessionId", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const sessionResult = await pool.query(
      `SELECT id, composition, completed_at FROM sessions WHERE id = $1 AND user_id = $2`,
      [req.params.sessionId, req.user!.id],
    );
    const session = sessionResult.rows[0];
    if (!session) return res.status(404).json({ error: "session_not_found" });
    if (!Array.isArray(session.composition?.history)) {
      return res.status(410).json({ error: "session_predates_adaptive_engine" });
    }

    const response = await buildHistoryResponse(session.id, session.composition, !!session.completed_at);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

placementRouter.post("/session/:sessionId/attempts", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = submitAttemptSchema.parse(req.body);

    const sessionResult = await pool.query(`SELECT id, composition, completed_at FROM sessions WHERE id = $1 AND user_id = $2`, [
      req.params.sessionId,
      req.user!.id,
    ]);
    const session = sessionResult.rows[0];
    if (!session) return res.status(404).json({ error: "session_not_found" });
    if (session.completed_at) return res.status(409).json({ error: "session_already_completed" });
    if (!Array.isArray(session.composition?.history)) {
      return res.status(410).json({ error: "session_predates_adaptive_engine" });
    }

    const composition = session.composition as AdaptiveComposition;
    // The adaptive engine only ever has one live question at a time — this
    // guards against a stale client submitting for a question that isn't
    // (or is no longer) the one actually pending.
    if (composition.pendingItemId !== body.itemId) {
      return res.status(409).json({ error: "not_the_current_item" });
    }

    const itemResult = await pool.query(
      `SELECT i.item_type_id, i.answer_set, i.content, i.cefr_level, it.min_words, it.input_method
       FROM items i JOIN item_types it ON it.id = i.item_type_id
       WHERE i.id = $1`,
      [body.itemId],
    );
    const item = itemResult.rows[0];
    if (!item) return res.status(404).json({ error: "item_not_found" });

    // Guards against a duplicate network retry of the same submission —
    // the adaptive flow never intentionally resubmits an already-answered
    // question (there's no "Back"), but a retry shouldn't double-count.
    const priorResult = await pool.query(
      `SELECT id, response_uri FROM attempts WHERE session_id = $1 AND item_id = $2`,
      [session.id, body.itemId],
    );
    const prior = priorResult.rows[0];
    if (prior) {
      await pool.query(`DELETE FROM attempts WHERE id = $1`, [prior.id]);
      if (prior.response_uri) {
        const fileName = path.basename(prior.response_uri);
        await unlink(path.join(UPLOADS_DIR, fileName)).catch(() => {
          // best-effort cleanup — a missing file isn't worth failing the resubmit over
        });
      }
    }

    let responseUri: string | null = null;
    if (body.audioBase64) {
      await mkdir(UPLOADS_DIR, { recursive: true });
      const ext = body.audioMimeType?.includes("mp4") ? "m4a" : "webm";
      const fileName = `${randomUUID()}.${ext}`;
      await writeFile(path.join(UPLOADS_DIR, fileName), Buffer.from(body.audioBase64, "base64"));
      responseUri = `/uploads/attempts/${fileName}`;
    }

    // The recording (if any) is still saved above for playback/human
    // review, but grading itself runs on the transcript only — Claude's API
    // has no audio input, so unlike before, it can't listen to the actual
    // recording (see aiGrading.ts).
    const grade = await gradeAttempt(
      item.item_type_id,
      item.answer_set,
      item.content,
      item.cefr_level,
      item.min_words,
      body.responseText,
    );
    const responseText = body.responseText ?? null;

    const attemptResult = await pool.query(
      `INSERT INTO attempts (session_id, item_id, window_start_at, submitted_at, response_uri, response_text)
       VALUES ($1, $2, now(), now(), $3, $4) RETURNING id`,
      [session.id, body.itemId, responseUri, responseText],
    );
    const attemptId = attemptResult.rows[0].id;

    const modelVersion =
      grade.method === "ai-text" ? "gemini-3.5-flash-lite-v1" : grade.method === "text-diff" ? "text-diff-v1" : "exact-match-v1";

    // Free fluency signals (speech rate, filler words) — computed from the
    // transcript and recording length alone, no AI, no cost. Separate from
    // content_score entirely: this describes how a spoken answer was
    // delivered, not whether it was correct. Only meaningful for mic
    // answers that actually produced a transcript.
    const freeSignals =
      item.input_method === "mic" && responseText
        ? computeFluencySignals(responseText, body.durationMs)
        : null;

    // Real pronunciation/fluency scoring, from actually listening to the
    // recording — the thing Claude cannot do at all. Only attempted when
    // there's both a recording and a GEMINI_API_KEY configured; fails
    // closed (see geminiFluency.ts), so a quota limit or network error just
    // means this field is absent, never a broken submission.
    const geminiScores =
      item.input_method === "mic" && body.audioBase64
        ? await scoreAudioFluency(body.audioBase64, body.audioMimeType ?? "audio/webm", item.cefr_level)
        : null;

    const mannerScores = freeSignals || geminiScores ? { ...freeSignals, gemini: geminiScores ?? undefined } : null;

    await pool.query(
      `INSERT INTO scores (attempt_id, content_score, manner_scores, status, model_version) VALUES ($1, $2, $3, $4, $5)`,
      [attemptId, grade.score, mannerScores ? JSON.stringify(mannerScores) : null, grade.status, modelVersion],
    );

    // --- Adaptive step: pick what comes next ---
    // A skip or a failed-grading attempt gets treated the same as "wrong"
    // for stepping purposes — there's no evidence they cleared this level,
    // so the next question in this type steps down, same as a real miss.
    // For a mic answer, "correct" now also requires pronunciation, fluency,
    // and pace to clear the bar (when we actually measured them) — see
    // isTrulyCorrect in fluencySignals.ts for the full reasoning.
    const wasCorrect = isTrulyCorrect(grade.score, item.cefr_level, item.input_method, mannerScores, passThresholdForLevel);
    const currentType = item.item_type_id as string;
    const typeState = composition.perType[currentType];
    let nextItem: ItemPoolRow | null = null;

    if (typeState.shown.length < typeState.budget) {
      const nextLevel = stepLevel((item.cefr_level as CefrLevel) ?? START_LEVEL, wasCorrect);
      const rows = await fetchTypePool(req.user!.id, currentType);
      nextItem = pickAdaptiveItem(rows, nextLevel, new Set(typeState.shown));
    }

    if (nextItem) {
      typeState.shown.push(nextItem.id);
      composition.history.push(nextItem.id);
      composition.pendingItemId = nextItem.id;
    } else {
      // This type's budget is used up (or its pool unexpectedly ran dry) —
      // move on to the next type that still has items available.
      const next = await pickFirstItemFrom(req.user!.id, composition.currentTypeIndex + 1);
      if (next) {
        composition.currentTypeIndex = next.typeIndex;
        composition.perType[TYPE_ORDER[next.typeIndex]] = {
          budget: ITEMS_PER_TYPE[TYPE_ORDER[next.typeIndex]],
          shown: [next.item.id],
        };
        composition.history.push(next.item.id);
        composition.pendingItemId = next.item.id;
        nextItem = next.item;
      } else {
        // Nothing left anywhere — the test is done.
        composition.pendingItemId = null;
      }
    }

    await pool.query(`UPDATE sessions SET composition = $1 WHERE id = $2`, [JSON.stringify(composition), session.id]);

    res.status(201).json({
      attemptId,
      status: grade.status,
      correct: grade.status === "scored" ? wasCorrect : grade.correct,
      // null means there's nothing left to ask — the frontend should call
      // /complete once it sees this instead of waiting on a fixed count.
      nextItem: nextItem ? toItemPayload(nextItem) : null,
    });
  } catch (err) {
    next(err);
  }
});

placementRouter.post("/session/:sessionId/complete", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const sessionResult = await pool.query(
      `UPDATE sessions SET completed_at = now() WHERE id = $1 AND user_id = $2 AND completed_at IS NULL RETURNING id`,
      [req.params.sessionId, req.user!.id],
    );
    if (!sessionResult.rows[0]) return res.status(404).json({ error: "session_not_found_or_already_completed" });

    const summaryResult = await pool.query(
      `SELECT sc.status, sc.content_score, sc.manner_scores, it.skills, it.input_method, i.cefr_level
       FROM attempts a
       JOIN scores sc ON sc.attempt_id = a.id
       JOIN items i ON i.id = a.item_id
       JOIN item_types it ON it.id = i.item_type_id
       WHERE a.session_id = $1`,
      [req.params.sessionId],
    );
    const graded = summaryResult.rows.filter((r) => r.status === "scored");
    // pg returns `numeric` columns as strings, not JS numbers. Each row's own
    // level sets its own bar — C2 content demands far more than A1 does. For
    // a mic answer, "correct" also requires pronunciation/fluency/pace to
    // clear that same bar, when measured — see isTrulyCorrect.
    const correctCount = graded.filter((r) =>
      isTrulyCorrect(Number(r.content_score), r.cefr_level, r.input_method, r.manner_scores, passThresholdForLevel),
    ).length;
    const pendingCount = summaryResult.rows.filter((r) => r.status === "pending").length;
    // Distinct from pending: an answer WAS given and grading was actually
    // attempted, but the AI call itself broke (rate limit, network error) —
    // a temporary service problem, not "you didn't answer enough."
    const failedCount = summaryResult.rows.filter((r) => r.status === "failed").length;

    // Not enough evidence yet to estimate a level — every item is still
    // awaiting review (e.g. the item bank changed to be all open-ended).
    // The raw tally is still useful on its own, so return it without a
    // placement/roadmap rather than fail the request.
    if (graded.length === 0) {
      return res.json({ gradedCount: 0, correctCount: 0, pendingCount, failedCount });
    }

    const overallPercent = Math.round((correctCount / graded.length) * 100);

    // null means exactly what it says — this skill had zero graded questions
    // (skipped, or all still pending), so there is no evidence to report.
    // This used to silently fall back to the overall percentage, which
    // fabricated a plausible-looking score for a skill that was never
    // actually tested at all.
    const skillPercents = {} as Record<SkillTag, number | null>;
    // Each entry carries `cappedByGap` alongside the level itself — when
    // true, the percent above looks deceptively high next to a low level
    // only because there's a real testing gap behind it (see cefr.ts), and
    // the frontend needs to know that to explain it instead of just
    // displaying what looks like a contradiction.
    const skillLevels = {} as Record<SkillTag, { level: CefrLevel; cappedByGap: boolean } | null>;
    for (const skill of ALL_SKILLS) {
      const relevant = graded.filter((r) => (r.skills as string[]).includes(skill));
      if (relevant.length === 0) {
        skillPercents[skill] = null;
        skillLevels[skill] = null;
        continue;
      }
      const percent = Math.round(
        (relevant.filter((r) => isTrulyCorrect(Number(r.content_score), r.cefr_level, r.input_method, r.manner_scores, passThresholdForLevel)).length /
          relevant.length) *
          100,
      );
      skillPercents[skill] = percent;
      // The real assessment — per skill, the highest CEFR level the learner
      // actually sustained, from which difficulty of items they got right,
      // not just a flat percentage. Falls back to the percent-based estimate
      // only when items were answered but none carry a cefr_level tag yet.
      const assessed = assessSkillLevel(
        relevant.map((r) => ({
          cefrLevel: r.cefr_level,
          correct: isTrulyCorrect(Number(r.content_score), r.cefr_level, r.input_method, r.manner_scores, passThresholdForLevel),
        })),
      );
      skillLevels[skill] = { level: assessed.level ?? percentToCefr(percent), cappedByGap: assessed.cappedByGap };
    }

    // The headline level is assessed from every question the learner was
    // actually SHOWN, across all skills combined — not just the ones they
    // answered. A skipped question counts as a wrong answer here, the same
    // as a real mistake would — but only at a level where the learner
    // engaged with *something*. A level nobody attempted at all (every
    // single question at that difficulty was skipped) is genuinely
    // untested, not failed — the walk already treats an untested level as a
    // gap, and it should stay that way here too rather than reading as a
    // hard 0% that kills the whole climb before it can reach levels the
    // learner actually did well on. Skipping some questions at a level
    // you're otherwise engaging with still counts against you there, same
    // as before — this only excuses a level with zero real attempts.
    // (An AI grading *failure* is different — that's a service fault, not
    // the learner's fault, so it's left out of this entirely rather than
    // counted against them.)
    const gradedLevels = new Set(graded.map((r) => r.cefr_level));
    const skippedAsWrong = summaryResult.rows
      .filter((r) => r.status === "pending" && gradedLevels.has(r.cefr_level))
      .map((r) => ({ cefrLevel: r.cefr_level, correct: false }));
    const answeredEvidence = graded.map((r) => ({
      cefrLevel: r.cefr_level,
      correct: isTrulyCorrect(Number(r.content_score), r.cefr_level, r.input_method, r.manner_scores, passThresholdForLevel),
    }));
    const overallAssessment = assessSkillLevel([...answeredEvidence, ...skippedAsWrong]);
    // The fallback percentage (used only when the walk above finds no real
    // evidence to certify any level) also has to count skips as wrong, for
    // the same reason — otherwise a mostly-skipped test could still fall
    // back to a percentage computed only from the few questions answered.
    const overallPercentForLevel = Math.round((correctCount / (graded.length + pendingCount)) * 100);
    const cefrLevel: CefrLevel = overallAssessment.level ?? percentToCefr(overallPercentForLevel);
    const cefrCappedByGap = overallAssessment.cappedByGap;

    // buildRoadmap still needs a real number per skill to rank "weakest
    // first" for milestone ordering — an untested skill falls back to the
    // overall percent here (an internal ranking input only, never surfaced
    // to the learner as if it were a real per-skill score).
    const roadmapSkillPercents = {} as Record<SkillTag, number>;
    for (const skill of ALL_SKILLS) {
      roadmapSkillPercents[skill] = skillPercents[skill] ?? overallPercent;
    }

    await pool.query(
      `INSERT INTO placements (user_id, overall_percent, cefr_level, skill_percents, skill_levels) VALUES ($1, $2, $3, $4, $5)`,
      [req.user!.id, overallPercent, cefrLevel, JSON.stringify(skillPercents), JSON.stringify(skillLevels)],
    );

    const profileResult = await pool.query(
      `SELECT goal_level, exam_date, access_duration, daily_minutes_preference FROM participant_profiles WHERE user_id = $1`,
      [req.user!.id],
    );
    const profile = profileResult.rows[0] ?? {};
    const goalLevel: CefrLevel =
      profile.goal_level && profile.goal_level !== "unsure"
        ? profile.goal_level
        : CEFR_LEVELS[Math.min(cefrRank(cefrLevel) + 1, CEFR_LEVELS.length - 1)];

    const roadmap = buildRoadmap({
      assessedLevel: cefrLevel,
      goalLevel,
      examDate: profile.exam_date ? new Date(profile.exam_date).toISOString().slice(0, 10) : null,
      accessDuration: (profile.access_duration as AccessDuration) ?? "3months",
      dailyMinutesPreference: profile.daily_minutes_preference ?? 30,
      skillPercents: roadmapSkillPercents,
    });

    const roadmapResult = await pool.query(
      `INSERT INTO roadmaps (user_id, pace, minutes_per_day, total_hours_estimate) VALUES ($1, $2, $3, $4) RETURNING id`,
      [req.user!.id, roadmap.pace, roadmap.minutesPerDay, roadmap.totalHoursEstimate],
    );
    const roadmapId = roadmapResult.rows[0].id;

    for (const m of roadmap.milestones) {
      await pool.query(
        `INSERT INTO roadmap_milestones (roadmap_id, level, label, target_day_offset, focus_skill) VALUES ($1, $2, $3, $4, $5)`,
        [roadmapId, m.level, m.labelType, m.targetDayOffset, m.focusSkill],
      );
    }

    const speakingDelivery = summarizeSpeakingDelivery(graded.map((r) => r.manner_scores));

    res.json({
      gradedCount: graded.length,
      correctCount,
      pendingCount,
      failedCount,
      overallPercent,
      cefrLevel,
      cefrCappedByGap,
      skillPercents,
      skillLevels,
      goalLevel,
      speakingDelivery,
    });
  } catch (err) {
    next(err);
  }
});
