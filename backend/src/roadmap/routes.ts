import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";

export const roadmapRouter = Router();

roadmapRouter.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const placementResult = await pool.query(
      `SELECT overall_percent, cefr_level, skill_percents, skill_levels, taken_at, status
       FROM placements WHERE user_id = $1 ORDER BY taken_at DESC LIMIT 1`,
      [req.user!.id],
    );
    const placement = placementResult.rows[0];

    const profileResult = await pool.query(
      `SELECT goal_level, assessment_scheduled_for, access_window_start_date, access_window_duration_days
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

    const roadmapResult = await pool.query(
      `SELECT id, pace, minutes_per_day, total_hours_estimate
       FROM roadmaps WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 1`,
      [req.user!.id],
    );
    const roadmap = roadmapResult.rows[0];
    if (!roadmap) {
      return res.status(404).json({ error: "no_roadmap_yet" });
    }

    const milestonesResult = await pool.query(
      `SELECT level, label, target_day_offset, focus_skill
       FROM roadmap_milestones WHERE roadmap_id = $1 ORDER BY target_day_offset ASC`,
      [roadmap.id],
    );

    const userResult = await pool.query(`SELECT first_name FROM users WHERE id = $1`, [req.user!.id]);

    // Same "which milestone is active" logic the timeline UI uses — the
    // first milestone whose target day hasn't passed yet (or the last one,
    // once they're all behind schedule).
    const daysSinceStart = profile.access_window_start_date
      ? Math.round((Date.now() - new Date(profile.access_window_start_date).getTime()) / 86_400_000)
      : 0;
    const milestones = milestonesResult.rows;
    const currentMilestone =
      milestones.find((m) => m.target_day_offset >= daysSinceStart) ?? milestones[milestones.length - 1];
    const focusSkill = currentMilestone?.focus_skill ?? "listening";

    const practiceItemsResult = await pool.query(
      `SELECT id, name, question_instruction, estimated_seconds
       FROM item_types WHERE $1 = ANY(skills) ORDER BY estimated_seconds ASC LIMIT 5`,
      [focusSkill],
    );

    res.json({
      firstName: userResult.rows[0]?.first_name ?? null,
      placement: {
        overallPercent: Number(placement.overall_percent),
        cefrLevel: placement.cefr_level,
        skillPercents: placement.skill_percents,
        // Older placements taken before this column existed have no value —
        // the frontend falls back to just showing the percent for those.
        skillLevels: placement.skill_levels ?? null,
        takenAt: placement.taken_at,
        // Non-blocking — the learner still sees their result; this just flags
        // it as awaiting an admin's look (Phase 2 async certification).
        reviewStatus: placement.status ?? "certified",
      },
      goalLevel: profile.goal_level && profile.goal_level !== "unsure" ? profile.goal_level : placement.cefr_level,
      accessWindow:
        profile.access_window_start_date && profile.access_window_duration_days
          ? { startDate: profile.access_window_start_date, durationDays: profile.access_window_duration_days }
          : null,
      roadmap: {
        pace: roadmap.pace,
        minutesPerDay: roadmap.minutes_per_day,
        totalHoursEstimate: Number(roadmap.total_hours_estimate),
        milestones: milestonesResult.rows.map((m) => ({
          level: m.level,
          labelType: m.label,
          targetDayOffset: m.target_day_offset,
          focusSkill: m.focus_skill,
        })),
      },
      recommendedPractice: {
        focusSkill,
        items: practiceItemsResult.rows.map((row) => ({
          itemTypeId: row.id,
          name: row.name,
          questionInstruction: row.question_instruction,
          estimatedSeconds: row.estimated_seconds,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});
