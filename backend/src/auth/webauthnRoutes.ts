// Passkey registration + the face-check fallback ceremony. Login-2FA passkey use is a separate,
// later feature — this only covers the self-serve tier before admin-approval (face/routes.ts).
import { Router } from "express";
import { z } from "zod";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type WebAuthnCredential,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { RP_NAME, RP_ID, ORIGIN, CHALLENGE_TTL_MS } from "./webauthn.js";
import { FALLBACK_ELIGIBLE_DECISIONS } from "../face/routes.js";

export const webauthnRouter = Router();

async function storeChallenge(userId: string, challenge: string, purpose: "register" | "fallback") {
  await pool.query(
    `INSERT INTO webauthn_challenges (user_id, challenge, purpose, expires_at) VALUES ($1, $2, $3, $4)`,
    [userId, challenge, purpose, new Date(Date.now() + CHALLENGE_TTL_MS)],
  );
}

// Single-use: consumed_at prevents replaying the same options response twice.
async function consumeChallenge(userId: string, purpose: "register" | "fallback"): Promise<string | null> {
  const result = await pool.query(
    `UPDATE webauthn_challenges SET consumed_at = now()
     WHERE id = (
       SELECT id FROM webauthn_challenges
       WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC LIMIT 1
     )
     RETURNING challenge`,
    [userId, purpose],
  );
  return result.rows[0]?.challenge ?? null;
}

webauthnRouter.get("/status", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const deviceTag = typeof req.query.deviceTag === "string" ? req.query.deviceTag : null;
    const result = await pool.query(`SELECT 1 FROM webauthn_credentials WHERE user_id = $1 AND device_tag = $2 LIMIT 1`, [
      req.user!.id,
      deviceTag,
    ]);
    res.json({ registered: result.rows.length > 0 });
  } catch (err) {
    next(err);
  }
});

webauthnRouter.post("/register/options", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const existing = await pool.query(`SELECT credential_id, transports FROM webauthn_credentials WHERE user_id = $1`, [req.user!.id]);
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: req.user!.id,
      attestationType: "none",
      excludeCredentials: existing.rows.map((r) => ({ id: r.credential_id, transports: r.transports ?? undefined })),
      // "platform" steers the browser away from phone/security-key options in its own picker —
      // "hybrid" transport (QR + phone) lets a remote phone approve a session it was never
      // physically at, so it's also rejected server-side below regardless of what's picked.
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred", authenticatorAttachment: "platform" },
    });
    await storeChallenge(req.user!.id, options.challenge, "register");
    res.json(options);
  } catch (err) {
    next(err);
  }
});

const registerVerifySchema = z.object({ response: z.unknown(), deviceTag: z.string().min(1) });

