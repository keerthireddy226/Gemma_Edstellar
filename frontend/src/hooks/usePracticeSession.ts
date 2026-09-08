import { api } from "@/lib/api";
import type { SkillTag, TestItem } from "@/hooks/useTestSession";

export interface PracticeSummary {
  gradedCount: number;
  correctCount: number;
  pendingCount: number;
}

export interface SkillAvailability {
  skill: SkillTag;
  total: number;
  remaining: number;
}

export function getAvailability(): Promise<{ availability: SkillAvailability[] }> {
  return api("/practice/availability");
}

export function startPracticeSession(
  skill: SkillTag,
  count?: number,
  itemTypeId?: string,
): Promise<{ sessionId: string; skill: SkillTag; items: TestItem[] }> {
  return api("/practice/session", { method: "POST", body: JSON.stringify({ skill, count, itemTypeId }) });
}

export function submitPracticeAttempt(
  sessionId: string,
  payload: { itemId: string; responseText?: string; audioBase64?: string; audioMimeType?: string },
) {
  return api(`/practice/session/${sessionId}/attempts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completePracticeSession(sessionId: string): Promise<PracticeSummary> {
  return api(`/practice/session/${sessionId}/complete`, { method: "POST" });
}
