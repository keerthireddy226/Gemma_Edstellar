import type { SkillTag } from "@/api/testSession";

export const SKILL_TINT_CLASSES: Record<SkillTag, string> = {
  listening: "bg-listening/15 text-listening",
  speaking: "bg-speaking/20 text-navy-deep font-semibold",
  reading: "bg-reading/15 text-reading",
  writing: "bg-writing/15 text-writing",
};

export const SKILL_RING_COLOR: Record<SkillTag, string> = {
  listening: "text-listening",
  speaking: "text-speaking",
  reading: "text-reading",
  writing: "text-writing",
};
