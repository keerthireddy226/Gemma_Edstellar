import type { CefrLevel } from "@/hooks/useTestSession";

export const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function cefrRank(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

export function meetsGoal(assessed: CefrLevel, goal: CefrLevel): boolean {
  return cefrRank(assessed) >= cefrRank(goal);
}

// Used to turn a per-skill percentage into a level label for the skill
// breakdown widget — same bands the backend uses for the overall level.
export function percentToCefr(percent: number): CefrLevel {
  if (percent < 20) return "A1";
  if (percent < 40) return "A2";
  if (percent < 60) return "B1";
  if (percent < 75) return "B2";
  if (percent < 90) return "C1";
  return "C2";
}
