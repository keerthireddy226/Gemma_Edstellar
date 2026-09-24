import { pool } from "../db.js";

// Links a Voice Check (done before session start, with no session yet) to
// the session it gated, once that session exists. No-op if voiceCheckId is
// missing/invalid/already claimed.
export async function correlateVoiceCheck(userId: string, voiceCheckId: string | undefined, sessionId: string): Promise<void> {
  if (!voiceCheckId) return;
  await pool.query(`UPDATE voice_check_results SET session_id = $1 WHERE id = $2 AND user_id = $3 AND session_id IS NULL`, [
    sessionId,
    voiceCheckId,
    userId,
  ]);
}
