-- Pilot content for the Modules Units/Sets structure (Types -> Units ->
-- Sets -> Questions). Covers 3 item types across the 3 input-method
-- families that exist today: reading (mic, ungraded pronunciation),
-- repeats (mic, graded exact-match), reading_comprehension (radio,
-- multiple-choice). Each type: 3 units, one per real CEFR level (A1/A2/B1)
-- -- not the vague "Everyday Basics"/"Building Fluency" labels from the
-- first pass, which turned out to not actually be A1 (verified against this
-- app's own existing difficulty->cefr_level calibration: real A1 content
-- elsewhere sits at 0.10-0.15 difficulty; the first pass's "beginner" unit
-- was 0.20-0.32, actually A2). difficulty and cefr_level are both set here,
-- matching that same calibration (A1 0.10-0.15, A2 0.25-0.35, B1 0.45-0.58).
-- 2 sets per unit x 5 questions per set = 30 new items per type, 90 total.
--
-- Separate from the existing flat pool='practice' items (backend/seeds/003
-- etc.) — those are untouched and simply not linked to any set. set_order
-- (1-5) is explicit, not left to created_at — see migration 1789600100000
-- for why a single multi-row INSERT can't rely on created_at for ordering.
-- Re-runnable is NOT guaranteed (unlike the older flat seeds) since each run
-- would create duplicate units/sets; run once against a given database.
-- Requires psql (uses \gset, not plain SQL).
BEGIN;

