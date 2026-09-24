-- A real, persisted preference (unlike "Weekly Progress Reports"/"Strict
-- Timer Mode" shown alongside it in Profile, which have no backing
-- infrastructure yet and stay disabled/"coming soon") — defaults to true so
-- existing behavior (audio-first item types already play automatically)
-- doesn't change for anyone until this is deliberately wired into the
-- session UI's play logic.
BEGIN;
ALTER TABLE participant_profiles ADD COLUMN spoken_prompts_enabled boolean NOT NULL DEFAULT true;
COMMIT;
