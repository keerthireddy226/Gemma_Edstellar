// Exact-text grading for items that have a definite correct answer. A
// spoken response only reaches here after client-side transcription (the
// browser's SpeechRecognition API) turns it into text — this module never
// looks at audio itself.
//
// A non-match on passage_reconstruction is deliberately "pending", not
// "wrong": there are many valid ways to correct a passage, so only a
// confident exact match short-circuits to an instant score; anything else
// waits for a human reviewer rather than being marked incorrect.
export type GradeResult = { status: "scored" | "pending"; correct: boolean | null };

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, "")
    .replace(/\s+/g, " ");
}

// Passage Reconstruction is graded on whether the grammar got fixed, not on
// reproducing the reference's exact punctuation/capitalization choices —
// unlike Dictation/Repeats, where transcribing punctuation correctly is the
// point. Strips all internal punctuation too (not just trailing), so a
// stray comma or an un-capitalized "she" doesn't fail an otherwise-correct
// correction.
function normalizeLoose(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, "")
    .replace(/\s+/g, " ");
}

export function gradeAttempt(itemTypeId: string, answerSet: unknown, responseText: string | undefined): GradeResult {
  const set = (answerSet ?? {}) as Record<string, unknown>;
  if (!responseText) return { status: "pending", correct: null };
  const given = normalize(responseText);

  switch (itemTypeId) {
    case "dictation":
    case "repeats": {
      const exact = set.exact;
      if (typeof exact !== "string") return { status: "pending", correct: null };
      return { status: "scored", correct: given === normalize(exact) };
    }
    case "short_answer":
    case "sentence_completion": {
      const accepted = set.acceptable_answers;
      if (!Array.isArray(accepted) || accepted.length === 0) return { status: "pending", correct: null };
      return { status: "scored", correct: accepted.some((a) => typeof a === "string" && normalize(a) === given) };
    }
    case "sentence_builds": {
      const candidates = [set.correct, ...((Array.isArray(set.alternates) ? set.alternates : []) as unknown[])].filter(
        (c): c is string => typeof c === "string",
      );
      if (candidates.length === 0) return { status: "pending", correct: null };
      return { status: "scored", correct: candidates.some((c) => normalize(c) === given) };
    }
    case "passage_reconstruction": {
      const corrected = set.corrected;
      if (typeof corrected !== "string") return { status: "pending", correct: null };
      if (normalizeLoose(corrected) === normalizeLoose(responseText)) return { status: "scored", correct: true };
      return { status: "pending", correct: null };
    }
    default:
      // reading, story_retelling, open_questions, free_writing: no single
      // correct text — needs a human reviewer or a future rubric/
      // pronunciation-scoring model.
      return { status: "pending", correct: null };
  }
}
