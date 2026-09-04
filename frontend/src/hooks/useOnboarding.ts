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

export async function submitOnboarding(answers: OnboardingAnswers): Promise<void> {
  const res = await fetch("/api/onboarding/complete", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "unknown_error" }));
    throw new Error(body.error ?? "request_failed");
  }
}
