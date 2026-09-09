-- Up Migration
-- Adds real per-item CEFR level tags (A1-C2) so scoring can assess a user
-- level-by-level instead of one flat correct/total percentage, and adds the
-- 9 item types (of the reference project's 18) that had no equivalent here,
-- so the new leveled content (sourced from Pearson's official guides +
-- test-prep-guides.com practice items) can cover all 18 types.

ALTER TABLE items ADD COLUMN cefr_level TEXT;
ALTER TABLE items ADD CONSTRAINT items_cefr_level_check CHECK (cefr_level IS NULL OR cefr_level IN ('A1','A2','B1','B2','C1','C2'));
CREATE INDEX idx_items_cefr_level ON items(cefr_level);

ALTER TABLE placements ADD COLUMN skill_levels JSONB;

INSERT INTO item_types (id, name, skills, input_method, instruction_text, question_instruction, auto_advance, timer_seconds, two_phase_read_seconds, two_phase_write_seconds, min_words, max_words, estimated_seconds) VALUES
('conversations', 'Conversations', ARRAY['speaking','listening'], 'mic',
 'You will hear a conversation between two people, followed by a question. Give a short, simple answer to the question.',
 'Answer the question.', true, NULL, NULL, NULL, NULL, NULL, 14),

('reading_selective', 'Reading (Selective)', ARRAY['speaking','reading','listening'], 'mic',
 'Please read the sentences as you are instructed.',
 'Read the sentence as instructed.', true, NULL, NULL, NULL, NULL, NULL, 12),

('passage_comprehension', 'Passage Comprehension', ARRAY['speaking','listening'], 'mic',
 'You will hear a story, followed by three questions. When you hear a beep, say your answer quickly and smoothly. Your answer should be a few words or a very short sentence.',
 'Answer the question.', true, NULL, NULL, NULL, NULL, NULL, 35),

('speaking_situations', 'Speaking Situations', ARRAY['speaking','reading'], 'mic',
 'You will hear and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 60 seconds to answer the question. Please answer as completely as you can.',
 'Answer the question.', false, 60, NULL, NULL, NULL, NULL, 85),

('typing', 'Typing', ARRAY['writing'], 'textarea',
 'This section allows you to get used to the keyboard and also measures your typing speed. You will have 60 seconds to type as much as you can. Type quickly and accurately. Keep typing until your time is up.',
 'Type the passage.', false, 60, NULL, NULL, NULL, NULL, 75),

('email_writing', 'E-Mail Writing', ARRAY['writing'], 'textarea',
 'Read a description of a situation and write an email addressing the issues described in the situation. You will have 9 minutes. You must write at least 100 words.',
 'Type your e-mail.', false, 540, NULL, NULL, 100, NULL, 570),

('summary_and_opinion', 'Summary and Opinion', ARRAY['writing','reading'], 'textarea',
 'Read the passage. Then write a short summary of the author''s opinion in 25-50 words, and give your own opinion on the topic. You must write at least 50 words. You will have 18 minutes.',
 'Summarize the passage, then give your opinion.', false, 1080, NULL, NULL, 50, NULL, 1110),

('reading_comprehension', 'Reading Comprehension', ARRAY['reading'], 'radio',
 'Read a passage and a question. Select the best answer.',
 'Select the best answer.', false, 180, NULL, NULL, NULL, NULL, 200),

('response_selection', 'Response Selection', ARRAY['listening'], 'radio',
 'You will hear a sentence and then three possible responses. Choose the correct response.',
 'Select the correct response.', false, 8, NULL, NULL, NULL, NULL, 15);

-- Passage Reconstruction was previously "fix the grammar errors" (text
-- input, auto-graded). The reference project's real version is "read for
-- 30s, it disappears, rewrite from memory" — a genuinely different,
-- ungraded task (no single correct rewording, needs human/rubric review,
-- same category as Story Retelling/Open Questions). Switching the existing
-- type over to that real mechanic now that real content replaces the old
-- fix-the-errors items.
UPDATE item_types SET
  input_method = 'two-phase',
  instruction_text = 'You will have 30 seconds to read a paragraph. After 30 seconds, the paragraph will disappear from the screen. Then, you will have 90 seconds to reconstruct the paragraph. Show that you understood the passage by rewriting it in your own words.',
  question_instruction = 'Rewrite the passage using your own words.',
  two_phase_read_seconds = 30,
  two_phase_write_seconds = 90,
  estimated_seconds = 135
WHERE id = 'passage_reconstruction';

-- "reading" was a simplified stand-in for the reference's "Read Aloud" —
-- align it fully now that real Read Aloud content replaces it (also fixes
-- a skills-tag gap: it was missing "reading").
UPDATE item_types SET
  name = 'Read Aloud',
  skills = ARRAY['speaking','reading'],
  instruction_text = 'Read the passage aloud smoothly and naturally in a clear voice. You will be stopped after 30 seconds. This is not a speed reading test. You may not be able to finish reading the entire passage, but that is okay.',
  question_instruction = 'Read the passage out loud.',
  timer_seconds = 30,
  estimated_seconds = 45
WHERE id = 'reading';
