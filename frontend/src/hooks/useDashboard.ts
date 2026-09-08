import { api } from "@/lib/api";
import type { SkillTag } from "@/hooks/useTestSession";

export type ModuleStatus = "not_started" | "in_progress" | "completed";

export interface DashboardModule {
  skill: SkillTag;
  status: ModuleStatus;
  progressPercent: number;
}

export interface TodaysTask {
  skill: SkillTag;
  itemTarget: number;
  itemsCompletedToday: number;
  done: boolean;
}

export interface DashboardStats {
  sessions: number;
  questionsCompleted: number;
  practiceMinutes: number;
  streakDays: number;
}

export interface DashboardData {
  firstName: string | null;
  startSkill: SkillTag;
  modules: DashboardModule[];
  todaysTasks: TodaysTask[];
  stats: DashboardStats;
}

export function getDashboard(): Promise<DashboardData> {
  return api("/dashboard");
}
