// Tutor (Coach Mode) — open-ended conversation, unlike aiGrading.ts's one-shot rubric grading.
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-3.5-flash-lite";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export interface CoachTurn {
  speaker: "learner" | "agent";
  transcript: string;
}

// Fixed, not AI-generated — starting a conversation never costs an API call.
export const COACH_OPENING_LINE =
  "Hi! I'm your practice conversation partner. Tell me a little about your day so far.";

// Sent every turn, not persisted — keeps the model in a consistent persona.
const SYSTEM_INSTRUCTION =
  "You are a friendly, encouraging English conversation partner helping a language learner practice everyday spoken English. " +
  "Keep every reply short — 1 to 3 sentences, natural and conversational, like a real chat message, not an essay. " +
  "If the learner makes a clear grammar or word-choice mistake, you may gently model the correct form in passing (e.g. \"Ah, you went to the market — nice!\"), but never lecture about grammar or call out the mistake directly. " +
  "Always end your reply with a simple follow-up question that keeps the conversation going. " +
  "Stay in character as a conversation partner at all times — never mention that you are an AI, a model, or a program.";

// Only the most recent turns are sent — bounds prompt size without capping conversation length.
const MAX_HISTORY_TURNS = 20;

export async function getCoachReply(history: CoachTurn[]): Promise<string | null> {
  const ai = getClient();
  if (!ai) return null;

  const recent = history.slice(-MAX_HISTORY_TURNS);
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: recent.map((turn) => ({
        role: turn.speaker === "learner" ? "user" : "model",
        parts: [{ text: turn.transcript }],
      })),
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });
    const text = response.text?.trim();
    return text || null;
  } catch (err) {
    console.error("getCoachReply: request failed:", err);
    return null;
  }
}
