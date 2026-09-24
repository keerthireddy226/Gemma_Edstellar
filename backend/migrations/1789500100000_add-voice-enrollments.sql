-- Up Migration
-- One-time speaker-verification enrollment per learner, computed locally via
-- sherpa-onnx-node (no external provider — see backend/src/voice/
-- speakerVerification.ts). `embedding` stores the raw Float32Array bytes of
-- the learner's voiceprint (512 numbers, ~2KB) — verify calls compare
-- against this directly, never against the raw audio. `sample_uri` keeps
-- the enrollment clip only so a human reviewer could later re-check a
-- disputed case; it is not itself compared on every session.

CREATE TABLE voice_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    embedding bytea NOT NULL,
    status text DEFAULT 'enrolled' NOT NULL,
    sample_uri text,
    consent_record_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT voice_enrollments_pkey PRIMARY KEY (id),
    CONSTRAINT voice_enrollments_user_id_key UNIQUE (user_id),
    CONSTRAINT voice_enrollments_status_check CHECK (status IN ('enrolled', 'failed')),
    CONSTRAINT voice_enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT voice_enrollments_consent_record_id_fkey FOREIGN KEY (consent_record_id) REFERENCES consent_records(id) ON DELETE SET NULL
);

CREATE INDEX idx_voice_enrollments_user_id ON voice_enrollments USING btree (user_id);
