-- Up Migration
-- item_audio has existed since the baseline schema but has never been
-- written to (0 rows, no code references it). The new batch generation
-- script (backend/scripts/generateItemAudio.ts) needs to re-run safely —
-- new items added later, or a voice regenerated after a content fix —
-- without duplicating rows, so it upserts on (item_id, voice_id). That
-- requires a real uniqueness guarantee, which this table never had.
--
-- voice_id values going forward are exactly 'male' / 'female' (not the raw
-- Google TTS voice name like "en-US-Neural2-D") so this joins directly
-- against participant_profiles.preferred_voice; accent is always 'en-US'.

ALTER TABLE item_audio ADD CONSTRAINT item_audio_item_id_voice_id_key UNIQUE (item_id, voice_id);
