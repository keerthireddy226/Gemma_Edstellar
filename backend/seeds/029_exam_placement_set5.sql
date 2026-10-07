-- Practice Tests: English Placement Test, Set 5 (fifth parallel form).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('b5000000-0000-4000-8000-000000000001', 'placement-5', 'English Placement Test — Set 5', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('b5000000-0000-4000-8000-000000000011', 'b5000000-0000-4000-8000-000000000001', 'Read Aloud', 'reading', 1),
  ('b5000000-0000-4000-8000-000000000012', 'b5000000-0000-4000-8000-000000000001', 'Repeats', 'repeats', 2),
  ('b5000000-0000-4000-8000-000000000013', 'b5000000-0000-4000-8000-000000000001', 'Sentence Builds', 'sentence_builds', 3),
  ('b5000000-0000-4000-8000-000000000014', 'b5000000-0000-4000-8000-000000000001', 'Conversations', 'conversations', 4),
  ('b5000000-0000-4000-8000-000000000015', 'b5000000-0000-4000-8000-000000000001', 'Typing', 'typing', 5),
  ('b5000000-0000-4000-8000-000000000016', 'b5000000-0000-4000-8000-000000000001', 'Sentence Completion', 'sentence_completion', 6),
  ('b5000000-0000-4000-8000-000000000017', 'b5000000-0000-4000-8000-000000000001', 'Dictation', 'dictation', 7),
  ('b5000000-0000-4000-8000-000000000018', 'b5000000-0000-4000-8000-000000000001', 'Passage Reconstruction', 'passage_reconstruction', 8),
  ('b5000000-0000-4000-8000-000000000019', 'b5000000-0000-4000-8000-000000000001', 'Summary and Opinion', 'summary_and_opinion', 9)
ON CONFLICT (id) DO NOTHING;
