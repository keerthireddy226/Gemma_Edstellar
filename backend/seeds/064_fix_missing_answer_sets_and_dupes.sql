-- Post-build audit fixes (idempotent — safe to re-run on an already-fixed DB):
-- 1. Any practice-pool dictation item missing answer_set.exact (exact-match
--    grading needs it; without it these are permanently stuck PENDING).
--    Covers both pre-existing items and the new B2/C1/C2 content, since
--    the exact answer is always just the dictated text itself.
UPDATE items
SET answer_set = jsonb_build_object('exact', content->>'text')
WHERE item_type_id = 'dictation' AND pool = 'practice' AND answer_set IS NULL;

-- 2. Pre-existing A1/A2/B1 items (seeded 2026-09-08, before this session)
--    that had answer_set = NULL entirely for exact-match-graded types.
BEGIN;
UPDATE items SET answer_set = '{"acceptable_answers": ["am"]}' WHERE id = 'a8965646-5a05-4179-bee9-01b0e013fab7';
UPDATE items SET answer_set = '{"acceptable_answers": ["is"]}' WHERE id = '49522ac0-c058-4828-b437-f7c3cfbfb35f';
UPDATE items SET answer_set = '{"acceptable_answers": ["are"]}' WHERE id = '87e39016-14c0-4367-8ec2-8c174c95f8a9';
UPDATE items SET answer_set = '{"acceptable_answers": ["goes"]}' WHERE id = '413aea43-081c-48de-aac5-42f62d17bfe3';
UPDATE items SET answer_set = '{"acceptable_answers": ["drink"]}' WHERE id = 'd1995312-48f4-4138-a036-b8c65494e127';
UPDATE items SET answer_set = '{"acceptable_answers": ["sleeps", "sits", "lies", "is"]}' WHERE id = 'd5bdb929-cebc-4504-93cd-57708361550b';
UPDATE items SET answer_set = '{"acceptable_answers": ["have"]}' WHERE id = 'a18f16a3-a913-4dea-afc0-7dd9916be94a';
UPDATE items SET answer_set = '{"acceptable_answers": ["has"]}' WHERE id = '0ff67da9-e3b0-44a7-bf6a-a487d1182e08';
UPDATE items SET answer_set = '{"acceptable_answers": ["live"]}' WHERE id = 'c03893a3-54e6-425d-b67c-a72c602e1579';
UPDATE items SET answer_set = '{"acceptable_answers": ["plays"]}' WHERE id = 'd3f02ccd-9af6-4c15-b214-01c234a08a3d';
UPDATE items SET answer_set = '{"acceptable_answers": ["goes"]}' WHERE id = '720eb09d-8f7c-466b-9ee8-38a2c48ff3fe';
UPDATE items SET answer_set = '{"acceptable_answers": ["had"]}' WHERE id = '781082fa-8617-444c-baa4-f4bbb92fbbc5';
UPDATE items SET answer_set = '{"acceptable_answers": ["will"]}' WHERE id = 'a62320c2-3575-4bc9-be38-ad87a005ef26';
UPDATE items SET answer_set = '{"acceptable_answers": ["has been"]}' WHERE id = 'd9c058bd-f27b-4d8b-b9c2-96698cdb3a44';
UPDATE items SET answer_set = '{"acceptable_answers": ["were having"]}' WHERE id = '4a3a2aa1-64be-4e6c-9043-43eb99e9acf6';
UPDATE items SET answer_set = '{"acceptable_answers": ["do", "finish"]}' WHERE id = '985c503b-391d-44db-b30b-8263d5df065d';
UPDATE items SET answer_set = '{"acceptable_answers": ["to be"]}' WHERE id = '290f82f7-8d9b-4d1b-a0d8-f4dd3c06831b';
UPDATE items SET answer_set = '{"acceptable_answers": ["have"]}' WHERE id = 'bc73efeb-1f32-42bd-9c94-700058c30320';
UPDATE items SET answer_set = '{"acceptable_answers": ["taller", "shorter", "smarter", "stronger", "older"]}' WHERE id = 'e37b119f-5857-4f25-b09d-4b38caa688f1';
UPDATE items SET answer_set = '{"acceptable_answers": ["must", "should"]}' WHERE id = '44da26f7-b5c4-41d4-989f-41258b9c1af3';
UPDATE items SET answer_set = '{"acceptable_answers": ["had"]}' WHERE id = 'ee340b07-f024-429d-8814-b1dd17429f5d';
UPDATE items SET answer_set = '{"acceptable_answers": ["must", "should", "needs to"]}' WHERE id = '47c6d7c8-daf1-43f5-9cc1-e8a5d6adcf8c';
UPDATE items SET answer_set = '{"acceptable_answers": ["postponing", "delaying"]}' WHERE id = 'ad1d6c18-3dba-4f90-b885-a1b208c61341';
UPDATE items SET answer_set = '{"acceptable_answers": ["would"]}' WHERE id = 'a24e5583-f610-4a61-8e84-ed3465f77f0a';
UPDATE items SET answer_set = '{"acceptable_answers": ["comes", "will come"]}' WHERE id = '6d98b10a-06e5-4f6d-96f6-e276b893ca4c';
UPDATE items SET answer_set = '{"acceptable_answers": ["making"]}' WHERE id = 'd0e223bd-37a1-4b1c-bc75-620411f13b00';
UPDATE items SET answer_set = '{"acceptable_answers": ["studying", "trying", "working"]}' WHERE id = 'e46b889b-6c1f-414a-b351-c2f964bcea62';
UPDATE items SET answer_set = '{"acceptable_answers": ["will be"]}' WHERE id = '9bbca329-8a2c-4b87-986d-4e87c82eccdd';
UPDATE items SET answer_set = '{"acceptable_answers": ["waking"]}' WHERE id = 'c4958151-6fc9-4ecb-97ff-67c114486eff';
UPDATE items SET answer_set = '{"acceptable_answers": ["has been"]}' WHERE id = '3e537e6f-1fe7-4635-ab83-a1a9cd08f7dd';

