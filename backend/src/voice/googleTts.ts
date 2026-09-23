// Real AI-generated item audio (male/female, standard American accent),
// replacing the frontend's browser-native speechSynthesis for items that
// have been batch-generated (see ../../scripts/generateItemAudio.ts).
// Plain REST, not the @google-cloud SDK, so this only needs a restricted
// API key rather than a service-account credential file — same shape as
// GEMINI_API_KEY elsewhere in this codebase. Fails closed exactly like
// geminiFluency.ts: no key, a non-OK response, or a network error all
// resolve to null, and the caller (the batch script) just skips that item
// rather than crashing the whole run.

export type VoiceGender = "male" | "female";

// Chosen from Google's en-US Neural2 voice set: clear, standard American
// accent, one male and one female. Not stored per item_audio row — that
// table's voice_id column is the gender label ('male'/'female'), which is
// what the rest of the app (preferred_voice, item-serving joins) keys on.
const VOICE_NAME: Record<VoiceGender, string> = {
  male: "en-US-Neural2-D",
  female: "en-US-Neural2-F",
};

export interface SynthesizedSpeech {
  audioBase64: string;
  mimeType: string;
}

export async function synthesizeSpeech(text: string, voice: VoiceGender): Promise<SynthesizedSpeech | null> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "en-US", name: VOICE_NAME[voice] },
        audioConfig: { audioEncoding: "MP3" },
      }),
    });
    if (!res.ok) {
      console.error("synthesizeSpeech: request failed:", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { audioContent?: string };
    if (!json.audioContent) return null;
    return { audioBase64: json.audioContent, mimeType: "audio/mpeg" };
  } catch (err) {
    console.error("synthesizeSpeech: request failed:", err);
    return null;
  }
}
