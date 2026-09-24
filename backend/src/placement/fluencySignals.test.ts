import { describe, expect, it } from "vitest";
import { computeFluencySignals, isTrulyCorrect } from "./fluencySignals.js";
import { passThresholdForLevel } from "./cefr.js";

describe("computeFluencySignals", () => {
  it("counts words and unambiguous filler interjections", () => {
    const result = computeFluencySignals("Um, I think, uh, this is correct.", 5000);
    expect(result.wordCount).toBe(7);
    expect(result.fillerCount).toBe(2);
  });

  it("does not treat ordinary words like 'like' as fillers", () => {
    const result = computeFluencySignals("I like apples and I like oranges too.", 5000);
    expect(result.fillerCount).toBe(0);
  });

  it("computes words per minute from word count and duration", () => {
    // 10 words in 5000ms = 120 words/minute.
    const result = computeFluencySignals("one two three four five six seven eight nine ten", 5000);
    expect(result.wordsPerMinute).toBe(120);
  });

  it("reports wordsPerMinute as null under the 1.5s false-start threshold", () => {
    expect(computeFluencySignals("hi there", 1000).wordsPerMinute).toBeNull();
    expect(computeFluencySignals("hi there", null).wordsPerMinute).toBeNull();
    expect(computeFluencySignals("hi there", undefined).wordsPerMinute).toBeNull();
  });

  it("handles empty input without crashing", () => {
    // 0 words in 5000ms is still a defined (if meaningless) rate of 0 wpm —
    // only a too-short duration reports wordsPerMinute as null, not an empty transcript.
    expect(computeFluencySignals("", 5000)).toEqual({ wordCount: 0, wordsPerMinute: 0, fillerCount: 0 });
  });
});

describe("isTrulyCorrect", () => {
  it("is false when there's no content score at all", () => {
    expect(isTrulyCorrect(null, "B1", "text", null, passThresholdForLevel)).toBe(false);
  });

  it("for non-mic input, correctness is content score alone against the level's bar", () => {
    expect(isTrulyCorrect(0.65, "B1", "text", null, passThresholdForLevel)).toBe(true);
    expect(isTrulyCorrect(0.64, "B1", "text", null, passThresholdForLevel)).toBe(false);
    // Manner scores present but input isn't mic — ignored entirely.
    expect(isTrulyCorrect(0.65, "B1", "text", { wordsPerMinute: 1000 }, passThresholdForLevel)).toBe(true);
  });

  it("for mic input, content below the bar is wrong regardless of manner scores", () => {
    expect(isTrulyCorrect(0.5, "B1", "mic", { wordsPerMinute: 130 }, passThresholdForLevel)).toBe(false);
  });

  it("for mic input with content passing, a wildly off pace fails it", () => {
    expect(isTrulyCorrect(0.9, "B1", "mic", { wordsPerMinute: 30 }, passThresholdForLevel)).toBe(false);
    expect(isTrulyCorrect(0.9, "B1", "mic", { wordsPerMinute: 300 }, passThresholdForLevel)).toBe(false);
    expect(isTrulyCorrect(0.9, "B1", "mic", { wordsPerMinute: 130 }, passThresholdForLevel)).toBe(true);
  });

  it("a missing pace/gemini signal never counts against the learner", () => {
    expect(isTrulyCorrect(0.9, "B1", "mic", {}, passThresholdForLevel)).toBe(true);
    expect(isTrulyCorrect(0.9, "B1", "mic", null, passThresholdForLevel)).toBe(true);
  });

  it("for mic input with content passing, gemini pronunciation/fluency below the bar fails it", () => {
    const bar = passThresholdForLevel("B1"); // 0.65
    expect(
      isTrulyCorrect(0.9, "B1", "mic", { gemini: { pronunciation: bar - 0.01, fluency: 0.9, comment: "" } }, passThresholdForLevel),
    ).toBe(false);
    expect(
      isTrulyCorrect(0.9, "B1", "mic", { gemini: { pronunciation: 0.9, fluency: bar - 0.01, comment: "" } }, passThresholdForLevel),
    ).toBe(false);
    expect(
      isTrulyCorrect(0.9, "B1", "mic", { gemini: { pronunciation: bar, fluency: bar, comment: "" } }, passThresholdForLevel),
    ).toBe(true);
  });
});
