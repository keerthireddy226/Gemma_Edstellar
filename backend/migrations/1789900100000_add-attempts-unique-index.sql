-- Two concurrent submissions for the same (session, item) — a double-click
-- before the button disables, or a network retry racing the original
-- request — could each pass gradeAndSaveAttempt's non-atomic "does a prior
-- attempt exist" check and both insert, leaving two attempts/scores rows
-- for one question. That silently double-counts it in /complete's
-- gradedCount/correctCount/skill percents. Dedupe any existing duplicates
-- (keep the most recently submitted) before adding the constraint that
-- gradeAndSaveAttempt's UPSERT now relies on to make writes atomic.
BEGIN;

DELETE FROM attempts a USING (
  SELECT id, row_number() OVER (PARTITION BY session_id, item_id ORDER BY submitted_at DESC NULLS LAST, created_at DESC) AS rn
  FROM attempts
) dupes
WHERE a.id = dupes.id AND dupes.rn > 1;

CREATE UNIQUE INDEX attempts_session_id_item_id_key ON attempts (session_id, item_id);

COMMIT;
