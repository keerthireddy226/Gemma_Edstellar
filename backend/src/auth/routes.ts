import { Router } from "express";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { pool } from "../db.js";
import { generateToken, hashToken } from "./tokens.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "./mailer.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from "./schemas.js";

const SESSION_COOKIE = "session_token";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const BCRYPT_ROUNDS = 12;
// Postgres unique_violation error code.
const PG_UNIQUE_VIOLATION = "23505";

// Separate instances so each endpoint gets its own 10-per-15-min budget per IP,
// instead of three routes silently sharing one pool of attempts.
function makeAuthLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
  });
}
const signupLimiter = makeAuthLimiter();
const loginLimiter = makeAuthLimiter();
const forgotPasswordLimiter = makeAuthLimiter();

export const authRouter = Router();

// Accepts either the shared pool or an in-transaction client — signup must
// create the session on the *same* connection as the still-uncommitted user
// row, or the insert fails a foreign-key check against a connection that
// can't see that row yet.
async function createSession(executor: Pick<typeof pool, "query">, userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await executor.query(
    `INSERT INTO auth_sessions (user_id, session_token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, hashToken(token), expiresAt],
  );
  return { token, expiresAt };
}

function setSessionCookie(res: import("express").Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    // Configurable because the right value depends on production topology
    // (same-site works today via the dev proxy; a frontend/backend split
    // across subdomains later may need "none" + secure instead).
    sameSite: (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none") ?? "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
  });
}

authRouter.post("/signup", signupLimiter, async (req, res, next) => {
  const body = signupSchema.parse(req.body);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tenant = await client.query(
      `INSERT INTO tenants (name, type) VALUES ($1, 'individual_free') RETURNING id`,
      [`${body.email} (individual)`],
    );
    const tenantId = tenant.rows[0].id;

    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    const user = await client.query(
      `INSERT INTO users (tenant_id, role, email, password_hash, first_name, last_name)
       VALUES ($1, 'learner', $2, $3, $4, $5) RETURNING id`,
      [tenantId, body.email, passwordHash, body.firstName ?? null, body.lastName ?? null],
    );
    const userId = user.rows[0].id;

    const verifyToken = generateToken();
    await client.query(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [userId, hashToken(verifyToken), new Date(Date.now() + VERIFY_TOKEN_TTL_MS)],
    );

    await client.query("COMMIT");

    // No session is created here on purpose — signup ends with "check your
    // email," not an automatic login. The learner logs in for real afterward.
    sendVerificationEmail(body.email, verifyToken).catch((err) =>
      console.error("failed to send verification email:", err),
    );
    res.status(201).json({ email: body.email });
  } catch (err) {
    await client.query("ROLLBACK");
    // A concurrent signup with the same email can race past an existence
    // check — this constraint is the actual, atomic source of truth.
    if (err && typeof err === "object" && "code" in err && err.code === PG_UNIQUE_VIOLATION) {
      return res.status(409).json({ error: "email_already_registered" });
    }
    next(err);
  } finally {
    client.release();
  }
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await pool.query(
      `SELECT id, password_hash, role, email_verified FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [body.email],
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
      return res.status(401).json({ error: "invalid_credentials" });
    }
    if (!user.email_verified) {
      return res.status(403).json({ error: "email_not_verified" });
    }
    // Enforces the login portal as a real access boundary, not just a
    // different-looking page — a learner's credentials don't work at
    // /admin/login even though the password itself is correct. A portal may
    // accept more than one role (e.g. /admin/login accepts admin and
    // super_admin), so this is a membership check, not an exact match.
    if (!body.allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "wrong_login_portal" });
    }

    const { token } = await createSession(pool, user.id);
    setSessionCookie(res, token);
    res.json({ id: user.id, email: body.email, role: user.role, emailVerified: user.email_verified });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) {
      await pool.query(
        `UPDATE auth_sessions SET revoked_at = now() WHERE session_token_hash = $1`,
        [hashToken(token)],
      );
    }
    res.clearCookie(SESSION_COOKIE);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", async (req, res, next) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) return res.status(401).json({ error: "not_authenticated" });

    const result = await pool.query(
      `SELECT u.id, u.email, u.role, u.email_verified, u.tenant_id
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.session_token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now() AND u.deleted_at IS NULL`,
      [hashToken(token)],
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "not_authenticated" });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.email_verified,
      tenantId: user.tenant_id,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/verify-email", async (req, res, next) => {
  try {
    const body = verifyEmailSchema.parse(req.body);
    const result = await pool.query(
      `SELECT id, user_id FROM email_verification_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
      [hashToken(body.token)],
    );
    const row = result.rows[0];
    if (!row) return res.status(400).json({ error: "invalid_or_expired_token" });

    await pool.query("UPDATE email_verification_tokens SET used_at = now() WHERE id = $1", [row.id]);
    const user = await pool.query("UPDATE users SET email_verified = true WHERE id = $1 RETURNING role", [
      row.user_id,
    ]);
    // Returned so the frontend can send the learner back to *their* role's
    // login page, not always the learner one — verifying doesn't create a
    // session, so this is the only way it knows which portal to point at.
    res.json({ role: user.rows[0].role });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/forgot-password", forgotPasswordLimiter, async (req, res, next) => {
  try {
    const body = forgotPasswordSchema.parse(req.body);
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL",
      [body.email],
    );
    const user = result.rows[0];
    // Always respond the same way whether or not the email exists, so this
    // endpoint can't be used to enumerate registered accounts.
    if (user) {
      // Invalidate any still-live reset tokens from earlier requests, so only
      // the newest link actually works.
      await pool.query(
        "UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
        [user.id],
      );

      const resetToken = generateToken();
      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [user.id, hashToken(resetToken), new Date(Date.now() + RESET_TOKEN_TTL_MS)],
      );
      sendPasswordResetEmail(body.email, resetToken).catch((err) =>
        console.error("failed to send password reset email:", err),
      );
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const result = await pool.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
      [hashToken(body.token)],
    );
    const row = result.rows[0];
    if (!row) return res.status(400).json({ error: "invalid_or_expired_token" });

    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    const user = await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING role", [
      passwordHash,
      row.user_id,
    ]);
    await pool.query("UPDATE password_reset_tokens SET used_at = now() WHERE id = $1", [row.id]);
    // Resetting a password invalidates every existing session, in case the reset
    // was prompted by a compromised account.
    await pool.query("UPDATE auth_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [
      row.user_id,
    ]);
    // Returned so the frontend can send the learner back to *their* role's
    // login page, not always the learner one.
    res.json({ role: user.rows[0].role });
  } catch (err) {
    next(err);
  }
});
