-- Practice Tests: Versant Professional English Test, Set 1 — real 10-part
-- structure per Table 1 of the Pearson validation summary (58 items:
-- Sentence Completion 10, Passage Reconstruction 3, Reading Comprehension
-- 6 (3 passages x 2 Q), E-mail Writing 2, Dictation 8, Response Selection
-- 8, Passage Comprehension 6 (2 passages x 3 Q), Repeat 10, Speaking
-- Situations 2, Story Retellings 3).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'professional-1', 'Versant Professional English Test — Set 1', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('d1000000-0000-4000-8000-000000000011', 'd1000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 1),
  ('d1000000-0000-4000-8000-000000000012', 'd1000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 2),
  ('d1000000-0000-4000-8000-000000000013', 'd1000000-0000-4000-8000-000000000001', 'Reading Comprehension', 'reading_comprehension', 3),
  ('d1000000-0000-4000-8000-000000000014', 'd1000000-0000-4000-8000-000000000001', 'Email Writing', 'email_writing', 4),
  ('d1000000-0000-4000-8000-000000000015', 'd1000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 5),
  ('d1000000-0000-4000-8000-000000000016', 'd1000000-0000-4000-8000-000000000001', 'Response Selection', 'response_selection', 6),
  ('d1000000-0000-4000-8000-000000000017', 'd1000000-0000-4000-8000-000000000001', 'Passage Comprehension', 'passage_comprehension', 7),
  ('d1000000-0000-4000-8000-000000000018', 'd1000000-0000-4000-8000-000000000001', 'Repeat', 'repeats', 8),
  ('d1000000-0000-4000-8000-000000000019', 'd1000000-0000-4000-8000-000000000001', 'Speaking Situations', 'speaking_situations', 9),
  ('d1000000-0000-4000-8000-00000000001a', 'd1000000-0000-4000-8000-000000000001', 'Story Retellings', 'story_retelling', 10)
ON CONFLICT (id) DO NOTHING;
