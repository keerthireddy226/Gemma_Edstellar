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
import { CEFR_LEVELS, cefrRank, percentToCefr, assessSkillLevel, type CefrLevel } from "./cefr.js";
import { buildRoadmap, type AccessDuration, type SkillTag } from "./roadmap.js";

const ALL_SKILLS: SkillTag[] = ["listening", "speaking", "reading", "writing"];

export const placementRouter = Router();

const REMINDER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// 20 questions total, weighted toward the types that actually get auto-
// graded (6 types x 3 = 18) plus one spontaneous-speech and one open-ended-
// writing item (the two most valuable open-ended Versant rounds, kept even
// though they don't score yet). Reading (Read Aloud), Story Retelling,
// Speaking Situations, Typing, and Summary and Opinion are available in the
// bank but not chosen for placement — all ungraded, and Read Aloud/Story
// Retelling overlap with Repeats/Open Questions for signal we can't yet
// grade either way.
//
// Passage Reconstruction was swapped out for Reading Comprehension: its
// real Versant mechanic (read-then-recall-from-memory) has no single
// correct rewording, so it can no longer fill a "graded" slot — Reading
// Comprehension (MCQ) is the new stand-in, and also keeps the Reading skill
// represented in placement at all (nothing else here carries it).
const ITEMS_PER_TYPE: Record<string, number> = {
  repeats: 3,
  short_answer: 3,
  sentence_builds: 3,
  dictation: 3,
  sentence_completion: 3,
  reading_comprehension: 3,
  open_questions: 1,
  email_writing: 1,
};

