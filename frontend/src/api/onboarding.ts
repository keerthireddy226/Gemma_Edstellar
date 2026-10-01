import { api } from "@/lib/api";

export type ExamPreference = "versant" | "ielts" | "toefl" | "pte" | "cambridge" | "other";
export type GoalLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "unsure";
export type ExamReason = "university" | "job" | "immigration" | "promotion" | "personal";
export type AttemptsStatus = "first" | "once" | "multiple";
export type AccessDuration = "1month" | "3months" | "6months" | "untilexam";

export interface OnboardingAnswers {
  firstName: string;
  lastName: string;
  examPreference: ExamPreference;
  goalLevel: GoalLevel;
  scoreTarget: string;
  examReason: ExamReason;
  hasAppliedForExam: boolean;
  examDate: string | null;
  targetPrepDays: number;
  pastAttemptsStatus: AttemptsStatus;
  prevScore: string;
  prevDate: string;
  dailyMinutesPreference: number;
  accessDuration: AccessDuration;
  consentGiven: boolean;
}

export type PreferredVoice = "male" | "female";

// Widened to the fields Profile actually displays (exam goal, score target, exam date).
export interface OnboardingProfile {
  onboarding_complete: boolean;
  preferred_voice: PreferredVoice | null;
  exam_preference: ExamPreference | null;
  goal_level: GoalLevel | null;
  score_target: string | null;
  exam_date: string | null;
  daily_minutes_preference: number | null;
  spoken_prompts_enabled: boolean;
}

export function getOnboardingProfile(): Promise<OnboardingProfile | null> {
  return api("/onboarding/profile");
}

// Real, persisted preference, unlike Profile's other two "coming soon" toggles — not yet wired into session playback behavior.
export function updateSpokenPromptsPreference(spokenPromptsEnabled: boolean): Promise<void> {
  return api("/onboarding/preferences", { method: "PATCH", body: JSON.stringify({ spokenPromptsEnabled }) });
}

export function submitOnboarding(answers: OnboardingAnswers): Promise<void> {
  return api("/onboarding/complete", { method: "POST", body: JSON.stringify(answers) });
}

export function updateVoicePreference(preferredVoice: PreferredVoice): Promise<void> {
  return api("/onboarding/voice-preference", { method: "PATCH", body: JSON.stringify({ preferredVoice }) });
}
