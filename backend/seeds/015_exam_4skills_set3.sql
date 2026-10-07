-- Practice Tests: Versant 4-Skills Essentials Test, Set 3 (third parallel form).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('a3000000-0000-4000-8000-000000000001', 'fourskills-3', 'English 4-Skills Essentials — Set 3', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('a3000000-0000-4000-8000-000000000011', 'a3000000-0000-4000-8000-000000000001', 'Repeats', 'repeats', 1),
  ('a3000000-0000-4000-8000-000000000012', 'a3000000-0000-4000-8000-000000000001', 'Sentence Builds', 'sentence_builds', 2),
  ('a3000000-0000-4000-8000-000000000013', 'a3000000-0000-4000-8000-000000000001', 'Conversations', 'conversations', 3),
  ('a3000000-0000-4000-8000-000000000014', 'a3000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 4),
  ('a3000000-0000-4000-8000-000000000015', 'a3000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 5),
  ('a3000000-0000-4000-8000-000000000016', 'a3000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 6)
ON CONFLICT (id) DO NOTHING;
