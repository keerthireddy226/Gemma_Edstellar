-- A third decision state between 'match' and 'mismatch' — see
-- backend/src/voice/speakerVerification.ts. Real testing found a genuine
-- speaker's own natural voice variation (fatigue, time of day, mild
-- congestion) can score as low as a genuinely different person, so no
-- single threshold can be both always-forgiving-of-you and
-- always-rejecting-of-someone-else. 'uncertain' lets a borderline score
-- through (flagged_for_review, same column this table always had for
-- exactly this) instead of hard-blocking a learner having an off voice day;
-- only a clearly-low score still blocks as a real 'mismatch'.
BEGIN;
ALTER TABLE voice_check_results DROP CONSTRAINT voice_check_results_decision_check;
ALTER TABLE voice_check_results ADD CONSTRAINT voice_check_results_decision_check
  CHECK (decision IN ('match', 'uncertain', 'mismatch', 'error'));
COMMIT;
