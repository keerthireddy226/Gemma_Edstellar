-- Up Migration
-- Voice Check (speaker identity verification) needs its own, separately-
-- worded consent — biometric identity-verification use of voice data has a
-- different (typically stricter) legal basis than the existing 'recording'
-- consent, which only covers using voice for scoring/grading. Reusing
-- 'recording' would misrepresent what the learner actually agreed to.

ALTER TABLE consent_records DROP CONSTRAINT consent_records_consent_type_check;
ALTER TABLE consent_records
  ADD CONSTRAINT consent_records_consent_type_check
    CHECK (consent_type = ANY (ARRAY['recording'::text, 'training_use'::text, 'voice_identity'::text]));
