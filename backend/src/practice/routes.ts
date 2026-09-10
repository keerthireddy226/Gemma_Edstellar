import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { submitAttemptSchema } from "../placement/schemas.js";
import { gradeAttempt } from "../placement/grading.js";
import { passThresholdForLevel } from "../placement/cefr.js";
import { pickDifficultySpread } from "../placement/routes.js";
import type { SkillTag } from "../placement/roadmap.js";

export const practiceRouter = Router();

const ALL_SKILLS: SkillTag[] = ["listening", "speaking", "reading", "writing"];
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "attempts");
const MIN_ITEMS = 1;
// Generous ceiling — selectPracticeItems already caps the actual result to
// however many items are available for that skill, so this just needs to
// comfortably cover a high daily-minutes preference without erroring.
const MAX_ITEMS = 40;
// A whole-skill session spread across every item type for that skill —
// kept short (not the old 8) since a "Start Practice" click otherwise reads
// as a long same-feeling grind (e.g. 8 listening drills back to back).
const DEFAULT_ITEMS = 5;
// A single-type task from the Dashboard's "Today's Tasks" checklist — quick
// enough to feel like one bite-sized item, not a full session.
const DEFAULT_TASK_ITEMS = 3;

const startSessionSchema = z.object({
  skill: z.enum(["listening", "speaking", "reading", "writing"]),
  count: z.number().int().min(MIN_ITEMS).max(MAX_ITEMS).optional(),
  // When set, the session pulls only from this one item type instead of
  // spreading across every type that carries the skill — used by a single
  // "Today's Tasks" row so clicking one task practices just that exercise.
  itemTypeId: z.string().optional(),
});

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

// Draws `count` items for one skill from the practice pool, spread across
// the item types that carry that skill (not just one type) and across
// difficulty within each type, preferring items this learner hasn't done
// yet — same "prefer unseen, fall back once the pool runs out" rule as
// placement selection, but scoped to practice sessions/items only so it
// doesn't interact with placement-test history at all.
async function selectPracticeItems(userId: string, skill: SkillTag, count: number, itemTypeId?: string) {
  const result = await pool.query(
    `SELECT i.id, i.item_type_id, i.content, i.difficulty, it.input_method, it.instruction_text, it.question_instruction, it.timer_seconds, it.two_phase_read_seconds, it.two_phase_write_seconds,
       EXISTS (
         SELECT 1 FROM attempts a JOIN sessions s ON s.id = a.session_id
         WHERE s.user_id = $1 AND a.item_id = i.id AND s.session_type = 'practice'
       ) AS previously_attempted
     FROM items i
     JOIN item_types it ON it.id = i.item_type_id
     WHERE i.status = 'approved' AND i.pool = 'practice' AND $2 = ANY(it.skills)
       AND ($3::text IS NULL OR i.item_type_id = $3)
     ORDER BY i.item_type_id, i.difficulty ASC`,
    [userId, skill, itemTypeId ?? null],
  );

  const perType = new Map<string, (typeof result.rows)[number][]>();
  for (const row of result.rows) {
    const list = perType.get(row.item_type_id) ?? [];
    list.push(row);
    perType.set(row.item_type_id, list);
  }
  const types = [...perType.keys()];
  if (types.length === 0) return [];

  // Spread `count` as evenly as possible across the types that carry this
  // skill, capped per type by how many items that type actually has.
  const picksPerType = new Map<string, number>();
  let assigned = 0;
  const base = Math.floor(count / types.length);
  let remainder = count % types.length;
  for (const type of types) {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder--;
    const want = Math.min(base + extra, perType.get(type)!.length);
    picksPerType.set(type, want);
    assigned += want;
  }
  // Some types were capped below their fair share — hand the shortfall to
  // any type that still has room, so a thin type doesn't shrink the session.
  let leftover = count - assigned;
  for (const type of types) {
    if (leftover <= 0) break;
    const cur = picksPerType.get(type)!;
    const room = perType.get(type)!.length - cur;
    const add = Math.min(leftover, room);
    if (add > 0) {
      picksPerType.set(type, cur + add);
      leftover -= add;
    }
  }

  const selected: (typeof result.rows)[number][] = [];
  for (const type of types) {
    const n = picksPerType.get(type) ?? 0;
    if (n === 0) continue;
    const rows = perType.get(type)!;
    const notAttempted = rows.filter((r) => !r.previously_attempted);
    const pool = notAttempted.length >= n ? notAttempted : rows;
    selected.push(...pickDifficultySpread(pool, n));
  }
  return selected;
}

