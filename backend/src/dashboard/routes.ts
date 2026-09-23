import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { isTrulyCorrect } from "../placement/fluencySignals.js";
import { passThresholdForLevel } from "../placement/cefr.js";

export const dashboardRouter = Router();

type SkillTag = "listening" | "speaking" | "reading" | "writing";
const ALL_SKILLS: SkillTag[] = ["listening", "speaking", "reading", "writing"];
// Ceiling on how many items of one skill get suggested for a single day —
// otherwise a big level gap + tight deadline can inflate minutesPerDay
// enough to ask for a long, repetitive same-skill grind in one sitting.
const MAX_ITEMS_PER_SKILL_PER_DAY = 8;

// Weaker skills get proportionally more of today's practice time — same
// "practice your weakest skill first" idea the roadmap milestones use.
// Floored at 5 so a skill already at 100% still gets a token amount of
// upkeep practice rather than disappearing from today's plan entirely.
function computeSkillWeights(skillPercents: Record<SkillTag, number>): Record<SkillTag, number> {
  const inverse = ALL_SKILLS.map((s) => Math.max(100 - (skillPercents[s] ?? 0), 5));
  const total = inverse.reduce((a, b) => a + b, 0);
  const weights = {} as Record<SkillTag, number>;
  ALL_SKILLS.forEach((s, i) => {
    weights[s] = inverse[i] / total;
  });
  return weights;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Longest run of consecutive calendar days (ending today or yesterday —
// today's practice may not have happened yet) with at least one completed
// practice session.
function computeStreakDays(completedDates: string[]): number {
  const days = new Set(completedDates);
  const today = new Date();
  let cursor = dayKey(today);
  if (!days.has(cursor)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    cursor = dayKey(yesterday);
    if (!days.has(cursor)) return 0;
  }
  let streak = 0;
  const d = new Date(cursor);
  while (days.has(dayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

dashboardRouter.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const placementResult = await pool.query(
      `SELECT skill_percents, cefr_level FROM placements WHERE user_id = $1 ORDER BY taken_at DESC LIMIT 1`,
      [req.user!.id],
    );
    const placement = placementResult.rows[0];

    const profileResult = await pool.query(
      `SELECT daily_minutes_preference, assessment_scheduled_for, access_window_start_date
       FROM participant_profiles WHERE user_id = $1`,
      [req.user!.id],
    );
    const profile = profileResult.rows[0] ?? {};

    if (!placement) {
      return res.status(404).json({
        error: "no_placement_yet",
        assessmentScheduledFor: profile.assessment_scheduled_for ?? null,
      });
    }

    const userResult = await pool.query(`SELECT first_name FROM users WHERE id = $1`, [req.user!.id]);

    // The roadmap already folds "time to prepare" (days until the access
    // window/exam runs out) and "level gap" (current vs. goal CEFR level)
    // into a single minutes-per-day figure — reuse it here instead of a
    // second, competing formula, and reuse the same milestone-based
    // "current focus skill" the Roadmap page shows, so the two pages never
    // disagree about what today should be about.
    const roadmapResult = await pool.query(
      `SELECT id, minutes_per_day FROM roadmaps WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 1`,
      [req.user!.id],
    );
    const roadmap = roadmapResult.rows[0];
    let minutesPerDay = profile.daily_minutes_preference ?? 30;
    let startSkill: SkillTag = ALL_SKILLS.reduce((weakest, s) =>
      (placement.skill_percents[s] ?? 0) < (placement.skill_percents[weakest] ?? 0) ? s : weakest,
    );

    if (roadmap) {
      minutesPerDay = roadmap.minutes_per_day;
      const milestonesResult = await pool.query(
        `SELECT target_day_offset, focus_skill FROM roadmap_milestones WHERE roadmap_id = $1 ORDER BY target_day_offset ASC`,
        [roadmap.id],
      );
      const daysSinceStart = profile.access_window_start_date
        ? Math.round((Date.now() - new Date(profile.access_window_start_date).getTime()) / 86_400_000)
        : 0;
      const milestones = milestonesResult.rows;
      const currentMilestone =
        milestones.find((m) => m.target_day_offset >= daysSinceStart) ?? milestones[milestones.length - 1];
      if (currentMilestone) startSkill = currentMilestone.focus_skill;
    }

    const itemTypesResult = await pool.query(
      `SELECT it.id AS item_type_id, it.skills, it.estimated_seconds,
         EXISTS (
           SELECT 1 FROM attempts a
           JOIN sessions s ON s.id = a.session_id
           JOIN items i ON i.id = a.item_id
           WHERE s.user_id = $1 AND s.session_type = 'practice' AND i.item_type_id = it.id
         ) AS practiced
       FROM item_types it`,
      [req.user!.id],
    );

    // A skill's module is "completed" once the learner has tried at least
    // one item from every item type that carries that skill — not once
    // they've exhausted the whole bank (60-72 items), which would make
    // "Completed" practically unreachable.
    const modules = ALL_SKILLS.map((skill) => {
      const types = itemTypesResult.rows.filter((r) => (r.skills as string[]).includes(skill));
      const practicedCount = types.filter((r) => r.practiced).length;
      const progressPercent = types.length > 0 ? Math.round((practicedCount / types.length) * 100) : 0;
      const status: "not_started" | "in_progress" | "completed" =
        practicedCount === 0 ? "not_started" : practicedCount === types.length ? "completed" : "in_progress";
      return { skill, status, progressPercent };
    });

    const weights = computeSkillWeights(placement.skill_percents);
    const avgSecondsPerSkill = {} as Record<SkillTag, number>;
    for (const skill of ALL_SKILLS) {
      const matching = itemTypesResult.rows.filter((r) => (r.skills as string[]).includes(skill));
      avgSecondsPerSkill[skill] =
        matching.length > 0 ? matching.reduce((sum, r) => sum + r.estimated_seconds, 0) / matching.length : 60;
    }

    const attemptsTodayResult = await pool.query(
      `SELECT it.skills
       FROM attempts a
       JOIN sessions s ON s.id = a.session_id
       JOIN items i ON i.id = a.item_id
       JOIN item_types it ON it.id = i.item_type_id
       WHERE s.user_id = $1 AND s.session_type = 'practice' AND a.submitted_at >= date_trunc('day', now())`,
      [req.user!.id],
    );

    // Personalized per-skill target for today — driven by time to prepare
    // and level gap (via the roadmap's minutesPerDay), skill weakness (via
    // weights), and capped so the weakest skill doesn't turn into a long
    // same-skill grind in one sitting.
    const todaysTasks = ALL_SKILLS.map((skill) => {
      const secondsForSkill = minutesPerDay * 60 * weights[skill];
      const itemTarget = Math.min(
        MAX_ITEMS_PER_SKILL_PER_DAY,
        Math.max(1, Math.round(secondsForSkill / avgSecondsPerSkill[skill])),
      );
      const itemsCompletedToday = attemptsTodayResult.rows.filter((r) => (r.skills as string[]).includes(skill)).length;
      return { skill, itemTarget, itemsCompletedToday, done: itemsCompletedToday >= itemTarget };
    });

    const completedSessionsResult = await pool.query(
      `SELECT started_at, completed_at FROM sessions
       WHERE user_id = $1 AND session_type = 'practice' AND completed_at IS NOT NULL`,
      [req.user!.id],
    );
    const sessions = completedSessionsResult.rows.length;
    // Real elapsed wall-clock time per session, not an estimate — attempts
    // don't carry a trustworthy per-item duration (window_start_at and
    // submitted_at are both written at submission time), but the session's
    // own started_at/completed_at span is genuine.
    const practiceMinutes = Math.round(
      completedSessionsResult.rows.reduce(
        (sum, r) => sum + (new Date(r.completed_at).getTime() - new Date(r.started_at).getTime()) / 60_000,
        0,
      ),
    );
    const streakDays = computeStreakDays(completedSessionsResult.rows.map((r) => dayKey(new Date(r.completed_at))));

    const questionsCompletedResult = await pool.query(
      `SELECT count(*) FROM attempts a JOIN sessions s ON s.id = a.session_id
       WHERE s.user_id = $1 AND s.session_type = 'practice'`,
      [req.user!.id],
    );
    const questionsCompleted = Number(questionsCompletedResult.rows[0].count);

    // null (not 0) until there's at least one *graded* practice answer —
    // same "no real evidence yet" reasoning as the placement skill
    // breakdown: an accuracy of 0% before anything has been graded would
    // misleadingly read as "you got everything wrong" rather than "you
    // haven't practiced".
    const accuracyResult = await pool.query(
      `SELECT sc.content_score, sc.manner_scores, i.cefr_level, it.input_method
       FROM attempts a
       JOIN sessions s ON s.id = a.session_id
       JOIN scores sc ON sc.attempt_id = a.id
       JOIN items i ON i.id = a.item_id
       JOIN item_types it ON it.id = i.item_type_id
       WHERE s.user_id = $1 AND s.session_type = 'practice' AND sc.status = 'scored'`,
      [req.user!.id],
    );
    const accuracyPercent =
      accuracyResult.rows.length === 0
        ? null
        : Math.round(
            (accuracyResult.rows.filter((r) =>
              isTrulyCorrect(Number(r.content_score), r.cefr_level, r.input_method, r.manner_scores, passThresholdForLevel),
            ).length /
              accuracyResult.rows.length) *
              100,
          );

    // "Continue where you left off" — an unfinished practice session, so
    // Overview can offer a direct resume link instead of the learner only
    // discovering it by re-picking the same skill in Modules (which itself
    // already resumes correctly — see practice/routes.ts POST /session).
    const inProgressResult = await pool.query(
      `SELECT id, composition FROM sessions
       WHERE user_id = $1 AND session_type = 'practice' AND completed_at IS NULL
       ORDER BY started_at DESC LIMIT 1`,
      [req.user!.id],
    );
    const inProgressRow = inProgressResult.rows[0];
    let inProgressPractice: { skill: SkillTag; answered: number; total: number } | null = null;
    if (inProgressRow) {
      const answeredResult = await pool.query(`SELECT count(*) FROM attempts WHERE session_id = $1`, [inProgressRow.id]);
      inProgressPractice = {
        skill: inProgressRow.composition.skill,
        answered: Number(answeredResult.rows[0].count),
        total: (inProgressRow.composition.itemIds ?? []).length,
      };
    }

    res.json({
      firstName: userResult.rows[0]?.first_name ?? null,
      startSkill,
      modules,
      todaysTasks,
      stats: { sessions, questionsCompleted, practiceMinutes, streakDays, accuracyPercent },
      inProgressPractice,
    });
  } catch (err) {
    next(err);
  }
});

// Days including today, oldest first — matches how the streak/achievement
// logic elsewhere already thinks in whole calendar days.
const DAILY_HISTORY_DAYS = 7;

dashboardRouter.get("/daily", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    // UTC-based, not local midnight — dayKey() below reads a Date's UTC
    // calendar date (via toISOString), including for real attempt/session
    // timestamps elsewhere in this function. Zeroing with local setHours
    // and then keying with toISOString silently disagreed by a day in any
    // timezone ahead of UTC (a whole day's attempts fell in no bucket at
    // all — caught by a manual seed-and-verify test, not by tsc).
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (DAILY_HISTORY_DAYS - 1));

    // LEFT JOIN scores — an attempt still pending review has no scores row
    // yet, but it should still count toward that day's questions-answered
    // total, just not toward accuracy.
    const attemptsResult = await pool.query(
      `SELECT a.submitted_at, sc.status, sc.content_score, sc.manner_scores, i.cefr_level, it.input_method
       FROM attempts a
       JOIN sessions s ON s.id = a.session_id
       JOIN items i ON i.id = a.item_id
       JOIN item_types it ON it.id = i.item_type_id
       LEFT JOIN scores sc ON sc.attempt_id = a.id
       WHERE s.user_id = $1 AND s.session_type = 'practice' AND a.submitted_at >= $2`,
      [req.user!.id, since],
    );

    const sessionsResult = await pool.query(
      `SELECT started_at, completed_at FROM sessions
       WHERE user_id = $1 AND session_type = 'practice' AND completed_at IS NOT NULL AND completed_at >= $2`,
      [req.user!.id, since],
    );

    const byDay = new Map<string, { questions: number; correct: number; graded: number; minutes: number }>();
    for (let i = 0; i < DAILY_HISTORY_DAYS; i++) {
      const d = new Date(since);
      d.setUTCDate(d.getUTCDate() + i);
      byDay.set(dayKey(d), { questions: 0, correct: 0, graded: 0, minutes: 0 });
    }

    for (const row of attemptsResult.rows) {
      const bucket = byDay.get(dayKey(new Date(row.submitted_at)));
      if (!bucket) continue;
      bucket.questions += 1;
      if (row.status === "scored") {
        bucket.graded += 1;
        if (isTrulyCorrect(Number(row.content_score), row.cefr_level, row.input_method, row.manner_scores, passThresholdForLevel)) {
          bucket.correct += 1;
        }
      }
    }

    for (const row of sessionsResult.rows) {
      const bucket = byDay.get(dayKey(new Date(row.completed_at)));
      if (!bucket) continue;
      bucket.minutes += (new Date(row.completed_at).getTime() - new Date(row.started_at).getTime()) / 60_000;
    }

    const days = Array.from(byDay.entries()).map(([date, b]) => ({
      date,
      questionsCompleted: b.questions,
      accuracyPercent: b.graded > 0 ? Math.round((b.correct / b.graded) * 100) : null,
      practiceMinutes: Math.round(b.minutes),
    }));

    const totalQuestions = days.reduce((sum, d) => sum + d.questionsCompleted, 0);

    // Weighted across the whole week (sum of corrects / sum of gradeds),
    // not an average of each day's already-rounded percent — a 1-question
    // day at 100% shouldn't count the same as a 20-question day at 80%.
    let weekCorrect = 0;
    let weekGraded = 0;
    for (const b of byDay.values()) {
      weekCorrect += b.correct;
      weekGraded += b.graded;
    }
    const weekAccuracyPercent = weekGraded > 0 ? Math.round((weekCorrect / weekGraded) * 100) : null;

    // Ties (including an all-zero week) resolve to the most recent day —
    // "your best day was today" reads better than an arbitrary earlier tie.
    const bestDay = days.reduce((best, d) => (d.questionsCompleted >= best.questionsCompleted ? d : best), days[0]);

    // Same streak definition as GET / (dashboard overview) — computed over
    // ALL completed practice sessions, not just this week, so a streak that
    // started more than 7 days ago still reports its true length here.
    const allCompletedSessionsResult = await pool.query(
      `SELECT completed_at FROM sessions WHERE user_id = $1 AND session_type = 'practice' AND completed_at IS NOT NULL`,
      [req.user!.id],
    );
    const streakDays = computeStreakDays(allCompletedSessionsResult.rows.map((r) => dayKey(new Date(r.completed_at))));

    res.json({ days, totalQuestions, weekAccuracyPercent, bestDay, streakDays });
  } catch (err) {
    next(err);
  }
});
