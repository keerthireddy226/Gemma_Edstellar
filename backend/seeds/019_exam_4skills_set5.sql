-- Practice Tests: Versant 4-Skills Essentials Test, Set 5 (fifth parallel form).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('a5000000-0000-4000-8000-000000000001', 'fourskills-5', 'English 4-Skills Essentials — Set 5', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('a5000000-0000-4000-8000-000000000011', 'a5000000-0000-4000-8000-000000000001', 'Repeats', 'repeats', 1),
  ('a5000000-0000-4000-8000-000000000012', 'a5000000-0000-4000-8000-000000000001', 'Sentence Builds', 'sentence_builds', 2),
  ('a5000000-0000-4000-8000-000000000013', 'a5000000-0000-4000-8000-000000000001', 'Conversations', 'conversations', 3),
  ('a5000000-0000-4000-8000-000000000014', 'a5000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 4),
  ('a5000000-0000-4000-8000-000000000015', 'a5000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 5),
  ('a5000000-0000-4000-8000-000000000016', 'a5000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 6)
ON CONFLICT (id) DO NOTHING;
