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

export function getOnboardingProfile(): Promise<{ onboarding_complete: boolean; preferred_voice: PreferredVoice | null } | null> {
  return api("/onboarding/profile");
}

export function submitOnboarding(answers: OnboardingAnswers): Promise<void> {
  return api("/onboarding/complete", { method: "POST", body: JSON.stringify(answers) });
}

export function updateVoicePreference(preferredVoice: PreferredVoice): Promise<void> {
  return api("/onboarding/voice-preference", { method: "PATCH", body: JSON.stringify({ preferredVoice }) });
}
