-- Up Migration
-- A synced passkey (Google Password Manager/iCloud Keychain) works from any device signed
-- into that account, not just the enrolled one — defeats the device-bound security claim.
-- Stored so registration can reject synced credentials and verify can re-check as a backstop.

ALTER TABLE webauthn_credentials ADD COLUMN device_type text;
ALTER TABLE webauthn_credentials ADD COLUMN backed_up boolean DEFAULT false NOT NULL;

-- Down Migration
ALTER TABLE webauthn_credentials DROP COLUMN backed_up;
ALTER TABLE webauthn_credentials DROP COLUMN device_type;
