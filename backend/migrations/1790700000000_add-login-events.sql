-- Up Migration
-- Passive signal collection only — no new behavior, no detection logic yet.
-- Persists what a login request already carries (IP, user agent) instead of
-- discarding it, so there's real data to design anomaly detection against
-- later instead of guessing. Covered by the same purpose as existing
-- identity-verification consent (fraud/abuse prevention on the account).

CREATE TABLE login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_login_events_user_id ON login_events USING btree (user_id);

-- Down Migration
DROP TABLE login_events;
