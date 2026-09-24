import { api } from "@/lib/api";
import type { SkillTag, TestItem } from "@/hooks/useTestSession";

export interface PracticeSummary {
  gradedCount: number;
  correctCount: number;
  // Genuinely unanswered, or nothing to grade yet.
  pendingCount: number;
  // An answer was given and grading was attempted, but the AI call itself
  // failed (rate limit, network error) — a temporary service issue, not the
  // learner's fault, shown separately from pendingCount.
  failedCount: number;
}

export interface SkillAvailability {
  skill: SkillTag;
  total: number;
  remaining: number;
}

export interface PracticeUnit {
  id: string;
  name: string;
  setCount: number;
  completedCount: number;
}

export interface PracticeSet {
  id: string;
  name: string;
  completed: boolean;
}

export function getAvailability(): Promise<{ availability: SkillAvailability[] }> {
  return api("/practice/availability");
}

export function getUnits(itemTypeId: string): Promise<{ units: PracticeUnit[] }> {
  return api(`/practice/units?itemTypeId=${encodeURIComponent(itemTypeId)}`);
}

export function getSets(unitId: string): Promise<{ sets: PracticeSet[] }> {
  return api(`/practice/units/${unitId}/sets`);
}

export function startPracticeSession(
  skill: SkillTag,
  count?: number,
  itemTypeId?: string,
  voiceCheckId?: string,
  setId?: string,
): Promise<{ sessionId: string; skill: SkillTag; items: TestItem[] }> {
  return api("/practice/session", { method: "POST", body: JSON.stringify({ skill, count, itemTypeId, voiceCheckId, setId }) });
}

export function submitPracticeAttempt(
  sessionId: string,
  payload: { itemId: string; responseText?: string; audioBase64?: string; audioMimeType?: string; durationMs?: number },
) {
  return api(`/practice/session/${sessionId}/attempts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completePracticeSession(sessionId: string): Promise<PracticeSummary> {
  return api(`/practice/session/${sessionId}/complete`, { method: "POST" });
}
