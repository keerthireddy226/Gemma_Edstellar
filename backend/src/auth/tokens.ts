import { randomBytes, createHash } from "node:crypto";

// Shared between auth/routes.ts and auth/middleware.ts so both agree on the
// same cookie name without either importing the other.
export const SESSION_COOKIE = "session_token";

/**
 * Session/reset/verification tokens are high-entropy random values, not
 * user-chosen secrets, so a fast SHA-256 lookup hash is appropriate here —
 * bcrypt (used for passwords, FR custom-auth) is for low-entropy human input.
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
