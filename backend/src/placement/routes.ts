import { Router } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { generateToken, hashToken } from "../auth/tokens.js";
import { sendPlacementReminderEmail } from "../auth/mailer.js";

export const placementRouter = Router();

const REMINDER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Skipped outside production, same reasoning as the auth limiters — local
// testing shouldn't get locked out by the same cooldown a real learner would
// only hit from actually spamming this button.
const scheduleLaterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== "production",
  handler: (_req, res) => {
    res.status(429).json({ error: "too_many_attempts" });
  },
});

async function activeReminder(userId: string) {
  const result = await pool.query(
    `SELECT expires_at FROM placement_reminder_tokens
     WHERE user_id = $1 AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

placementRouter.post("/schedule-later", requireAuth, scheduleLaterLimiter, async (req: AuthedRequest, res, next) => {
  try {
    // Already scheduled and still within its window — don't send a second
    // email or reset the cooldown just because the button got clicked twice
    // (e.g. a double click, or the client's disabled state was stale).
    const existing = await activeReminder(req.user!.id);
    if (existing) {
      return res.json({ scheduledUntil: existing.expires_at });
    }

    const userResult = await pool.query("SELECT email FROM users WHERE id = $1", [req.user!.id]);
    const email = userResult.rows[0].email;

    const token = generateToken();
    const expiresAt = new Date(Date.now() + REMINDER_TTL_MS);
    await pool.query(
      `INSERT INTO placement_reminder_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [req.user!.id, hashToken(token), expiresAt],
    );

    sendPlacementReminderEmail(email, token).catch((err) =>
      console.error("failed to send placement reminder email:", err),
    );

    res.status(201).json({ scheduledUntil: expiresAt });
  } catch (err) {
    next(err);
  }
});
