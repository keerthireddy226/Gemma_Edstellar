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
});
