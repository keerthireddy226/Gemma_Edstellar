import { gradeWithAI, scoreTypingAccuracy, AI_GRADED_TYPES } from "./aiGrading.js";
import { passThresholdForLevel } from "./cefr.js";

// Exact-text grading for items that have a definite correct answer, and
// rubric-based AI grading (via Claude) for everything else — open-ended
// writing, and every spoken type, judged from its transcript. Claude's API
// has no audio input, so spoken answers are graded on the words only, same
// as the written types — see aiGrading.ts for that trade-off in detail.
//
// A non-match on passage_reconstruction's legacy exact-answer path is
// deliberately "pending", not "wrong" — see the case below.
//
// `score` is the real 0-1 grade; `correct` is score >= that item's own
// level's pass bar (see passThresholdForLevel — C2 demands far more than
// A1 does), kept around because the client-facing attempt response has
// always returned a boolean and nothing depends on changing that.
export type GradeResult = {
  status: "scored" | "pending" | "failed";
  correct: boolean | null;
  score: number | null;
  method: "exact-match" | "text-diff" | "ai-text" | null;
};

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, "")
    .replace(/\s+/g, " ");
}

const PENDING: GradeResult = { status: "pending", correct: null, score: null, method: null };

function exactResult(correct: boolean): GradeResult {
  return { status: "scored", correct, score: correct ? 1 : 0, method: "exact-match" };
}

async function aiResult(
  itemTypeId: string,
  content: unknown,
  answerSet: unknown,
  cefrLevel: string | null,
  minWords: number | null,
  responseText: string,
): Promise<GradeResult> {
  const ai = await gradeWithAI(itemTypeId, content, answerSet, cefrLevel, minWords, responseText);
  // A real answer was given and grading was actually attempted — a null
  // result here means the AI call itself broke, not that there was nothing
  // to grade. Recorded as "failed" so it isn't confused with a genuinely
  // unanswered question.
  if (!ai) return { status: "failed", correct: null, score: null, method: "ai-text" };
  return {
    status: "scored",
    correct: ai.score >= passThresholdForLevel(cefrLevel),
    score: ai.score,
    method: "ai-text",
  };
}

export async function gradeAttempt(
  itemTypeId: string,
  answerSet: unknown,
  content: unknown,
  cefrLevel: string | null,
  minWords: number | null,
  responseText: string | undefined,
): Promise<GradeResult> {
  if (!responseText) return PENDING;

  if (AI_GRADED_TYPES.has(itemTypeId)) {
    return aiResult(itemTypeId, content, answerSet, cefrLevel, minWords, responseText);
  }

  const set = (answerSet ?? {}) as Record<string, unknown>;
  const given = normalize(responseText);

  switch (itemTypeId) {
    // A typed-transcription task (hear it, type it).
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
      return { status: "scored", correct: score >= passThresholdForLevel(cefrLevel), score, method: "text-diff" };
    }
    default:
      return PENDING;
  }
}
