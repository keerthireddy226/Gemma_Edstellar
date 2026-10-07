-- Practice Tests: Versant Writing Test, Set 1 — real 5-part structure per
-- Table 1 of the Pearson validation summary (43 items: Typing 1,
-- Sentence Completion 20, Dictation 16, Passage Reconstruction 4,
-- Email Writing 2).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'writing-1', 'Versant Writing Test — Set 1', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('c1000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000001', 'Typing', 'typing', 1),
  ('c1000000-0000-4000-8000-000000000012', 'c1000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 2),
  ('c1000000-0000-4000-8000-000000000013', 'c1000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 3),
  ('c1000000-0000-4000-8000-000000000014', 'c1000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 4),
  ('c1000000-0000-4000-8000-000000000015', 'c1000000-0000-4000-8000-000000000001', 'Email Writing', 'email_writing', 5)
ON CONFLICT (id) DO NOTHING;
