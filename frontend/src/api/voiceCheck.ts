import { api } from "@/lib/api";

export type VoiceCheckPurpose = "placement" | "practice" | "practice_test";

export function getVoiceEnrollmentStatus(): Promise<{ enrolled: boolean }> {
  return api("/voice/enrollment/status");
}

export interface VoiceSample {
  audioBase64: string;
  audioMimeType: string;
}

// 2 takes of the phrase — embeddings averaged server-side into one
// voiceprint (see backend/src/voice/speakerVerification.ts).
export function enrollVoice(samples: VoiceSample[]): Promise<{ status: "enrolled" | "failed" }> {
  return api("/voice/enrollment", {
    method: "POST",
    body: JSON.stringify({ consentGiven: true, samples }),
  });
}

export function verifyVoice(
  purpose: VoiceCheckPurpose,
  audioBase64: string,
  audioMimeType: string,
): Promise<{ voiceCheckId: string; allowed: boolean; decision: "match" | "mismatch" | "error" }> {
  return api("/voice/verify", {
    method: "POST",
    body: JSON.stringify({ purpose, audioBase64, audioMimeType }),
  });
}
