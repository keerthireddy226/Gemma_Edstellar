-- Practice Tests: Versant Writing Test, Set 5 (fifth parallel form).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('c5000000-0000-4000-8000-000000000001', 'writing-5', 'Versant Writing Test — Set 5', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('c5000000-0000-4000-8000-000000000011', 'c5000000-0000-4000-8000-000000000001', 'Typing', 'typing', 1),
  ('c5000000-0000-4000-8000-000000000012', 'c5000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 2),
  ('c5000000-0000-4000-8000-000000000013', 'c5000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 3),
  ('c5000000-0000-4000-8000-000000000014', 'c5000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 4),
  ('c5000000-0000-4000-8000-000000000015', 'c5000000-0000-4000-8000-000000000001', 'Email Writing', 'email_writing', 5)
ON CONFLICT (id) DO NOTHING;
