import { pool } from "../db.js";
import type { VoiceGender } from "./googleTts.js";

const DEFAULT_VOICE: VoiceGender = "female";

export async function getPreferredVoice(userId: string): Promise<VoiceGender> {
  const result = await pool.query(`SELECT preferred_voice FROM participant_profiles WHERE user_id = $1`, [userId]);
  return (result.rows[0]?.preferred_voice as VoiceGender | null) ?? DEFAULT_VOICE;
}

// Attaches audioUrl (null if that item/voice pair hasn't been generated
// yet) to each item payload — frontend falls back to browser TTS when
// audioUrl is null, so an ungenerated item never breaks playback, it's just
// not yet using real AI audio.
export async function withAudioUrls<T extends { id: string }>(userId: string, items: T[]): Promise<(T & { audioUrl: string | null })[]> {
  if (items.length === 0) return [];
  const voice = await getPreferredVoice(userId);
  const result = await pool.query(`SELECT item_id, uri FROM item_audio WHERE item_id = ANY($1::uuid[]) AND voice_id = $2`, [
    items.map((item) => item.id),
    voice,
  ]);
  const uriByItemId = new Map<string, string>(result.rows.map((row) => [row.item_id as string, row.uri as string]));
  return items.map((item) => ({ ...item, audioUrl: uriByItemId.get(item.id) ?? null }));
}
