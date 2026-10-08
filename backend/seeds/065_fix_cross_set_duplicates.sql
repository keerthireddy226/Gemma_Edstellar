-- Post-build audit (round 2): the earlier dedup check (064) only compared
-- content within the SAME set_id. This catches the same Set-3-backfill bug
-- manifesting as cross-set duplicates (identical question in both Set 1
-- and Set 3 of the same unit) — 15 pre-existing cases, plus one new
-- duplicate introduced by 064 itself (064 picked "She has a small dog."
-- for dictation A1 Set 3 without checking Set 1, which already had that
-- exact sentence). Idempotent — safe to re-run on an already-fixed DB.
BEGIN;
UPDATE items SET content = '{"dialogue": "A: Can you help me? B: Yes, of course.", "question": "Does B agree to help?"}', answer_set = '{"acceptable_answers": ["yes"]}' WHERE id = '50b14650-4db2-46ab-80a8-224c8759bb89';
UPDATE items SET content = '{"text": "My sister likes to read books."}' WHERE id = '6911c2cb-2236-40cf-9110-f2f48589b488';
UPDATE items SET content = '{"text": "The weather is sunny today."}', answer_set = '{"exact": "The weather is sunny today."}' WHERE id = 'b6b701b6-7e04-4fca-b4f5-54191818fd64';
UPDATE items SET content = '{"prompt": "Write a short email to a friend asking them to go to the park."}' WHERE id = '9239b837-3b13-436b-8923-253a52631139';
UPDATE items SET content = '{"prompt": "Write 2-3 sentences about your favorite color."}' WHERE id = 'ea23b87f-8e79-4f06-bf83-97f964d5fb98';
UPDATE items SET content = '{"story": "Leo has a green bicycle. He rides it every day after school.", "question": "What color is Leo''s bicycle?"}', answer_set = '{"acceptable_answers": ["green"]}' WHERE id = '545457b4-5217-426c-84c8-d63f099ad960';
UPDATE items SET content = '{"passage": "Maya has a small bird. The bird can sing."}' WHERE id = 'ed2dd02a-4a68-44b5-a96b-af8c1ba83372';
UPDATE items SET content = '{"text": "OPEN Monday to Friday, 9 to 5.", "question": "Is it open on Saturday?"}', answer_set = '{"acceptable_answers": ["no"]}' WHERE id = 'fb0533c7-e717-4a9b-bef0-6d2cd0528616';
UPDATE items SET content = '{"text": "What day is it today?", "options": ["It is Friday.", "I am happy.", "Yes, please."]}', answer_set = '{"correctIndex": 0}' WHERE id = '44c1bfa9-b5c9-49e8-9bd3-13e917f7a3e6';
UPDATE items SET content = '{"groups": ["likes", "he", "ice cream"]}', answer_set = '{"correct": "He likes ice cream.", "alternates": []}' WHERE id = 'c9de3f17-96d8-4313-bd40-3fa83c994a51';
UPDATE items SET content = '{"sentence": "He ___ my brother."}', answer_set = '{"acceptable_answers": ["is"]}' WHERE id = 'cf975b9a-6b12-4245-91ad-939456260137';
UPDATE items SET content = '{"situation": "You want to buy a ticket at the station. What do you say?"}' WHERE id = '7b60fbf8-4395-4dba-b578-22dfb47898a3';
UPDATE items SET content = '{"story": "Priya has a rabbit. The rabbit is white and loves carrots."}' WHERE id = 'd18999e8-00b1-4d0d-999a-218cfbd12810';
UPDATE items SET content = '{"story": "Arjun has a fish. The fish lives in a small blue tank."}' WHERE id = '347c4708-5687-4061-af18-7e926f4831d8';
UPDATE items SET content = '{"passage": "Many people enjoy music. Music can make people feel happy."}' WHERE id = '9ddae517-475d-4d0e-a276-23d1ecaa7b2f';
UPDATE items SET content = '{"text": "I have a cat. My cat is black."}' WHERE id = 'eb00db57-7498-4da4-ae3a-6876e5e5190a';
COMMIT;
