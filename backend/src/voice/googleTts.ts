// Real AI-generated item audio (male/female), batch-generated. Fails closed to null on any error.

export type VoiceGender = "male" | "female";

// Google's en-US Neural2 voice set. item_audio.voice_id stores the gender label, not this name.
const VOICE_NAME: Record<VoiceGender, string> = {
  male: "en-US-Neural2-D",
  female: "en-US-Neural2-F",
};

export interface SynthesizedSpeech {
  audioBuffer: Buffer;
  mimeType: string;
  durationMs: number | null;
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
    const audioBuffer = Buffer.from(json.audioContent, "base64");
    // Google doesn't return an exact duration — estimated from the MP3's
    // byte size at its default encoding bitrate (good enough; nothing reads
    // this for playback timing today, only item_audio.duration_ms).
    const MP3_BITRATE_KBPS = 32;
    const durationMs = Math.round((audioBuffer.byteLength * 8) / MP3_BITRATE_KBPS);
    return { audioBuffer, mimeType: "audio/mpeg", durationMs };
  } catch (err) {
    console.error("synthesizeSpeech: request failed:", err);
    return null;
  }
}