-- ===================== reading =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('reading', 'A1 - Beginner', 1) RETURNING id \gset r_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('reading', 'A2 - Elementary', 2) RETURNING id \gset r_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('reading', 'B1 - Intermediate', 3) RETURNING id \gset r_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'r_a1_id', 'Set 1', 1) RETURNING id \gset r_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'r_a1_id', 'Set 2', 2) RETURNING id \gset r_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'r_a2_id', 'Set 1', 1) RETURNING id \gset r_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'r_a2_id', 'Set 2', 2) RETURNING id \gset r_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'r_b1_id', 'Set 1', 1) RETURNING id \gset r_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'r_b1_id', 'Set 2', 2) RETURNING id \gset r_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('reading', '{"text": "My name is Anna."}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'r_a1s1_id', 1),
('reading', '{"text": "I like tea."}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'r_a1s1_id', 2),
('reading', '{"text": "This is my book."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'r_a1s1_id', 3),
('reading', '{"text": "She is my friend."}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'r_a1s1_id', 4),
('reading', '{"text": "We go to school."}', 0.15, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'r_a1s1_id', 5),
('reading', '{"text": "He is my brother."}', 0.12, 'A1', 'approved', 'manual', 'family', 'practice', :'r_a1s2_id', 1),
('reading', '{"text": "I have a red pen."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'r_a1s2_id', 2),
('reading', '{"text": "The cat is black."}', 0.10, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'r_a1s2_id', 3),
('reading', '{"text": "This is a big house."}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'r_a1s2_id', 4),
('reading', '{"text": "I am from India."}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'r_a1s2_id', 5),
('reading', '{"text": "I usually wake up at seven in the morning."}', 0.27, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'r_a2s1_id', 1),
('reading', '{"text": "My sister is studying to become a nurse."}', 0.29, 'A2', 'approved', 'manual', 'family', 'practice', :'r_a2s1_id', 2),
('reading', '{"text": "We usually have dinner together on Sundays."}', 0.31, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'r_a2s1_id', 3),
('reading', '{"text": "He plays football with his friends every weekend."}', 0.33, 'A2', 'approved', 'manual', 'hobbies', 'practice', :'r_a2s1_id', 4),
('reading', '{"text": "The train to the city center leaves every ten minutes."}', 0.30, 'A2', 'approved', 'manual', 'transport', 'practice', :'r_a2s1_id', 5),
('reading', '{"text": "Can you tell me where the nearest bank is?"}', 0.28, 'A2', 'approved', 'manual', 'directions', 'practice', :'r_a2s2_id', 1),
('reading', '{"text": "Please remember to lock the door before you leave."}', 0.30, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'r_a2s2_id', 2),
('reading', '{"text": "I would like a cup of coffee with a little milk."}', 0.32, 'A2', 'approved', 'manual', 'dining', 'practice', :'r_a2s2_id', 3),
('reading', '{"text": "The children were playing happily in the park."}', 0.34, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'r_a2s2_id', 4),
('reading', '{"text": "It looks like it might rain later today."}', 0.29, 'A2', 'approved', 'manual', 'weather', 'practice', :'r_a2s2_id', 5),
('reading', '{"text": "Despite the heavy traffic, we arrived at the airport on time."}', 0.48, 'B1', 'approved', 'manual', 'travel', 'practice', :'r_b1s1_id', 1),
('reading', '{"text": "She has been practicing the piano for almost ten years."}', 0.50, 'B1', 'approved', 'manual', 'hobbies', 'practice', :'r_b1s1_id', 2),
('reading', '{"text": "The manager explained the new procedure in great detail."}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', :'r_b1s1_id', 3),
('reading', '{"text": "Scientists are still studying the long-term effects of the change."}', 0.55, 'B1', 'approved', 'manual', 'science', 'practice', :'r_b1s1_id', 4),
('reading', '{"text": "The museum''s new exhibition attracted visitors from around the world."}', 0.47, 'B1', 'approved', 'manual', 'culture', 'practice', :'r_b1s1_id', 5),
('reading', '{"text": "The committee postponed its decision until further evidence was available."}', 0.53, 'B1', 'approved', 'manual', 'business', 'practice', :'r_b1s2_id', 1),
('reading', '{"text": "Her dedication to the project impressed everyone on the team."}', 0.49, 'B1', 'approved', 'manual', 'work', 'practice', :'r_b1s2_id', 2),
('reading', '{"text": "The bridge was closed for repairs after the storm damaged its foundation."}', 0.56, 'B1', 'approved', 'manual', 'infrastructure', 'practice', :'r_b1s2_id', 3),
('reading', '{"text": "Negotiators from both sides expressed cautious optimism about the outcome."}', 0.58, 'B1', 'approved', 'manual', 'politics', 'practice', :'r_b1s2_id', 4),
('reading', '{"text": "The professor encouraged students to question their own assumptions."}', 0.51, 'B1', 'approved', 'manual', 'education', 'practice', :'r_b1s2_id', 5);

-- ===================== repeats =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('repeats', 'A1 - Beginner', 1) RETURNING id \gset p_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('repeats', 'A2 - Elementary', 2) RETURNING id \gset p_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('repeats', 'B1 - Intermediate', 3) RETURNING id \gset p_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'p_a1_id', 'Set 1', 1) RETURNING id \gset p_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'p_a1_id', 'Set 2', 2) RETURNING id \gset p_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'p_a2_id', 'Set 1', 1) RETURNING id \gset p_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'p_a2_id', 'Set 2', 2) RETURNING id \gset p_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'p_b1_id', 'Set 1', 1) RETURNING id \gset p_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'p_b1_id', 'Set 2', 2) RETURNING id \gset p_b1s2_

INSERT INTO items (item_type_id, content, answer_set, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('repeats', '{"text": "My name is Tom."}', '{"exact": "My name is Tom."}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'p_a1s1_id', 1),
('repeats', '{"text": "I like coffee."}', '{"exact": "I like coffee."}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'p_a1s1_id', 2),
('repeats', '{"text": "This is my book."}', '{"exact": "This is my book."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'p_a1s1_id', 3),
('repeats', '{"text": "He is my brother."}', '{"exact": "He is my brother."}', 0.14, 'A1', 'approved', 'manual', 'family', 'practice', :'p_a1s1_id', 4),
('repeats', '{"text": "We live here."}', '{"exact": "We live here."}', 0.10, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'p_a1s1_id', 5),
('repeats', '{"text": "I am from Spain."}', '{"exact": "I am from Spain."}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'p_a1s2_id', 1),
('repeats', '{"text": "She has a red car."}', '{"exact": "She has a red car."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'p_a1s2_id', 2),
('repeats', '{"text": "The dog is small."}', '{"exact": "The dog is small."}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'p_a1s2_id', 3),
('repeats', '{"text": "This is my school."}', '{"exact": "This is my school."}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'p_a1s2_id', 4),
('repeats', '{"text": "I am ten years old."}', '{"exact": "I am ten years old."}', 0.15, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'p_a1s2_id', 5),
('repeats', '{"text": "I need to buy some bread."}', '{"exact": "I need to buy some bread."}', 0.27, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'p_a2s1_id', 1),
('repeats', '{"text": "She is cooking dinner right now."}', '{"exact": "She is cooking dinner right now."}', 0.29, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'p_a2s1_id', 2),
('repeats', '{"text": "We got home just before dark."}', '{"exact": "We got home just before dark."}', 0.31, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'p_a2s1_id', 3),
('repeats', '{"text": "Turn right at the traffic light."}', '{"exact": "Turn right at the traffic light."}', 0.28, 'A2', 'approved', 'manual', 'directions', 'practice', :'p_a2s1_id', 4),
('repeats', '{"text": "He lost his phone at the station."}', '{"exact": "He lost his phone at the station."}', 0.32, 'A2', 'approved', 'manual', 'travel', 'practice', :'p_a2s1_id', 5),
('repeats', '{"text": "The weather is nice this weekend."}', '{"exact": "The weather is nice this weekend."}', 0.30, 'A2', 'approved', 'manual', 'weather', 'practice', :'p_a2s2_id', 1),
('repeats', '{"text": "They moved to a new apartment."}', '{"exact": "They moved to a new apartment."}', 0.29, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'p_a2s2_id', 2),
('repeats', '{"text": "I would rather stay home tonight."}', '{"exact": "I would rather stay home tonight."}', 0.31, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'p_a2s2_id', 3),
('repeats', '{"text": "Our meeting starts at ten o''clock."}', '{"exact": "Our meeting starts at ten o''clock."}', 0.33, 'A2', 'approved', 'manual', 'work', 'practice', :'p_a2s2_id', 4),
('repeats', '{"text": "She forgot to bring her umbrella."}', '{"exact": "She forgot to bring her umbrella."}', 0.34, 'A2', 'approved', 'manual', 'weather', 'practice', :'p_a2s2_id', 5),
('repeats', '{"text": "The company announced a new product line."}', '{"exact": "The company announced a new product line."}', 0.49, 'B1', 'approved', 'manual', 'work', 'practice', :'p_b1s1_id', 1),
('repeats', '{"text": "Her argument was clear and well organized."}', '{"exact": "Her argument was clear and well organized."}', 0.51, 'B1', 'approved', 'manual', 'education', 'practice', :'p_b1s1_id', 2),
('repeats', '{"text": "Researchers discovered an unexpected pattern in the data."}', '{"exact": "Researchers discovered an unexpected pattern in the data."}', 0.54, 'B1', 'approved', 'manual', 'science', 'practice', :'p_b1s1_id', 3),
('repeats', '{"text": "The negotiations lasted longer than anyone expected."}', '{"exact": "The negotiations lasted longer than anyone expected."}', 0.47, 'B1', 'approved', 'manual', 'business', 'practice', :'p_b1s1_id', 4),
('repeats', '{"text": "The government introduced stricter regulations last month."}', '{"exact": "The government introduced stricter regulations last month."}', 0.56, 'B1', 'approved', 'manual', 'politics', 'practice', :'p_b1s1_id', 5),
('repeats', '{"text": "The committee postponed the vote until next week."}', '{"exact": "The committee postponed the vote until next week."}', 0.52, 'B1', 'approved', 'manual', 'business', 'practice', :'p_b1s2_id', 1),
('repeats', '{"text": "The bridge remained closed after the storm."}', '{"exact": "The bridge remained closed after the storm."}', 0.48, 'B1', 'approved', 'manual', 'infrastructure', 'practice', :'p_b1s2_id', 2),
('repeats', '{"text": "His explanation clarified most of the confusion."}', '{"exact": "His explanation clarified most of the confusion."}', 0.50, 'B1', 'approved', 'manual', 'education', 'practice', :'p_b1s2_id', 3),
('repeats', '{"text": "The exhibition drew visitors from several countries."}', '{"exact": "The exhibition drew visitors from several countries."}', 0.57, 'B1', 'approved', 'manual', 'culture', 'practice', :'p_b1s2_id', 4),
('repeats', '{"text": "The proposal received mixed reactions from the board."}', '{"exact": "The proposal received mixed reactions from the board."}', 0.53, 'B1', 'approved', 'manual', 'business', 'practice', :'p_b1s2_id', 5);

-- ===================== reading_comprehension =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('reading_comprehension', 'A1 - Beginner', 1) RETURNING id \gset c_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('reading_comprehension', 'A2 - Elementary', 2) RETURNING id \gset c_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('reading_comprehension', 'B1 - Intermediate', 3) RETURNING id \gset c_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'c_a1_id', 'Set 1', 1) RETURNING id \gset c_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'c_a1_id', 'Set 2', 2) RETURNING id \gset c_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'c_a2_id', 'Set 1', 1) RETURNING id \gset c_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'c_a2_id', 'Set 2', 2) RETURNING id \gset c_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'c_b1_id', 'Set 1', 1) RETURNING id \gset c_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'c_b1_id', 'Set 2', 2) RETURNING id \gset c_b1s2_

INSERT INTO items (item_type_id, content, answer_set, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('reading_comprehension', '{"passage": "The cat is black.", "question": "What color is the cat?", "options": ["Black", "White", "Brown", "Grey"]}', '{"correctIndex": 0}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'c_a1s1_id', 1),
('reading_comprehension', '{"passage": "Tom has two dogs.", "question": "How many dogs does Tom have?", "options": ["One", "Two", "Three", "Four"]}', '{"correctIndex": 1}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'c_a1s1_id', 2),
('reading_comprehension', '{"passage": "The shop opens at nine.", "question": "What time does the shop open?", "options": ["Eight", "Nine", "Ten", "Eleven"]}', '{"correctIndex": 1}', 0.11, 'A1', 'approved', 'manual', 'shopping', 'practice', :'c_a1s1_id', 3),
('reading_comprehension', '{"passage": "Anna likes apples.", "question": "What does Anna like?", "options": ["Apples", "Bananas", "Oranges", "Grapes"]}', '{"correctIndex": 0}', 0.10, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'c_a1s1_id', 4),
('reading_comprehension', '{"passage": "It is Monday today.", "question": "What day is it today?", "options": ["Sunday", "Monday", "Tuesday", "Wednesday"]}', '{"correctIndex": 1}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'c_a1s1_id', 5),
('reading_comprehension', '{"passage": "The book is on the table.", "question": "Where is the book?", "options": ["On the table", "On the chair", "On the floor", "On the bed"]}', '{"correctIndex": 0}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'c_a1s2_id', 1),
('reading_comprehension', '{"passage": "Maria has three brothers.", "question": "How many brothers does Maria have?", "options": ["One", "Two", "Three", "Four"]}', '{"correctIndex": 2}', 0.12, 'A1', 'approved', 'manual', 'family', 'practice', :'c_a1s2_id', 2),
('reading_comprehension', '{"passage": "The bus is red.", "question": "What color is the bus?", "options": ["Blue", "Red", "Green", "Yellow"]}', '{"correctIndex": 1}', 0.10, 'A1', 'approved', 'manual', 'transport', 'practice', :'c_a1s2_id', 3),
('reading_comprehension', '{"passage": "School starts at eight.", "question": "What time does school start?", "options": ["Seven", "Eight", "Nine", "Ten"]}', '{"correctIndex": 1}', 0.15, 'A1', 'approved', 'manual', 'education', 'practice', :'c_a1s2_id', 4),
('reading_comprehension', '{"passage": "Sam is seven years old.", "question": "How old is Sam?", "options": ["Six", "Seven", "Eight", "Nine"]}', '{"correctIndex": 1}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'c_a1s2_id', 5),
('reading_comprehension', '{"passage": "Cafe open 8am-6pm. Closed Monday.", "question": "Is the cafe open on Monday?", "options": ["Yes", "No", "Only mornings", "Only evenings"]}', '{"correctIndex": 1}', 0.28, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'c_a2s1_id', 1),
('reading_comprehension', '{"passage": "Train to downtown: 7:00, 7:30, 8:00, 8:30.", "question": "What time is the third train?", "options": ["7:00", "7:30", "8:00", "8:30"]}', '{"correctIndex": 2}', 0.30, 'A2', 'approved', 'manual', 'transport', 'practice', :'c_a2s1_id', 2),
('reading_comprehension', '{"passage": "Please recycle paper and plastic in the blue bin.", "question": "What color is the recycling bin?", "options": ["Green", "Blue", "Red", "Black"]}', '{"correctIndex": 1}', 0.27, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'c_a2s1_id', 3),
('reading_comprehension', '{"passage": "The library is closed for renovation until March.", "question": "Why is the library closed?", "options": ["Holiday", "Renovation", "Weather", "Staff shortage"]}', '{"correctIndex": 1}', 0.32, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'c_a2s1_id', 4),
('reading_comprehension', '{"passage": "Sale: 20% off all shoes this weekend only.", "question": "How much off are shoes?", "options": ["10%", "20%", "30%", "50%"]}', '{"correctIndex": 1}', 0.29, 'A2', 'approved', 'manual', 'shopping', 'practice', :'c_a2s1_id', 5),
('reading_comprehension', '{"passage": "Gym hours: Mon-Fri 6am-10pm, weekends 8am-8pm.", "question": "What time does the gym open on weekends?", "options": ["6am", "7am", "8am", "9am"]}', '{"correctIndex": 2}', 0.31, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'c_a2s2_id', 1),
('reading_comprehension', '{"passage": "Flight 204 has been delayed by two hours.", "question": "How long is the delay?", "options": ["One hour", "Two hours", "Three hours", "Four hours"]}', '{"correctIndex": 1}', 0.30, 'A2', 'approved', 'manual', 'travel', 'practice', :'c_a2s2_id', 2),
('reading_comprehension', '{"passage": "The pharmacy is between the bakery and the bank.", "question": "What is next to the pharmacy?", "options": ["School and park", "Bakery and bank", "Gym and cafe", "Library and store"]}', '{"correctIndex": 1}', 0.33, 'A2', 'approved', 'manual', 'directions', 'practice', :'c_a2s2_id', 3),
('reading_comprehension', '{"passage": "Meeting moved from Tuesday to Thursday at 2pm.", "question": "What day is the meeting now?", "options": ["Monday", "Tuesday", "Wednesday", "Thursday"]}', '{"correctIndex": 3}', 0.34, 'A2', 'approved', 'manual', 'work', 'practice', :'c_a2s2_id', 4),
('reading_comprehension', '{"passage": "Recipe needs 2 eggs, 1 cup flour, and a pinch of salt.", "question": "How many eggs does the recipe need?", "options": ["1", "2", "3", "4"]}', '{"correctIndex": 1}', 0.26, 'A2', 'approved', 'manual', 'cooking', 'practice', :'c_a2s2_id', 5),
('reading_comprehension', '{"passage": "Despite initial delays, the construction project finished two weeks ahead of its revised schedule.", "question": "How did the project ultimately finish?", "options": ["Two weeks late", "On the original schedule", "Two weeks early", "It was cancelled"]}', '{"correctIndex": 2}', 0.50, 'B1', 'approved', 'manual', 'business', 'practice', :'c_b1s1_id', 1),
('reading_comprehension', '{"passage": "The survey found that most respondents preferred remote work, though a significant minority favored a hybrid arrangement.", "question": "What did most respondents prefer?", "options": ["Office work", "Remote work", "Hybrid work", "No preference"]}', '{"correctIndex": 1}', 0.53, 'B1', 'approved', 'manual', 'work', 'practice', :'c_b1s1_id', 2),
('reading_comprehension', '{"passage": "The new policy applies to all employees hired after January, exempting existing staff from the change.", "question": "Who is exempt from the new policy?", "options": ["New hires", "Existing staff", "Managers only", "No one"]}', '{"correctIndex": 1}', 0.55, 'B1', 'approved', 'manual', 'work', 'practice', :'c_b1s1_id', 3),
('reading_comprehension', '{"passage": "Although the museum''s main hall was closed for repairs, the east wing remained open to visitors.", "question": "Which part of the museum stayed open?", "options": ["Main hall", "East wing", "The whole museum", "None of it"]}', '{"correctIndex": 1}', 0.47, 'B1', 'approved', 'manual', 'culture', 'practice', :'c_b1s1_id', 4),
('reading_comprehension', '{"passage": "Economists warned that the proposed tax changes could slow growth, even as supporters argued they would boost investment.", "question": "What did economists warn about?", "options": ["Faster growth", "Slower growth", "No change", "Higher taxes for everyone"]}', '{"correctIndex": 1}', 0.57, 'B1', 'approved', 'manual', 'business', 'practice', :'c_b1s1_id', 5),
('reading_comprehension', '{"passage": "The committee approved the budget unanimously after months of revisions to the original proposal.", "question": "How was the budget approved?", "options": ["Unanimously", "By a narrow vote", "It was rejected", "It was postponed"]}', '{"correctIndex": 0}', 0.51, 'B1', 'approved', 'manual', 'business', 'practice', :'c_b1s2_id', 1),
('reading_comprehension', '{"passage": "Despite forecasts predicting rain, the outdoor festival went ahead as scheduled and drew record attendance.", "question": "What happened to the festival?", "options": ["It was cancelled", "It was postponed", "It went ahead", "It moved indoors"]}', '{"correctIndex": 2}', 0.49, 'B1', 'approved', 'manual', 'events', 'practice', :'c_b1s2_id', 2),
('reading_comprehension', '{"passage": "The professor''s revised grading criteria drew criticism from students who felt it was applied inconsistently.", "question": "What did students criticize?", "options": ["The lecture topic", "The grading criteria", "The classroom", "The textbook"]}', '{"correctIndex": 1}', 0.54, 'B1', 'approved', 'manual', 'education', 'practice', :'c_b1s2_id', 3),
('reading_comprehension', '{"passage": "Negotiators reached a preliminary agreement, though several key details remain unresolved ahead of final talks.", "question": "What is still unresolved?", "options": ["Nothing", "Several key details", "The entire agreement", "The location of talks"]}', '{"correctIndex": 1}', 0.58, 'B1', 'approved', 'manual', 'politics', 'practice', :'c_b1s2_id', 4),
('reading_comprehension', '{"passage": "The report concluded that while emissions had declined overall, certain sectors saw a slight increase.", "question": "What happened in certain sectors?", "options": ["A large decline", "A slight increase", "No change at all", "Complete elimination"]}', '{"correctIndex": 1}', 0.52, 'B1', 'approved', 'manual', 'science', 'practice', :'c_b1s2_id', 5);

COMMIT;
