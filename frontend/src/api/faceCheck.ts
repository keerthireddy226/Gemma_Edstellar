import { api } from "@/lib/api";

export type FaceCheckPurpose = "placement" | "practice" | "practice_test";

export function getFaceEnrollmentStatus(): Promise<{ enrolled: boolean }> {
  return api("/face/enrollment/status");
}

export function enrollFace(imageBase64: string): Promise<{ status: "enrolled" | "failed"; reasons?: string[] }> {
  return api("/face/enrollment", {
    method: "POST",
    body: JSON.stringify({ consentGiven: true, imageBase64 }),
  });
}

export interface FaceVerifyResult {
  faceCheckId: string;
  allowed: boolean;
  decision: "match" | "uncertain" | "mismatch" | "no_face" | "multiple_faces" | "spoof" | "error";
  retake: boolean;
  fallbackEligible?: boolean;
  retriesRemaining?: number;
  reason?: string;
}

export function verifyFace(purpose: FaceCheckPurpose, imageBase64: string): Promise<FaceVerifyResult> {
  return api("/face/verify", {
    method: "POST",
    body: JSON.stringify({ purpose, imageBase64 }),
  });
}

export function requestFaceFallback(
  purpose: FaceCheckPurpose,
  failedResultId: string,
): Promise<{ fallbackRequestId: string; status: "pending" }> {
  return api("/face/fallback/request", {
    method: "POST",
    body: JSON.stringify({ purpose, failedResultId }),
  });
}

export function getFaceFallbackStatus(id: string): Promise<{ status: "pending" | "approved" | "denied" | "expired"; consumed: boolean }> {
  return api(`/face/fallback/status/${id}`);
}

export function consumeFaceFallback(fallbackRequestId: string): Promise<{ consumed: boolean }> {
  return api("/face/fallback/consume", {
    method: "POST",
    body: JSON.stringify({ fallbackRequestId }),
  });
}
