export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function cefrRank(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

/**
 * Approximate percent-correct -> CEFR band. A reasonable heuristic, not an
 * official Pearson/Versant score conversion — always surfaced to the user as
 * an estimate, never claimed as official.
 */
export function percentToCefr(percent: number): CefrLevel {
  if (percent < 20) return "A1";
  if (percent < 40) return "A2";
  if (percent < 60) return "B1";
  if (percent < 75) return "B2";
  if (percent < 90) return "C1";
  return "C2";
}

// How much accuracy it takes to be credited with a level, and it isn't the
// same at every level — clearing A2 with a couple of lucky guesses is fine,
// but calling someone C2 ("near-native") off a bare 60% would be handing out
// the top of the entire CEFR scale too cheaply. The top levels require
// close to flawless performance; the bottom levels stay lenient, since a
// true beginner making basic errors is expected, not disqualifying.
const LEVEL_PASS_THRESHOLD: Record<CefrLevel, number> = {
  A1: 0.6,
  A2: 0.6,
  B1: 0.65,
  B2: 0.7,
  C1: 0.85,
  C2: 0.95,
};

export function passThresholdForLevel(level: string | null): number {
  if (level && level in LEVEL_PASS_THRESHOLD) return LEVEL_PASS_THRESHOLD[level as CefrLevel];
  return LEVEL_PASS_THRESHOLD.B1;
}

/**
 * Assesses a level from *which* difficulty of items a learner actually got
 * right, instead of one flat percent-correct — two learners who score 50%
 * overall but on opposite ends of the difficulty range aren't equally
 * proficient, and a flat percentage can't tell them apart.
 *
 * Walks A1 -> C2, tracking the highest level with accuracy at or above that
 * level's own pass bar (see LEVEL_PASS_THRESHOLD — 60% is enough at A1/A2,
 * but C2 demands 95%). A single shaky level (below threshold but not 0%) is
 * treated as noise from a small per-level sample and doesn't cap the result
 * — but two such dips in a row, or any level with a true 0% accuracy, is
 * treated as a real ceiling and stops the walk there.
 *
 * Once the walk has reached the first level with any real evidence, a later
 * level with zero attempted items stops the walk there too, same as a 0% —
 * it does NOT get skipped over. Passing a scattered handful of levels with
 * an untested gap in between (e.g. A2 and C2 both tested and passed, but B1
 * and C1 never asked at all) is not evidence of C2 ability: we only have a
 * real basis to certify up to the last level in an *unbroken* chain of
 * levels we actually tested and the learner actually passed, starting from
 * wherever their evidence begins. Beyond a gap, we genuinely don't know, and
 * shouldn't report a level as if we did. (Untested levels *before* the first
 * tested one don't count against this — e.g. if the sample happened to start
 * at A2, that's just where the evidence begins, not a gap.)
 *
 * Heuristic, like percentToCefr — not an officially validated psychometric
 * scale, and only as good as the per-item cefr_level tags it's fed. When a
 * gap makes this return a null level, the caller falls back to a cruder
 * flat-percent estimate rather than a fabricated precise one.
 *
 * `cappedByGap` tells the caller *why* the walk stopped where it did: true
 * means it hit an untested level with higher-level answers waiting beyond
 * it (so the raw percent-correct on what *was* tested can look deceptively
 * high right next to a low capped level — that combination needs explaining
 * to the learner, not just displaying as-is). False means it stopped for a
 * real reason (failed a level, or simply ran out of graded items), which
 * doesn't need that caveat.
 */
export interface SkillLevelAssessment {
  level: CefrLevel | null;
  cappedByGap: boolean;
}

export function assessSkillLevel(gradedItems: { cefrLevel: string | null; correct: boolean }[]): SkillLevelAssessment {
  const byLevel = new Map<CefrLevel, { correct: number; total: number }>();
  for (const item of gradedItems) {
    if (!item.cefrLevel || !CEFR_LEVELS.includes(item.cefrLevel as CefrLevel)) continue;
    const level = item.cefrLevel as CefrLevel;
    const entry = byLevel.get(level) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (item.correct) entry.correct += 1;
    byLevel.set(level, entry);
  }
  if (byLevel.size === 0) return { level: null, cappedByGap: false };

  let highestPassed: CefrLevel | null = null;
  let consecutiveDips = 0;
  let sawFirstTestedLevel = false;
  for (const level of CEFR_LEVELS) {
    const entry = byLevel.get(level);
    if (!entry) {
      if (sawFirstTestedLevel) {
        // Stopped on a gap — but only worth flagging if there's graded
        // evidence at a *higher* level than where we stopped, since that's
        // exactly the "100% next to a low level" situation that needs an
        // explanation. A gap with nothing tested beyond it isn't confusing.
        const higherLevelTested = CEFR_LEVELS.slice(cefrRank(level) + 1).some((l) => byLevel.has(l));
        return { level: highestPassed, cappedByGap: higherLevelTested };
      }
      continue;
    }
    sawFirstTestedLevel = true;
    const accuracy = entry.correct / entry.total;
    if (accuracy === 0) break;
    if (accuracy >= passThresholdForLevel(level)) {
      highestPassed = level;
      consecutiveDips = 0;
    } else {
      consecutiveDips += 1;
      if (consecutiveDips >= 2) break;
    }
  }
  return { level: highestPassed, cappedByGap: false };
}
