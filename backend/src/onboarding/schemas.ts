import { z } from "zod";

// Mirrors participant_profiles + users.first_name/last_name. One combined submission, not save-per-step.
export const onboardingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  examPreference: z.enum(["versant", "ielts", "toefl", "pte", "cambridge", "other"]),
  goalLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "unsure"]),
  scoreTarget: z.string().optional(),
  examReason: z.enum(["university", "job", "immigration", "promotion", "personal"]),
  hasAppliedForExam: z.boolean(),
  examDate: z.iso.date().optional().nullable(),
  targetPrepDays: z.number().int().positive(),
  pastAttemptsStatus: z.enum(["first", "once", "multiple"]),
  prevScore: z.string().optional(),
  prevDate: z.string().optional(),
  dailyMinutesPreference: z.number().int().positive(),
  accessDuration: z.enum(["1month", "3months", "6months", "untilexam"]),
  // Must be affirmatively true, not just present — a checkbox left unchecked
  // fails validation rather than silently defaulting to consent given (C3).
  consentGiven: z.literal(true),
});
