import type { TestItem } from "@/hooks/useTestSession";

// These are heard, not read — showing the source text on screen would let a
// learner just read it back instead of actually listening. Dictation is
// typed but still needs the audio played first, same reasoning.
export const AUDIO_FIRST_TYPES = new Set(["repeats", "short_answer", "sentence_builds", "story_retelling", "dictation"]);

// Tailwind can't resolve a dynamic `text-${skill}` class at build time — it
// only picks up classes that appear as literal strings somewhere in source,
// so the mapping has to be spelled out.
export const SKILL_TEXT_CLASS: Record<string, string> = {
  listening: "text-listening",
  speaking: "text-speaking",
  reading: "text-reading",
  writing: "text-writing",
};

export const ITEM_TYPE_META: Record<string, { name: string; skills: ("listening" | "speaking" | "reading" | "writing")[] }> = {
  reading: { name: "Reading", skills: ["speaking"] },
  repeats: { name: "Repeats", skills: ["listening", "speaking"] },
  short_answer: { name: "Short Answer", skills: ["listening", "speaking"] },
  sentence_builds: { name: "Sentence Builds", skills: ["listening", "speaking"] },
  story_retelling: { name: "Story Retelling", skills: ["listening", "speaking"] },
  open_questions: { name: "Open Questions", skills: ["speaking"] },
  dictation: { name: "Dictation", skills: ["listening", "writing"] },
  sentence_completion: { name: "Sentence Completion", skills: ["writing"] },
  passage_reconstruction: { name: "Passage Reconstruction", skills: ["reading", "writing"] },
  free_writing: { name: "Free Writing", skills: ["writing"] },
};

export function getSpokenSegments(item: TestItem): string[] {
  const c = item.content as Record<string, unknown>;
  if (item.itemTypeId === "sentence_builds" && Array.isArray(c.groups)) return c.groups as string[];
  if (typeof c.text === "string") return [c.text];
  if (typeof c.question === "string") return [c.question];
  if (typeof c.story === "string") return [c.story];
  return [];
}

export function getVisibleText(item: TestItem): string {
  const c = item.content as Record<string, unknown>;
  return (c.text ?? c.question ?? c.sentence ?? c.passage ?? c.prompt ?? "") as string;
}
