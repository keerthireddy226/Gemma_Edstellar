-- Practice Tests: Versant 4-Skills Essentials Test, Set 4 (fourth parallel form).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('a4000000-0000-4000-8000-000000000001', 'fourskills-4', 'English 4-Skills Essentials — Set 4', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('a4000000-0000-4000-8000-000000000011', 'a4000000-0000-4000-8000-000000000001', 'Repeats', 'repeats', 1),
  ('a4000000-0000-4000-8000-000000000012', 'a4000000-0000-4000-8000-000000000001', 'Sentence Builds', 'sentence_builds', 2),
  ('a4000000-0000-4000-8000-000000000013', 'a4000000-0000-4000-8000-000000000001', 'Conversations', 'conversations', 3),
  ('a4000000-0000-4000-8000-000000000014', 'a4000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 4),
  ('a4000000-0000-4000-8000-000000000015', 'a4000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 5),
  ('a4000000-0000-4000-8000-000000000016', 'a4000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 6)
ON CONFLICT (id) DO NOTHING;
