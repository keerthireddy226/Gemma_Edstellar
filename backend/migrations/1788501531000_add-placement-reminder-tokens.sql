-- Up Migration
-- Backs the Placement page's "Schedule for later" button: a token that (1)
-- lets the emailed link deep-link back to the learner's account, and (2)
-- tracks the 7-day window during which the button stays disabled, mirroring
-- the existing email_verification_tokens / password_reset_tokens pattern.
CREATE TABLE placement_reminder_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ NOT NULL   -- 7 days from creation
);
CREATE INDEX idx_placement_reminder_tokens_user_id ON placement_reminder_tokens(user_id);
