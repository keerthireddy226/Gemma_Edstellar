import { randomBytes, createHash } from "node:crypto";

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
