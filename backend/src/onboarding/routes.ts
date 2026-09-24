import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { onboardingSchema } from "./schemas.js";

const voicePreferenceSchema = z.object({ preferredVoice: z.enum(["male", "female"]) });
const preferencesSchema = z.object({ spokenPromptsEnabled: z.boolean() });

export const onboardingRouter = Router();

const FIXED_DURATION_DAYS: Record<string, number> = {
  "1month": 30,
  "3months": 90,
  "6months": 180,
};

onboardingRouter.get("/profile", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM participant_profiles WHERE user_id = $1", [req.user!.id]);
    res.json(result.rows[0] ?? null);
  } catch (err) {
    next(err);
  }
});

onboardingRouter.post("/complete", requireAuth, async (req: AuthedRequest, res, next) => {
  const client = await pool.connect();
  try {
    const body = onboardingSchema.parse(req.body);
    await client.query("BEGIN");

    await client.query("UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3", [
      body.firstName,
      body.lastName,
      req.user!.id,
    ]);

    // "Until my exam date" is computed from the stated exam date rather than
    // being a fixed number, per the prototype this mirrors.
    let accessWindowDurationDays = FIXED_DURATION_DAYS[body.accessDuration] ?? 90;
    if (body.accessDuration === "untilexam" && body.examDate) {
      const days = Math.ceil((new Date(body.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      accessWindowDurationDays = Math.max(days, 1);
    }

    await client.query(
      `INSERT INTO participant_profiles (
         user_id, onboarding_step, onboarding_complete, exam_preference, goal_level, score_target,
         exam_reason, has_applied_for_exam, exam_date, target_prep_days, past_attempts_status,
         daily_minutes_preference, access_duration, access_window_start_date, access_window_duration_days
       ) VALUES ($1, 'done', true, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE, $12)
       ON CONFLICT (user_id) DO UPDATE SET
         onboarding_step = EXCLUDED.onboarding_step,
         onboarding_complete = EXCLUDED.onboarding_complete,
         exam_preference = EXCLUDED.exam_preference,
         goal_level = EXCLUDED.goal_level,
         score_target = EXCLUDED.score_target,
         exam_reason = EXCLUDED.exam_reason,
         has_applied_for_exam = EXCLUDED.has_applied_for_exam,
         exam_date = EXCLUDED.exam_date,
         target_prep_days = EXCLUDED.target_prep_days,
         past_attempts_status = EXCLUDED.past_attempts_status,
         daily_minutes_preference = EXCLUDED.daily_minutes_preference,
         access_duration = EXCLUDED.access_duration,
         access_window_start_date = EXCLUDED.access_window_start_date,
         access_window_duration_days = EXCLUDED.access_window_duration_days,
         updated_at = now()`,
      [
        req.user!.id,
        body.examPreference,
        body.goalLevel,
        body.scoreTarget || null,
        body.examReason,
        body.hasAppliedForExam,
        body.examDate || null,
        body.targetPrepDays,
        body.pastAttemptsStatus,
        body.dailyMinutesPreference,
        body.accessDuration,
        accessWindowDurationDays,
      ],
    );

    // FR-041: a past attempt goes into external_results, not a free-text
    // field on the profile — avoids the two-places-for-one-fact duplication
    // flagged during the earlier schema review. prevScore is often not a
    // plain number ("B1", "58", "IELTS 6.5"), so it's only parsed into the
    // numeric column when it actually is one; the raw text always survives
    // in reported_skills either way.
    if (body.pastAttemptsStatus !== "first" && (body.prevScore || body.prevDate)) {
      const numericScore = /^\d+(\.\d+)?$/.test((body.prevScore ?? "").trim())
        ? Number(body.prevScore)
        : null;
      await client.query(
        `INSERT INTO external_results (user_id, reported_overall, reported_skills, source, verified_flag)
         VALUES ($1, $2, $3, $4, false)`,
        [
          req.user!.id,
          numericScore,
          JSON.stringify({ raw: body.prevScore ?? null, reportedDate: body.prevDate ?? null }),
          "self-reported (onboarding questionnaire)",
        ],
      );
    }

    // C3 / FR-011: a separate, affirmative consent record — not bundled into
    // the rest of the form data, and required before this endpoint succeeds
    // at all (onboardingSchema.consentGiven is z.literal(true)).
    await client.query(
      `INSERT INTO consent_records (user_id, consent_version, consent_type, ip_address)
       VALUES ($1, $2, 'recording', $3)`,
      [req.user!.id, "v1", req.ip],
    );

    await client.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

onboardingRouter.patch("/voice-preference", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = voicePreferenceSchema.parse(req.body);
    const result = await pool.query(
      `UPDATE participant_profiles SET preferred_voice = $1, updated_at = now() WHERE user_id = $2 RETURNING user_id`,
      [body.preferredVoice, req.user!.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "profile_not_found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

onboardingRouter.patch("/preferences", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = preferencesSchema.parse(req.body);
    const result = await pool.query(
      `UPDATE participant_profiles SET spoken_prompts_enabled = $1, updated_at = now() WHERE user_id = $2 RETURNING user_id`,
      [body.spokenPromptsEnabled, req.user!.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "profile_not_found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
