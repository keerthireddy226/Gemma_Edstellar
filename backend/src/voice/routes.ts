// Voice Check routes: enroll once, verify before every session. A real
// mismatch/unreadable audio blocks (re-record); only a missing/failed
// enrollment (a setup gap, not fixable by re-recording) lets it through.
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import {
  computeEmbedding,
  cosineSimilarity,
  averageEmbeddings,
  embeddingToBuffer,
  bufferToEmbedding,
  isCompatibleEmbedding,
  MATCH_THRESHOLD,
} from "./speakerVerification.js";

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

const REQUIRED_ENROLLMENT_TAKES = 2;

const enrollmentSchema = z.object({
  consentGiven: z.literal(true),
  // 2 separate takes of the phrase, embeddings averaged into one voiceprint
  // — cancels out per-take noise (nerves, mic position, a stray sound)
  // instead of permanently trusting whichever single take happened to be
  // recorded at setup (see speakerVerification.ts's averageEmbeddings).
  samples: z
    .array(z.object({ audioBase64: z.string(), audioMimeType: z.string().optional() }))
    .length(REQUIRED_ENROLLMENT_TAKES),
});

voiceRouter.post("/enrollment", requireAuth, voiceCheckLimiter, async (req: AuthedRequest, res, next) => {
  const client = await pool.connect();
  try {
    const body = enrollmentSchema.parse(req.body);

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

    const embeddings = await Promise.all(
      body.samples.map((s) => computeEmbedding(Buffer.from(s.audioBase64, "base64"), extFromMime(s.audioMimeType))),
    );

    if (embeddings.some((e) => !e)) {
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

    const [embeddingA, embeddingB] = embeddings as Float32Array[];
    const embedding = averageEmbeddings(embeddingA, embeddingB);

    await mkdir(ENROLLMENT_UPLOADS_DIR, { recursive: true });
    const sampleUris = body.samples.map((s, i) => {
      const ext = extFromMime(s.audioMimeType);
      const fileName = `${req.user!.id}-${i + 1}.${ext}`;
      return { uri: `/uploads/voice-enrollment/${fileName}`, fileName, buffer: Buffer.from(s.audioBase64, "base64") };
    });
    await Promise.all(sampleUris.map((s) => writeFile(path.join(ENROLLMENT_UPLOADS_DIR, s.fileName), s.buffer)));

    await client.query(
      `INSERT INTO voice_enrollments (user_id, embedding, status, sample_uri, sample_uri_2, consent_record_id)
       VALUES ($1, $2, 'enrolled', $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         embedding = EXCLUDED.embedding, status = 'enrolled', sample_uri = EXCLUDED.sample_uri,
         sample_uri_2 = EXCLUDED.sample_uri_2, consent_record_id = EXCLUDED.consent_record_id, updated_at = now()`,
      [req.user!.id, embeddingToBuffer(embedding), sampleUris[0].uri, sampleUris[1].uri, consentRecordId],
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
    const result = await pool.query(`SELECT status, embedding FROM voice_enrollments WHERE user_id = $1`, [req.user!.id]);
    const row = result.rows[0];
    // An embedding left over from a since-replaced model (see
    // speakerVerification.ts) can't be compared against — treat it the
    // same as never having enrolled, so the learner is prompted to redo it.
    const enrolled = row?.status === "enrolled" && isCompatibleEmbedding(row.embedding);
    res.json({ enrolled });
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

    // No/failed enrollment, or one left over from a since-replaced model
    // (see speakerVerification.ts) — no voiceprint to check against, so let
    // them through, same as ever.
    if (!enrollment || enrollment.status !== "enrolled" || !isCompatibleEmbedding(enrollment.embedding)) {
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
