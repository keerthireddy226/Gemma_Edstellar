-- Companion to attempts_session_id_item_id_key: gradeAndSaveAttempt now
-- upserts the scores row by attempt_id too, so two concurrent submissions
-- for the same attempt can't each insert their own scores row (which would
-- double-count that question in /complete's gradedCount/correctCount).
BEGIN;
CREATE UNIQUE INDEX scores_attempt_id_key ON scores (attempt_id);
COMMIT;