UPDATE items SET answer_set = '{"correct": "This is my bag.", "alternates": []}' WHERE id = 'ce6fd8e1-341b-4344-bd69-35d7ea6f6a2b';
UPDATE items SET answer_set = '{"correct": "I have a pen.", "alternates": []}' WHERE id = '2e471109-cd11-46e3-bfb2-07d728ebf7e4';
UPDATE items SET answer_set = '{"correct": "She is my mother.", "alternates": []}' WHERE id = '3b1563c5-67ec-47db-9052-e1653246e6aa';
UPDATE items SET answer_set = '{"correct": "We play football.", "alternates": []}' WHERE id = '70ac6d2e-f0ba-4fee-a94d-9424ad5e5119';
UPDATE items SET answer_set = '{"correct": "He is a student.", "alternates": []}' WHERE id = '52e8da1b-1922-4e15-b894-8967f15baf08';
UPDATE items SET answer_set = '{"correct": "I like apples.", "alternates": []}' WHERE id = '95dc1cbb-59e4-435c-955c-3a2ca074c450';
UPDATE items SET answer_set = '{"correct": "The cat is black.", "alternates": []}' WHERE id = '6582c996-916a-482d-88f7-8ea90661dded';
UPDATE items SET answer_set = '{"correct": "We go to school.", "alternates": []}' WHERE id = 'a94f99f7-c6e0-4ef0-9fca-967355af7ebe';
UPDATE items SET answer_set = '{"correct": "My house is big.", "alternates": []}' WHERE id = 'b52ba02e-452e-485a-aa1b-3b1cc081aa8d';
UPDATE items SET answer_set = '{"correct": "They have a car.", "alternates": []}' WHERE id = 'cb3b63bd-74f2-4a59-af57-7313bb4f2140';
UPDATE items SET answer_set = '{"correct": "She usually wakes up at seven.", "alternates": []}' WHERE id = '481b7872-66a6-45a9-b694-6693312fca89';
UPDATE items SET answer_set = '{"correct": "He has been working here for two years.", "alternates": []}' WHERE id = '4fcd63a0-6dc5-465a-94cb-1bccc330aa7b';
UPDATE items SET answer_set = '{"correct": "It is going to rain tomorrow.", "alternates": []}' WHERE id = 'c83f75ab-e177-4d05-83cf-2b676ea9ec18';
UPDATE items SET answer_set = '{"correct": "She enjoys reading books in the evening.", "alternates": []}' WHERE id = '1cde96dc-9960-42ad-99bc-905a256400f2';
UPDATE items SET answer_set = '{"correct": "He needs to finish his homework.", "alternates": []}' WHERE id = '3c89678b-4678-4787-94c1-9a2827a44e07';
UPDATE items SET answer_set = '{"correct": "We are planning a trip.", "alternates": []}' WHERE id = '6562f243-2b02-4225-ba1a-8609f898438c';
UPDATE items SET answer_set = '{"correct": "She has two brothers and a sister.", "alternates": []}' WHERE id = '35814c1b-4140-4456-b7cf-e5625096f55f';
UPDATE items SET answer_set = '{"correct": "The meeting is scheduled for Monday.", "alternates": []}' WHERE id = 'b5267b31-a267-4d10-b85c-33928e662e75';
UPDATE items SET answer_set = '{"correct": "He likes to cook on weekends.", "alternates": []}' WHERE id = '9436e2fb-5069-44e9-9c78-e6e07857aa65';
UPDATE items SET answer_set = '{"correct": "My sister is studying to become a nurse.", "alternates": []}' WHERE id = 'c7436d7a-2b71-43b6-8512-0bd723be0fba';
UPDATE items SET answer_set = '{"correct": "Despite the rain, the match continued.", "alternates": []}' WHERE id = '97edc598-3ed1-4346-866d-7024b025083c';
UPDATE items SET answer_set = '{"correct": "If I had known, I would have come.", "alternates": []}' WHERE id = '9308cdb7-290a-4d2b-9caf-573a893f7c17';
UPDATE items SET answer_set = '{"correct": "The company announced a new policy last week.", "alternates": []}' WHERE id = 'fb6149dd-1268-4495-9f99-309de35f4895';
UPDATE items SET answer_set = '{"correct": "Although he was tired, he finished the race.", "alternates": []}' WHERE id = '594f6b2e-476e-4695-aab6-e5abd2722d0b';
UPDATE items SET answer_set = '{"correct": "The government introduced new measures to reduce pollution.", "alternates": []}' WHERE id = 'c571bdec-8e2a-4b77-8101-600b871e6d97';
UPDATE items SET answer_set = '{"correct": "She has been working on this project for months.", "alternates": []}' WHERE id = 'e845114f-8997-42ff-bffb-fe0d1129d5d7';
UPDATE items SET answer_set = '{"correct": "Many students struggle to balance study and work.", "alternates": []}' WHERE id = '6c94b767-e0ce-4b68-998a-798b5d436791';
UPDATE items SET answer_set = '{"correct": "The committee will review the proposal next Tuesday.", "alternates": []}' WHERE id = '3af451b1-785b-4f2c-a035-7d45778bc693';
UPDATE items SET answer_set = '{"correct": "Volunteers worked all weekend to clean the river.", "alternates": []}' WHERE id = '57c0f477-f09b-4399-9d00-b5eb6d6c91a7';
UPDATE items SET answer_set = '{"correct": "The economy has shown signs of steady improvement.", "alternates": []}' WHERE id = 'a162461f-e509-4413-8f34-fe5c308a184e';

