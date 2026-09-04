import type { NextFunction, Request, Response } from "express";
import { pool } from "../db.js";
import { hashToken, SESSION_COOKIE } from "./tokens.js";

export interface AuthedRequest extends Request {
  user?: { id: string; role: string; tenantId: string | null };
}

// Same session lookup /api/auth/me already does — factored out so any other
// route module can require a logged-in user without duplicating that query.
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) return res.status(401).json({ error: "not_authenticated" });

    const result = await pool.query(
      `SELECT u.id, u.role, u.tenant_id
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.session_token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now() AND u.deleted_at IS NULL`,
      [hashToken(token)],
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "not_authenticated" });

    req.user = { id: user.id, role: user.role, tenantId: user.tenant_id };
    next();
  } catch (err) {
    next(err);
  }
}
