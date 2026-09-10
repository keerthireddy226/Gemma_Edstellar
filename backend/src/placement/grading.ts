import { gradeWithAI, gradeSpokenAudio, scoreTypingAccuracy, MIC_ITEM_TYPES } from "./aiGrading.js";
import { passThresholdForLevel } from "./cefr.js";

// Exact-text grading for items that have a definite correct answer, rubric-
// based AI grading for open-ended writing (see aiGrading.ts), and audio-
// native grading for every type where the learner actually speaks — that one
// judges the real recording (pronunciation, fluency, pacing), not just a
// transcript of the words, and returns its own transcript alongside the
// score since it already has to listen to the audio anyway.
//
// A non-match on passage_reconstruction's legacy exact-answer path is
// deliberately "pending", not "wrong" — see the case below.
//
// `score` is the real 0-1 grade; `correct` is score >= that item's own
// level's pass bar (see passThresholdForLevel — C2 demands far more than
// A1 does), kept around because the client-facing attempt response has
// always returned a boolean and nothing depends on changing that.
//
// "pending" vs "failed" — a real distinction, not a naming choice:
// "pending" means there was genuinely nothing to grade yet (skipped, no
// recording, no text). "failed" means an answer WAS given and grading was
// actually attempted, but the AI call itself broke (rate limit, network
// error, an unparseable response) — that's a temporary service problem, not
// the learner's fault, and the two need to be shown differently instead of
// both silently looking like "not enough answered."
export type GradeResult = {
  status: "scored" | "pending" | "failed";
  correct: boolean | null;
  score: number | null;
  method: "exact-match" | "text-diff" | "ai-rubric" | "audio-rubric" | null;
  // Only ever set by the audio-native path — the authoritative transcript of
  // what was actually said, since that grading call already had to listen to
  // the recording. Callers should prefer this over any client-supplied text.
  transcript: string | null;
};

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, "")
    .replace(/\s+/g, " ");
}

// Passage Reconstruction is graded on whether the grammar got fixed, not on
// reproducing the reference's exact punctuation/capitalization choices —
// unlike Dictation, where transcribing punctuation correctly is the point.
// Strips all internal punctuation too (not just trailing), so a stray comma
// or an un-capitalized "she" doesn't fail an otherwise-correct correction.
function normalizeLoose(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, "")
    .replace(/\s+/g, " ");
}

const PENDING: GradeResult = { status: "pending", correct: null, score: null, method: null, transcript: null };

function exactResult(correct: boolean): GradeResult {
  return { status: "scored", correct, score: correct ? 1 : 0, method: "exact-match", transcript: null };
}

async function aiResult(
  itemTypeId: string,
  content: unknown,
  cefrLevel: string | null,
  minWords: number | null,
  responseText: string,
): Promise<GradeResult> {
  const ai = await gradeWithAI(itemTypeId, content, cefrLevel, minWords, responseText);
  // A real answer was given and grading was actually attempted — a null
  // result here means the AI call itself broke, not that there was nothing
  // to grade. Recorded as "failed" (with the method that was attempted) so
  // it isn't confused with a genuinely unanswered question.
  if (!ai) return { status: "failed", correct: null, score: null, method: "ai-rubric", transcript: null };
  return {
    status: "scored",
    correct: ai.score >= passThresholdForLevel(cefrLevel),
    score: ai.score,
    method: "ai-rubric",
    transcript: null,
  };
}

async function spokenResult(
  itemTypeId: string,
  content: unknown,
  answerSet: unknown,
  cefrLevel: string | null,
  audioBase64: string,
  mimeType: string,
): Promise<GradeResult> {
  const spoken = await gradeSpokenAudio(itemTypeId, content, answerSet, cefrLevel, audioBase64, mimeType);
  if (!spoken) return { status: "failed", correct: null, score: null, method: "audio-rubric", transcript: null };
  return {
    status: "scored",
    correct: spoken.score >= passThresholdForLevel(cefrLevel),
    score: spoken.score,
    method: "audio-rubric",
    transcript: spoken.transcript,
  };
}

export async function gradeAttempt(
  itemTypeId: string,
  answerSet: unknown,
  content: unknown,
  cefrLevel: string | null,
  minWords: number | null,
  responseText: string | undefined,
  audioBase64?: string,
  audioMimeType?: string,
): Promise<GradeResult> {
  // Every type where the learner actually speaks goes through audio-native
  // grading — content correctness and delivery quality together, straight
  // from the recording. These types are mic-only in the UI, so no audio
  // means there's genuinely nothing to grade yet (not a text fallback).
  if (MIC_ITEM_TYPES.has(itemTypeId)) {
    if (!audioBase64) return PENDING;
    return spokenResult(itemTypeId, content, answerSet, cefrLevel, audioBase64, audioMimeType ?? "audio/webm");
  }

  const set = (answerSet ?? {}) as Record<string, unknown>;
  if (!responseText) return PENDING;
  const given = normalize(responseText);

  switch (itemTypeId) {
    // A typed-transcription task (hear it, type it) — no spoken output from
    // the learner, so there's no pronunciation to assess here.
    case "dictation": {
      const exact = set.exact;
      if (typeof exact !== "string") return PENDING;
      return exactResult(given === normalize(exact));
    }
    case "sentence_completion": {
      const accepted = set.acceptable_answers;
      if (!Array.isArray(accepted) || accepted.length === 0) return PENDING;
      return exactResult(accepted.some((a) => typeof a === "string" && normalize(a) === given));
    }
    // The real mechanic (read-then-recall-from-memory) has no single
    // correct rewording — the legacy exact-match path only fires for old
    // content that carried a `corrected` answer key; current content has
    // none and falls straight to AI grading (comparing the recall against
    // the original passage for content accuracy, not exact wording).
    case "passage_reconstruction": {
      const corrected = set.corrected;
      if (typeof corrected === "string" && normalizeLoose(corrected) === normalizeLoose(responseText)) {
        return exactResult(true);
      }
      return aiResult(itemTypeId, content, cefrLevel, minWords, responseText);
    }
    // Multiple-choice types — the client submits the selected option's
    // index (as a string, e.g. "1"), exact/unambiguous to grade unlike
    // free-text matching.
    case "response_selection":
    case "reading_comprehension": {
      const correctIndex = set.correctIndex;
      if (typeof correctIndex !== "number") return PENDING;
      const givenIndex = Number(responseText);
      if (!Number.isInteger(givenIndex)) return PENDING;
      return exactResult(givenIndex === correctIndex);
    }
    // A copy-the-passage-exactly typing drill — there's a definite target
    // text, so a word-level diff (not an AI judgment call) is the right tool.
    case "typing": {
      const contentObj = (content ?? {}) as Record<string, unknown>;
      const target = typeof contentObj.text === "string" ? contentObj.text : null;
      if (!target) return PENDING;
      const score = scoreTypingAccuracy(target, responseText);
      return {
        status: "scored",
        correct: score >= passThresholdForLevel(cefrLevel),
        score,
        method: "text-diff",
        transcript: null,
      };
    }
    // Open-ended writing — no single correct answer, so these go through
    // rubric-based AI grading instead of text matching.
    case "summary_and_opinion":
    case "email_writing":
      return aiResult(itemTypeId, content, cefrLevel, minWords, responseText);
    default:
      return PENDING;
  }
}