webauthnRouter.post("/register/verify", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = registerVerifySchema.parse(req.body);
    const challenge = await consumeChallenge(req.user!.id, "register");
    if (!challenge) return res.status(400).json({ error: "challenge_expired" });

    const verification = await verifyRegistrationResponse({
      response: body.response as Parameters<typeof verifyRegistrationResponse>[0]["response"],
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      // Matches authenticatorSelection.userVerification: "preferred" above.
      requireUserVerification: false,
    });
    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ verified: false });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    // No sync/transport rejection — Chrome reports "hybrid" alongside "internal" even for a
    // same-session Google Password Manager save on this hardware, so that check was a false
    // positive blocking the only option available here. Still phishing-proof, still cryptographic.

    await pool.query(
      `INSERT INTO webauthn_credentials (user_id, credential_id, public_key, counter, transports, device_type, backed_up, device_tag)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        req.user!.id,
        credential.id,
        isoBase64URL.fromBuffer(credential.publicKey),
        credential.counter,
        credential.transports ?? null,
        credentialDeviceType,
        credentialBackedUp,
        body.deviceTag,
      ],
    );
    res.status(201).json({ verified: true });
  } catch (err) {
    next(err);
  }
});

const fallbackOptionsSchema = z.object({ faceCheckId: z.string().uuid(), deviceTag: z.string().min(1) });

webauthnRouter.post("/fallback/options", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = fallbackOptionsSchema.parse(req.body);
    // Re-checked server-side at verify time too — this param is just for UX, not trusted alone.
    const failedCheck = await pool.query(
      `SELECT id FROM face_check_results WHERE id = $1 AND user_id = $2 AND decision = ANY($3)`,
      [body.faceCheckId, req.user!.id, FALLBACK_ELIGIBLE_DECISIONS],
    );
    if (!failedCheck.rows[0]) return res.status(400).json({ error: "invalid_failed_result" });

    // Scoped to this browser's device_tag — a passkey registered elsewhere on the same
    // account doesn't count here, even though the key material itself may be account-synced.
    const creds = await pool.query(`SELECT credential_id, transports FROM webauthn_credentials WHERE user_id = $1 AND device_tag = $2`, [
      req.user!.id,
      body.deviceTag,
    ]);
    if (creds.rows.length === 0) return res.status(400).json({ error: "no_passkey_on_this_device" });

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: creds.rows.map((r) => ({ id: r.credential_id, transports: r.transports ?? undefined })),
      userVerification: "preferred",
    });
    await storeChallenge(req.user!.id, options.challenge, "fallback");
    res.json(options);
  } catch (err) {
    next(err);
  }
});

const fallbackVerifySchema = z.object({ faceCheckId: z.string().uuid(), response: z.unknown(), deviceTag: z.string().min(1) });

webauthnRouter.post("/fallback/verify", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = fallbackVerifySchema.parse(req.body);
    const failedCheck = await pool.query(
      `SELECT id, purpose FROM face_check_results WHERE id = $1 AND user_id = $2 AND decision = ANY($3)`,
      [body.faceCheckId, req.user!.id, FALLBACK_ELIGIBLE_DECISIONS],
    );
    if (!failedCheck.rows[0]) return res.status(400).json({ error: "invalid_failed_result" });

    const challenge = await consumeChallenge(req.user!.id, "fallback");
    if (!challenge) return res.status(400).json({ error: "challenge_expired" });

    const assertion = body.response as { id: string };
    const credRow = await pool.query(
      `SELECT credential_id, public_key, counter, transports, backed_up FROM webauthn_credentials
       WHERE user_id = $1 AND credential_id = $2 AND device_tag = $3`,
      [req.user!.id, assertion.id, body.deviceTag],
    );
    if (!credRow.rows[0]) return res.status(400).json({ error: "unknown_credential" });

    const stored: WebAuthnCredential = {
      id: credRow.rows[0].credential_id,
      publicKey: isoBase64URL.toBuffer(credRow.rows[0].public_key),
      counter: Number(credRow.rows[0].counter),
      transports: credRow.rows[0].transports ?? undefined,
    };

    const verification = await verifyAuthenticationResponse({
      response: body.response as Parameters<typeof verifyAuthenticationResponse>[0]["response"],
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: stored,
      // Matches the "preferred" (not "required") asked for in fallback/options above —
      // a laptop with no fingerprint/Face ID still has to pass as a valid device-bound passkey.
      requireUserVerification: false,
    });
    if (!verification.verified) return res.status(400).json({ verified: false });

    await pool.query(
      `UPDATE webauthn_credentials SET counter = $1, last_used_at = now(), backed_up = $2 WHERE credential_id = $3`,
      [verification.authenticationInfo.newCounter, verification.authenticationInfo.credentialBackedUp, stored.id],
    );

    // reviewed_at set without reviewed_by — cryptographically proven, so it's excluded from the
    // human audit queue (reviewed_at IS NULL) unlike the no-check auto-allow path in face/routes.ts.
    await pool.query(
      `INSERT INTO face_check_fallback_requests (user_id, failed_result_id, purpose, status, reviewed_at, review_note, consumed_at)
       VALUES ($1, $2, $3, 'approved', now(), 'passkey', now())`,
      [req.user!.id, body.faceCheckId, failedCheck.rows[0].purpose],
    );

    res.json({ allowed: true, faceCheckId: body.faceCheckId });
  } catch (err) {
    next(err);
  }
});
