-- Up Migration
-- One row per pre-session voice-check attempt. Mismatches/low-confidence
-- results are never used to block a session (see backend/src/voice/
-- routes.ts) — they are only flagged here for later human review, mirroring
-- how an AI-grading service failure is treated as "needs review," not
-- automatically the learner's fault. `session_id` starts NULL (the check
-- happens before the session row exists) and is backfilled by the
-- session-start endpoint once it creates/resumes the actual session.
-- `purpose` includes 'practice_test' now even though that page is currently
-- a stub, so no further migration is needed once it's built for real.

CREATE TABLE voice_check_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid,
    purpose text NOT NULL,
    decision text NOT NULL,
    similarity_score numeric,
    sample_uri text,
    flagged_for_review boolean DEFAULT false NOT NULL,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT voice_check_results_pkey PRIMARY KEY (id),
    CONSTRAINT voice_check_results_purpose_check CHECK (purpose IN ('placement', 'practice', 'practice_test')),
    CONSTRAINT voice_check_results_decision_check CHECK (decision IN ('match', 'mismatch', 'error')),
    CONSTRAINT voice_check_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT voice_check_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_voice_check_results_user_id ON voice_check_results USING btree (user_id);
CREATE INDEX idx_voice_check_results_session_id ON voice_check_results USING btree (session_id);
CREATE INDEX idx_voice_check_results_flagged ON voice_check_results USING btree (flagged_for_review) WHERE flagged_for_review;
