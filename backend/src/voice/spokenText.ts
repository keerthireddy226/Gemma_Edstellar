// A server-side port of frontend/src/lib/testItemDisplay.ts's
// getSpokenSegments(item) — needed because the batch generation script
// (../../scripts/generateItemAudio.ts) runs in plain Node and can't import
// a browser-bundled frontend module. KEEP THIS IN SYNC: if the field-
// priority logic in getSpokenSegments changes, mirror the change here too.

export function getSpokenSegments(itemTypeId: string, content: Record<string, unknown>): string[] {
  if (itemTypeId === "sentence_builds" && Array.isArray(content.groups)) return content.groups as string[];
  if (typeof content.dialogue === "string" && typeof content.question === "string") {
    return [content.dialogue, content.question];
  }
  if (typeof content.story === "string" && typeof content.question === "string") {
    return [content.story, content.question];
  }
  if (typeof content.text === "string") return [content.text];
  if (typeof content.question === "string") return [content.question];
  if (typeof content.story === "string") return [content.story];
  return [];
}

// Items whose type needs spoken audio at all — mirrors AUDIO_FIRST_TYPES in
// frontend/src/lib/testItemDisplay.ts exactly. KEEP IN SYNC with that set.
export const AUDIO_FIRST_TYPES = new Set([
  "repeats",
  "short_answer",
  "sentence_builds",
  "story_retelling",
  "dictation",
  "conversations",
  "passage_comprehension",
  "response_selection",
]);
