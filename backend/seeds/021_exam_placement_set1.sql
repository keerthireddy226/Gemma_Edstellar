-- Practice Tests: Versant English Placement Test, Set 1 — real 9-part
-- structure per Table 1 of the Pearson validation summary (81 items:
-- Read Aloud 2, Repeats 16, Sentence Builds 10, Conversations 12, Typing 1,
-- Sentence Completion 20, Dictation 16, Passage Reconstruction 3,
-- Summary & Opinion 1).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'placement-1', 'English Placement Test — Set 1', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('b1000000-0000-4000-8000-000000000011', 'b1000000-0000-4000-8000-000000000001', 'Read Aloud', 'reading', 1),
  ('b1000000-0000-4000-8000-000000000012', 'b1000000-0000-4000-8000-000000000001', 'Repeats', 'repeats', 2),
  ('b1000000-0000-4000-8000-000000000013', 'b1000000-0000-4000-8000-000000000001', 'Sentence Builds', 'sentence_builds', 3),
  ('b1000000-0000-4000-8000-000000000014', 'b1000000-0000-4000-8000-000000000001', 'Conversations', 'conversations', 4),
  ('b1000000-0000-4000-8000-000000000015', 'b1000000-0000-4000-8000-000000000001', 'Typing', 'typing', 5),
  ('b1000000-0000-4000-8000-000000000016', 'b1000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 6),
  ('b1000000-0000-4000-8000-000000000017', 'b1000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 7),
  ('b1000000-0000-4000-8000-000000000018', 'b1000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 8),
  ('b1000000-0000-4000-8000-000000000019', 'b1000000-0000-4000-8000-000000000001', 'Summary and Opinion', 'summary_and_opinion', 9)
ON CONFLICT (id) DO NOTHING;
