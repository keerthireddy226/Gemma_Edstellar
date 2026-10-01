-- Set 3 for all 19 item types: reuses already-approved, previously unassigned
-- flat-pool items first (matched to A1/A2/B1 by cefr_level or difficulty band);
-- only the shortfall below that gets freshly authored content.
BEGIN;

-- ===================== conversations : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('075a2ce8-feda-4f4a-9975-53b6679522bd', 'Set 3', 3) RETURNING id \gset s3_1_
UPDATE items SET set_id = :'s3_1_id', set_order = 1 WHERE id = '50b14650-4db2-46ab-80a8-224c8759bb89';
UPDATE items SET set_id = :'s3_1_id', set_order = 2 WHERE id = '69454662-8d40-46c6-97c9-c0461ae33467';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('conversations', '{"dialogue": "A: What is your name? B: My name is Raj.", "question": "What is B''s name?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', '{"acceptable_answers": ["raj"]}', :'s3_1_id', 3),
('conversations', '{"dialogue": "A: Do you have a sister? B: Yes, one sister.", "question": "Does B have a sister?"}', 0.13, 'A1', 'approved', 'manual', 'family', 'practice', '{"acceptable_answers": ["yes"]}', :'s3_1_id', 4),
('conversations', '{"dialogue": "A: Is it cold today? B: Yes, very cold.", "question": "Is it cold today?"}', 0.13, 'A1', 'approved', 'manual', 'weather', 'practice', '{"acceptable_answers": ["yes"]}', :'s3_1_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('ddd982d4-9f9a-4385-ace8-57964d83f260', 'Set 3', 3) RETURNING id \gset s3_2_
UPDATE items SET set_id = :'s3_2_id', set_order = 1 WHERE id = 'c45ce5ef-4407-4e49-a051-424df01ddf84';
UPDATE items SET set_id = :'s3_2_id', set_order = 2 WHERE id = '889ad827-1f38-4228-87ae-022266663966';
UPDATE items SET set_id = :'s3_2_id', set_order = 3 WHERE id = 'f6cb375e-0526-4a09-a59f-4fc5ed21e9fc';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('conversations', '{"dialogue": "A: Can you pick me up at six? B: Sure, I''ll be there.", "question": "What time should A be picked up?"}', 0.3, 'A2', 'approved', 'manual', 'daily-life', 'practice', '{"acceptable_answers": ["six", "6"]}', :'s3_2_id', 4),
('conversations', '{"dialogue": "A: Have you finished the report? B: Almost, just one more page.", "question": "Has A finished the report?"}', 0.3, 'A2', 'approved', 'manual', 'work', 'practice', '{"acceptable_answers": ["almost", "no", "not yet"]}', :'s3_2_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('53589a38-f399-4e37-a429-d416055faa91', 'Set 3', 3) RETURNING id \gset s3_3_
UPDATE items SET set_id = :'s3_3_id', set_order = 1 WHERE id = 'c688fbf6-9caf-47db-a633-82cd3f8afccf';
UPDATE items SET set_id = :'s3_3_id', set_order = 2 WHERE id = '83f3be46-d265-480d-a93a-b06891dd6da4';
UPDATE items SET set_id = :'s3_3_id', set_order = 3 WHERE id = 'e3d9ada9-82ca-4620-885e-fc4125544acc';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('conversations', '{"dialogue": "A: Did the shipment arrive on time? B: No, it was delayed by two days due to customs.", "question": "Why was the shipment delayed?"}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', '{"acceptable_answers": ["customs", "due to customs"]}', :'s3_3_id', 4),
('conversations', '{"dialogue": "A: Have you decided on the new vendor? B: Not yet, we''re still comparing three options.", "question": "How many vendor options are being compared?"}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', '{"acceptable_answers": ["three", "3"]}', :'s3_3_id', 5);

-- ===================== dictation : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('c37e7143-766b-4eb2-96eb-0b8d1efec7be', 'Set 3', 3) RETURNING id \gset s3_4_
UPDATE items SET set_id = :'s3_4_id', set_order = 1 WHERE id = '8b0f9422-1dc7-412e-a27e-601f3ed61ac4';
UPDATE items SET set_id = :'s3_4_id', set_order = 2 WHERE id = '6911c2cb-2236-40cf-9110-f2f48589b488';
UPDATE items SET set_id = :'s3_4_id', set_order = 3 WHERE id = 'd8b872d7-327a-44a3-8534-daa9061ca976';
UPDATE items SET set_id = :'s3_4_id', set_order = 4 WHERE id = 'b6b701b6-7e04-4fca-b4f5-54191818fd64';
UPDATE items SET set_id = :'s3_4_id', set_order = 5 WHERE id = 'c643ff21-7f6d-4069-8a87-b5a3ee1b1f9d';

INSERT INTO sets (unit_id, name, order_index) VALUES ('e3977b98-ad19-425b-933d-e2e09dac4aa7', 'Set 3', 3) RETURNING id \gset s3_5_
UPDATE items SET set_id = :'s3_5_id', set_order = 1 WHERE id = '7561b2e4-d0a7-4f9d-aea3-339bd419ebea';
UPDATE items SET set_id = :'s3_5_id', set_order = 2 WHERE id = '1f8f871a-2c51-49c3-9175-87a17d72bbe5';
UPDATE items SET set_id = :'s3_5_id', set_order = 3 WHERE id = 'aa5525a0-8626-4215-8df3-20cace101aee';
UPDATE items SET set_id = :'s3_5_id', set_order = 4 WHERE id = 'b32ae506-b3a8-4c2a-a412-c6ceb6e6f0ee';
UPDATE items SET set_id = :'s3_5_id', set_order = 5 WHERE id = '071fdc7b-bd27-410f-8997-ef4d7141dc63';

INSERT INTO sets (unit_id, name, order_index) VALUES ('fdc286bc-4f91-4df9-b292-3ae06964e6f4', 'Set 3', 3) RETURNING id \gset s3_6_
UPDATE items SET set_id = :'s3_6_id', set_order = 1 WHERE id = 'ce1e8c60-f253-4d6a-b1e9-4b7b4d692b90';
UPDATE items SET set_id = :'s3_6_id', set_order = 2 WHERE id = 'b3033eec-4f8f-45e3-b35f-69bb7b16ae5a';
UPDATE items SET set_id = :'s3_6_id', set_order = 3 WHERE id = '6fe281a3-b79f-4b13-b8b3-416292ee50e1';
UPDATE items SET set_id = :'s3_6_id', set_order = 4 WHERE id = '2baab672-80db-45c2-82f1-580c93e1605a';
UPDATE items SET set_id = :'s3_6_id', set_order = 5 WHERE id = '92782d56-461d-4157-baf0-40e582e6cc7b';

-- ===================== email_writing : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('29156a92-94e3-41d6-b0b0-795ac2df7f50', 'Set 3', 3) RETURNING id \gset s3_7_
UPDATE items SET set_id = :'s3_7_id', set_order = 1 WHERE id = '9239b837-3b13-436b-8923-253a52631139';
UPDATE items SET set_id = :'s3_7_id', set_order = 2 WHERE id = 'd57415d2-34e6-4716-a109-4ae85b05bc72';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('email_writing', '{"prompt": "Write a short email to a friend asking about their weekend."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_7_id', 3),
('email_writing', '{"prompt": "Write a short email to your teacher saying thank you."}', 0.13, 'A1', 'approved', 'manual', 'education', 'practice', NULL, :'s3_7_id', 4),
('email_writing', '{"prompt": "Write a short email to a friend about your new shoes."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_7_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('72ae4279-9ebe-40ee-8d85-130c726d6e78', 'Set 3', 3) RETURNING id \gset s3_8_
UPDATE items SET set_id = :'s3_8_id', set_order = 1 WHERE id = 'ac494d35-8603-46e6-b097-6e61b49919d6';
UPDATE items SET set_id = :'s3_8_id', set_order = 2 WHERE id = '3147189d-46b8-4d0f-ad72-812b70c24257';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('email_writing', '{"prompt": "Write an email to a friend asking them to recommend a movie."}', 0.3, 'A2', 'approved', 'manual', 'entertainment', 'practice', NULL, :'s3_8_id', 3),
('email_writing', '{"prompt": "Write an email to a neighbor asking to borrow a tool."}', 0.3, 'A2', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_8_id', 4),
('email_writing', '{"prompt": "Write an email to your gym asking about membership prices."}', 0.3, 'A2', 'approved', 'manual', 'health', 'practice', NULL, :'s3_8_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('88949f00-6c69-4124-b89b-fda02311e613', 'Set 3', 3) RETURNING id \gset s3_9_
UPDATE items SET set_id = :'s3_9_id', set_order = 1 WHERE id = 'e5fe04f8-c9e5-45c0-9abe-bebc49d5d28a';
UPDATE items SET set_id = :'s3_9_id', set_order = 2 WHERE id = '9987fd78-394a-453f-9edf-5107e9eea43b';
UPDATE items SET set_id = :'s3_9_id', set_order = 3 WHERE id = 'c7f9c980-9a0c-4154-8b6a-598b76d7b3ae';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('email_writing', '{"prompt": "Write an email to a colleague suggesting a new way to organize weekly meetings."}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', NULL, :'s3_9_id', 4),
('email_writing', '{"prompt": "Write an email to a travel agency asking about a group discount."}', 0.52, 'B1', 'approved', 'manual', 'travel', 'practice', NULL, :'s3_9_id', 5);

-- ===================== free_writing : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('44c3a390-e946-4811-94f4-8abf0d683a38', 'Set 3', 3) RETURNING id \gset s3_10_
UPDATE items SET set_id = :'s3_10_id', set_order = 1 WHERE id = 'ea23b87f-8e79-4f06-bf83-97f964d5fb98';
UPDATE items SET set_id = :'s3_10_id', set_order = 2 WHERE id = '7eacf7a1-a215-4101-ac9e-6b5b9af71559';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('free_writing', '{"prompt": "Write 2-3 sentences about your favorite toy or game."}', 0.13, 'A1', 'approved', 'manual', 'hobbies', 'practice', NULL, :'s3_10_id', 3),
('free_writing', '{"prompt": "Write 2-3 sentences about your pet or an animal you like."}', 0.13, 'A1', 'approved', 'manual', 'nature', 'practice', NULL, :'s3_10_id', 4),
('free_writing', '{"prompt": "Write 2-3 sentences about your favorite day of the week."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_10_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('f6b44cde-18b8-41ba-ab46-119d20539356', 'Set 3', 3) RETURNING id \gset s3_11_
UPDATE items SET set_id = :'s3_11_id', set_order = 1 WHERE id = '713f20d2-bee9-4787-942d-ee040d2d93d0';
UPDATE items SET set_id = :'s3_11_id', set_order = 2 WHERE id = 'cc0edf3b-0dde-4a70-8cbb-fa1e63c3413e';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('free_writing', '{"prompt": "Write a short paragraph about something you are good at."}', 0.3, 'A2', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_11_id', 3),
('free_writing', '{"prompt": "Write a short paragraph about a place you visit often."}', 0.3, 'A2', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_11_id', 4),
('free_writing', '{"prompt": "Write a short paragraph about your favorite way to spend free time."}', 0.3, 'A2', 'approved', 'manual', 'hobbies', 'practice', NULL, :'s3_11_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('660bc305-c0c3-4947-81dc-613fbb2c9397', 'Set 3', 3) RETURNING id \gset s3_12_
UPDATE items SET set_id = :'s3_12_id', set_order = 1 WHERE id = '84c3f9c7-e2e6-4d3a-a755-15b2288eddba';
UPDATE items SET set_id = :'s3_12_id', set_order = 2 WHERE id = 'c332f482-3874-4023-ad6e-1862df0c9141';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('free_writing', '{"prompt": "Write a paragraph about a time you helped someone and how it made you feel."}', 0.52, 'B1', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_12_id', 3),
('free_writing', '{"prompt": "Write a paragraph about how your city or town has changed over the years."}', 0.52, 'B1', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_12_id', 4),
('free_writing', '{"prompt": "Write a paragraph about a skill you think everyone should learn."}', 0.52, 'B1', 'approved', 'manual', 'education', 'practice', NULL, :'s3_12_id', 5);

-- ===================== open_questions : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('3829517c-5b4c-4d1d-acac-28c03930ca11', 'Set 3', 3) RETURNING id \gset s3_13_
UPDATE items SET set_id = :'s3_13_id', set_order = 1 WHERE id = '9bf3162d-a9c4-4969-b615-ac292f292e7b';
UPDATE items SET set_id = :'s3_13_id', set_order = 2 WHERE id = '2a45911d-ef10-4fe4-abea-cc38316a55d6';
UPDATE items SET set_id = :'s3_13_id', set_order = 3 WHERE id = '7aaf449c-f90a-4081-a8b9-886dd3b65a59';
UPDATE items SET set_id = :'s3_13_id', set_order = 4 WHERE id = 'ce0d7d47-3dc8-452a-b0ca-91030513c298';
UPDATE items SET set_id = :'s3_13_id', set_order = 5 WHERE id = '1db709c3-4071-4bd4-a9d0-7393764efb77';

INSERT INTO sets (unit_id, name, order_index) VALUES ('20024d56-941d-4c98-875e-36aa9c734799', 'Set 3', 3) RETURNING id \gset s3_14_
UPDATE items SET set_id = :'s3_14_id', set_order = 1 WHERE id = '3493c1d4-7cc5-4eef-bbd3-2b6ffbe71beb';
UPDATE items SET set_id = :'s3_14_id', set_order = 2 WHERE id = '8e370b49-5811-43c0-aa26-20d4c184ca78';
UPDATE items SET set_id = :'s3_14_id', set_order = 3 WHERE id = '2d4a325a-cae5-4c4f-8c1a-9d6c7e472e63';
UPDATE items SET set_id = :'s3_14_id', set_order = 4 WHERE id = '8233c045-da9e-40c2-91d1-522a2d67d479';
UPDATE items SET set_id = :'s3_14_id', set_order = 5 WHERE id = '760ff03f-46e5-430a-9b4c-297748bda1fc';

INSERT INTO sets (unit_id, name, order_index) VALUES ('556d3a48-c2f8-457b-9bfa-dede206170d6', 'Set 3', 3) RETURNING id \gset s3_15_
UPDATE items SET set_id = :'s3_15_id', set_order = 1 WHERE id = '6e75c19b-2b20-4dda-95f5-a195dd141ae7';
UPDATE items SET set_id = :'s3_15_id', set_order = 2 WHERE id = 'e1293da5-19aa-4bdc-af20-ee9f7ec7bc69';
UPDATE items SET set_id = :'s3_15_id', set_order = 3 WHERE id = '75d38962-6adf-42ed-9916-b19316fab1f9';
UPDATE items SET set_id = :'s3_15_id', set_order = 4 WHERE id = 'af99b018-85be-4abf-bbf4-75ace7fdd302';
UPDATE items SET set_id = :'s3_15_id', set_order = 5 WHERE id = 'bfe80a05-baa3-4c3e-9759-97fc6cd0a8d1';

-- ===================== passage_comprehension : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('03703a53-2e3d-40a1-ac37-35e771bd1710', 'Set 3', 3) RETURNING id \gset s3_16_
UPDATE items SET set_id = :'s3_16_id', set_order = 1 WHERE id = 'bf43ef0c-aef4-4abe-99e8-0b9233fcb1fc';
UPDATE items SET set_id = :'s3_16_id', set_order = 2 WHERE id = '545457b4-5217-426c-84c8-d63f099ad960';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('passage_comprehension', '{"story": "Tom has a blue kite. He flies it in the park.", "question": "What color is Tom''s kite?"}', 0.13, 'A1', 'approved', 'manual', 'hobbies', 'practice', '{"acceptable_answers": ["blue"]}', :'s3_16_id', 3),
('passage_comprehension', '{"story": "Mia has a yellow umbrella. She uses it when it rains.", "question": "When does Mia use her umbrella?"}', 0.13, 'A1', 'approved', 'manual', 'weather', 'practice', '{"acceptable_answers": ["when it rains", "it rains"]}', :'s3_16_id', 4),
('passage_comprehension', '{"story": "I have three pencils. They are in my bag.", "question": "How many pencils do I have?"}', 0.13, 'A1', 'approved', 'manual', 'education', 'practice', '{"acceptable_answers": ["three", "3"]}', :'s3_16_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('98828b5b-2c7a-432f-a842-e788ff8038c0', 'Set 3', 3) RETURNING id \gset s3_17_
UPDATE items SET set_id = :'s3_17_id', set_order = 1 WHERE id = '22a284c4-00a2-4632-90ae-e37f76b6b859';
UPDATE items SET set_id = :'s3_17_id', set_order = 2 WHERE id = '2f25ab6f-a1e7-4f0e-9727-aa982ff68069';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('passage_comprehension', '{"story": "Jake works at a bakery. He starts at six every morning.", "question": "What time does Jake start work?"}', 0.3, 'A2', 'approved', 'manual', 'work', 'practice', '{"acceptable_answers": ["six", "6 am"]}', :'s3_17_id', 3),
('passage_comprehension', '{"story": "Priya takes the bus to college every day because it is cheaper than a taxi.", "question": "Why does Priya take the bus?"}', 0.3, 'A2', 'approved', 'manual', 'transport', 'practice', '{"acceptable_answers": ["cheaper", "it is cheaper"]}', :'s3_17_id', 4),
('passage_comprehension', '{"story": "The park closes at eight in the evening in summer.", "question": "When does the park close in summer?"}', 0.3, 'A2', 'approved', 'manual', 'daily-life', 'practice', '{"acceptable_answers": ["eight in the evening", "8 pm"]}', :'s3_17_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('84c4c0c4-c196-489b-a50d-6c87c015bf1f', 'Set 3', 3) RETURNING id \gset s3_18_
UPDATE items SET set_id = :'s3_18_id', set_order = 1 WHERE id = '66aca8d9-33ad-4a18-9450-16e1b85810fb';
UPDATE items SET set_id = :'s3_18_id', set_order = 2 WHERE id = 'f5fa399d-d036-406c-aafb-1414f7f7913a';
UPDATE items SET set_id = :'s3_18_id', set_order = 3 WHERE id = '17484af0-da9e-4fe2-97e5-e6f491e02202';
UPDATE items SET set_id = :'s3_18_id', set_order = 4 WHERE id = '822a8304-9c8e-410c-9848-52029fcb5dcc';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('passage_comprehension', '{"story": "The company reduced its prices after competitors launched a cheaper product, winning back several customers within weeks.", "question": "Why did the company reduce its prices?"}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', '{"acceptable_answers": ["competitors launched a cheaper product", "because of competitors"]}', :'s3_18_id', 5);

-- ===================== passage_reconstruction : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('2f3d732f-c57d-428a-a4e5-f4c6acbd1704', 'Set 3', 3) RETURNING id \gset s3_19_
UPDATE items SET set_id = :'s3_19_id', set_order = 1 WHERE id = '54b200a3-54e2-4534-9da0-a1198fd70d8c';
UPDATE items SET set_id = :'s3_19_id', set_order = 2 WHERE id = 'ed2dd02a-4a68-44b5-a96b-af8c1ba83372';
UPDATE items SET set_id = :'s3_19_id', set_order = 3 WHERE id = '9e94fccf-3b31-43ce-bd54-6424f9fd26a8';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('passage_reconstruction', '{"passage": "Mona has a yellow umbrella. She likes rainy days."}', 0.13, 'A1', 'approved', 'manual', 'weather', 'practice', NULL, :'s3_19_id', 4),
('passage_reconstruction', '{"passage": "I have a small radio. I listen to it every morning."}', 0.13, 'A1', 'approved', 'manual', 'hobbies', 'practice', NULL, :'s3_19_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('dcd4016c-b44d-46e8-bee0-41a542bd063c', 'Set 3', 3) RETURNING id \gset s3_20_
UPDATE items SET set_id = :'s3_20_id', set_order = 1 WHERE id = 'b28c6539-d7d0-49d0-914f-65401ce1499c';
UPDATE items SET set_id = :'s3_20_id', set_order = 2 WHERE id = '7446ebf3-a912-4acf-bae5-58ef8a703673';
UPDATE items SET set_id = :'s3_20_id', set_order = 3 WHERE id = '575b1d28-74ec-442e-b86f-004bfd45a287';
UPDATE items SET set_id = :'s3_20_id', set_order = 4 WHERE id = '6c8de9d5-300f-435e-b59a-936f19a42754';
UPDATE items SET set_id = :'s3_20_id', set_order = 5 WHERE id = '7b0d0f26-44ed-48cf-b85e-2339357ec22b';

INSERT INTO sets (unit_id, name, order_index) VALUES ('6c6ff73c-166b-48cd-8b6d-34760760dbd0', 'Set 3', 3) RETURNING id \gset s3_21_
UPDATE items SET set_id = :'s3_21_id', set_order = 1 WHERE id = '921940b0-c3a9-4227-9d2d-0d33142a3e4f';
UPDATE items SET set_id = :'s3_21_id', set_order = 2 WHERE id = 'c30dfcea-7b27-4b76-875a-a258be1766f5';
UPDATE items SET set_id = :'s3_21_id', set_order = 3 WHERE id = '4a9e9cb2-f9bb-4ba1-9da2-c41ea248bc9b';
UPDATE items SET set_id = :'s3_21_id', set_order = 4 WHERE id = '493df9cb-b1bc-4153-8114-9e434548459c';
UPDATE items SET set_id = :'s3_21_id', set_order = 5 WHERE id = '87466ae6-32f7-4835-a1b9-81be01ac013d';

-- ===================== reading : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('45655378-89db-4dca-973a-d57052048c93', 'Set 3', 3) RETURNING id \gset s3_22_
UPDATE items SET set_id = :'s3_22_id', set_order = 1 WHERE id = 'cb695124-1862-44d1-9046-7d3e3615b4e0';
UPDATE items SET set_id = :'s3_22_id', set_order = 2 WHERE id = '52ce95e7-1f7f-49d0-9fc2-ccb905abc570';
UPDATE items SET set_id = :'s3_22_id', set_order = 3 WHERE id = 'eede5895-6d1c-4351-9d46-8fcbac03c38a';
UPDATE items SET set_id = :'s3_22_id', set_order = 4 WHERE id = '13afdc17-9a72-4695-9449-1229e423f58a';
UPDATE items SET set_id = :'s3_22_id', set_order = 5 WHERE id = '51e4d9c9-24b6-4cf8-b4c3-3b429f756c83';

INSERT INTO sets (unit_id, name, order_index) VALUES ('e884f7bb-d8bd-44f2-be90-db5e861cc00a', 'Set 3', 3) RETURNING id \gset s3_23_
UPDATE items SET set_id = :'s3_23_id', set_order = 1 WHERE id = 'a3d85229-1926-4ef2-8e1f-3073f8cd7107';
UPDATE items SET set_id = :'s3_23_id', set_order = 2 WHERE id = 'e3862fc9-568a-4da6-8450-955f2f27d7d0';
UPDATE items SET set_id = :'s3_23_id', set_order = 3 WHERE id = '3ac1074d-0988-480a-985f-20d6d88fa5f5';
UPDATE items SET set_id = :'s3_23_id', set_order = 4 WHERE id = '865f99e0-383b-4183-9a08-e052bacf1858';
UPDATE items SET set_id = :'s3_23_id', set_order = 5 WHERE id = 'e5ba2aac-7b77-448a-bb1d-1ca3e1b08cb5';

INSERT INTO sets (unit_id, name, order_index) VALUES ('b69504b1-aec7-4c37-86e3-6498bb46d97e', 'Set 3', 3) RETURNING id \gset s3_24_
UPDATE items SET set_id = :'s3_24_id', set_order = 1 WHERE id = 'b9924bf0-5497-4be8-9f16-b9f508624c19';
UPDATE items SET set_id = :'s3_24_id', set_order = 2 WHERE id = '6ec0c9c4-a6b1-4bee-8db3-cf3fe3ac2a7d';
UPDATE items SET set_id = :'s3_24_id', set_order = 3 WHERE id = 'dd677678-43f8-4773-8e98-6a3f51762e47';
UPDATE items SET set_id = :'s3_24_id', set_order = 4 WHERE id = '2e3dafd5-35f5-4e8b-a003-683838599f5c';
UPDATE items SET set_id = :'s3_24_id', set_order = 5 WHERE id = 'cecca8bd-6076-44f8-a6c7-ddb397815799';

-- ===================== reading_comprehension : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('7629901c-c8d7-4da6-8419-07ba5a34dbe3', 'Set 3', 3) RETURNING id \gset s3_25_
UPDATE items SET set_id = :'s3_25_id', set_order = 1 WHERE id = 'b7db0964-9917-4d5a-a398-d44e1f64b74a';
UPDATE items SET set_id = :'s3_25_id', set_order = 2 WHERE id = '27137cae-ea58-41e0-bde8-443d5e1d0d64';
UPDATE items SET set_id = :'s3_25_id', set_order = 3 WHERE id = 'b1e8e788-2bb5-454b-89bf-48431c1b08a9';
UPDATE items SET set_id = :'s3_25_id', set_order = 4 WHERE id = '7f028710-9c76-45ee-a918-8dba88f630db';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('reading_comprehension', '{"text": "Ravi has a green bike.", "question": "What color is Ravi''s bike?", "options": ["Green", "Red", "Blue"]}', 0.13, 'A1', 'approved', 'manual', 'hobbies', 'practice', '{"correctIndex": 0}', :'s3_25_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('07a370e4-91a2-44aa-b2b6-7de702fd9fb1', 'Set 3', 3) RETURNING id \gset s3_26_
UPDATE items SET set_id = :'s3_26_id', set_order = 1 WHERE id = '88f54d3c-9e2f-446c-906b-e2d5f5d2cdb3';
UPDATE items SET set_id = :'s3_26_id', set_order = 2 WHERE id = '862e23c4-2021-4128-b144-329617ce188b';
UPDATE items SET set_id = :'s3_26_id', set_order = 3 WHERE id = '219e4a02-d9c5-4f85-9f94-54dc812d9039';
UPDATE items SET set_id = :'s3_26_id', set_order = 4 WHERE id = 'e392c3a9-bd8f-4218-a633-5dffbdaaf2e6';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('reading_comprehension', '{"text": "The library opens at nine and closes at six on weekdays.", "question": "When does the library close?", "options": ["At six", "At nine", "At noon"]}', 0.3, 'A2', 'approved', 'manual', 'education', 'practice', '{"correctIndex": 0}', :'s3_26_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('cfa1077a-835e-44e8-bd17-0fd0db69285a', 'Set 3', 3) RETURNING id \gset s3_27_
UPDATE items SET set_id = :'s3_27_id', set_order = 1 WHERE id = '6df649f2-890c-48cb-bc69-658bbfb1f1f4';
UPDATE items SET set_id = :'s3_27_id', set_order = 2 WHERE id = 'b5e7d419-280f-4146-ab09-ea09cd11848c';
UPDATE items SET set_id = :'s3_27_id', set_order = 3 WHERE id = '06f92330-f54d-48da-b0e9-5566da4ceead';
UPDATE items SET set_id = :'s3_27_id', set_order = 4 WHERE id = 'd7695899-7761-43d1-9d94-a8214044ba7b';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('reading_comprehension', '{"text": "After the bridge was repaired, traffic delays in the area dropped significantly, according to city officials.", "question": "What happened after the bridge was repaired?", "options": ["Traffic delays dropped", "Traffic delays increased", "Nothing changed"]}', 0.52, 'B1', 'approved', 'manual', 'transport', 'practice', '{"correctIndex": 0}', :'s3_27_id', 5);

-- ===================== reading_selective : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('d51cb6f6-b151-4888-8181-4c99287fa24e', 'Set 3', 3) RETURNING id \gset s3_28_
UPDATE items SET set_id = :'s3_28_id', set_order = 1 WHERE id = '150b53d9-e275-4e4f-af99-aac442fb1780';
UPDATE items SET set_id = :'s3_28_id', set_order = 2 WHERE id = 'fb0533c7-e717-4a9b-bef0-6d2cd0528616';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('reading_selective', '{"text": "OPEN today, 10 to 5.", "question": "Is it closed today?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', '{"acceptable_answers": ["no"]}', :'s3_28_id', 3),
('reading_selective', '{"text": "NO ENTRY after 9 PM.", "question": "Can you enter at 10 PM?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', '{"acceptable_answers": ["no"]}', :'s3_28_id', 4),
('reading_selective', '{"text": "KEEP OFF the grass.", "question": "Can you walk on the grass?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', '{"acceptable_answers": ["no"]}', :'s3_28_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('2134d435-d290-4b25-8783-cb43655dbe69', 'Set 3', 3) RETURNING id \gset s3_29_
UPDATE items SET set_id = :'s3_29_id', set_order = 1 WHERE id = '2c0ec507-d689-4b41-8072-549370442241';
UPDATE items SET set_id = :'s3_29_id', set_order = 2 WHERE id = '33965a6c-45ed-45fa-82da-5d4e04e55457';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('reading_selective', '{"text": "This medicine should be taken twice a day, after meals.", "question": "Should this medicine be taken before meals?"}', 0.3, 'A2', 'approved', 'manual', 'health', 'practice', '{"acceptable_answers": ["no"]}', :'s3_29_id', 3),
('reading_selective', '{"text": "The store offers free delivery for orders over 500 rupees.", "question": "Is delivery free for small orders under 500 rupees?"}', 0.3, 'A2', 'approved', 'manual', 'daily-life', 'practice', '{"acceptable_answers": ["no"]}', :'s3_29_id', 4),
('reading_selective', '{"text": "Entry is free for children under five.", "question": "Does a six-year-old pay for entry?"}', 0.3, 'A2', 'approved', 'manual', 'daily-life', 'practice', '{"acceptable_answers": ["yes"]}', :'s3_29_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('c37fa18b-73f2-465c-8131-ddcc2647ac2c', 'Set 3', 3) RETURNING id \gset s3_30_
UPDATE items SET set_id = :'s3_30_id', set_order = 1 WHERE id = '1007328c-d844-4a60-8de9-3193e2ff5f59';
UPDATE items SET set_id = :'s3_30_id', set_order = 2 WHERE id = '027415d4-ce4f-4cae-b334-e79eafd9ccf1';
UPDATE items SET set_id = :'s3_30_id', set_order = 3 WHERE id = '14b2be1f-28e0-420b-8fb1-0a5fccea7bea';
UPDATE items SET set_id = :'s3_30_id', set_order = 4 WHERE id = '86684ed2-65c9-4bd6-9dfb-e7ce6cec8974';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('reading_selective', '{"text": "Applications submitted after the deadline will only be considered if space remains available in the program.", "question": "Are late applications always rejected?"}', 0.52, 'B1', 'approved', 'manual', 'education', 'practice', '{"acceptable_answers": ["no"]}', :'s3_30_id', 5);

-- ===================== repeats : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('206f3570-63f2-4a07-8e6c-2c6acde95243', 'Set 3', 3) RETURNING id \gset s3_31_
UPDATE items SET set_id = :'s3_31_id', set_order = 1 WHERE id = '0eb6aa05-fa45-4070-999a-c31be7bbd1ad';
UPDATE items SET set_id = :'s3_31_id', set_order = 2 WHERE id = '60a1f3fd-87e0-4823-b745-bdd3bfce2143';
UPDATE items SET set_id = :'s3_31_id', set_order = 3 WHERE id = '5bd22b86-ffc0-4c09-bb89-30b7d6db11c1';
UPDATE items SET set_id = :'s3_31_id', set_order = 4 WHERE id = 'a7c1dad3-aa7c-4f80-a975-74385b6557ad';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('repeats', '{"text": "I have a small garden."}', 0.13, 'A1', 'approved', 'manual', 'nature', 'practice', '{"exact": "I have a small garden."}', :'s3_31_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('42b9c7de-e346-4571-afbd-d9b172e13b0e', 'Set 3', 3) RETURNING id \gset s3_32_
UPDATE items SET set_id = :'s3_32_id', set_order = 1 WHERE id = 'ceee8541-c596-4952-8f48-e02eaeeb42fc';
UPDATE items SET set_id = :'s3_32_id', set_order = 2 WHERE id = '1decd022-9cb4-4e35-8261-faa4e45d2736';
UPDATE items SET set_id = :'s3_32_id', set_order = 3 WHERE id = '63d443d2-4b8c-4a98-af2b-b03b1c0aa8e9';
UPDATE items SET set_id = :'s3_32_id', set_order = 4 WHERE id = '36a394f7-ac45-4a51-ae14-29786680f57e';
UPDATE items SET set_id = :'s3_32_id', set_order = 5 WHERE id = 'd3def4d7-1f2b-4de7-9870-155cbf3abf08';

INSERT INTO sets (unit_id, name, order_index) VALUES ('5a348e99-11eb-479c-b024-1256bd23ad66', 'Set 3', 3) RETURNING id \gset s3_33_
UPDATE items SET set_id = :'s3_33_id', set_order = 1 WHERE id = 'b0189f57-eb64-4c2a-9d56-16606b75db9c';
UPDATE items SET set_id = :'s3_33_id', set_order = 2 WHERE id = 'a300487e-db79-4bc8-8c74-8f309b3fc13f';
UPDATE items SET set_id = :'s3_33_id', set_order = 3 WHERE id = '3d92bd69-3f3e-45df-aeee-db9479e9862e';
UPDATE items SET set_id = :'s3_33_id', set_order = 4 WHERE id = 'd62c3ab3-aa6e-426e-a2d9-21340caf50d9';
UPDATE items SET set_id = :'s3_33_id', set_order = 5 WHERE id = '987af875-0521-4642-b03b-8ab135659999';

-- ===================== response_selection : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('b6e5f605-2508-4e9c-8b93-780d80218ba6', 'Set 3', 3) RETURNING id \gset s3_34_
UPDATE items SET set_id = :'s3_34_id', set_order = 1 WHERE id = '44c1bfa9-b5c9-49e8-9bd3-13e917f7a3e6';
UPDATE items SET set_id = :'s3_34_id', set_order = 2 WHERE id = '1fe7c9b4-ce85-432d-bc8d-806e5e4d8b30';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('response_selection', '{"text": "What is your favorite color?", "options": ["It is blue.", "I am ten.", "Yes, please."]}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', '{"correctIndex": 0}', :'s3_34_id', 3),
('response_selection', '{"text": "Do you want some water?", "options": ["Yes, please.", "It is Monday.", "I live here."]}', 0.13, 'A1', 'approved', 'manual', 'food', 'practice', '{"correctIndex": 0}', :'s3_34_id', 4),
('response_selection', '{"text": "Where is your school?", "options": ["It is near my house.", "I am happy.", "Yes, I do."]}', 0.13, 'A1', 'approved', 'manual', 'education', 'practice', '{"correctIndex": 0}', :'s3_34_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('bbf321ec-a2fd-4ebd-8961-a8c43f4723b5', 'Set 3', 3) RETURNING id \gset s3_35_
UPDATE items SET set_id = :'s3_35_id', set_order = 1 WHERE id = 'f73ec46a-5fbd-4a4c-abfb-eabb8826e830';
UPDATE items SET set_id = :'s3_35_id', set_order = 2 WHERE id = '3b4d0064-df5a-45f4-87b8-453e690ba73c';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('response_selection', '{"text": "Shall we meet at the cafe at noon?", "options": ["Sounds good, see you then.", "She has two brothers.", "It rained all day."]}', 0.3, 'A2', 'approved', 'manual', 'daily-life', 'practice', '{"correctIndex": 0}', :'s3_35_id', 3),
('response_selection', '{"text": "What do you think of the new menu?", "options": ["I think it''s a great improvement.", "He works nine to five.", "The train was late."]}', 0.3, 'A2', 'approved', 'manual', 'food', 'practice', '{"correctIndex": 0}', :'s3_35_id', 4),
('response_selection', '{"text": "Could you send me the file today?", "options": ["Sure, I''ll send it in an hour.", "She likes blue shoes.", "It happened last year."]}', 0.3, 'A2', 'approved', 'manual', 'work', 'practice', '{"correctIndex": 0}', :'s3_35_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('226ada86-c8fa-4fd8-b3b2-ae5fcc9afef5', 'Set 3', 3) RETURNING id \gset s3_36_
UPDATE items SET set_id = :'s3_36_id', set_order = 1 WHERE id = 'a2816df0-1f31-491f-bd09-c8b69fd6d233';
UPDATE items SET set_id = :'s3_36_id', set_order = 2 WHERE id = 'bbebe569-1554-4e59-b1e0-0f2b1028cf84';
UPDATE items SET set_id = :'s3_36_id', set_order = 3 WHERE id = '708ab926-1b6b-4b57-b203-31072cc335ec';
UPDATE items SET set_id = :'s3_36_id', set_order = 4 WHERE id = '2fa2ee05-432a-4cc1-9c2b-aab0332abdf2';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('response_selection', '{"text": "How should we handle the budget overrun?", "options": ["I suggest we review non-essential costs first.", "She enjoys painting on weekends.", "The flight leaves at noon."]}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', '{"correctIndex": 0}', :'s3_36_id', 5);

-- ===================== sentence_builds : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('386807f2-b474-4e76-8dd8-b5c6957f348b', 'Set 3', 3) RETURNING id \gset s3_37_
UPDATE items SET set_id = :'s3_37_id', set_order = 1 WHERE id = 'c9de3f17-96d8-4313-bd40-3fa83c994a51';
UPDATE items SET set_id = :'s3_37_id', set_order = 2 WHERE id = 'c9cdf1d4-4d46-4e05-8b36-353ce085d3cb';
UPDATE items SET set_id = :'s3_37_id', set_order = 3 WHERE id = 'c9ffea7a-735a-427e-9ab1-14dbaa1ad685';
UPDATE items SET set_id = :'s3_37_id', set_order = 4 WHERE id = '80d86be9-1640-41ef-9ddb-7f8a8f1bccee';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('sentence_builds', '{"groups": ["has", "she", "a blue bag"]}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', '{"correct": "She has a blue bag."}', :'s3_37_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('04dc2ddd-8e09-4da0-ab61-e8f7da767d1c', 'Set 3', 3) RETURNING id \gset s3_38_
UPDATE items SET set_id = :'s3_38_id', set_order = 1 WHERE id = 'e991f3ba-bdaa-446e-b210-83e21ef2fcfc';
UPDATE items SET set_id = :'s3_38_id', set_order = 2 WHERE id = '4e9835e5-dade-47f9-b51b-c01d3ca7a6f9';
UPDATE items SET set_id = :'s3_38_id', set_order = 3 WHERE id = 'f90f0a62-7228-4780-9ba5-1ef9881376f2';
UPDATE items SET set_id = :'s3_38_id', set_order = 4 WHERE id = '3c1ecdfd-7040-403d-9d74-d1c60bad750e';
UPDATE items SET set_id = :'s3_38_id', set_order = 5 WHERE id = '7ac2dbce-b945-42a5-8725-2c89e345b444';

INSERT INTO sets (unit_id, name, order_index) VALUES ('12a90f09-acad-47d9-91e4-68b49ab02e3f', 'Set 3', 3) RETURNING id \gset s3_39_
UPDATE items SET set_id = :'s3_39_id', set_order = 1 WHERE id = 'bbee76fb-a1b8-4e43-bedd-d945c6151a6e';
UPDATE items SET set_id = :'s3_39_id', set_order = 2 WHERE id = '5c977608-fa44-4304-938f-0b8fb007ff33';
UPDATE items SET set_id = :'s3_39_id', set_order = 3 WHERE id = '3b81126b-1212-45f6-9bd4-ec3808d6c8c0';
UPDATE items SET set_id = :'s3_39_id', set_order = 4 WHERE id = 'a557218b-6ed7-4920-b182-2fc3fa4723e1';
UPDATE items SET set_id = :'s3_39_id', set_order = 5 WHERE id = '79578764-d300-43ca-a600-1c0a9f71500a';

-- ===================== sentence_completion : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('b97df0de-29d2-4cb6-9fe4-ded294df31d8', 'Set 3', 3) RETURNING id \gset s3_40_
UPDATE items SET set_id = :'s3_40_id', set_order = 1 WHERE id = 'cf975b9a-6b12-4245-91ad-939456260137';
UPDATE items SET set_id = :'s3_40_id', set_order = 2 WHERE id = 'b26e4fcf-3a03-4744-bee2-c24347f3ec36';
UPDATE items SET set_id = :'s3_40_id', set_order = 3 WHERE id = '305f16ac-6016-4e1d-89a9-dcabbbdf8077';
UPDATE items SET set_id = :'s3_40_id', set_order = 4 WHERE id = 'c5f8dcaf-ced6-45d5-a0d9-eaf2bbee98ee';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('sentence_completion', '{"sentence": "They ___ happy today."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', '{"acceptable_answers": ["are"]}', :'s3_40_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('2750b0f0-5475-428d-89e8-2a7af3aa274d', 'Set 3', 3) RETURNING id \gset s3_41_
UPDATE items SET set_id = :'s3_41_id', set_order = 1 WHERE id = 'db3fb427-af44-4bf1-9cdd-eab54384881b';
UPDATE items SET set_id = :'s3_41_id', set_order = 2 WHERE id = 'ed91f3f0-d907-41d6-a255-cf3d18730bdd';
UPDATE items SET set_id = :'s3_41_id', set_order = 3 WHERE id = 'f3ec37d3-bf6b-455e-adad-069d95f62071';
UPDATE items SET set_id = :'s3_41_id', set_order = 4 WHERE id = 'cd0b6b24-3302-4aa0-b2bf-e1f2227f464b';
UPDATE items SET set_id = :'s3_41_id', set_order = 5 WHERE id = '395be56b-2db1-4904-aef7-fff707c6bade';

INSERT INTO sets (unit_id, name, order_index) VALUES ('0e5ea08a-5d00-49b5-8035-9f3a508f23af', 'Set 3', 3) RETURNING id \gset s3_42_
UPDATE items SET set_id = :'s3_42_id', set_order = 1 WHERE id = '5bb8c1cb-8eaf-442d-b556-449b6dc44aaa';
UPDATE items SET set_id = :'s3_42_id', set_order = 2 WHERE id = 'e9b3131f-a55e-4b85-b69e-7118c7c1cdc4';
UPDATE items SET set_id = :'s3_42_id', set_order = 3 WHERE id = 'f099707e-e124-4e92-8ba7-c95471cb106d';
UPDATE items SET set_id = :'s3_42_id', set_order = 4 WHERE id = '93819396-41e4-4514-8b88-66921048f962';
UPDATE items SET set_id = :'s3_42_id', set_order = 5 WHERE id = '268d6892-c68e-4cbf-b0f4-5c4407e91f9d';

-- ===================== short_answer : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('0afb71f9-8114-49d7-8d74-4af8a0c77789', 'Set 3', 3) RETURNING id \gset s3_43_
UPDATE items SET set_id = :'s3_43_id', set_order = 1 WHERE id = '2917f58a-57a1-44d8-8463-6971c83bcf16';
UPDATE items SET set_id = :'s3_43_id', set_order = 2 WHERE id = '7622e759-e1d6-43e2-a803-fc844b593162';
UPDATE items SET set_id = :'s3_43_id', set_order = 3 WHERE id = '3ca94045-ee11-4f04-9ef9-b86213904d35';
UPDATE items SET set_id = :'s3_43_id', set_order = 4 WHERE id = 'f06fa240-6ef8-4450-ba4b-bd56134ec4f6';
UPDATE items SET set_id = :'s3_43_id', set_order = 5 WHERE id = 'f2cb8c61-1e80-4921-bce4-699f58f5d212';

INSERT INTO sets (unit_id, name, order_index) VALUES ('4a1ba5b3-ea5f-409c-94a7-8d347e2a3498', 'Set 3', 3) RETURNING id \gset s3_44_
UPDATE items SET set_id = :'s3_44_id', set_order = 1 WHERE id = '19e21e9a-0333-4a63-8b05-dd8dcb4a0ce8';
UPDATE items SET set_id = :'s3_44_id', set_order = 2 WHERE id = '8f8308fe-9b83-41d8-b581-d01180afa1b0';
UPDATE items SET set_id = :'s3_44_id', set_order = 3 WHERE id = '5a870df3-0931-4a46-9e29-464d8bded1da';
UPDATE items SET set_id = :'s3_44_id', set_order = 4 WHERE id = 'c6908926-7f19-41e9-9d0f-ae2109ae445a';
UPDATE items SET set_id = :'s3_44_id', set_order = 5 WHERE id = '119cef0a-e17f-4124-88cf-202b948a6617';

INSERT INTO sets (unit_id, name, order_index) VALUES ('d2c2fe6f-c5f7-4cee-9ff8-a3cc4a23ff1c', 'Set 3', 3) RETURNING id \gset s3_45_
UPDATE items SET set_id = :'s3_45_id', set_order = 1 WHERE id = '05093a5e-a55b-49cf-a1bd-48cc929587d4';
UPDATE items SET set_id = :'s3_45_id', set_order = 2 WHERE id = '37653fc6-1ca4-496f-8aed-3628ea1cdea0';
UPDATE items SET set_id = :'s3_45_id', set_order = 3 WHERE id = 'd79c858c-2663-48d6-bbe8-c1e321010e5d';
UPDATE items SET set_id = :'s3_45_id', set_order = 4 WHERE id = '40b06dd5-5457-4954-a190-0642a2719ef6';
UPDATE items SET set_id = :'s3_45_id', set_order = 5 WHERE id = 'e8132523-d7b5-4cc0-8839-947ceff1d368';

-- ===================== speaking_situations : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('9724b2b0-d7ae-453d-851d-c19f2a1726e8', 'Set 3', 3) RETURNING id \gset s3_46_
UPDATE items SET set_id = :'s3_46_id', set_order = 1 WHERE id = '7b60fbf8-4395-4dba-b578-22dfb47898a3';
UPDATE items SET set_id = :'s3_46_id', set_order = 2 WHERE id = '63d7265e-efb7-4b80-8e7b-3d8b3d2be345';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('speaking_situations', '{"situation": "You want to ask a shopkeeper for a bag. What do you say?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_46_id', 3),
('speaking_situations', '{"situation": "Your friend sneezes. What do you say?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_46_id', 4),
('speaking_situations', '{"situation": "You want to ask your teacher to repeat something. What do you say?"}', 0.13, 'A1', 'approved', 'manual', 'education', 'practice', NULL, :'s3_46_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('659fcc65-c7f2-49ac-8eaf-9e9c0ed61486', 'Set 3', 3) RETURNING id \gset s3_47_
UPDATE items SET set_id = :'s3_47_id', set_order = 1 WHERE id = '67508480-5cdf-4985-a42b-90103d0e14e8';
UPDATE items SET set_id = :'s3_47_id', set_order = 2 WHERE id = '09c4d435-a6fc-4486-9bdc-ef18d5cf25a0';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('speaking_situations', '{"situation": "You want to ask a stranger for directions to the station. What do you say?"}', 0.3, 'A2', 'approved', 'manual', 'travel', 'practice', NULL, :'s3_47_id', 3),
('speaking_situations', '{"situation": "Your friend did well on a test. What do you say to congratulate them?"}', 0.3, 'A2', 'approved', 'manual', 'education', 'practice', NULL, :'s3_47_id', 4),
('speaking_situations', '{"situation": "You want to return a shirt that doesn''t fit. What do you say to the shop staff?"}', 0.3, 'A2', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_47_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('0b90822f-04ae-4044-bbc3-b6efe9711f07', 'Set 3', 3) RETURNING id \gset s3_48_
UPDATE items SET set_id = :'s3_48_id', set_order = 1 WHERE id = '23850247-0e11-4b90-b5a2-d7f08dfa9002';
UPDATE items SET set_id = :'s3_48_id', set_order = 2 WHERE id = 'c44989e7-a81b-4b4c-a696-278f0c4dd418';
UPDATE items SET set_id = :'s3_48_id', set_order = 3 WHERE id = 'cc05c0f4-c683-457a-9ef5-b35cc5c62f53';
UPDATE items SET set_id = :'s3_48_id', set_order = 4 WHERE id = '958011a1-0ce5-45af-a6f9-d6e28daf7b65';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('speaking_situations', '{"situation": "You need to explain to a client why a feature won''t be ready this week. What do you say?"}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', NULL, :'s3_48_id', 5);

-- ===================== story_retelling : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('c3541875-97a0-4c13-930f-853c14145159', 'Set 3', 3) RETURNING id \gset s3_49_
UPDATE items SET set_id = :'s3_49_id', set_order = 1 WHERE id = 'd18999e8-00b1-4d0d-999a-218cfbd12810';
UPDATE items SET set_id = :'s3_49_id', set_order = 2 WHERE id = '347c4708-5687-4061-af18-7e926f4831d8';
UPDATE items SET set_id = :'s3_49_id', set_order = 3 WHERE id = '481f0b40-6781-47fc-a7a8-3b4a767d5187';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('story_retelling', '{"story": "Lila has a red umbrella. She uses it when it rains."}', 0.13, 'A1', 'approved', 'manual', 'weather', 'practice', NULL, :'s3_49_id', 4),
('story_retelling', '{"story": "Kiran has a small radio. He listens to music every evening."}', 0.13, 'A1', 'approved', 'manual', 'hobbies', 'practice', NULL, :'s3_49_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('8fcf9298-9c18-460c-9d16-0e8a5a8271ba', 'Set 3', 3) RETURNING id \gset s3_50_
UPDATE items SET set_id = :'s3_50_id', set_order = 1 WHERE id = 'd5e27019-6b80-497a-b78b-68ec71d4213c';
UPDATE items SET set_id = :'s3_50_id', set_order = 2 WHERE id = 'f12eecb3-33c2-46cf-8b9c-15ebaad298d7';
UPDATE items SET set_id = :'s3_50_id', set_order = 3 WHERE id = '0c8a6830-5d6c-462e-8ed1-f2c9e2b3d25e';
UPDATE items SET set_id = :'s3_50_id', set_order = 4 WHERE id = '9c2b11a1-f046-40d2-9555-48ef95b5479c';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('story_retelling', '{"story": "Noor started a small vegetable garden last spring. By summer, she had fresh tomatoes and peppers to share with neighbors."}', 0.3, 'A2', 'approved', 'manual', 'nature', 'practice', NULL, :'s3_50_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('45747101-b806-4bff-bbf1-f7a7c4fc4b04', 'Set 3', 3) RETURNING id \gset s3_51_
UPDATE items SET set_id = :'s3_51_id', set_order = 1 WHERE id = 'd2015100-8cb8-4103-b296-f72f0b667bb4';
UPDATE items SET set_id = :'s3_51_id', set_order = 2 WHERE id = '5e81459a-5abe-4519-80cc-06844caa436f';
UPDATE items SET set_id = :'s3_51_id', set_order = 3 WHERE id = '3abdf57f-bc8d-4b59-a6d8-8362d30c47a5';
UPDATE items SET set_id = :'s3_51_id', set_order = 4 WHERE id = '7d5b30b8-9281-4dc7-be0e-ad174619c5d2';
UPDATE items SET set_id = :'s3_51_id', set_order = 5 WHERE id = '3bd9daa5-5277-4d8a-8f5c-4650488b4dcc';

-- ===================== summary_and_opinion : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('72fd406d-fdf0-4f6d-9f1e-200a34f5a99b', 'Set 3', 3) RETURNING id \gset s3_52_
UPDATE items SET set_id = :'s3_52_id', set_order = 1 WHERE id = '9ddae517-475d-4d0e-a276-23d1ecaa7b2f';
UPDATE items SET set_id = :'s3_52_id', set_order = 2 WHERE id = '736b027b-9a0b-4f10-addb-1324fbd37ae4';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('summary_and_opinion', '{"passage": "Many children like to play outside. Playing outside is healthy."}', 0.13, 'A1', 'approved', 'manual', 'health', 'practice', NULL, :'s3_52_id', 3),
('summary_and_opinion', '{"passage": "People like to read stories. Stories can teach us things."}', 0.13, 'A1', 'approved', 'manual', 'education', 'practice', NULL, :'s3_52_id', 4),
('summary_and_opinion', '{"passage": "Many people have phones. Phones help us talk to friends."}', 0.13, 'A1', 'approved', 'manual', 'technology', 'practice', NULL, :'s3_52_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('08484a5b-d218-42cb-b2ca-b83f6bbd44b0', 'Set 3', 3) RETURNING id \gset s3_53_
UPDATE items SET set_id = :'s3_53_id', set_order = 1 WHERE id = '19f2ea88-5f77-4ef9-bc6d-b2a7befe5987';
UPDATE items SET set_id = :'s3_53_id', set_order = 2 WHERE id = 'b3b0149b-e5be-4766-aedf-cc58efcbbbf2';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('summary_and_opinion', '{"passage": "Riding a bicycle is good exercise. It is also a cheap way to travel short distances."}', 0.3, 'A2', 'approved', 'manual', 'health', 'practice', NULL, :'s3_53_id', 3),
('summary_and_opinion', '{"passage": "Cooking at home can save money. It can also be healthier than eating out often."}', 0.3, 'A2', 'approved', 'manual', 'food', 'practice', NULL, :'s3_53_id', 4),
('summary_and_opinion', '{"passage": "Reading before bed can help people relax. It can also improve vocabulary over time."}', 0.3, 'A2', 'approved', 'manual', 'education', 'practice', NULL, :'s3_53_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('c1f63d43-d48b-403e-887e-4c56d54a6e70', 'Set 3', 3) RETURNING id \gset s3_54_
UPDATE items SET set_id = :'s3_54_id', set_order = 1 WHERE id = '6e8e113c-1ceb-4fe5-88be-19a195da96c8';
UPDATE items SET set_id = :'s3_54_id', set_order = 2 WHERE id = '3940a32e-b6ef-42d9-ab63-4ebf8f6ce2e5';
UPDATE items SET set_id = :'s3_54_id', set_order = 3 WHERE id = '19806387-3223-4542-b681-4ab8c355eb97';
UPDATE items SET set_id = :'s3_54_id', set_order = 4 WHERE id = '76de36a8-8843-4b31-99e9-2d2b84ce40f4';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('summary_and_opinion', '{"passage": "Hybrid work arrangements let employees split time between home and office. Many enjoy the balance, though some miss daily in-person contact with colleagues."}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', NULL, :'s3_54_id', 5);

-- ===================== typing : Set 3 =====================

INSERT INTO sets (unit_id, name, order_index) VALUES ('aa3f2b1d-c0d6-41e1-b2f8-faf428383c62', 'Set 3', 3) RETURNING id \gset s3_55_
UPDATE items SET set_id = :'s3_55_id', set_order = 1 WHERE id = 'eb00db57-7498-4da4-ae3a-6876e5e5190a';
UPDATE items SET set_id = :'s3_55_id', set_order = 2 WHERE id = '937e87d8-d132-4cc0-9d27-0b03e945e365';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('typing', '{"text": "She has a yellow umbrella. It is raining today."}', 0.13, 'A1', 'approved', 'manual', 'weather', 'practice', NULL, :'s3_55_id', 3),
('typing', '{"text": "We watch TV at night. The show is funny."}', 0.13, 'A1', 'approved', 'manual', 'entertainment', 'practice', NULL, :'s3_55_id', 4),
('typing', '{"text": "He has a new bag. The bag is black."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', NULL, :'s3_55_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('193d945b-2d39-4564-993b-bbddf1e5d19f', 'Set 3', 3) RETURNING id \gset s3_56_
UPDATE items SET set_id = :'s3_56_id', set_order = 1 WHERE id = '283f15f1-181e-47a9-823b-1c42651f3df7';
UPDATE items SET set_id = :'s3_56_id', set_order = 2 WHERE id = '760520f8-c123-423c-8584-bee13d832c40';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('typing', '{"text": "The library is quiet, so students go there to study."}', 0.3, 'A2', 'approved', 'manual', 'education', 'practice', NULL, :'s3_56_id', 3),
('typing', '{"text": "My neighbor grows tomatoes in his garden every summer."}', 0.3, 'A2', 'approved', 'manual', 'nature', 'practice', NULL, :'s3_56_id', 4),
('typing', '{"text": "The train to the city leaves every thirty minutes on weekdays."}', 0.3, 'A2', 'approved', 'manual', 'transport', 'practice', NULL, :'s3_56_id', 5);

INSERT INTO sets (unit_id, name, order_index) VALUES ('e8e03eda-d122-41a0-9a68-b0595d758a70', 'Set 3', 3) RETURNING id \gset s3_57_
UPDATE items SET set_id = :'s3_57_id', set_order = 1 WHERE id = 'bb24e985-35a3-447f-8faa-d13fb60db92a';
UPDATE items SET set_id = :'s3_57_id', set_order = 2 WHERE id = '5248e853-fefb-4679-a40b-e84b75a63a49';
UPDATE items SET set_id = :'s3_57_id', set_order = 3 WHERE id = 'ee695bec-6b33-4b5f-bdce-ec931a5557f0';
UPDATE items SET set_id = :'s3_57_id', set_order = 4 WHERE id = '91c8dfd3-0ea2-4f21-bf4c-b324f4b8b8b5';
INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, answer_set, set_id, set_order) VALUES
('typing', '{"text": "The new policy requires all staff to complete training by next month."}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', NULL, :'s3_57_id', 5);

COMMIT;