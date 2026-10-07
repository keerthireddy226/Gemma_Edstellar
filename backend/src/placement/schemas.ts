import { z } from "zod";

export const submitAttemptSchema = z.object({
  itemId: z.string().uuid(),
  responseText: z.string().optional(),
  // Recorded mic responses, base64-encoded — small enough (a few seconds of
  // speech) that a data URL round-trip is fine without a multipart upload.
  audioBase64: z.string().optional(),
  audioMimeType: z.string().optional(),
  // Wall-clock length of the recording, in milliseconds — used to compute
  // speech rate (words per minute). Only meaningful for mic answers.
  durationMs: z.number().positive().optional(),
  // Real time spent on this question — question shown to submitted, tracked
  // client-side. Applies to every input method, not just mic answers. Used
  // for practice-time stats instead of session wall-clock span, which also
  // counts idle/dashboard time.
  activeMs: z.number().int().min(0).optional(),
});
