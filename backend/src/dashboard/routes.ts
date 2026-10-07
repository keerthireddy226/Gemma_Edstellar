import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { isTrulyCorrect } from "../placement/fluencySignals.js";
import { passThresholdForLevel } from "../placement/cefr.js";
import { getLearnerStats, computeStreakDays, ALL_SKILLS, type SkillTag } from "../gamification/stats.js";

export const dashboardRouter = Router();
// Ceiling on items of one skill per day — avoids a long, repetitive same-skill grind.
const MAX_ITEMS_PER_SKILL_PER_DAY = 8;
// Fallback average seconds-per-item for a skill with no matching item types
// yet — shouldn't normally happen, just avoids a divide-by-zero.
const FALLBACK_AVG_SECONDS_PER_ITEM = 60;
// Weaker skills get proportionally more time; floored at 5 so a 100% skill still gets token upkeep.
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
             AND (a.response_text IS NOT NULL OR a.response_uri IS NOT NULL)
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
        matching.length > 0
          ? matching.reduce((sum, r) => sum + r.estimated_seconds, 0) / matching.length
          : FALLBACK_AVG_SECONDS_PER_ITEM;
    }

    const attemptsTodayResult = await pool.query(
      `SELECT it.skills
       FROM attempts a
       JOIN sessions s ON s.id = a.session_id
       JOIN items i ON i.id = a.item_id
       JOIN item_types it ON it.id = i.item_type_id
       WHERE s.user_id = $1 AND s.session_type = 'practice' AND a.submitted_at >= date_trunc('day', now())
         AND (a.response_text IS NOT NULL OR a.response_uri IS NOT NULL)`,
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

    // Single source of truth for sessions/questions/minutes/streak/accuracy
    // (streak here already forgives up to 2 missed days) plus level/XP —
    // the same function session-completion uses to decide badge unlocks, so
    // the dashboard and the badge checks can never disagree.
    const learnerStats = await getLearnerStats(req.user!.id);
    const { sessions, questionsCompleted, practiceMinutes, streakDays, accuracyPercent, level, totalXp } = learnerStats;

    const badgesResult = await pool.query(
      `SELECT a.id, a.title, a.description, a.icon, ua.unlocked_at
       FROM achievements a
       LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = $1
       ORDER BY a.id`,
      [req.user!.id],
    );
    const badges = badgesResult.rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      icon: r.icon,
      unlocked: r.unlocked_at !== null,
      unlockedAt: r.unlocked_at,
    }));

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
      const answeredResult = await pool.query(
        `SELECT count(*) FROM attempts WHERE session_id = $1 AND (response_text IS NOT NULL OR response_uri IS NOT NULL)`,
        [inProgressRow.id],
      );
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
      stats: { sessions, questionsCompleted, practiceMinutes, streakDays, accuracyPercent, level, totalXp },
      badges,
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
      `SELECT a.submitted_at, a.active_ms, sc.status, sc.content_score, sc.manner_scores, i.cefr_level, it.input_method
       FROM attempts a
       JOIN sessions s ON s.id = a.session_id
       JOIN items i ON i.id = a.item_id
       JOIN item_types it ON it.id = i.item_type_id
       LEFT JOIN scores sc ON sc.attempt_id = a.id
       WHERE s.user_id = $1 AND s.session_type = 'practice' AND a.submitted_at >= $2
         AND (a.response_text IS NOT NULL OR a.response_uri IS NOT NULL)`,
      [req.user!.id, since],
    );

    const byDay = new Map<string, { questions: number; correct: number; graded: number; minutes: number }>();
    for (let i = 0; i < DAILY_HISTORY_DAYS; i++) {
      const d = new Date(since);
      d.setUTCDate(d.getUTCDate() + i);
      byDay.set(dayKey(d), { questions: 0, correct: 0, graded: 0, minutes: 0 });
    }

    // Bucketed by when the question was actually submitted, using its own
    // real active time — not session wall-clock span, which also counts
    // idle time and can't be attributed to the right day for a session left
    // open overnight.
    for (const row of attemptsResult.rows) {
      const bucket = byDay.get(dayKey(new Date(row.submitted_at)));
      if (!bucket) continue;
      bucket.questions += 1;
      bucket.minutes += (row.active_ms ?? 0) / 60_000;
      if (row.status === "scored") {
        bucket.graded += 1;
        if (isTrulyCorrect(Number(row.content_score), row.cefr_level, row.input_method, row.manner_scores, passThresholdForLevel)) {
          bucket.correct += 1;
        }
      }
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
