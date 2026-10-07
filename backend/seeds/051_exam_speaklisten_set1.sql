-- Practice Tests: Versant Speaking and Listening Test, Set 1 — real 6-part
-- structure per the validation report's Table 1 (Give a short answer 8,
-- Repeat the sentence 16, Answer a question about a conversation 6,
-- Answer questions about a passage 6 = 2 passages x 3 questions, Retell a
-- passage 3, Give your opinion 3 — 42 total, consistent with the real
-- spec's own approximate/ranged counts).
INSERT INTO exams (id, code, name, is_active) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'speaklisten-1', 'Versant Speaking and Listening Test — Set 1', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exam_parts (id, exam_id, part_label, item_type_id, sort_order) VALUES
  ('e1000000-0000-4000-8000-000000000011', 'e1000000-0000-4000-8000-000000000001', 'Give a Short Answer', 'short_answer', 1),
  ('e1000000-0000-4000-8000-000000000012', 'e1000000-0000-4000-8000-000000000001', 'Repeat the Sentence', 'repeats', 2),
  ('e1000000-0000-4000-8000-000000000013', 'e1000000-0000-4000-8000-000000000001', 'Answer a Question About a Conversation', 'conversations', 3),
  ('e1000000-0000-4000-8000-000000000014', 'e1000000-0000-4000-8000-000000000001', 'Answer Questions About a Passage', 'passage_comprehension', 4),
  ('e1000000-0000-4000-8000-000000000015', 'e1000000-0000-4000-8000-000000000001', 'Retell a Passage', 'story_retelling', 5),
  ('e1000000-0000-4000-8000-000000000016', 'e1000000-0000-4000-8000-000000000001', 'Give Your Opinion', 'open_questions', 6)
ON CONFLICT (id) DO NOTHING;
