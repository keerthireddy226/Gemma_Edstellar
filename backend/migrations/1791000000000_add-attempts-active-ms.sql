-- Up Migration
-- Real per-question active time (question shown -> submitted, client-tracked),
-- independent of mic-recording duration. window_start_at/submitted_at on this
-- table are both set to now() at submit time (not a real per-item duration),
-- and session-level wall-clock span includes idle/dashboard time — neither
-- can answer "how long was actually spent on this question." This can.
ALTER TABLE attempts ADD COLUMN active_ms integer;

-- Down Migration
ALTER TABLE attempts DROP COLUMN active_ms;
