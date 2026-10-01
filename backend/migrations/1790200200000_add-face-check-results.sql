-- Up Migration
-- One row per face-check attempt. uncertain/mismatch never grant access alone —
-- see face_check_fallback_requests for the only path past a failed check.
-- liveness_score/spoof_detected stored separately from similarity_score since
-- they answer a different question (live person vs. right person).

CREATE TABLE face_check_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid,
    purpose text NOT NULL,
    decision text NOT NULL,
    similarity_score numeric,
    liveness_score numeric,
    spoof_detected boolean DEFAULT false NOT NULL,
    face_count integer,
    sample_uri text,
    flagged_for_review boolean DEFAULT false NOT NULL,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT face_check_results_pkey PRIMARY KEY (id),
    CONSTRAINT face_check_results_purpose_check CHECK (purpose IN ('placement', 'practice', 'practice_test')),
    CONSTRAINT face_check_results_decision_check CHECK (decision IN ('match', 'uncertain', 'mismatch', 'no_face', 'multiple_faces', 'spoof', 'error')),
    CONSTRAINT face_check_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT face_check_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_face_check_results_user_id ON face_check_results USING btree (user_id);
CREATE INDEX idx_face_check_results_session_id ON face_check_results USING btree (session_id);
CREATE INDEX idx_face_check_results_flagged ON face_check_results USING btree (flagged_for_review) WHERE flagged_for_review;

-- Down Migration
DROP TABLE face_check_results;
