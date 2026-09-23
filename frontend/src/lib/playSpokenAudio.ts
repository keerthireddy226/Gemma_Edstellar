import { speak } from "@/hooks/useVoiceRecorder";
import type { TestItem } from "@/hooks/useTestSession";

// Prefers real pre-generated AI voice audio (item.audioUrl) over the
// browser's speechSynthesis — falls back to speak(segments) whenever
// there's no URL yet, the file fails to load, or playback itself errors, so
// an item that hasn't been through generateItemAudio.ts yet (or a bad file)
// never breaks audio entirely.
export function playSpokenAudio(item: TestItem, segments: string[]): Promise<void> {
  if (!item.audioUrl) return speak(segments);

  return new Promise((resolve) => {
    const audio = new Audio(item.audioUrl!);
    audio.onended = () => resolve();
    audio.onerror = () => speak(segments).then(resolve);
    audio.play().catch(() => speak(segments).then(resolve));
  });
}
