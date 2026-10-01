// Enroll once, verify before every session. Order: face count -> quality -> liveness -> match.
// Only "match" allows; fallback is admin approval, not OTP (proves credential, not identity).
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { detectFaces, cropFace } from "./detect.js";
import { assessQuality } from "./quality.js";
import { scoreLiveness } from "./liveness.js";
import { embedFace, cosineSimilarity, embeddingToBuffer, bufferToEmbedding, MATCH_THRESHOLD, UNCERTAIN_FLOOR } from "./embed.js";

export const faceRouter = Router();

const ENROLLMENT_UPLOADS_DIR = path.join(process.cwd(), "uploads", "face-enrollment");
const CHECK_UPLOADS_DIR = path.join(process.cwd(), "uploads", "face-check");

// Skipped outside production so local QA never gets locked out.
const faceCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== "production",
  handler: (_req, res) => {
    res.status(429).json({ error: "too_many_attempts" });
  },
});

// Only mismatch/uncertain burn a retry — retakes and spoofs don't.
const RETRY_LIMIT = 2;

// Guards against comparing an embedding from a since-replaced model.
const EMBEDDING_BYTES = 512 * Float32Array.BYTES_PER_ELEMENT;
function isCompatibleEmbedding(embedding: Buffer): boolean {
  return embedding.byteLength === EMBEDDING_BYTES;
}

