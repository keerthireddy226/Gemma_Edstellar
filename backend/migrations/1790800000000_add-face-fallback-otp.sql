-- Up Migration
-- Replaces passkey as the only path past a failed face check — a 6-digit
-- code emailed to the account's own (already verified) address instead.
CREATE TABLE face_fallback_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  face_check_id uuid NOT NULL REFERENCES face_check_results(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_face_fallback_otp_user_id ON face_fallback_otp_codes USING btree (user_id);

-- Down Migration
DROP TABLE face_fallback_otp_codes;
