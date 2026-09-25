-- Enrollment now records 2 takes of the phrase (embeddings averaged into
-- one voiceprint, to cancel out per-take noise) instead of 1 — see
-- backend/src/voice/speakerVerification.ts. sample_uri already held the
-- first take's recording for human review; this adds a column for the
-- second one, same reasoning.
BEGIN;
ALTER TABLE voice_enrollments ADD COLUMN sample_uri_2 text;
COMMIT;
