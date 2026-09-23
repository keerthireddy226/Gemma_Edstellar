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
  // null until at least one practice answer has been graded — see
  // dashboard/routes.ts for why 0% isn't used as the "no data yet" value.
  accuracyPercent: number | null;
}

export interface InProgressPractice {
  skill: SkillTag;
  answered: number;
  total: number;
}

export interface DashboardData {
  firstName: string | null;
  startSkill: SkillTag;
  modules: DashboardModule[];
  todaysTasks: TodaysTask[];
  stats: DashboardStats;
  inProgressPractice: InProgressPractice | null;
}

export function getDashboard(): Promise<DashboardData> {
  return api("/dashboard");
}

export interface DailyStat {
  date: string;
  questionsCompleted: number;
  // null on a day with no graded answers yet — same "no evidence yet"
  // convention as DashboardStats.accuracyPercent.
  accuracyPercent: number | null;
  practiceMinutes: number;
}

export interface DailyProgress {
  days: DailyStat[];
  totalQuestions: number;
  // Weighted across the whole week, not an average of each day's percent —
  // see dashboard/routes.ts.
  weekAccuracyPercent: number | null;
  bestDay: DailyStat;
  streakDays: number;
}

export function getDailyProgress(): Promise<DailyProgress> {
  return api("/dashboard/daily");
}
