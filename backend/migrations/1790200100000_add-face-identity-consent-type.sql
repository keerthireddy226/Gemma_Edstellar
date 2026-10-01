-- Up Migration
-- Face identity verification needs its own consent type, distinct from 'recording'.

ALTER TABLE consent_records DROP CONSTRAINT consent_records_consent_type_check;
ALTER TABLE consent_records
  ADD CONSTRAINT consent_records_consent_type_check
    CHECK (consent_type = ANY (ARRAY['recording'::text, 'training_use'::text, 'voice_identity'::text, 'face_identity'::text]));

-- Down Migration
ALTER TABLE consent_records DROP CONSTRAINT consent_records_consent_type_check;
ALTER TABLE consent_records
  ADD CONSTRAINT consent_records_consent_type_check
    CHECK (consent_type = ANY (ARRAY['recording'::text, 'training_use'::text, 'voice_identity'::text]));
