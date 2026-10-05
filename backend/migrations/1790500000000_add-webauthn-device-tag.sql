-- Up Migration
-- A random id the browser generates and stores in localStorage at registration — never synced
-- anywhere. Pins passkey *usage* to the registering browser even though the key material itself
-- (Google Password Manager) can be synced account-wide. Scoped per credential, not per user, so
-- each device the learner registers on gets its own independently-gated row.

ALTER TABLE webauthn_credentials ADD COLUMN device_tag text;
CREATE INDEX idx_webauthn_credentials_device_tag ON webauthn_credentials USING btree (user_id, device_tag);

-- Down Migration
ALTER TABLE webauthn_credentials DROP COLUMN device_tag;
