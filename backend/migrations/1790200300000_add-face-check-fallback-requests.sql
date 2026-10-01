-- Up Migration
-- Only path past a failed face check: admin approval, not OTP (OTP proves
-- credential possession, not identity — doesn't help if account is already compromised).
-- Scoped to one specific attempt via failed_result_id + expires_at, not a standing bypass.

CREATE TABLE face_check_fallback_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    failed_result_id uuid NOT NULL,
    purpose text NOT NULL,
    status text DEFAULT 'pending' NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    review_note text,
    expires_at timestamp with time zone,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT face_check_fallback_requests_pkey PRIMARY KEY (id),
    CONSTRAINT face_check_fallback_requests_purpose_check CHECK (purpose IN ('placement', 'practice', 'practice_test')),
    CONSTRAINT face_check_fallback_requests_status_check CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
    CONSTRAINT face_check_fallback_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT face_check_fallback_requests_failed_result_id_fkey FOREIGN KEY (failed_result_id) REFERENCES face_check_results(id) ON DELETE CASCADE,
    CONSTRAINT face_check_fallback_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_face_fallback_user_id ON face_check_fallback_requests USING btree (user_id);
CREATE INDEX idx_face_fallback_pending ON face_check_fallback_requests USING btree (status) WHERE status = 'pending';

-- Down Migration
DROP TABLE face_check_fallback_requests;
