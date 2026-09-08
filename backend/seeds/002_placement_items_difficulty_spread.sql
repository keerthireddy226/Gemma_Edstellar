-- Adds a genuine easy/hard difficulty spread to the placement item bank.
-- The original 20 items (seeded in 001) were all roughly the same middle
-- difficulty, which meant the test couldn't actually discriminate a true
-- beginner from a true advanced speaker — everyone was answering questions
-- pitched at the same level. This tags those 20 as "medium" (0.5) and adds
-- one easy (~0.25, A2-ish) and one hard (~0.8, C1-ish) item per type, so a
-- session can sample across the range instead of a flat middle band.
-- difficulty is a 0-1 heuristic scale, not a calibrated psychometric score.
-- Re-runnable: psql "$DATABASE_URL" -f seeds/002_placement_items_difficulty_spread.sql

BEGIN;

UPDATE items SET difficulty = 0.5 WHERE difficulty IS NULL;

-- Reading — pronunciation only, no listening component
INSERT INTO items (item_type_id, content, difficulty, status, pipeline_version, topic) VALUES
('reading', '{"text": "I like to drink coffee every morning."}', 0.25, 'draft', 'manual', 'daily-life'),
('reading', '{"text": "The committee''s unprecedented decision to postpone the merger sparked considerable controversy among shareholders."}', 0.8, 'draft', 'manual', 'business');

-- Repeats — hear it, repeat it exactly
INSERT INTO items (item_type_id, content, answer_set, difficulty, status, pipeline_version, topic) VALUES
('repeats', '{"text": "I want to go home now."}', '{"exact": "I want to go home now."}', 0.25, 'draft', 'manual', 'daily-life'),
('repeats', '{"text": "Although the proposal seemed promising initially, further analysis revealed several significant drawbacks."}', '{"exact": "Although the proposal seemed promising initially, further analysis revealed several significant drawbacks."}', 0.8, 'draft', 'manual', 'business');

-- Short Answer Questions — hear a question, answer in a few words
INSERT INTO items (item_type_id, content, answer_set, difficulty, status, pipeline_version, topic) VALUES
('short_answer', '{"question": "What color is the sky on a clear day?"}', '{"acceptable_answers": ["blue"]}', 0.25, 'draft', 'manual', 'daily-life'),
('short_answer', '{"question": "What''s the word for being extremely careful and precise in your work?"}', '{"acceptable_answers": ["meticulous"]}', 0.8, 'draft', 'manual', 'vocabulary');

-- Sentence Builds — hear 3 jumbled word groups, speak them in correct order.
-- Both are plain SVO / fixed-clause structures with no movable adverbial
-- phrase, so there's exactly one grammatical ordering (the earlier
-- ambiguity bug came from a frontable time phrase — avoided here).
INSERT INTO items (item_type_id, content, answer_set, difficulty, status, pipeline_version, topic) VALUES
('sentence_builds', '{"groups": ["a new bicycle", "wants", "my sister"]}', '{"correct": "My sister wants a new bicycle."}', 0.25, 'draft', 'manual', 'daily-life'),
('sentence_builds', '{"groups": ["convinced her colleagues", "the presentation she gave", "was so compelling that it"]}', '{"correct": "The presentation she gave was so compelling that it convinced her colleagues."}', 0.8, 'draft', 'manual', 'business');

-- Story Retelling — hear a short story, retell it in your own words
INSERT INTO items (item_type_id, content, difficulty, status, pipeline_version, topic) VALUES
('story_retelling', '{"story": "Tom forgot his umbrella at home. It started raining, so he bought a new one from a small shop near his office."}', 0.25, 'draft', 'manual', 'daily-life'),
('story_retelling', '{"story": "After months of preparing for the promotion, Elena was passed over in favor of a colleague with less experience. Frustrated but determined, she scheduled a meeting with her manager to understand the decision and ask what she could improve for next time."}', 0.8, 'draft', 'manual', 'work');

-- Open Questions — spoken opinion
INSERT INTO items (item_type_id, content, difficulty, status, pipeline_version, topic) VALUES
('open_questions', '{"prompt": "What is your favorite season of the year, and why?"}', 0.25, 'draft', 'manual', 'opinion'),
('open_questions', '{"prompt": "Do you think technology has made people more or less connected to each other? Explain your view."}', 0.8, 'draft', 'manual', 'opinion');

-- Dictation — type exactly what is heard
INSERT INTO items (item_type_id, content, answer_set, word_count, difficulty, status, pipeline_version, topic) VALUES
('dictation', '{"text": "She walks to school every day."}', '{"exact": "She walks to school every day."}', 6, 0.25, 'draft', 'manual', 'daily-life'),
('dictation', '{"text": "The negotiations were postponed indefinitely due to unforeseen circumstances."}', '{"exact": "The negotiations were postponed indefinitely due to unforeseen circumstances."}', 9, 0.8, 'draft', 'manual', 'business');

-- Sentence Completion — typed grammar item
INSERT INTO items (item_type_id, content, answer_set, difficulty, status, pipeline_version, topic) VALUES
('sentence_completion', '{"sentence": "She ___ (go) to the market every Sunday.", "hint_word": "go"}', '{"acceptable_answers": ["goes"]}', 0.25, 'draft', 'manual', 'grammar'),
('sentence_completion', '{"sentence": "If the museum ___ (extend) its hours during the festival, more visitors would have seen the exhibit.", "hint_word": "extend"}', '{"acceptable_answers": ["had extended"]}', 0.8, 'draft', 'manual', 'grammar');

-- Passage Reconstruction / Error Correction — fix a short passage with grammar errors
INSERT INTO items (item_type_id, content, answer_set, difficulty, status, pipeline_version, topic) VALUES
('passage_reconstruction', '{"passage": "He don''t like coffee. She go to work by bus every day."}', '{"corrected": "He doesn''t like coffee. She goes to work by bus every day."}', 0.25, 'draft', 'manual', 'daily-life'),
('passage_reconstruction', '{"passage": "Despite of the heavy traffic, we arrive on time for the meeting yesterday. The manager were impressed by our punctuality and give us positive feedback."}', '{"corrected": "Despite the heavy traffic, we arrived on time for the meeting yesterday. The manager was impressed by our punctuality and gave us positive feedback."}', 0.8, 'draft', 'manual', 'work');

-- Free Writing — short typed response to a prompt
INSERT INTO items (item_type_id, content, difficulty, status, pipeline_version, topic) VALUES
('free_writing', '{"prompt": "Write 2-3 sentences describing your favorite food and why you like it."}', 0.25, 'draft', 'manual', 'daily-life'),
('free_writing', '{"prompt": "In 3-4 sentences, explain whether you think working from home is better than working in an office, and why."}', 0.8, 'draft', 'manual', 'opinion');

COMMIT;
