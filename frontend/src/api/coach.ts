import { api } from "@/lib/api";

export interface CoachTurn {
  speaker: "learner" | "agent";
  text: string;
}

// Resumes the learner's one in-progress conversation, or starts a fresh one
// (seeded with a fixed opening line server-side) if there isn't one yet.
export function startCoachSession(): Promise<{ sessionId: string; turns: CoachTurn[] }> {
  return api("/coach/session", { method: "POST" });
}

export function sendCoachMessage(sessionId: string, text: string): Promise<{ reply: string }> {
  return api(`/coach/session/${sessionId}/messages`, { method: "POST", body: JSON.stringify({ text }) });
}

export function endCoachSession(sessionId: string): Promise<void> {
  return api(`/coach/session/${sessionId}/end`, { method: "POST" });
}
