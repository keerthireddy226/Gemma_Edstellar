-- Up Migration
-- One-time face enrollment per learner (AuraFace embedding, 512 floats).
-- sample_uri kept for the fallback-approval flow's human review, not re-compared on checks.

CREATE TABLE face_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    embedding bytea NOT NULL,
    status text DEFAULT 'enrolled' NOT NULL,
    sample_uri text,
    consent_record_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT face_enrollments_pkey PRIMARY KEY (id),
    CONSTRAINT face_enrollments_user_id_key UNIQUE (user_id),
    CONSTRAINT face_enrollments_status_check CHECK (status IN ('enrolled', 'failed')),
    CONSTRAINT face_enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT face_enrollments_consent_record_id_fkey FOREIGN KEY (consent_record_id) REFERENCES consent_records(id) ON DELETE SET NULL
);

CREATE INDEX idx_face_enrollments_user_id ON face_enrollments USING btree (user_id);

-- Down Migration
DROP TABLE face_enrollments;
