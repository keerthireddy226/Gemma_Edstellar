-- Tutor (Coach Mode) sessions reuse the existing sessions/coach_turns
-- tables (both already in the schema, coach_turns previously unused) rather
-- than a new table — just a new session_type value alongside
-- diagnostic/practice/placement/drill.
BEGIN;
ALTER TABLE sessions DROP CONSTRAINT sessions_session_type_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_session_type_check
  CHECK (session_type = ANY (ARRAY['diagnostic'::text, 'practice'::text, 'placement'::text, 'drill'::text, 'coach'::text]));
COMMIT;
