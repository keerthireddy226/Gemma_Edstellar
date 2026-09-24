// Voice Check — speaker identity verification. See speakerVerification.ts
// for how the matching itself works. This file is deliberately simple:
// enroll once, verify before every session. A real mismatch or unreadable
// audio blocks (the learner has to re-record); only a missing/failed
// enrollment — a setup gap, not something re-recording fixes — lets them
// through anyway.
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { computeEmbedding, cosineSimilarity, embeddingToBuffer, bufferToEmbedding, MATCH_THRESHOLD } from "./speakerVerification.js";

export const voiceRouter = Router();

const ENROLLMENT_UPLOADS_DIR = path.join(process.cwd(), "uploads", "voice-enrollment");
const CHECK_UPLOADS_DIR = path.join(process.cwd(), "uploads", "voice-check");

// Same shape as placement/practice routes' rate limiters — skipped outside
// production so local testing/QA never gets locked out.
const voiceCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== "production",
  handler: (_req, res) => {
    res.status(429).json({ error: "too_many_attempts" });
  },
});

function extFromMime(mimeType: string | undefined): string {
  return mimeType?.includes("mp4") ? "m4a" : "webm";
}

const enrollmentSchema = z.object({
  consentGiven: z.literal(true),
  audioBase64: z.string(),
  audioMimeType: z.string().optional(),
});

voiceRouter.post("/enrollment", requireAuth, voiceCheckLimiter, async (req: AuthedRequest, res, next) => {
  const client = await pool.connect();
  try {
    const body = enrollmentSchema.parse(req.body);
    const audioBuffer = Buffer.from(body.audioBase64, "base64");
    const ext = extFromMime(body.audioMimeType);

    await client.query("BEGIN");

    // A separate, distinct consent from the existing 'recording' one —
    // biometric identity use has a different legal basis than "we record
    // your voice to grade it."
    const consentResult = await client.query(
      `INSERT INTO consent_records (user_id, consent_version, consent_type, ip_address)
       VALUES ($1, $2, 'voice_identity', $3) RETURNING id`,
      [req.user!.id, "v1", req.ip],
    );
    const consentRecordId = consentResult.rows[0].id;

    const embedding = await computeEmbedding(audioBuffer, ext);

    if (!embedding) {
      // Fails open, same spirit as geminiFluency.ts: the consent record
      // still stands (they did consent), but nothing blocks the rest of
      // the app — the learner can just retry enrollment later.
      await client.query(
        `INSERT INTO voice_enrollments (user_id, embedding, status, consent_record_id)
         VALUES ($1, $2, 'failed', $3)
         ON CONFLICT (user_id) DO UPDATE SET status = 'failed', consent_record_id = EXCLUDED.consent_record_id, updated_at = now()`,
        [req.user!.id, Buffer.alloc(0), consentRecordId],
      );
      await client.query("COMMIT");
      return res.status(200).json({ status: "failed" });
    }

    await mkdir(ENROLLMENT_UPLOADS_DIR, { recursive: true });
    const sampleUri = `/uploads/voice-enrollment/${req.user!.id}.${ext}`;
    await writeFile(path.join(ENROLLMENT_UPLOADS_DIR, `${req.user!.id}.${ext}`), audioBuffer);

    await client.query(
      `INSERT INTO voice_enrollments (user_id, embedding, status, sample_uri, consent_record_id)
       VALUES ($1, $2, 'enrolled', $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         embedding = EXCLUDED.embedding, status = 'enrolled', sample_uri = EXCLUDED.sample_uri,
         consent_record_id = EXCLUDED.consent_record_id, updated_at = now()`,
      [req.user!.id, embeddingToBuffer(embedding), sampleUri, consentRecordId],
    );

    await client.query("COMMIT");
    res.status(201).json({ status: "enrolled" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

voiceRouter.get("/enrollment/status", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const result = await pool.query(`SELECT status FROM voice_enrollments WHERE user_id = $1`, [req.user!.id]);
    res.json({ enrolled: result.rows[0]?.status === "enrolled" });
  } catch (err) {
    next(err);
  }
});

const verifySchema = z.object({
  purpose: z.enum(["placement", "practice", "practice_test"]),
  audioBase64: z.string(),
  audioMimeType: z.string().optional(),
});

voiceRouter.post("/verify", requireAuth, voiceCheckLimiter, async (req: AuthedRequest, res, next) => {
  try {
    const body = verifySchema.parse(req.body);
    const audioBuffer = Buffer.from(body.audioBase64, "base64");
    const ext = extFromMime(body.audioMimeType);

    const enrollmentResult = await pool.query(`SELECT embedding, status FROM voice_enrollments WHERE user_id = $1`, [req.user!.id]);
    const enrollment = enrollmentResult.rows[0];

    await mkdir(CHECK_UPLOADS_DIR, { recursive: true });
    const fileName = `${randomUUID()}.${ext}`;
    const sampleUri = `/uploads/voice-check/${fileName}`;
    await writeFile(path.join(CHECK_UPLOADS_DIR, fileName), audioBuffer);

    // No enrollment on file, or it previously failed — a setup gap, not the
    // learner's fault (there's no voiceprint to check against at all), so
    // this specific case still lets them through rather than blocking on a
    // problem they can't fix by re-recording.
    if (!enrollment || enrollment.status !== "enrolled") {
      const result = await pool.query(
        `INSERT INTO voice_check_results (user_id, purpose, decision, sample_uri, flagged_for_review)
         VALUES ($1, $2, 'error', $3, true) RETURNING id`,
        [req.user!.id, body.purpose, sampleUri],
      );
      return res.status(201).json({ voiceCheckId: result.rows[0].id, allowed: true, decision: "error" });
    }

    const newEmbedding = await computeEmbedding(audioBuffer, ext);
    let decision: "match" | "mismatch" | "error";
    let similarity: number | null = null;

    if (!newEmbedding) {
      decision = "error";
    } else {
      similarity = cosineSimilarity(bufferToEmbedding(enrollment.embedding), newEmbedding);
      decision = similarity >= MATCH_THRESHOLD ? "match" : "mismatch";
    }

    const result = await pool.query(
      `INSERT INTO voice_check_results (user_id, purpose, decision, similarity_score, sample_uri, flagged_for_review)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [req.user!.id, body.purpose, decision, similarity, sampleUri, decision !== "match"],
    );

    // A mismatch or a failed read (silence/corrupt audio) now blocks —
    // the learner has to re-record until it matches. Only an actual "match"
    // is let through.
    res.status(201).json({ voiceCheckId: result.rows[0].id, allowed: decision === "match", decision });
  } catch (err) {
    next(err);
  }
});
