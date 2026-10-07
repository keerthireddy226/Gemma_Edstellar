-- Practice Tests: English Placement Test, Set 3 (third parallel form).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('b3000000-0000-4000-8000-000000000001', 'placement-3', 'English Placement Test — Set 3', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('b3000000-0000-4000-8000-000000000011', 'b3000000-0000-4000-8000-000000000001', 'Read Aloud', 'reading', 1),
  ('b3000000-0000-4000-8000-000000000012', 'b3000000-0000-4000-8000-000000000001', 'Repeats', 'repeats', 2),
  ('b3000000-0000-4000-8000-000000000013', 'b3000000-0000-4000-8000-000000000001', 'Sentence Builds', 'sentence_builds', 3),
  ('b3000000-0000-4000-8000-000000000014', 'b3000000-0000-4000-8000-000000000001', 'Conversations', 'conversations', 4),
  ('b3000000-0000-4000-8000-000000000015', 'b3000000-0000-4000-8000-000000000001', 'Typing', 'typing', 5),
  ('b3000000-0000-4000-8000-000000000016', 'b3000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 6),
  ('b3000000-0000-4000-8000-000000000017', 'b3000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 7),
  ('b3000000-0000-4000-8000-000000000018', 'b3000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 8),
  ('b3000000-0000-4000-8000-000000000019', 'b3000000-0000-4000-8000-000000000001', 'Summary and Opinion', 'summary_and_opinion', 9)
ON CONFLICT (id) DO NOTHING;