// Per-skill total/remaining unattempted counts in the practice pool — lets
// the Modules skill picker and the Dashboard's Today's Plan card show real
// content depth instead of assuming a bottomless supply.
practiceRouter.get("/availability", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT unnest(it.skills) AS skill, count(DISTINCT i.id) AS total,
         count(DISTINCT a.item_id) FILTER (WHERE a.item_id IS NOT NULL) AS attempted
       FROM items i
       JOIN item_types it ON it.id = i.item_type_id
       LEFT JOIN attempts a ON a.item_id = i.id
         AND a.session_id IN (SELECT id FROM sessions WHERE user_id = $1 AND session_type = 'practice')
       WHERE i.status = 'approved' AND i.pool = 'practice'
       GROUP BY skill`,
      [req.user!.id],
    );
    const bySkill = new Map(result.rows.map((r) => [r.skill, r]));
    const availability = ALL_SKILLS.map((skill) => {
      const row = bySkill.get(skill);
      const total = row ? Number(row.total) : 0;
      const attempted = row ? Number(row.attempted) : 0;
      return { skill, total, remaining: Math.max(0, total - attempted) };
    });
    res.json({ availability });
  } catch (err) {
    next(err);
  }
});

// Starting a practice session reuses any already-in-progress session for
// the same skill instead of minting a new item set — a page refresh
// shouldn't hand the learner a different half-done set.
practiceRouter.post("/session", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = startSessionSchema.parse(req.body);
    const count = body.count ?? (body.itemTypeId ? DEFAULT_TASK_ITEMS : DEFAULT_ITEMS);

    const existing = await pool.query(
      `SELECT id, composition FROM sessions
       WHERE user_id = $1 AND session_type = 'practice' AND completed_at IS NULL
         AND composition->>'skill' = $2
         AND composition->>'itemTypeId' IS NOT DISTINCT FROM $3
       ORDER BY started_at DESC LIMIT 1`,
      [req.user!.id, body.skill, body.itemTypeId ?? null],
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
        skill: body.skill,
        items: itemIds.map((id) => byId.get(id)).filter(Boolean).map(toItemPayload),
      });
    }

    const items = await selectPracticeItems(req.user!.id, body.skill, count, body.itemTypeId);
    if (items.length === 0) {
      return res.status(404).json({ error: "no_practice_items_available" });
    }

    const sessionResult = await pool.query(
      `INSERT INTO sessions (user_id, session_type, mode, composition)
       VALUES ($1, 'practice', 'coach', $2) RETURNING id`,
      [req.user!.id, JSON.stringify({ skill: body.skill, itemTypeId: body.itemTypeId ?? null, itemIds: items.map((i) => i.id) })],
    );

    res.status(201).json({ sessionId: sessionResult.rows[0].id, skill: body.skill, items: items.map(toItemPayload) });
  } catch (err) {
    next(err);
  }
});

practiceRouter.get("/session/:sessionId", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const sessionResult = await pool.query(
      `SELECT id, composition, completed_at FROM sessions WHERE id = $1 AND user_id = $2 AND session_type = 'practice'`,
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
      skill: session.composition?.skill ?? null,
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

practiceRouter.post("/session/:sessionId/attempts", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = submitAttemptSchema.parse(req.body);

    const sessionResult = await pool.query(
      `SELECT id, completed_at FROM sessions WHERE id = $1 AND user_id = $2 AND session_type = 'practice'`,
      [req.params.sessionId, req.user!.id],
    );
    const session = sessionResult.rows[0];
    if (!session) return res.status(404).json({ error: "session_not_found" });
    if (session.completed_at) return res.status(409).json({ error: "session_already_completed" });

    const itemResult = await pool.query(
      `SELECT i.item_type_id, i.answer_set, i.content, i.cefr_level, it.min_words
       FROM items i JOIN item_types it ON it.id = i.item_type_id
       WHERE i.id = $1`,
      [body.itemId],
    );
    const item = itemResult.rows[0];
    if (!item) return res.status(404).json({ error: "item_not_found" });

    // Resubmitting the same item in this session replaces the old attempt
    // instead of stacking a second one, same as placement.
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

    // Spoken item types are graded straight from the recording (see
    // grading.ts) — that call already has to listen to the audio, so it
    // returns its own transcript too, which is the authoritative one to
    // store (more reliable than the browser's own live-guess transcript).
    const grade = await gradeAttempt(
      item.item_type_id,
      item.answer_set,
      item.content,
      item.cefr_level,
      item.min_words,
      body.responseText,
      body.audioBase64,
      body.audioMimeType,
    );
    const responseText = grade.transcript ?? body.responseText ?? null;

    const attemptResult = await pool.query(
      `INSERT INTO attempts (session_id, item_id, window_start_at, submitted_at, response_uri, response_text)
       VALUES ($1, $2, now(), now(), $3, $4) RETURNING id`,
      [session.id, body.itemId, responseUri, responseText],
    );
    const attemptId = attemptResult.rows[0].id;

    const modelVersion =
      grade.method === "audio-rubric"
        ? "gemini-3.6-flash-audio-v1"
        : grade.method === "ai-rubric"
          ? "gemini-3.6-flash-v1"
          : grade.method === "text-diff"
            ? "text-diff-v1"
            : "exact-match-v1";
    await pool.query(
      `INSERT INTO scores (attempt_id, content_score, status, model_version) VALUES ($1, $2, $3, $4)`,
      [attemptId, grade.score, grade.status, modelVersion],
    );

    res.status(201).json({ attemptId, status: grade.status, correct: grade.correct });
  } catch (err) {
    next(err);
  }
});

// Unlike placement, completing a practice session never writes a placement
// or roadmap row — it's just a tally of how this set went.
practiceRouter.post("/session/:sessionId/complete", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const sessionResult = await pool.query(
      `UPDATE sessions SET completed_at = now()
       WHERE id = $1 AND user_id = $2 AND session_type = 'practice' AND completed_at IS NULL
       RETURNING id`,
      [req.params.sessionId, req.user!.id],
    );
    if (!sessionResult.rows[0]) return res.status(404).json({ error: "session_not_found_or_already_completed" });

    const summaryResult = await pool.query(
      `SELECT sc.status, sc.content_score, i.cefr_level
       FROM attempts a
       JOIN scores sc ON sc.attempt_id = a.id
       JOIN items i ON i.id = a.item_id
       WHERE a.session_id = $1`,
      [req.params.sessionId],
    );
    const graded = summaryResult.rows.filter((r) => r.status === "scored");
    const correctCount = graded.filter((r) => Number(r.content_score) >= passThresholdForLevel(r.cefr_level)).length;
    const pendingCount = summaryResult.rows.filter((r) => r.status === "pending").length;
    // Distinct from pending: an answer was given and grading was attempted,
    // but the AI call itself failed (rate limit, network error) — a
    // temporary service problem, not "you didn't answer enough."
    const failedCount = summaryResult.rows.filter((r) => r.status === "failed").length;

    res.json({ gradedCount: graded.length, correctCount, pendingCount, failedCount });
  } catch (err) {
    next(err);
  }
});