function decodeImage(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

const enrollmentSchema = z.object({
  consentGiven: z.literal(true),
  imageBase64: z.string(),
});

faceRouter.post("/enrollment", requireAuth, faceCheckLimiter, async (req: AuthedRequest, res, next) => {
  const client = await pool.connect();
  try {
    const body = enrollmentSchema.parse(req.body);
    const image = decodeImage(body.imageBase64);

    await client.query("BEGIN");

    // Distinct consent type — face biometric data has its own disclosure obligations.
    const consentResult = await client.query(
      `INSERT INTO consent_records (user_id, consent_version, consent_type, ip_address)
       VALUES ($1, $2, 'face_identity', $3) RETURNING id`,
      [req.user!.id, "v1", req.ip],
    );
    const consentRecordId = consentResult.rows[0].id;

    const [box] = await detectFaces(image);
    const quality = box ? await assessQuality(image, box) : await assessQuality(image, null);

    if (!box || !quality.ok) {
      // Fails open: consent stands, learner just retries enrollment.
      await client.query(
        `INSERT INTO face_enrollments (user_id, embedding, status, consent_record_id)
         VALUES ($1, $2, 'failed', $3)
         ON CONFLICT (user_id) DO UPDATE SET status = 'failed', consent_record_id = EXCLUDED.consent_record_id, updated_at = now()`,
        [req.user!.id, Buffer.alloc(0), consentRecordId],
      );
      await client.query("COMMIT");
      return res.status(200).json({
        status: "failed",
        reasons: box ? quality.reasons : ["No face detected. Sit in front of the camera and look straight at it."],
      });
    }

    const embedding = await embedFace(image, box);
    if (!embedding) {
      await client.query(
        `INSERT INTO face_enrollments (user_id, embedding, status, consent_record_id)
         VALUES ($1, $2, 'failed', $3)
         ON CONFLICT (user_id) DO UPDATE SET status = 'failed', consent_record_id = EXCLUDED.consent_record_id, updated_at = now()`,
        [req.user!.id, Buffer.alloc(0), consentRecordId],
      );
      await client.query("COMMIT");
      return res.status(200).json({ status: "failed", reasons: ["Could not read facial geometry — face the camera squarely."] });
    }

    await mkdir(ENROLLMENT_UPLOADS_DIR, { recursive: true });
    const fileName = `${req.user!.id}.jpg`;
    const sampleUri = `/uploads/face-enrollment/${fileName}`;
    await writeFile(path.join(ENROLLMENT_UPLOADS_DIR, fileName), image);

    await client.query(
      `INSERT INTO face_enrollments (user_id, embedding, status, sample_uri, consent_record_id)
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

faceRouter.get("/enrollment/status", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const result = await pool.query(`SELECT status, embedding FROM face_enrollments WHERE user_id = $1`, [req.user!.id]);
    const row = result.rows[0];
    const enrolled = row?.status === "enrolled" && isCompatibleEmbedding(row.embedding);
    res.json({ enrolled });
  } catch (err) {
    next(err);
  }
});

const verifySchema = z.object({
  purpose: z.enum(["placement", "practice", "practice_test"]),
  imageBase64: z.string(),
});

faceRouter.post("/verify", requireAuth, faceCheckLimiter, async (req: AuthedRequest, res, next) => {
  try {
    const body = verifySchema.parse(req.body);
    const image = decodeImage(body.imageBase64);

    const enrollmentResult = await pool.query(`SELECT embedding, status FROM face_enrollments WHERE user_id = $1`, [req.user!.id]);
    const enrollment = enrollmentResult.rows[0];

    await mkdir(CHECK_UPLOADS_DIR, { recursive: true });
    const fileName = `${randomUUID()}.jpg`;
    const sampleUri = `/uploads/face-check/${fileName}`;
    await writeFile(path.join(CHECK_UPLOADS_DIR, fileName), image);

    // No usable enrollment — a setup gap, not fixable by retrying here.
    if (!enrollment || enrollment.status !== "enrolled" || !isCompatibleEmbedding(enrollment.embedding)) {
      const result = await pool.query(
        `INSERT INTO face_check_results (user_id, purpose, decision, sample_uri, flagged_for_review)
         VALUES ($1, $2, 'error', $3, true) RETURNING id`,
        [req.user!.id, body.purpose, sampleUri],
      );
      return res.status(201).json({ faceCheckId: result.rows[0].id, allowed: true, decision: "error" });
    }

    const faces = await detectFaces(image);

    // Not an identity failure, doesn't burn a retry.
    if (faces.length !== 1) {
      const decision = faces.length === 0 ? "no_face" : "multiple_faces";
      const result = await pool.query(
        `INSERT INTO face_check_results (user_id, purpose, decision, face_count, sample_uri)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [req.user!.id, body.purpose, decision, faces.length, sampleUri],
      );
      return res.status(201).json({
        faceCheckId: result.rows[0].id,
        allowed: false,
        decision,
        retake: true, // does not count against RETRY_LIMIT
        reason: faces.length === 0 ? "No face detected. Sit in front of the camera and look straight at it." : "More than one face is in frame. Only you should be visible.",
      });
    }

    const [box] = faces;
    const quality = await assessQuality(image, box);
    if (!quality.ok) {
      const result = await pool.query(
        `INSERT INTO face_check_results (user_id, purpose, decision, face_count, sample_uri)
         VALUES ($1, $2, 'error', 1, $3) RETURNING id`,
        [req.user!.id, body.purpose, sampleUri],
      );
      return res.status(201).json({
        faceCheckId: result.rows[0].id,
        allowed: false,
        decision: "error",
        retake: true,
        reason: quality.reasons[0],
      });
    }

    const liveness = await scoreLiveness(await cropFace(image, box));
    if (!liveness.isLive) {
      // Attack attempt — never reaches fallback, always flagged.
      const result = await pool.query(
        `INSERT INTO face_check_results (user_id, purpose, decision, liveness_score, spoof_detected, face_count, sample_uri, flagged_for_review)
         VALUES ($1, $2, 'spoof', $3, true, 1, $4, true) RETURNING id`,
        [req.user!.id, body.purpose, liveness.live, sampleUri],
      );
      return res.status(201).json({
        faceCheckId: result.rows[0].id,
        allowed: false,
        decision: "spoof",
        retake: false,
        fallbackEligible: false,
        reason: "Not a live face — looks like a photo or screen.",
      });
    }

    const probeEmbedding = await embedFace(image, box);
    if (!probeEmbedding) {
      const result = await pool.query(
        `INSERT INTO face_check_results (user_id, purpose, decision, liveness_score, face_count, sample_uri)
         VALUES ($1, $2, 'error', $3, 1, $4) RETURNING id`,
        [req.user!.id, body.purpose, liveness.live, sampleUri],
      );
      return res.status(201).json({
        faceCheckId: result.rows[0].id,
        allowed: false,
        decision: "error",
        retake: true,
        reason: "Could not read facial geometry — face the camera squarely.",
      });
    }

    const similarity = cosineSimilarity(bufferToEmbedding(enrollment.embedding), probeEmbedding);
    const decision = similarity >= MATCH_THRESHOLD ? "match" : similarity >= UNCERTAIN_FLOOR ? "uncertain" : "mismatch";

    const result = await pool.query(
      `INSERT INTO face_check_results (user_id, purpose, decision, similarity_score, liveness_score, face_count, sample_uri, flagged_for_review)
       VALUES ($1, $2, $3, $4, $5, 1, $6, $7) RETURNING id`,
      [req.user!.id, body.purpose, decision, similarity, liveness.live, sampleUri, decision !== "match"],
    );

    // uncertain/mismatch both count toward RETRY_LIMIT and look the same to the learner.
    const retriesUsed = await countRecentIdentityFailures(req.user!.id, body.purpose);

    res.status(201).json({
      faceCheckId: result.rows[0].id,
      allowed: decision === "match",
      decision,
      retake: false,
      fallbackEligible: decision !== "match" && retriesUsed >= RETRY_LIMIT,
      retriesRemaining: Math.max(0, RETRY_LIMIT - retriesUsed),
      reason: decision === "match" ? undefined : "Face didn't match your enrolled photo. Please try again.",
    });
  } catch (err) {
    next(err);
  }
});

