-- Up Migration
-- Lets a learner pick which generated TTS voice (male/female) plays item
-- audio everywhere, changeable later from the Profile page. Nullable, no
-- default, on purpose: onboarding is NOT being touched to ask this — item-
-- serving code falls back to a hardcoded default voice (COALESCE(preferred_
-- voice, 'female')) until the learner actually visits Profile.

ALTER TABLE participant_profiles ADD COLUMN preferred_voice TEXT;
ALTER TABLE participant_profiles ADD CONSTRAINT participant_profiles_preferred_voice_check
  CHECK (preferred_voice IS NULL OR preferred_voice IN ('male', 'female'));