UPDATE items SET answer_set = '{"correctIndex": 0}' WHERE id IN (
  '99593f62-14e5-4781-b178-65785243791d','2772c68e-bcba-475a-af40-8acbf7c66ec4','88271295-2a8d-4bd5-b952-b0820e630d04',
  '62e284a8-6798-427b-87b5-59f23c05434c','9986955c-e520-4a5c-a81a-e93431d11805','eb6fb206-6753-42ce-b77a-44e727e17670',
  'a213e5a9-9414-4692-a37e-8956ef39b4b9','158c669f-2f47-46ed-b58b-603bd30bfe6b','8f6dbbf4-0630-4ffc-a8f3-4bda7b84be38',
  '89f754a9-4c11-417f-854d-610be5817809','2750fb5b-d8b0-4adb-a2c2-3e442f484f78','024d5e82-c42c-4940-9e27-4e1708a74575',
  '948f027a-a64a-4815-9234-d1439291b622','10ec3046-b255-4926-85f7-ad6d051464ca','ade0cf98-3a44-4ebb-a767-27418b33d9b2',
  '2eb9364c-7a61-4cdb-81a2-0f2e4d9ad77a','5ac58468-5d6c-4835-8e1f-107eeb2ec04e','344f6085-0f46-4768-8e17-ce22f317c479',
  '61e6f759-ed72-452d-8e7b-1d27e51d36fe','6810d0be-09f8-4130-a684-91724d1a7cc7','660c3e26-490f-4b21-a31f-66853a0871c8',
  'c21e45a2-268d-490c-9d02-71ace594b9cd','f3d5fc0f-8ced-4e3d-a36e-6d222e277ca9','09db7080-3aec-40e5-b28c-d6736a10d267',
  'e9bc24f2-37da-4d9c-bdc6-0cbd0a6cd736','1ec74b44-e744-47d7-aa44-53dd611d6daa','8c16cc31-a240-457d-8650-76688706e40d',
  'f03a8933-6b53-4663-a79f-58579cbdf616','b1ccc89c-ce6a-4dd7-a612-ec8a95a9acb9','7eec0387-2ae5-46e2-ad82-d89a0f94b358'
);