// Counts mismatch/uncertain since the user's last match for this purpose.
async function countRecentIdentityFailures(userId: string, purpose: string): Promise<number> {
  const result = await pool.query(
    `SELECT count(*)::int AS n FROM face_check_results
     WHERE user_id = $1 AND purpose = $2 AND decision IN ('mismatch', 'uncertain')
       AND created_at > COALESCE(
         (SELECT max(created_at) FROM face_check_results WHERE user_id = $1 AND purpose = $2 AND decision = 'match'),
         '1970-01-01'::timestamptz
       )`,
    [userId, purpose],
  );
  return result.rows[0].n;
}

const fallbackRequestSchema = z.object({
  purpose: z.enum(["placement", "practice", "practice_test"]),
  failedResultId: z.string().uuid(),
});

// Re-checks RETRY_LIMIT server-side so a direct API call can't skip it.
faceRouter.post("/fallback/request", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = fallbackRequestSchema.parse(req.body);

    const retriesUsed = await countRecentIdentityFailures(req.user!.id, body.purpose);
    if (retriesUsed < RETRY_LIMIT) {
      return res.status(400).json({ error: "retries_not_exhausted", retriesRemaining: RETRY_LIMIT - retriesUsed });
    }

    const failedResult = await pool.query(
      `SELECT id FROM face_check_results
       WHERE id = $1 AND user_id = $2 AND decision IN ('mismatch', 'uncertain')`,
      [body.failedResultId, req.user!.id],
    );
    if (!failedResult.rows[0]) {
      return res.status(400).json({ error: "invalid_failed_result" });
    }

    const result = await pool.query(
      `INSERT INTO face_check_fallback_requests (user_id, failed_result_id, purpose, expires_at)
       VALUES ($1, $2, $3, now() + interval '15 minutes') RETURNING id`,
      [req.user!.id, body.failedResultId, body.purpose],
    );
    res.status(201).json({ fallbackRequestId: result.rows[0].id, status: "pending" });
  } catch (err) {
    next(err);
  }
});

faceRouter.get("/fallback/status/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT status, expires_at, consumed_at FROM face_check_fallback_requests WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user!.id],
    );
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: "not_found" });
    const expired = row.status === "pending" && row.expires_at && new Date(row.expires_at) < new Date();
    res.json({ status: expired ? "expired" : row.status, consumed: Boolean(row.consumed_at) });
  } catch (err) {
    next(err);
  }
});

// Single-use: consumed_at prevents replay, one approval unlocks one session.
faceRouter.post("/fallback/consume", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { fallbackRequestId } = z.object({ fallbackRequestId: z.string().uuid() }).parse(req.body);
    const result = await pool.query(
      `UPDATE face_check_fallback_requests
       SET consumed_at = now()
       WHERE id = $1 AND user_id = $2 AND status = 'approved' AND consumed_at IS NULL AND expires_at > now()
       RETURNING id`,
      [fallbackRequestId, req.user!.id],
    );
    if (!result.rows[0]) return res.status(400).json({ error: "not_consumable" });
    res.json({ consumed: true });
  } catch (err) {
    next(err);
  }
});

// --- Admin review surface ---

function requireAdmin(req: AuthedRequest, res: import("express").Response): boolean {
  if (!req.user || !["org_admin", "admin", "super_admin"].includes(req.user.role)) {
    res.status(403).json({ error: "forbidden" });
    return false;
  }
  return true;
}

faceRouter.get("/fallback/pending", requireAuth, async (req: AuthedRequest, res, next) => {
  if (!requireAdmin(req, res)) return;
  try {
    const result = await pool.query(
      `SELECT fr.id, fr.user_id, u.email, fr.purpose, fr.created_at, fr.expires_at,
              fcr.similarity_score, fcr.decision, fcr.sample_uri AS failed_sample_uri,
              fe.sample_uri AS enrolled_sample_uri
       FROM face_check_fallback_requests fr
       JOIN users u ON u.id = fr.user_id
       JOIN face_check_results fcr ON fcr.id = fr.failed_result_id
       LEFT JOIN face_enrollments fe ON fe.user_id = fr.user_id
       WHERE fr.status = 'pending' AND fr.expires_at > now()
       ORDER BY fr.created_at ASC`,
    );
    res.json({ requests: result.rows });
  } catch (err) {
    next(err);
  }
});

const reviewSchema = z.object({
  decision: z.enum(["approved", "denied"]),
  note: z.string().optional(),
});

faceRouter.post("/fallback/:id/review", requireAuth, async (req: AuthedRequest, res, next) => {
  if (!requireAdmin(req, res)) return;
  try {
    const body = reviewSchema.parse(req.body);
    const result = await pool.query(
      `UPDATE face_check_fallback_requests
       SET status = $1, reviewed_by = $2, reviewed_at = now(), review_note = $3
       WHERE id = $4 AND status = 'pending' AND expires_at > now()
       RETURNING id`,
      [body.decision, req.user!.id, body.note ?? null, req.params.id],
    );
    if (!result.rows[0]) return res.status(400).json({ error: "not_pending" });
    res.json({ status: body.decision });
  } catch (err) {
    next(err);
  }
});
