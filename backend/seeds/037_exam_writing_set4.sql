-- Practice Tests: Versant Writing Test, Set 4 (fourth parallel form).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('c4000000-0000-4000-8000-000000000001', 'writing-4', 'Versant Writing Test — Set 4', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('c4000000-0000-4000-8000-000000000011', 'c4000000-0000-4000-8000-000000000001', 'Typing', 'typing', 1),
  ('c4000000-0000-4000-8000-000000000012', 'c4000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 2),
  ('c4000000-0000-4000-8000-000000000013', 'c4000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 3),
  ('c4000000-0000-4000-8000-000000000014', 'c4000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 4),
  ('c4000000-0000-4000-8000-000000000015', 'c4000000-0000-4000-8000-000000000001', 'Email Writing', 'email_writing', 5)
ON CONFLICT (id) DO NOTHING;