-- 3. Pre-existing Set-3 duplicates (same content twice in one 5-item set,
--    from the original 2026-09-08 backfill) — replace the duplicate with
--    fresh, distinct content matching the set's level/topic.
UPDATE items SET content = '{"passage": "Many people enjoy walking in the park. Walking helps people stay healthy and feel relaxed."}' WHERE id = 'b3b0149b-e5be-4766-aedf-cc58efcbbbf2';
UPDATE items SET content = '{"situation": "You arrive at a restaurant and your table is not ready yet. What do you say to the staff?"}' WHERE id = '09c4d435-a6fc-4486-9bdc-ef18d5cf25a0';
UPDATE items SET content = '{"text": "The weather was cold, so she wore a warm coat and gloves before leaving the house."}' WHERE id = '760520f8-c123-423c-8584-bee13d832c40';
UPDATE items SET content = '{"text": "She has a small dog."}' WHERE id = 'b6b701b6-7e04-4fca-b4f5-54191818fd64';
UPDATE items SET content = '{"passage": "Some cities are banning cars from busy downtown streets. Supporters say it reduces pollution, while business owners worry it will hurt sales."}' WHERE id = '3940a32e-b6ef-42d9-ab63-4ebf8f6ce2e5';
UPDATE items SET content = '{"prompt": "What is a change you have made in your life that you are proud of?"}' WHERE id = 'e1293da5-19aa-4bdc-af20-ee9f7ec7bc69';
UPDATE items SET content = '{"text": "The pool closes at 8pm on weekdays and 6pm on weekends.", "question": "What time does it close on weekends?"}', answer_set = '{"acceptable_answers": ["6pm", "six pm"]}' WHERE id = '33965a6c-45ed-45fa-82da-5d4e04e55457';
UPDATE items SET content = '{"prompt": "Write a short email to a friend about your weekend plans."}' WHERE id = 'd57415d2-34e6-4716-a109-4ae85b05bc72';
UPDATE items SET content = '{"prompt": "Write an email to a friend asking if they want to go hiking this weekend."}' WHERE id = '3147189d-46b8-4d0f-ad72-812b70c24257';
UPDATE items SET content = '{"text": "Do you like ice cream?", "options": ["Yes, I do.", "It is cold.", "I am nine."]}', answer_set = '{"correctIndex": 0}' WHERE id = '1fe7c9b4-ce85-432d-bc8d-806e5e4d8b30';
UPDATE items SET content = '{"situation": "You finish eating at a friend''s house. What do you say to thank them?"}' WHERE id = '63d7265e-efb7-4b80-8e7b-3d8b3d2be345';
UPDATE items SET content = '{"prompt": "What do you like to do in your free time?"}' WHERE id = '7aaf449c-f90a-4081-a8b9-886dd3b65a59';
UPDATE items SET content = '{"text": "The company introduced a four-day work week as a trial, and most employees reported feeling less stressed."}' WHERE id = '5248e853-fefb-4679-a40b-e84b75a63a49';
UPDATE items SET content = '{"text": "Can you join the call at three instead of two?", "options": ["Sure, three works fine for me.", "I enjoy long meetings.", "The office has new chairs."]}', answer_set = '{"correctIndex": 0}' WHERE id = 'bbebe569-1554-4e59-b1e0-0f2b1028cf84';
UPDATE items SET content = '{"sentence": "We ___ good friends."}', answer_set = '{"acceptable_answers": ["are"]}' WHERE id = 'b26e4fcf-3a03-4744-bee2-c24347f3ec36';
UPDATE items SET content = '{"prompt": "What is your favorite way to relax after a busy day?"}' WHERE id = '2d4a325a-cae5-4c4f-8c1a-9d6c7e472e63';
UPDATE items SET content = '{"passage": "Many people like to cook at home. Cooking at home can save money."}' WHERE id = '736b027b-9a0b-4f10-addb-1324fbd37ae4';
COMMIT;