// Speaking/Listening types first (mirrors the Versant English Test), then
// the Writing-test types — same grouping as the content review doc.
const TYPE_ORDER = [
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
// rather than an arbitrary subset — with count=2 this always lands on the
// easiest and the hardest available item. A pair of similar-difficulty
// items can't tell a true beginner from a true advanced speaker; a
// deliberate easy+hard spread can.
export function pickDifficultySpread<T extends { id: string; difficulty: string | null }>(rows: T[], count: number): T[] {
  if (rows.length <= count) return rows;
  const sorted = [...rows].sort((a, b) => Number(a.difficulty ?? 0.5) - Number(b.difficulty ?? 0.5));
  const picks: T[] = [];
  const seen = new Set<string>();
  const step = (sorted.length - 1) / Math.max(count - 1, 1);
  for (let i = 0; i < count; i++) {
    const row = sorted[Math.round(i * step)];
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

async function selectSessionItems(userId: string) {
  const result = await pool.query(
    `SELECT i.id, i.item_type_id, i.content, i.difficulty, it.input_method, it.instruction_text, it.question_instruction, it.timer_seconds, it.two_phase_read_seconds, it.two_phase_write_seconds,
       EXISTS (
         SELECT 1 FROM attempts a JOIN sessions s ON s.id = a.session_id
         WHERE s.user_id = $1 AND a.item_id = i.id
       ) AS previously_attempted
     FROM items i
     JOIN item_types it ON it.id = i.item_type_id
     WHERE i.status = 'approved'
     ORDER BY i.item_type_id, i.difficulty ASC`,
    [userId],
  );

  const perType = new Map<string, (typeof result.rows)[number][]>();
  for (const row of result.rows) {
    const list = perType.get(row.item_type_id) ?? [];
    list.push(row);
    perType.set(row.item_type_id, list);
  }

  return TYPE_ORDER.flatMap((typeId) => {
    const rows = perType.get(typeId) ?? [];
    const count = ITEMS_PER_TYPE[typeId] ?? 0;
    // Prefer items this learner hasn't seen before; only fall back to
    // already-attempted ones once the unseen pool runs out (a thin bank
    // repeating rather than the session failing outright).
    const notAttempted = rows.filter((r) => !r.previously_attempted);
    const pool = notAttempted.length >= count ? notAttempted : rows;
    return pickDifficultySpread(pool, count);
  });
}

function toItemPayload(row: {
  id: string;
  item_type_id: string;
  content: unknown;
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
    if (existing.rows[0]) {
      const itemIds: string[] = existing.rows[0].composition?.itemIds ?? [];
      const itemsResult = await pool.query(
        `SELECT i.id, i.item_type_id, i.content, it.input_method, it.instruction_text, it.question_instruction, it.timer_seconds, it.two_phase_read_seconds, it.two_phase_write_seconds
         FROM items i JOIN item_types it ON it.id = i.item_type_id
         WHERE i.id = ANY($1::uuid[])`,
        [itemIds],
      );
      const byId = new Map(itemsResult.rows.map((r) => [r.id, r]));
      return res.json({
        sessionId: existing.rows[0].id,
        items: itemIds.map((id) => byId.get(id)).filter(Boolean).map(toItemPayload),
      });
    }

    const items = await selectSessionItems(req.user!.id);
    const sessionResult = await pool.query(
      `INSERT INTO sessions (user_id, session_type, mode, composition)
       VALUES ($1, 'placement', 'exam', $2) RETURNING id`,
      [req.user!.id, JSON.stringify({ itemIds: items.map((i) => i.id) })],
    );

    res.status(201).json({ sessionId: sessionResult.rows[0].id, items: items.map(toItemPayload) });
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

    const itemIds: string[] = session.composition?.itemIds ?? [];
    const itemsResult = await pool.query(
      `SELECT i.id, i.item_type_id, i.content, it.input_method, it.instruction_text, it.question_instruction, it.timer_seconds, it.two_phase_read_seconds, it.two_phase_write_seconds
       FROM items i JOIN item_types it ON it.id = i.item_type_id
       WHERE i.id = ANY($1::uuid[])`,
      [itemIds],
    );
    const byId = new Map(itemsResult.rows.map((r) => [r.id, r]));

    const attemptsResult = await pool.query(`SELECT item_id, response_text FROM attempts WHERE session_id = $1`, [
      session.id,
    ]);
    const attemptByItem = new Map(attemptsResult.rows.map((r) => [r.item_id, r.response_text]));

    res.json({
      sessionId: session.id,
      completed: !!session.completed_at,
      items: itemIds
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((row) => ({
          ...toItemPayload(row!),
          attempted: attemptByItem.has(row!.id),
          responseText: attemptByItem.get(row!.id) ?? null,
        })),
    });
  } catch (err) {
    next(err);
  }
});

placementRouter.post("/session/:sessionId/attempts", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = submitAttemptSchema.parse(req.body);

    const sessionResult = await pool.query(`SELECT id, completed_at FROM sessions WHERE id = $1 AND user_id = $2`, [
      req.params.sessionId,
      req.user!.id,
    ]);
    const session = sessionResult.rows[0];
    if (!session) return res.status(404).json({ error: "session_not_found" });
    if (session.completed_at) return res.status(409).json({ error: "session_already_completed" });

    const itemResult = await pool.query(`SELECT item_type_id, answer_set FROM items WHERE id = $1`, [body.itemId]);
    const item = itemResult.rows[0];
    if (!item) return res.status(404).json({ error: "item_not_found" });

    // Resubmitting the same item in this session (the learner went Back and
    // changed their answer) replaces the old attempt instead of stacking a
    // second one — otherwise the session summary would double-count it.
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

    const attemptResult = await pool.query(
      `INSERT INTO attempts (session_id, item_id, window_start_at, submitted_at, response_uri, response_text)
       VALUES ($1, $2, now(), now(), $3, $4) RETURNING id`,
      [session.id, body.itemId, responseUri, body.responseText ?? null],
    );
    const attemptId = attemptResult.rows[0].id;

    const grade = gradeAttempt(item.item_type_id, item.answer_set, body.responseText);
    await pool.query(
      `INSERT INTO scores (attempt_id, content_score, status, model_version) VALUES ($1, $2, $3, 'exact-match-v1')`,
      [attemptId, grade.correct === null ? null : grade.correct ? 1 : 0, grade.status],
    );

    res.status(201).json({ attemptId, status: grade.status, correct: grade.correct });
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
      `SELECT sc.status, sc.content_score, it.skills, i.cefr_level
       FROM attempts a
       JOIN scores sc ON sc.attempt_id = a.id
       JOIN items i ON i.id = a.item_id
       JOIN item_types it ON it.id = i.item_type_id
       WHERE a.session_id = $1`,
      [req.params.sessionId],
    );
    const graded = summaryResult.rows.filter((r) => r.status === "scored");
    // pg returns `numeric` columns as strings, not JS numbers.
    const correctCount = graded.filter((r) => Number(r.content_score) === 1).length;
    const pendingCount = summaryResult.rows.filter((r) => r.status === "pending").length;

    // Not enough evidence yet to estimate a level — every item is still
    // awaiting review (e.g. the item bank changed to be all open-ended).
    // The raw tally is still useful on its own, so return it without a
    // placement/roadmap rather than fail the request.
    if (graded.length === 0) {
      return res.json({ gradedCount: 0, correctCount: 0, pendingCount });
    }

    const overallPercent = Math.round((correctCount / graded.length) * 100);
    const cefrLevel = percentToCefr(overallPercent);

    const skillPercents = {} as Record<SkillTag, number>;
    // The real assessment — per skill, the highest CEFR level the learner
    // actually sustained, from which difficulty of items they got right,
    // not just a flat percentage. Falls back to the percent-based estimate
    // for a skill if none of its graded items carry a cefr_level tag yet.
    const skillLevels = {} as Record<SkillTag, CefrLevel>;
    for (const skill of ALL_SKILLS) {
      const relevant = graded.filter((r) => (r.skills as string[]).includes(skill));
      skillPercents[skill] =
        relevant.length > 0
          ? Math.round((relevant.filter((r) => Number(r.content_score) === 1).length / relevant.length) * 100)
          : overallPercent;
      const assessed = assessSkillLevel(
        relevant.map((r) => ({ cefrLevel: r.cefr_level, correct: Number(r.content_score) === 1 })),
      );
      skillLevels[skill] = assessed ?? percentToCefr(skillPercents[skill]);
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
      skillPercents,
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

    res.json({
      gradedCount: graded.length,
      correctCount,
      pendingCount,
      overallPercent,
      cefrLevel,
      skillPercents,
      skillLevels,
      goalLevel,
    });
  } catch (err) {
    next(err);
  }
});
