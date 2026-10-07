-- Practice Tests: Versant Professional English Test, Set 5 (fifth parallel form).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('d5000000-0000-4000-8000-000000000001', 'professional-5', 'Versant Professional English Test — Set 5', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('d5000000-0000-4000-8000-000000000011', 'd5000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 1),
  ('d5000000-0000-4000-8000-000000000012', 'd5000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 2),
  ('d5000000-0000-4000-8000-000000000013', 'd5000000-0000-4000-8000-000000000001', 'Reading Comprehension', 'reading_comprehension', 3),
  ('d5000000-0000-4000-8000-000000000014', 'd5000000-0000-4000-8000-000000000001', 'Email Writing', 'email_writing', 4),
  ('d5000000-0000-4000-8000-000000000015', 'd5000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 5),
  ('d5000000-0000-4000-8000-000000000016', 'd5000000-0000-4000-8000-000000000001', 'Response Selection', 'response_selection', 6),
  ('d5000000-0000-4000-8000-000000000017', 'd5000000-0000-4000-8000-000000000001', 'Passage Comprehension', 'passage_comprehension', 7),
  ('d5000000-0000-4000-8000-000000000018', 'd5000000-0000-4000-8000-000000000001', 'Repeat', 'repeats', 8),
  ('d5000000-0000-4000-8000-000000000019', 'd5000000-0000-4000-8000-000000000001', 'Speaking Situations', 'speaking_situations', 9),
  ('d5000000-0000-4000-8000-00000000001a', 'd5000000-0000-4000-8000-000000000001', 'Story Retellings', 'story_retelling', 10)
ON CONFLICT (id) DO NOTHING;
