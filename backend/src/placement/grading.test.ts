import { describe, expect, it } from "vitest";
import { gradeAttempt } from "./grading.js";

// Only the exact-match/text-diff item types are covered here — the AI-graded
// types (AI_GRADED_TYPES) call out to Gemini and aren't pure functions, so
// they're outside what a unit test can cheaply and honestly cover.

describe("gradeAttempt", () => {
  it("returns pending when there's no response text at all", async () => {
    const result = await gradeAttempt("dictation", { exact: "hello" }, {}, "A1", null, undefined);
    expect(result).toEqual({ status: "pending", correct: null, score: null, method: null });
  });

  describe("dictation (exact text match)", () => {
    it("matches ignoring case, trailing punctuation, and extra whitespace", async () => {
      const result = await gradeAttempt("dictation", { exact: "The cat sat." }, {}, "A1", null, "the   cat sat");
      expect(result).toEqual({ status: "scored", correct: true, score: 1, method: "exact-match" });
    });

    it("marks a genuinely different answer wrong", async () => {
      const result = await gradeAttempt("dictation", { exact: "The cat sat." }, {}, "A1", null, "the dog ran");
      expect(result.correct).toBe(false);
      expect(result.score).toBe(0);
    });

    it("is pending if the answer set has no exact text configured", async () => {
      const result = await gradeAttempt("dictation", {}, {}, "A1", null, "anything");
      expect(result.status).toBe("pending");
    });
  });

  describe("sentence_completion (any of several accepted answers)", () => {
    it("accepts any listed acceptable answer, normalized", async () => {
      const result = await gradeAttempt(
        "sentence_completion",
        { acceptable_answers: ["against", "Against!"] },
        {},
        "A1",
        null,
        "AGAINST",
      );
      expect(result).toEqual({ status: "scored", correct: true, score: 1, method: "exact-match" });
    });

    it("rejects an answer not in the accepted list", async () => {
      const result = await gradeAttempt("sentence_completion", { acceptable_answers: ["against"] }, {}, "A1", null, "for");
      expect(result.correct).toBe(false);
    });

    it("is pending if there are no acceptable answers configured", async () => {
      const result = await gradeAttempt("sentence_completion", { acceptable_answers: [] }, {}, "A1", null, "for");
      expect(result.status).toBe("pending");
    });
  });

  describe("response_selection / reading_comprehension (multiple choice by index)", () => {
    it("compares the submitted option index to the correct index", async () => {
      const right = await gradeAttempt("response_selection", { correctIndex: 2 }, {}, "A1", null, "2");
      expect(right.correct).toBe(true);
      const wrong = await gradeAttempt("reading_comprehension", { correctIndex: 2 }, {}, "A1", null, "0");
      expect(wrong.correct).toBe(false);
    });

    it("is pending for a non-integer response (never a false 'wrong')", async () => {
      const result = await gradeAttempt("response_selection", { correctIndex: 2 }, {}, "A1", null, "not-a-number");
      expect(result.status).toBe("pending");
    });
  });

  describe("typing (word-level diff against target text)", () => {
    it("scores an exact retype at 1", async () => {
      const result = await gradeAttempt("typing", {}, { text: "The quick brown fox" }, "B1", null, "The quick brown fox");
      expect(result.method).toBe("text-diff");
      expect(result.score).toBe(1);
      // B1's pass bar is 0.65 — a perfect score clears it.
      expect(result.correct).toBe(true);
    });

    it("scores a partial retype proportionally below 1", async () => {
      const result = await gradeAttempt("typing", {}, { text: "The quick brown fox" }, "B1", null, "The quick brown");
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(1);
    });

    it("is pending if the item has no target text", async () => {
      const result = await gradeAttempt("typing", {}, {}, "B1", null, "anything");
      expect(result.status).toBe("pending");
    });
  });

  it("falls back to pending for an item type with no grading rule at all", async () => {
    const result = await gradeAttempt("some_unhandled_type", {}, {}, "A1", null, "anything");
    expect(result).toEqual({ status: "pending", correct: null, score: null, method: null });
  });
});
