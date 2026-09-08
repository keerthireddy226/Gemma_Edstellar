import { api } from "@/lib/api";
import type { CefrLevel, SkillTag } from "@/hooks/useTestSession";

export interface RoadmapMilestone {
  level: CefrLevel;
  labelType: "reach" | "maintain";
  targetDayOffset: number;
  focusSkill: SkillTag;
}

export interface RoadmapData {
  firstName: string | null;
  placement: {
    overallPercent: number;
    cefrLevel: CefrLevel;
    skillPercents: Record<SkillTag, number>;
    takenAt: string;
  };
  goalLevel: CefrLevel;
  accessWindow: { startDate: string; durationDays: number } | null;
  roadmap: {
    pace: "maintenance" | "light" | "steady" | "intensive";
    minutesPerDay: number;
    totalHoursEstimate: number;
    milestones: RoadmapMilestone[];
  };
  recommendedPractice: {
    focusSkill: SkillTag;
    items: { itemTypeId: string; name: string; questionInstruction: string; estimatedSeconds: number }[];
  };
}

export function getRoadmap(): Promise<RoadmapData> {
  return api("/roadmap");
}
