-- Guards against a duplicate POST /session/:id/messages (double-click before
-- the send button disables, a network retry, or two tabs open to the same
-- session) computing the same turn_index twice and corrupting conversation
-- order. The route also now locks the session row for the duration of the
-- read-then-insert, so this constraint is a backstop, not the only guard.
BEGIN;
CREATE UNIQUE INDEX coach_turns_session_id_turn_index_key ON coach_turns (session_id, turn_index);
COMMIT;
