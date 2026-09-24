import { api } from "@/lib/api";

export type VoiceCheckPurpose = "placement" | "practice" | "practice_test";

export function getVoiceEnrollmentStatus(): Promise<{ enrolled: boolean }> {
  return api("/voice/enrollment/status");
}

export function enrollVoice(audioBase64: string, audioMimeType: string): Promise<{ status: "enrolled" | "failed" }> {
  return api("/voice/enrollment", {
    method: "POST",
    body: JSON.stringify({ consentGiven: true, audioBase64, audioMimeType }),
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
