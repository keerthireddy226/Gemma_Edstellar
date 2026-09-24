import { describe, expect, it } from "vitest";
import { CEFR_LEVELS, cefrRank, percentToCefr, passThresholdForLevel, stepLevel, assessSkillLevel } from "./cefr.js";

describe("cefrRank", () => {
  it("ranks levels in scale order", () => {
    expect(cefrRank("A1")).toBe(0);
    expect(cefrRank("C2")).toBe(CEFR_LEVELS.length - 1);
  });
});

describe("percentToCefr", () => {
  it("maps percent bands to the documented levels", () => {
    expect(percentToCefr(0)).toBe("A1");
    expect(percentToCefr(19)).toBe("A1");
    expect(percentToCefr(20)).toBe("A2");
    expect(percentToCefr(39)).toBe("A2");
    expect(percentToCefr(40)).toBe("B1");
    expect(percentToCefr(59)).toBe("B1");
    expect(percentToCefr(60)).toBe("B2");
    expect(percentToCefr(74)).toBe("B2");
    expect(percentToCefr(75)).toBe("C1");
    expect(percentToCefr(89)).toBe("C1");
    expect(percentToCefr(90)).toBe("C2");
    expect(percentToCefr(100)).toBe("C2");
  });
});

describe("passThresholdForLevel", () => {
  it("returns the per-level bar, stricter at the top than the bottom", () => {
    expect(passThresholdForLevel("A1")).toBe(0.6);
    expect(passThresholdForLevel("B1")).toBe(0.65);
    expect(passThresholdForLevel("C2")).toBe(0.95);
  });

  it("falls back to the B1 bar for null or an unrecognized level", () => {
    expect(passThresholdForLevel(null)).toBe(0.65);
    expect(passThresholdForLevel("not-a-level")).toBe(0.65);
  });
});

describe("stepLevel", () => {
  it("steps one level harder on correct, one easier on wrong", () => {
    expect(stepLevel("B1", true)).toBe("B2");
    expect(stepLevel("B1", false)).toBe("A2");
  });

  it("clamps at the ends of the scale instead of going out of range", () => {
    expect(stepLevel("C2", true)).toBe("C2");
    expect(stepLevel("A1", false)).toBe("A1");
  });
});

describe("assessSkillLevel", () => {
  it("returns a null, non-capped result when nothing is tagged with a real CEFR level", () => {
    expect(assessSkillLevel([])).toEqual({ level: null, cappedByGap: false });
    expect(assessSkillLevel([{ cefrLevel: null, correct: true }])).toEqual({ level: null, cappedByGap: false });
  });

  it("certifies the highest level with enough sample and accuracy at or above its own bar", () => {
    const items = [
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A2", correct: true },
      { cefrLevel: "A2", correct: true },
    ];
    expect(assessSkillLevel(items)).toEqual({ level: "A2", cappedByGap: false });
  });

  it("stops the walk at a true 0% level (a real ceiling, not noise)", () => {
    const items = [
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A2", correct: false },
      { cefrLevel: "A2", correct: false },
    ];
    expect(assessSkillLevel(items)).toEqual({ level: "A1", cappedByGap: false });
  });

  it("treats a single shaky level (below bar, not 0%) as noise and keeps walking", () => {
    // B1's bar is 0.65 — 1/2 = 50% is below bar but not a true 0%, so this
    // one dip alone shouldn't cap the result; B2 passing afterward should
    // still count as the highest certified level. (A2 needs its own real
    // evidence too, or the walk stops on that gap before ever reaching B1.)
    const items = [
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A2", correct: true },
      { cefrLevel: "A2", correct: true },
      { cefrLevel: "B1", correct: true },
      { cefrLevel: "B1", correct: false },
      { cefrLevel: "B2", correct: true },
      { cefrLevel: "B2", correct: true },
    ];
    expect(assessSkillLevel(items)).toEqual({ level: "B2", cappedByGap: false });
  });

  it("stops after two consecutive dips even without a true 0%", () => {
    const items = [
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A2", correct: true },
      { cefrLevel: "A2", correct: false }, // dip 1 (50%, below A2's 0.6 bar)
      { cefrLevel: "B1", correct: true },
      { cefrLevel: "B1", correct: false }, // dip 2 (50%, below B1's 0.65 bar)
      { cefrLevel: "B2", correct: true },
      { cefrLevel: "B2", correct: true },
    ];
    expect(assessSkillLevel(items)).toEqual({ level: "A1", cappedByGap: false });
  });

  it("a level with fewer than MIN_LEVEL_SAMPLE items counts as untested, not passed or failed", () => {
    // Only one A2 item (below the 2-item minimum sample) — treated as a gap.
    const items = [
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A2", correct: true },
      { cefrLevel: "B1", correct: true },
      { cefrLevel: "B1", correct: true },
    ];
    // Gap at A2 with nothing tested beyond it in this input? No — B1 IS
    // tested beyond the gap, so this should be flagged as capped by gap.
    expect(assessSkillLevel(items)).toEqual({ level: "A1", cappedByGap: true });
  });

  it("does not flag cappedByGap when nothing beyond the gap was tested", () => {
    const items = [
      { cefrLevel: "A1", correct: true },
      { cefrLevel: "A1", correct: true },
      // A2 never tested at all — a trailing gap, not a confusing one.
    ];
    expect(assessSkillLevel(items)).toEqual({ level: "A1", cappedByGap: false });
  });

  it("does not penalize untested levels before the first real evidence", () => {
    // Sample starts at B1 (A1/A2 never tested) — that's just where the
    // evidence begins, not a gap.
    const items = [
      { cefrLevel: "B1", correct: true },
      { cefrLevel: "B1", correct: true },
    ];
    expect(assessSkillLevel(items)).toEqual({ level: "B1", cappedByGap: false });
  });
});
