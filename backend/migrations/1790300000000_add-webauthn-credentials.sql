-- Up Migration
-- Passkey (WebAuthn) support: one self-serve fallback tier before admin-approval.
-- Device-bound, phishing-proof — closes the remote-impersonation case OTP/email can't.
-- credential_id/public_key are base64url text, not bytea — simplewebauthn's own encoding.

CREATE TABLE webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id text NOT NULL,
    public_key text NOT NULL,
    counter bigint DEFAULT 0 NOT NULL,
    transports text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone,
    CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id),
    CONSTRAINT webauthn_credentials_credential_id_key UNIQUE (credential_id),
    CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_webauthn_credentials_user_id ON webauthn_credentials USING btree (user_id);

-- One-time challenge storage between the options and verify calls of a ceremony.
-- Short-lived (expires_at) and single-use (consumed_at) — same shape as placement_reminder_tokens.
CREATE TABLE webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    challenge text NOT NULL,
    purpose text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id),
    CONSTRAINT webauthn_challenges_purpose_check CHECK (purpose IN ('register', 'fallback')),
    CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_webauthn_challenges_user_id ON webauthn_challenges USING btree (user_id);

-- Down Migration
DROP TABLE webauthn_challenges;
DROP TABLE webauthn_credentials;
