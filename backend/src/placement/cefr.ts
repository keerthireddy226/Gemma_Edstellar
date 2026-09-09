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

const PASS_THRESHOLD = 0.6;

/**
 * Assesses a level from *which* difficulty of items a learner actually got
 * right, instead of one flat percent-correct — two learners who score 50%
 * overall but on opposite ends of the difficulty range aren't equally
 * proficient, and a flat percentage can't tell them apart.
 *
 * Walks A1 -> C2, tracking the highest level with >= 60% accuracy. A single
 * shaky level (below threshold but not 0%) is treated as noise from a small
 * per-level sample and doesn't cap the result — but two such dips in a row,
 * or any level with a true 0% accuracy, is treated as a real ceiling and
 * stops the walk there. Levels with no attempted items are skipped rather
 * than counted as a pass or fail.
 *
 * Heuristic, like percentToCefr — not an officially validated psychometric
 * scale, and only as good as the per-item cefr_level tags it's fed.
 */
export function assessSkillLevel(gradedItems: { cefrLevel: string | null; correct: boolean }[]): CefrLevel | null {
  const byLevel = new Map<CefrLevel, { correct: number; total: number }>();
  for (const item of gradedItems) {
    if (!item.cefrLevel || !CEFR_LEVELS.includes(item.cefrLevel as CefrLevel)) continue;
    const level = item.cefrLevel as CefrLevel;
    const entry = byLevel.get(level) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (item.correct) entry.correct += 1;
    byLevel.set(level, entry);
  }
  if (byLevel.size === 0) return null;

  let highestPassed: CefrLevel | null = null;
  let consecutiveDips = 0;
  for (const level of CEFR_LEVELS) {
    const entry = byLevel.get(level);
    if (!entry) continue;
    const accuracy = entry.correct / entry.total;
    if (accuracy === 0) break;
    if (accuracy >= PASS_THRESHOLD) {
      highestPassed = level;
      consecutiveDips = 0;
    } else {
      consecutiveDips += 1;
      if (consecutiveDips >= 2) break;
    }
  }
  return highestPassed;
}
