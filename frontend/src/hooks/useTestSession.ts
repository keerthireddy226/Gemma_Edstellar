import { api } from "@/lib/api";

export type InputMethod = "mic" | "text" | "textarea" | "radio" | "two-phase";

export interface TestItem {
  id: string;
  itemTypeId: string;
  content: Record<string, unknown>;
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
  status: "scored" | "pending";
  correct: boolean | null;
}

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type SkillTag = "listening" | "speaking" | "reading" | "writing";

export interface SessionSummary {
  gradedCount: number;
  correctCount: number;
  pendingCount: number;
  // Only present once at least one item could be scored — see the
  // graded.length === 0 guard on the backend.
  overallPercent?: number;
  cefrLevel?: CefrLevel;
  skillPercents?: Record<SkillTag, number>;
  goalLevel?: CefrLevel;
}

export function startSession(): Promise<{ sessionId: string; items: TestItem[] }> {
  return api("/placement/session", { method: "POST" });
}

export function submitAttempt(
  sessionId: string,
  payload: { itemId: string; responseText?: string; audioBase64?: string; audioMimeType?: string },
): Promise<AttemptResult> {
  return api(`/placement/session/${sessionId}/attempts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeSession(sessionId: string): Promise<SessionSummary> {
  return api(`/placement/session/${sessionId}/complete`, { method: "POST" });
}
