// Real audio-based pronunciation/fluency scoring — the thing Claude
// structurally cannot do (see aiGrading.ts's header). Gemini accepts audio
// directly, so unlike the free signals in fluencySignals.ts (which only
// ever look at the transcript and the recording's length), this actually
// listens to the recording itself.
//
// This is a supplementary "manner" signal, not a replacement for content
// grading — it never decides right/wrong, and it fails closed exactly like
// aiGrading.ts: any missing key, network error, or unparseable response
// returns null, and the caller just omits it rather than failing the
// attempt submission.
import { GoogleGenAI } from "@google/genai";

// Verified directly against the live API before picking this: the older
// "gemini-2.5-flash-lite" name (still the current published price sheet's
// example) is no longer available to new callers — Google's own 404 points
// callers at this one instead. Confirmed working with a real request.
const GEMINI_MODEL = "gemini-3.5-flash-lite";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export interface GeminiFluencyResult {
  pronunciation: number;
  fluency: number;
  comment: string;
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    pronunciation: {
      type: "number",
      description: "0 to 1: how clearly and accurately the individual sounds/words were pronounced.",
    },
    fluency: {
      type: "number",
      description: "0 to 1: how smooth and natural the delivery was — pace, hesitation, filler words.",
    },
    comment: { type: "string", description: "One short, specific sentence of feedback for the learner." },
  },
  required: ["pronunciation", "fluency", "comment"],
};

export async function scoreAudioFluency(
  audioBase64: string,
  audioMimeType: string,
  cefrLevel: string | null,
): Promise<GeminiFluencyResult | null> {
  const ai = getClient();
  if (!ai) return null;

  const level = cefrLevel ?? "B1";
  // Deliberately does NOT tell the model what the learner was supposed to
  // say. Tested directly: giving it the expected text made it anchor on
  // "they probably said this" instead of critically checking the audio —
  // on six trials of the exact same silent recording, that version
  // hallucinated confident pronunciation feedback four times. Asking it to
  // verify real speech is present FIRST, with no expected text to anchor
  // on, got 6/6 correct on the same silent clip and still scored real
  // recordings sensibly (0.8–0.9, consistent, properly on the stated 0–1
  // scale). Content correctness doesn't need this call anyway — that's
  // graded separately, from the transcript, in aiGrading.ts.
  const prompt = `Listen carefully to the attached audio. First, determine: does this recording contain any actual audible human speech at all? If the recording is silent, contains only noise/static, or has no discernible spoken words, you must respond with pronunciation 0, fluency 0, and clearly state no speech was detected — do not guess or assume speech occurred. Only if you can actually hear real spoken words, judge the pronunciation and fluency of what you genuinely hear (a ${level}-level English learner's recording) — how it sounds, not the words' content. Score both pronunciation and fluency on a scale from 0 (worst) to 1 (excellent, native-like) — never use any other scale.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, { inlineData: { mimeType: audioMimeType, data: audioBase64 } }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text ?? "");
    const pronunciation = Number(parsed.pronunciation);
    const fluency = Number(parsed.fluency);
    if (Number.isNaN(pronunciation) || Number.isNaN(fluency)) return null;

    return {
      pronunciation: Math.max(0, Math.min(1, pronunciation)),
      fluency: Math.max(0, Math.min(1, fluency)),
      comment: String(parsed.comment ?? ""),
    };
  } catch (err) {
    console.error("scoreAudioFluency: request failed:", err);
    return null;
  }
}
