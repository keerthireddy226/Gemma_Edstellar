-- Practice Tests pilot: Versant 4-Skills Essentials Test, Set 1 — one
-- parallel form (exam) made of its six real task sections (exam_parts),
-- per the official Pearson item-count table (Repeats 16, Sentence Builds 8,
-- Conversations 12, Sentence Completion 18, Dictation 14, Passage
-- Reconstruction 2 = 70 total). Content items for each part are seeded
-- separately once drafted and reviewed.

INSERT INTO exams (id, code, name, is_active) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'fourskills-1', 'English 4-Skills Essentials — Set 1', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000001', 'Repeats', 'repeats', 1),
  ('a1000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000001', 'Sentence Builds', 'sentence_builds', 2),
  ('a1000000-0000-4000-8000-000000000013', 'a1000000-0000-4000-8000-000000000001', 'Conversations', 'conversations', 3),
  ('a1000000-0000-4000-8000-000000000014', 'a1000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 4),
  ('a1000000-0000-4000-8000-000000000015', 'a1000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 5),
  ('a1000000-0000-4000-8000-000000000016', 'a1000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 6)
ON CONFLICT (id) DO NOTHING;
