import { api } from "@/lib/api";

export type InputMethod = "mic" | "text" | "textarea" | "radio" | "two-phase";

export interface TestItem {
  id: string;
  itemTypeId: string;
  content: Record<string, unknown>;
  skills: SkillTag[];
  inputMethod: InputMethod;
  instructionText: string;
  questionInstruction: string;
  timerSeconds: number | null;
  twoPhaseReadSeconds?: number | null;
  twoPhaseWriteSeconds?: number | null;
  attempted?: boolean;
}

export interface AttemptResult {
  attemptId: string;
  status: "scored" | "pending" | "failed";
  correct: boolean | null;
  // The placement test is adaptive now — this is the next question to show,
  // chosen based on whether this answer was right. null means there's
  // nothing left to ask; the caller should call completeSession instead of
  // waiting for a fixed question count.
  nextItem: TestItem | null;
}

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type SkillTag = "listening" | "speaking" | "reading" | "writing";

export interface SessionSummary {
  gradedCount: number;
  correctCount: number;
  // Genuinely unanswered, or awaiting a grading path with nothing to check
  // yet — not the learner's fault, but not a service problem either.
  pendingCount: number;
  // An answer WAS given and grading was attempted, but the AI call itself
  // failed (rate limit, network error) — a temporary service issue, shown
  // separately so it isn't confused with "you didn't answer enough."
  failedCount: number;
  // Only present once at least one item could be scored — see the
  // graded.length === 0 guard on the backend.
  overallPercent?: number;
  cefrLevel?: CefrLevel;
  // Same meaning as skillLevels' cappedByGap below, but for the headline
  // level itself, which is now assessed from every graded answer combined
  // rather than the worst single per-skill level.
  cefrCappedByGap?: boolean;
  // null per skill means that skill had zero graded questions this run
  // (skipped, or still pending) — not a real score.
  skillPercents?: Record<SkillTag, number | null>;
  // cappedByGap: the percent above can look deceptively high next to this
  // level — it's correct, but there's an untested gap between what was
  // proven and a higher level that was also (partly) answered. Worth
  // explaining in the UI rather than just showing the two side by side.
  skillLevels?: Record<SkillTag, { level: CefrLevel; cappedByGap: boolean } | null>;
  goalLevel?: CefrLevel;
  // Rolled up from every spoken (mic) answer's free signals + Gemini's real
  // pronunciation/fluency listening, if any were captured this session.
  // null means no spoken answers had anything to summarize — not a failure,
  // just nothing to show (e.g. only typed questions were answered, or
  // GEMINI_API_KEY isn't configured and none had a usable duration either).
  speakingDelivery?: SpeakingDeliverySummary | null;
}

export interface SpeakingDeliverySummary {
  averageWordsPerMinute: number | null;
  totalFillerCount: number;
  // Real listening-based scores from Gemini — null when GEMINI_API_KEY isn't
  // configured or every attempt's Gemini call failed/was skipped.
  averagePronunciation: number | null;
  averageFluency: number | null;
  sampleComment: string | null;
  basedOnCount: number;
}

export function startSession(): Promise<{ sessionId: string; items: TestItem[] }> {
  return api("/placement/session", { method: "POST" });
}

export function submitAttempt(
  sessionId: string,
  payload: { itemId: string; responseText?: string; audioBase64?: string; audioMimeType?: string; durationMs?: number },
): Promise<AttemptResult> {
  return api(`/placement/session/${sessionId}/attempts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeSession(sessionId: string): Promise<SessionSummary> {
  return api(`/placement/session/${sessionId}/complete`, { method: "POST" });
}
