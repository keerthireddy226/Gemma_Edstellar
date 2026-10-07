-- Practice Tests: Versant Speaking and Listening Test, Set 4 (fourth parallel form).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('e4000000-0000-4000-8000-000000000001', 'speaklisten-4', 'Versant Speaking and Listening Test — Set 4', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('e4000000-0000-4000-8000-000000000011', 'e4000000-0000-4000-8000-000000000001', 'Give a Short Answer', 'short_answer', 1),
  ('e4000000-0000-4000-8000-000000000012', 'e4000000-0000-4000-8000-000000000001', 'Repeat the Sentence', 'repeats', 2),
  ('e4000000-0000-4000-8000-000000000013', 'e4000000-0000-4000-8000-000000000001', 'Answer a Question About a Conversation', 'conversations', 3),
  ('e4000000-0000-4000-8000-000000000014', 'e4000000-0000-4000-8000-000000000001', 'Answer Questions About a Passage', 'passage_comprehension', 4),
  ('e4000000-0000-4000-8000-000000000015', 'e4000000-0000-4000-8000-000000000001', 'Retell a Passage', 'story_retelling', 5),
  ('e4000000-0000-4000-8000-000000000016', 'e4000000-0000-4000-8000-000000000001', 'Give Your Opinion', 'open_questions', 6)
ON CONFLICT (id) DO NOTHING;
