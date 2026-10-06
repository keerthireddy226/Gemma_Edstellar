-- Up Migration
-- Async human certification (Phase 2) — a placement whose session had any
-- flagged_for_review face_check_results holds as 'pending_review' instead of
-- 'certified'. Not a real-time gate: the learner isn't blocked, just flagged
-- for a human to look at before the result is treated as fully trusted.

ALTER TABLE placements ADD COLUMN session_id uuid REFERENCES sessions(id) ON DELETE SET NULL;
ALTER TABLE placements ADD COLUMN status text DEFAULT 'certified' NOT NULL;
ALTER TABLE placements ADD CONSTRAINT placements_status_check CHECK (status IN ('certified', 'pending_review', 'fraud_confirmed'));
ALTER TABLE placements ADD COLUMN reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE placements ADD COLUMN reviewed_at timestamp with time zone;
ALTER TABLE placements ADD COLUMN review_note text;

CREATE INDEX idx_placements_pending_review ON placements USING btree (status) WHERE status = 'pending_review';

-- Down Migration
ALTER TABLE placements DROP COLUMN review_note;
ALTER TABLE placements DROP COLUMN reviewed_at;
ALTER TABLE placements DROP COLUMN reviewed_by;
ALTER TABLE placements DROP CONSTRAINT placements_status_check;
ALTER TABLE placements DROP COLUMN status;
ALTER TABLE placements DROP COLUMN session_id;
