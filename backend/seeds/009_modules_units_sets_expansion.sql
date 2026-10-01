-- Expansion: units/sets for the remaining 16 item types, same structure as the
-- pilot (008): 3 units per type (A1/A2/B1), 2 sets per unit, 5 questions per set.
-- Calibration matches 008's own note: A1 0.10-0.15, A2 0.25-0.35, B1 0.45-0.58.
BEGIN;

-- ===================== short_answer =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('short_answer', 'A1 - Beginner', 1) RETURNING id \gset t0_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('short_answer', 'A2 - Elementary', 2) RETURNING id \gset t0_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('short_answer', 'B1 - Intermediate', 3) RETURNING id \gset t0_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t0_a1_id', 'Set 1', 1) RETURNING id \gset t0_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t0_a1_id', 'Set 2', 2) RETURNING id \gset t0_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t0_a2_id', 'Set 1', 1) RETURNING id \gset t0_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t0_a2_id', 'Set 2', 2) RETURNING id \gset t0_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t0_b1_id', 'Set 1', 1) RETURNING id \gset t0_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t0_b1_id', 'Set 2', 2) RETURNING id \gset t0_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('short_answer', '{"question": "Is milk a liquid or a solid?"}', 0.1, 'A1', 'approved', 'manual', 'science', 'practice', :'t0_a1s1_id', 1),
('short_answer', '{"question": "Is the sun hot or cold?"}', 0.11, 'A1', 'approved', 'manual', 'science', 'practice', :'t0_a1s1_id', 2),
('short_answer', '{"question": "Do fish live in water or in trees?"}', 0.11, 'A1', 'approved', 'manual', 'nature', 'practice', :'t0_a1s1_id', 3),
('short_answer', '{"question": "Is a car bigger than a bicycle?"}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t0_a1s1_id', 4),
('short_answer', '{"question": "Do you eat breakfast in the morning or at night?"}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t0_a1s1_id', 5),
('short_answer', '{"question": "Is ice cold or warm?"}', 0.13, 'A1', 'approved', 'manual', 'science', 'practice', :'t0_a1s2_id', 1),
('short_answer', '{"question": "Do birds fly or swim?"}', 0.13, 'A1', 'approved', 'manual', 'nature', 'practice', :'t0_a1s2_id', 2),
('short_answer', '{"question": "Is a week shorter than a year?"}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t0_a1s2_id', 3),
('short_answer', '{"question": "Do you sleep at night or in the afternoon?"}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t0_a1s2_id', 4),
('short_answer', '{"question": "Is an apple a fruit or a vegetable?"}', 0.15, 'A1', 'approved', 'manual', 'food', 'practice', :'t0_a1s2_id', 5),
('short_answer', '{"question": "Why do people usually carry an umbrella?"}', 0.25, 'A2', 'approved', 'manual', 'weather', 'practice', :'t0_a2s1_id', 1),
('short_answer', '{"question": "What do you need to borrow a book from a library?"}', 0.26, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t0_a2s1_id', 2),
('short_answer', '{"question": "Why do we put food in a refrigerator?"}', 0.27, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t0_a2s1_id', 3),
('short_answer', '{"question": "What should you do before crossing a busy road?"}', 0.28, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t0_a2s1_id', 4),
('short_answer', '{"question": "Why do students take notes in class?"}', 0.29, 'A2', 'approved', 'manual', 'education', 'practice', :'t0_a2s1_id', 5),
('short_answer', '{"question": "What do you usually do on your day off?"}', 0.31, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t0_a2s2_id', 1),
('short_answer', '{"question": "Why is exercise good for your health?"}', 0.32, 'A2', 'approved', 'manual', 'health', 'practice', :'t0_a2s2_id', 2),
('short_answer', '{"question": "What do you need to send a letter?"}', 0.33, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t0_a2s2_id', 3),
('short_answer', '{"question": "Why do people go to the doctor?"}', 0.34, 'A2', 'approved', 'manual', 'health', 'practice', :'t0_a2s2_id', 4),
('short_answer', '{"question": "What time do most offices usually open?"}', 0.35, 'A2', 'approved', 'manual', 'work', 'practice', :'t0_a2s2_id', 5),
('short_answer', '{"question": "Why might a company decide to work remotely instead of in an office?"}', 0.45, 'B1', 'approved', 'manual', 'work', 'practice', :'t0_b1s1_id', 1),
('short_answer', '{"question": "What are the benefits of learning a second language?"}', 0.46, 'B1', 'approved', 'manual', 'education', 'practice', :'t0_b1s1_id', 2),
('short_answer', '{"question": "Why is recycling important for the environment?"}', 0.48, 'B1', 'approved', 'manual', 'environment', 'practice', :'t0_b1s1_id', 3),
('short_answer', '{"question": "What challenges do people face when moving to a new city?"}', 0.49, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t0_b1s1_id', 4),
('short_answer', '{"question": "Why do some people prefer public transport over driving?"}', 0.51, 'B1', 'approved', 'manual', 'transport', 'practice', :'t0_b1s1_id', 5),
('short_answer', '{"question": "What makes a good leader in the workplace?"}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', :'t0_b1s2_id', 1),
('short_answer', '{"question": "Why is it important to save money regularly?"}', 0.54, 'B1', 'approved', 'manual', 'finance', 'practice', :'t0_b1s2_id', 2),
('short_answer', '{"question": "What are the advantages of reading books regularly?"}', 0.55, 'B1', 'approved', 'manual', 'education', 'practice', :'t0_b1s2_id', 3),
('short_answer', '{"question": "Why do many people feel stressed at work?"}', 0.57, 'B1', 'approved', 'manual', 'work', 'practice', :'t0_b1s2_id', 4),
('short_answer', '{"question": "What can communities do to reduce pollution?"}', 0.58, 'B1', 'approved', 'manual', 'environment', 'practice', :'t0_b1s2_id', 5);

-- ===================== open_questions =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('open_questions', 'A1 - Beginner', 1) RETURNING id \gset t1_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('open_questions', 'A2 - Elementary', 2) RETURNING id \gset t1_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('open_questions', 'B1 - Intermediate', 3) RETURNING id \gset t1_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t1_a1_id', 'Set 1', 1) RETURNING id \gset t1_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t1_a1_id', 'Set 2', 2) RETURNING id \gset t1_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t1_a2_id', 'Set 1', 1) RETURNING id \gset t1_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t1_a2_id', 'Set 2', 2) RETURNING id \gset t1_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t1_b1_id', 'Set 1', 1) RETURNING id \gset t1_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t1_b1_id', 'Set 2', 2) RETURNING id \gset t1_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('open_questions', '{"prompt": "What is your favorite color?"}', 0.1, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t1_a1s1_id', 1),
('open_questions', '{"prompt": "What do you like to eat for breakfast?"}', 0.11, 'A1', 'approved', 'manual', 'food', 'practice', :'t1_a1s1_id', 2),
('open_questions', '{"prompt": "Who is your best friend?"}', 0.11, 'A1', 'approved', 'manual', 'family', 'practice', :'t1_a1s1_id', 3),
('open_questions', '{"prompt": "What is your favorite animal?"}', 0.12, 'A1', 'approved', 'manual', 'nature', 'practice', :'t1_a1s1_id', 4),
('open_questions', '{"prompt": "What do you do on weekends?"}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t1_a1s1_id', 5),
('open_questions', '{"prompt": "What is your favorite game?"}', 0.13, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t1_a1s2_id', 1),
('open_questions', '{"prompt": "Where do you live?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t1_a1s2_id', 2),
('open_questions', '{"prompt": "What is your favorite season?"}', 0.14, 'A1', 'approved', 'manual', 'weather', 'practice', :'t1_a1s2_id', 3),
('open_questions', '{"prompt": "What do you like to drink?"}', 0.14, 'A1', 'approved', 'manual', 'food', 'practice', :'t1_a1s2_id', 4),
('open_questions', '{"prompt": "What is your favorite subject at school?"}', 0.15, 'A1', 'approved', 'manual', 'education', 'practice', :'t1_a1s2_id', 5),
('open_questions', '{"prompt": "How do you usually spend your evenings?"}', 0.25, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t1_a2s1_id', 1),
('open_questions', '{"prompt": "What kind of music do you enjoy listening to?"}', 0.26, 'A2', 'approved', 'manual', 'hobbies', 'practice', :'t1_a2s1_id', 2),
('open_questions', '{"prompt": "Describe a place you would like to visit someday."}', 0.27, 'A2', 'approved', 'manual', 'travel', 'practice', :'t1_a2s1_id', 3),
('open_questions', '{"prompt": "What do you usually do to relax after a busy day?"}', 0.28, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t1_a2s1_id', 4),
('open_questions', '{"prompt": "Tell me about a hobby you enjoy and why."}', 0.29, 'A2', 'approved', 'manual', 'hobbies', 'practice', :'t1_a2s1_id', 5),
('open_questions', '{"prompt": "What is your favorite way to spend a holiday?"}', 0.31, 'A2', 'approved', 'manual', 'travel', 'practice', :'t1_a2s2_id', 1),
('open_questions', '{"prompt": "Describe your typical morning routine."}', 0.32, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t1_a2s2_id', 2),
('open_questions', '{"prompt": "What kind of movies do you like to watch?"}', 0.33, 'A2', 'approved', 'manual', 'entertainment', 'practice', :'t1_a2s2_id', 3),
('open_questions', '{"prompt": "How do you usually celebrate your birthday?"}', 0.34, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t1_a2s2_id', 4),
('open_questions', '{"prompt": "What is something new you learned recently?"}', 0.35, 'A2', 'approved', 'manual', 'education', 'practice', :'t1_a2s2_id', 5),
('open_questions', '{"prompt": "What changes would you like to see in your city?"}', 0.45, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t1_b1s1_id', 1),
('open_questions', '{"prompt": "How has technology changed the way we communicate?"}', 0.46, 'B1', 'approved', 'manual', 'technology', 'practice', :'t1_b1s1_id', 2),
('open_questions', '{"prompt": "What do you think makes someone successful in their career?"}', 0.48, 'B1', 'approved', 'manual', 'work', 'practice', :'t1_b1s1_id', 3),
('open_questions', '{"prompt": "Describe a difficult decision you had to make and how you handled it."}', 0.49, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t1_b1s1_id', 4),
('open_questions', '{"prompt": "What role does travel play in personal growth?"}', 0.51, 'B1', 'approved', 'manual', 'travel', 'practice', :'t1_b1s1_id', 5),
('open_questions', '{"prompt": "How do you think education will change in the next ten years?"}', 0.52, 'B1', 'approved', 'manual', 'education', 'practice', :'t1_b1s2_id', 1),
('open_questions', '{"prompt": "What are the pros and cons of working from home?"}', 0.54, 'B1', 'approved', 'manual', 'work', 'practice', :'t1_b1s2_id', 2),
('open_questions', '{"prompt": "Describe a book or movie that influenced the way you think."}', 0.55, 'B1', 'approved', 'manual', 'entertainment', 'practice', :'t1_b1s2_id', 3),
('open_questions', '{"prompt": "What steps can individuals take to live a healthier lifestyle?"}', 0.57, 'B1', 'approved', 'manual', 'health', 'practice', :'t1_b1s2_id', 4),
('open_questions', '{"prompt": "How important is it to maintain a work-life balance?"}', 0.58, 'B1', 'approved', 'manual', 'work', 'practice', :'t1_b1s2_id', 5);

-- ===================== dictation =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('dictation', 'A1 - Beginner', 1) RETURNING id \gset t2_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('dictation', 'A2 - Elementary', 2) RETURNING id \gset t2_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('dictation', 'B1 - Intermediate', 3) RETURNING id \gset t2_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t2_a1_id', 'Set 1', 1) RETURNING id \gset t2_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t2_a1_id', 'Set 2', 2) RETURNING id \gset t2_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t2_a2_id', 'Set 1', 1) RETURNING id \gset t2_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t2_a2_id', 'Set 2', 2) RETURNING id \gset t2_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t2_b1_id', 'Set 1', 1) RETURNING id \gset t2_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t2_b1_id', 'Set 2', 2) RETURNING id \gset t2_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('dictation', '{"text": "My brother works at a bank."}', 0.1, 'A1', 'approved', 'manual', 'family', 'practice', :'t2_a1s1_id', 1),
('dictation', '{"text": "She has a small dog."}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t2_a1s1_id', 2),
('dictation', '{"text": "We go to school by bus."}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t2_a1s1_id', 3),
('dictation', '{"text": "He likes to play football."}', 0.12, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t2_a1s1_id', 4),
('dictation', '{"text": "I drink tea every morning."}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t2_a1s1_id', 5),
('dictation', '{"text": "The shop is next to my house."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t2_a1s2_id', 1),
('dictation', '{"text": "My mother cooks dinner every night."}', 0.13, 'A1', 'approved', 'manual', 'family', 'practice', :'t2_a1s2_id', 2),
('dictation', '{"text": "They live in a big city."}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t2_a1s2_id', 3),
('dictation', '{"text": "I have two sisters."}', 0.14, 'A1', 'approved', 'manual', 'family', 'practice', :'t2_a1s2_id', 4),
('dictation', '{"text": "The weather is nice today."}', 0.15, 'A1', 'approved', 'manual', 'weather', 'practice', :'t2_a1s2_id', 5),
('dictation', '{"text": "We usually visit our grandparents on weekends."}', 0.25, 'A2', 'approved', 'manual', 'family', 'practice', :'t2_a2s1_id', 1),
('dictation', '{"text": "She has been learning English for two years."}', 0.26, 'A2', 'approved', 'manual', 'education', 'practice', :'t2_a2s1_id', 2),
('dictation', '{"text": "The train arrives at the station every hour."}', 0.27, 'A2', 'approved', 'manual', 'transport', 'practice', :'t2_a2s1_id', 3),
('dictation', '{"text": "He always finishes his homework before dinner."}', 0.28, 'A2', 'approved', 'manual', 'education', 'practice', :'t2_a2s1_id', 4),
('dictation', '{"text": "I need to buy some vegetables from the market."}', 0.29, 'A2', 'approved', 'manual', 'food', 'practice', :'t2_a2s1_id', 5),
('dictation', '{"text": "The children were playing in the garden."}', 0.31, 'A2', 'approved', 'manual', 'family', 'practice', :'t2_a2s2_id', 1),
('dictation', '{"text": "My father drives to work every morning."}', 0.32, 'A2', 'approved', 'manual', 'work', 'practice', :'t2_a2s2_id', 2),
('dictation', '{"text": "We are planning a trip to the mountains."}', 0.33, 'A2', 'approved', 'manual', 'travel', 'practice', :'t2_a2s2_id', 3),
('dictation', '{"text": "She enjoys reading books in her free time."}', 0.34, 'A2', 'approved', 'manual', 'hobbies', 'practice', :'t2_a2s2_id', 4),
('dictation', '{"text": "The meeting has been postponed until next week."}', 0.35, 'A2', 'approved', 'manual', 'work', 'practice', :'t2_a2s2_id', 5),
('dictation', '{"text": "Despite the heavy rain, the match continued as planned."}', 0.45, 'B1', 'approved', 'manual', 'sports', 'practice', :'t2_b1s1_id', 1),
('dictation', '{"text": "The company announced a new policy for remote employees."}', 0.46, 'B1', 'approved', 'manual', 'work', 'practice', :'t2_b1s1_id', 2),
('dictation', '{"text": "She has been working on this project for several months."}', 0.48, 'B1', 'approved', 'manual', 'work', 'practice', :'t2_b1s1_id', 3),
('dictation', '{"text": "The government introduced new measures to reduce pollution."}', 0.49, 'B1', 'approved', 'manual', 'environment', 'practice', :'t2_b1s1_id', 4),
('dictation', '{"text": "Although he was tired, he finished the marathon."}', 0.51, 'B1', 'approved', 'manual', 'sports', 'practice', :'t2_b1s1_id', 5),
('dictation', '{"text": "The scientists published their findings last month."}', 0.52, 'B1', 'approved', 'manual', 'science', 'practice', :'t2_b1s2_id', 1),
('dictation', '{"text": "Many students struggle to balance study and part-time work."}', 0.54, 'B1', 'approved', 'manual', 'education', 'practice', :'t2_b1s2_id', 2),
('dictation', '{"text": "The economy has shown signs of steady improvement."}', 0.55, 'B1', 'approved', 'manual', 'finance', 'practice', :'t2_b1s2_id', 3),
('dictation', '{"text": "Volunteers worked all weekend to clean the riverbank."}', 0.57, 'B1', 'approved', 'manual', 'environment', 'practice', :'t2_b1s2_id', 4),
('dictation', '{"text": "The committee will review the proposal next Tuesday."}', 0.58, 'B1', 'approved', 'manual', 'work', 'practice', :'t2_b1s2_id', 5);

-- ===================== sentence_completion =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('sentence_completion', 'A1 - Beginner', 1) RETURNING id \gset t3_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('sentence_completion', 'A2 - Elementary', 2) RETURNING id \gset t3_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('sentence_completion', 'B1 - Intermediate', 3) RETURNING id \gset t3_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t3_a1_id', 'Set 1', 1) RETURNING id \gset t3_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t3_a1_id', 'Set 2', 2) RETURNING id \gset t3_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t3_a2_id', 'Set 1', 1) RETURNING id \gset t3_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t3_a2_id', 'Set 2', 2) RETURNING id \gset t3_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t3_b1_id', 'Set 1', 1) RETURNING id \gset t3_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t3_b1_id', 'Set 2', 2) RETURNING id \gset t3_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('sentence_completion', '{"sentence": "I ___ a teacher."}', 0.1, 'A1', 'approved', 'manual', 'work', 'practice', :'t3_a1s1_id', 1),
('sentence_completion', '{"sentence": "She ___ my sister."}', 0.11, 'A1', 'approved', 'manual', 'family', 'practice', :'t3_a1s1_id', 2),
('sentence_completion', '{"sentence": "They ___ my friends."}', 0.11, 'A1', 'approved', 'manual', 'family', 'practice', :'t3_a1s1_id', 3),
('sentence_completion', '{"sentence": "He ___ to school every day."}', 0.12, 'A1', 'approved', 'manual', 'education', 'practice', :'t3_a1s1_id', 4),
('sentence_completion', '{"sentence": "We ___ tea in the morning."}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t3_a1s1_id', 5),
('sentence_completion', '{"sentence": "The cat ___ on the bed."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t3_a1s2_id', 1),
('sentence_completion', '{"sentence": "I ___ two brothers."}', 0.13, 'A1', 'approved', 'manual', 'family', 'practice', :'t3_a1s2_id', 2),
('sentence_completion', '{"sentence": "She ___ a red car."}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t3_a1s2_id', 3),
('sentence_completion', '{"sentence": "We ___ in a small house."}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t3_a1s2_id', 4),
('sentence_completion', '{"sentence": "He ___ football on Sundays."}', 0.15, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t3_a1s2_id', 5),
('sentence_completion', '{"sentence": "She ___ to the gym three times a week."}', 0.25, 'A2', 'approved', 'manual', 'health', 'practice', :'t3_a2s1_id', 1),
('sentence_completion', '{"sentence": "By the time we arrived, the movie ___ already started."}', 0.26, 'A2', 'approved', 'manual', 'entertainment', 'practice', :'t3_a2s1_id', 2),
('sentence_completion', '{"sentence": "If it rains tomorrow, we ___ stay at home."}', 0.27, 'A2', 'approved', 'manual', 'weather', 'practice', :'t3_a2s1_id', 3),
('sentence_completion', '{"sentence": "He ___ working here since 2019."}', 0.28, 'A2', 'approved', 'manual', 'work', 'practice', :'t3_a2s1_id', 4),
('sentence_completion', '{"sentence": "They ___ dinner when the phone rang."}', 0.29, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t3_a2s1_id', 5),
('sentence_completion', '{"sentence": "I ___ my homework before I watch TV."}', 0.31, 'A2', 'approved', 'manual', 'education', 'practice', :'t3_a2s2_id', 1),
('sentence_completion', '{"sentence": "She would like ___ a doctor someday."}', 0.32, 'A2', 'approved', 'manual', 'work', 'practice', :'t3_a2s2_id', 2),
('sentence_completion', '{"sentence": "We ___ never been to Paris before."}', 0.33, 'A2', 'approved', 'manual', 'travel', 'practice', :'t3_a2s2_id', 3),
('sentence_completion', '{"sentence": "He is ___ than his older brother."}', 0.34, 'A2', 'approved', 'manual', 'family', 'practice', :'t3_a2s2_id', 4),
('sentence_completion', '{"sentence": "You ___ wear a helmet when riding a bike."}', 0.35, 'A2', 'approved', 'manual', 'health', 'practice', :'t3_a2s2_id', 5),
('sentence_completion', '{"sentence": "If I ___ known about the meeting, I would have attended."}', 0.45, 'B1', 'approved', 'manual', 'work', 'practice', :'t3_b1s1_id', 1),
('sentence_completion', '{"sentence": "The report ___ be finished by the manager before Friday."}', 0.46, 'B1', 'approved', 'manual', 'work', 'practice', :'t3_b1s1_id', 2),
('sentence_completion', '{"sentence": "She suggested ___ the project to a later date."}', 0.48, 'B1', 'approved', 'manual', 'work', 'practice', :'t3_b1s1_id', 3),
('sentence_completion', '{"sentence": "Had I known the traffic would be bad, I ___ have left earlier."}', 0.49, 'B1', 'approved', 'manual', 'transport', 'practice', :'t3_b1s1_id', 4),
('sentence_completion', '{"sentence": "The new policy ___ into effect next month."}', 0.51, 'B1', 'approved', 'manual', 'work', 'practice', :'t3_b1s1_id', 5),
('sentence_completion', '{"sentence": "He admitted ___ a mistake in the calculation."}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', :'t3_b1s2_id', 1),
('sentence_completion', '{"sentence": "Despite ___ hard, he did not pass the exam."}', 0.54, 'B1', 'approved', 'manual', 'education', 'practice', :'t3_b1s2_id', 2),
('sentence_completion', '{"sentence": "The buildings ___ completed by the end of this year."}', 0.55, 'B1', 'approved', 'manual', 'work', 'practice', :'t3_b1s2_id', 3),
('sentence_completion', '{"sentence": "She is not used to ___ up so early."}', 0.57, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t3_b1s2_id', 4),
('sentence_completion', '{"sentence": "The team ___ working on the issue since Monday."}', 0.58, 'B1', 'approved', 'manual', 'work', 'practice', :'t3_b1s2_id', 5);

-- ===================== sentence_builds =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('sentence_builds', 'A1 - Beginner', 1) RETURNING id \gset t4_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('sentence_builds', 'A2 - Elementary', 2) RETURNING id \gset t4_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('sentence_builds', 'B1 - Intermediate', 3) RETURNING id \gset t4_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t4_a1_id', 'Set 1', 1) RETURNING id \gset t4_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t4_a1_id', 'Set 2', 2) RETURNING id \gset t4_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t4_a2_id', 'Set 1', 1) RETURNING id \gset t4_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t4_a2_id', 'Set 2', 2) RETURNING id \gset t4_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t4_b1_id', 'Set 1', 1) RETURNING id \gset t4_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t4_b1_id', 'Set 2', 2) RETURNING id \gset t4_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('sentence_builds', '{"groups": ["is", "this", "my bag"]}', 0.1, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t4_a1s1_id', 1),
('sentence_builds', '{"groups": ["have", "i", "a pen"]}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t4_a1s1_id', 2),
('sentence_builds', '{"groups": ["is", "she", "my mother"]}', 0.11, 'A1', 'approved', 'manual', 'family', 'practice', :'t4_a1s1_id', 3),
('sentence_builds', '{"groups": ["play", "we", "football"]}', 0.12, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t4_a1s1_id', 4),
('sentence_builds', '{"groups": ["is", "he", "a student"]}', 0.12, 'A1', 'approved', 'manual', 'education', 'practice', :'t4_a1s1_id', 5),
('sentence_builds', '{"groups": ["like", "i", "apples"]}', 0.13, 'A1', 'approved', 'manual', 'food', 'practice', :'t4_a1s2_id', 1),
('sentence_builds', '{"groups": ["is", "the cat", "black"]}', 0.13, 'A1', 'approved', 'manual', 'nature', 'practice', :'t4_a1s2_id', 2),
('sentence_builds', '{"groups": ["go", "we", "to school"]}', 0.14, 'A1', 'approved', 'manual', 'education', 'practice', :'t4_a1s2_id', 3),
('sentence_builds', '{"groups": ["is", "my house", "big"]}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t4_a1s2_id', 4),
('sentence_builds', '{"groups": ["have", "they", "a car"]}', 0.15, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t4_a1s2_id', 5),
('sentence_builds', '{"groups": ["usually", "wakes up", "she", "at seven"]}', 0.25, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t4_a2s1_id', 1),
('sentence_builds', '{"groups": ["has been", "he", "working here", "for two years"]}', 0.26, 'A2', 'approved', 'manual', 'work', 'practice', :'t4_a2s1_id', 2),
('sentence_builds', '{"groups": ["is going to", "it", "rain", "tomorrow"]}', 0.27, 'A2', 'approved', 'manual', 'weather', 'practice', :'t4_a2s1_id', 3),
('sentence_builds', '{"groups": ["enjoys", "she", "reading books", "in the evening"]}', 0.28, 'A2', 'approved', 'manual', 'hobbies', 'practice', :'t4_a2s1_id', 4),
('sentence_builds', '{"groups": ["needs to", "he", "finish", "his homework"]}', 0.29, 'A2', 'approved', 'manual', 'education', 'practice', :'t4_a2s1_id', 5),
('sentence_builds', '{"groups": ["are", "we", "planning", "a trip"]}', 0.31, 'A2', 'approved', 'manual', 'travel', 'practice', :'t4_a2s2_id', 1),
('sentence_builds', '{"groups": ["has", "she", "two brothers", "and a sister"]}', 0.32, 'A2', 'approved', 'manual', 'family', 'practice', :'t4_a2s2_id', 2),
('sentence_builds', '{"groups": ["is", "the meeting", "scheduled", "for Monday"]}', 0.33, 'A2', 'approved', 'manual', 'work', 'practice', :'t4_a2s2_id', 3),
('sentence_builds', '{"groups": ["likes to", "he", "cook", "on weekends"]}', 0.34, 'A2', 'approved', 'manual', 'hobbies', 'practice', :'t4_a2s2_id', 4),
('sentence_builds', '{"groups": ["is", "my sister", "studying", "to become a nurse"]}', 0.35, 'A2', 'approved', 'manual', 'family', 'practice', :'t4_a2s2_id', 5),
('sentence_builds', '{"groups": ["despite", "the rain", "the match", "continued"]}', 0.45, 'B1', 'approved', 'manual', 'sports', 'practice', :'t4_b1s1_id', 1),
('sentence_builds', '{"groups": ["if", "i", "had known", "i would have come"]}', 0.46, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t4_b1s1_id', 2),
('sentence_builds', '{"groups": ["the company", "announced", "a new policy", "last week"]}', 0.48, 'B1', 'approved', 'manual', 'work', 'practice', :'t4_b1s1_id', 3),
('sentence_builds', '{"groups": ["although", "he", "was tired", "he finished the race"]}', 0.49, 'B1', 'approved', 'manual', 'sports', 'practice', :'t4_b1s1_id', 4),
('sentence_builds', '{"groups": ["the government", "introduced", "new measures", "to reduce pollution"]}', 0.51, 'B1', 'approved', 'manual', 'environment', 'practice', :'t4_b1s1_id', 5),
('sentence_builds', '{"groups": ["she", "has been", "working on", "this project for months"]}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', :'t4_b1s2_id', 1),
('sentence_builds', '{"groups": ["many students", "struggle to", "balance", "study and work"]}', 0.54, 'B1', 'approved', 'manual', 'education', 'practice', :'t4_b1s2_id', 2),
('sentence_builds', '{"groups": ["the committee", "will review", "the proposal", "next Tuesday"]}', 0.55, 'B1', 'approved', 'manual', 'work', 'practice', :'t4_b1s2_id', 3),
('sentence_builds', '{"groups": ["volunteers", "worked", "all weekend", "to clean the river"]}', 0.57, 'B1', 'approved', 'manual', 'environment', 'practice', :'t4_b1s2_id', 4),
('sentence_builds', '{"groups": ["the economy", "has shown", "signs of", "steady improvement"]}', 0.58, 'B1', 'approved', 'manual', 'finance', 'practice', :'t4_b1s2_id', 5);

-- ===================== passage_reconstruction =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('passage_reconstruction', 'A1 - Beginner', 1) RETURNING id \gset t5_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('passage_reconstruction', 'A2 - Elementary', 2) RETURNING id \gset t5_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('passage_reconstruction', 'B1 - Intermediate', 3) RETURNING id \gset t5_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t5_a1_id', 'Set 1', 1) RETURNING id \gset t5_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t5_a1_id', 'Set 2', 2) RETURNING id \gset t5_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t5_a2_id', 'Set 1', 1) RETURNING id \gset t5_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t5_a2_id', 'Set 2', 2) RETURNING id \gset t5_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t5_b1_id', 'Set 1', 1) RETURNING id \gset t5_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t5_b1_id', 'Set 2', 2) RETURNING id \gset t5_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('passage_reconstruction', '{"passage": "Ben has a cat. The cat is white."}', 0.1, 'A1', 'approved', 'manual', 'nature', 'practice', :'t5_a1s1_id', 1),
('passage_reconstruction', '{"passage": "I have a dog. My dog is small."}', 0.11, 'A1', 'approved', 'manual', 'nature', 'practice', :'t5_a1s1_id', 2),
('passage_reconstruction', '{"passage": "She has a book. The book is blue."}', 0.11, 'A1', 'approved', 'manual', 'education', 'practice', :'t5_a1s1_id', 3),
('passage_reconstruction', '{"passage": "We have a car. The car is new."}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t5_a1s1_id', 4),
('passage_reconstruction', '{"passage": "He has a ball. The ball is red."}', 0.12, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t5_a1s1_id', 5),
('passage_reconstruction', '{"passage": "My mother cooks food. The food is tasty."}', 0.13, 'A1', 'approved', 'manual', 'family', 'practice', :'t5_a1s2_id', 1),
('passage_reconstruction', '{"passage": "I go to school. The school is near."}', 0.13, 'A1', 'approved', 'manual', 'education', 'practice', :'t5_a1s2_id', 2),
('passage_reconstruction', '{"passage": "She has a bag. The bag is pink."}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t5_a1s2_id', 3),
('passage_reconstruction', '{"passage": "We live in a house. The house is big."}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t5_a1s2_id', 4),
('passage_reconstruction', '{"passage": "He plays a game. The game is fun."}', 0.15, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t5_a1s2_id', 5),
('passage_reconstruction', '{"passage": "Tom woke up early. He made breakfast for his family. Then he went to work."}', 0.25, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t5_a2s1_id', 1),
('passage_reconstruction', '{"passage": "Mia visited her grandmother. They drank tea together. Mia told her about school."}', 0.26, 'A2', 'approved', 'manual', 'family', 'practice', :'t5_a2s1_id', 2),
('passage_reconstruction', '{"passage": "The students arrived at the museum. They looked at old paintings. Then they had lunch."}', 0.27, 'A2', 'approved', 'manual', 'education', 'practice', :'t5_a2s1_id', 3),
('passage_reconstruction', '{"passage": "Raj took the bus to work. The bus was late. He arrived a few minutes after nine."}', 0.28, 'A2', 'approved', 'manual', 'transport', 'practice', :'t5_a2s1_id', 4),
('passage_reconstruction', '{"passage": "Lily bought vegetables at the market. She cooked soup for dinner. Her family enjoyed it."}', 0.29, 'A2', 'approved', 'manual', 'food', 'practice', :'t5_a2s1_id', 5),
('passage_reconstruction', '{"passage": "The team practiced in the park. They played for two hours. Afterward they rested."}', 0.31, 'A2', 'approved', 'manual', 'sports', 'practice', :'t5_a2s2_id', 1),
('passage_reconstruction', '{"passage": "Sam read a book before bed. The story was about a journey. He fell asleep quickly."}', 0.32, 'A2', 'approved', 'manual', 'hobbies', 'practice', :'t5_a2s2_id', 2),
('passage_reconstruction', '{"passage": "The teacher explained the lesson. Students asked many questions. Class ended on time."}', 0.33, 'A2', 'approved', 'manual', 'education', 'practice', :'t5_a2s2_id', 3),
('passage_reconstruction', '{"passage": "Anna packed her bag for the trip. She checked the weather first. It was sunny."}', 0.34, 'A2', 'approved', 'manual', 'travel', 'practice', :'t5_a2s2_id', 4),
('passage_reconstruction', '{"passage": "The shop opened at nine. Customers came in quickly. The owner was happy."}', 0.35, 'A2', 'approved', 'manual', 'work', 'practice', :'t5_a2s2_id', 5),
('passage_reconstruction', '{"passage": "The company launched a new product last month. Sales increased quickly. Managers were pleased with the results."}', 0.45, 'B1', 'approved', 'manual', 'work', 'practice', :'t5_b1s1_id', 1),
('passage_reconstruction', '{"passage": "Scientists studied the river for a year. They found pollution levels had dropped. Local groups celebrated the news."}', 0.46, 'B1', 'approved', 'manual', 'environment', 'practice', :'t5_b1s1_id', 2),
('passage_reconstruction', '{"passage": "After months of practice, the team reached the finals. Supporters traveled far to watch. The match ended in a close win."}', 0.48, 'B1', 'approved', 'manual', 'sports', 'practice', :'t5_b1s1_id', 3),
('passage_reconstruction', '{"passage": "The city built a new library downtown. Students use it for study groups. It has become a popular meeting place."}', 0.49, 'B1', 'approved', 'manual', 'education', 'practice', :'t5_b1s1_id', 4),
('passage_reconstruction', '{"passage": "A young entrepreneur started a small business online. Within a year, it had grown significantly. She hired her first employees."}', 0.51, 'B1', 'approved', 'manual', 'work', 'practice', :'t5_b1s1_id', 5),
('passage_reconstruction', '{"passage": "Doctors recommended more exercise for better health. Many patients began walking daily. Over time, their energy improved."}', 0.52, 'B1', 'approved', 'manual', 'health', 'practice', :'t5_b1s2_id', 1),
('passage_reconstruction', '{"passage": "The village faced water shortages every summer. Engineers built a new system. Now water reaches every home."}', 0.54, 'B1', 'approved', 'manual', 'environment', 'practice', :'t5_b1s2_id', 2),
('passage_reconstruction', '{"passage": "A writer spent years researching her novel. She traveled to several countries. The book was finally published last spring."}', 0.55, 'B1', 'approved', 'manual', 'entertainment', 'practice', :'t5_b1s2_id', 3),
('passage_reconstruction', '{"passage": "The airline introduced a new route to the coast. Tickets sold out within days. Travelers were excited for the opening."}', 0.57, 'B1', 'approved', 'manual', 'travel', 'practice', :'t5_b1s2_id', 4),
('passage_reconstruction', '{"passage": "The factory adopted new safety rules. Accidents dropped sharply. Workers felt more confident at their jobs."}', 0.58, 'B1', 'approved', 'manual', 'work', 'practice', :'t5_b1s2_id', 5);

-- ===================== story_retelling =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('story_retelling', 'A1 - Beginner', 1) RETURNING id \gset t6_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('story_retelling', 'A2 - Elementary', 2) RETURNING id \gset t6_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('story_retelling', 'B1 - Intermediate', 3) RETURNING id \gset t6_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t6_a1_id', 'Set 1', 1) RETURNING id \gset t6_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t6_a1_id', 'Set 2', 2) RETURNING id \gset t6_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t6_a2_id', 'Set 1', 1) RETURNING id \gset t6_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t6_a2_id', 'Set 2', 2) RETURNING id \gset t6_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t6_b1_id', 'Set 1', 1) RETURNING id \gset t6_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t6_b1_id', 'Set 2', 2) RETURNING id \gset t6_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('story_retelling', '{"story": "Sam has a cat. The cat likes to sleep all day and never wants to play."}', 0.1, 'A1', 'approved', 'manual', 'nature', 'practice', :'t6_a1s1_id', 1),
('story_retelling', '{"story": "Lily has a red bike. She rides it to the park every day after school."}', 0.11, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t6_a1s1_id', 2),
('story_retelling', '{"story": "Tom likes apples. He eats one apple every morning before school."}', 0.11, 'A1', 'approved', 'manual', 'food', 'practice', :'t6_a1s1_id', 3),
('story_retelling', '{"story": "Mia has a small garden. She grows flowers and waters them every day."}', 0.12, 'A1', 'approved', 'manual', 'nature', 'practice', :'t6_a1s1_id', 4),
('story_retelling', '{"story": "Ravi has a dog. The dog is brown and loves to run in the park."}', 0.12, 'A1', 'approved', 'manual', 'nature', 'practice', :'t6_a1s1_id', 5),
('story_retelling', '{"story": "Anna likes to draw. She draws pictures of her family every weekend."}', 0.13, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t6_a1s2_id', 1),
('story_retelling', '{"story": "Ben has a sister. They play games together every evening."}', 0.13, 'A1', 'approved', 'manual', 'family', 'practice', :'t6_a1s2_id', 2),
('story_retelling', '{"story": "Sara likes tea. She drinks tea with her mother every morning."}', 0.14, 'A1', 'approved', 'manual', 'family', 'practice', :'t6_a1s2_id', 3),
('story_retelling', '{"story": "Jon has a ball. He plays with his friends in the garden."}', 0.14, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t6_a1s2_id', 4),
('story_retelling', '{"story": "Lucy has a book. She reads a little every night before bed."}', 0.15, 'A1', 'approved', 'manual', 'education', 'practice', :'t6_a1s2_id', 5),
('story_retelling', '{"story": "Maria wanted to learn to swim. She joined a class at the local pool. After a month, she could swim across the pool by herself."}', 0.25, 'A2', 'approved', 'manual', 'sports', 'practice', :'t6_a2s1_id', 1),
('story_retelling', '{"story": "David forgot his umbrella one rainy day. He got wet walking to work. After that, he always checked the weather first."}', 0.26, 'A2', 'approved', 'manual', 'weather', 'practice', :'t6_a2s1_id', 2),
('story_retelling', '{"story": "Priya saved money for a year to buy a new laptop. She finally bought it and used it for her studies."}', 0.27, 'A2', 'approved', 'manual', 'finance', 'practice', :'t6_a2s1_id', 3),
('story_retelling', '{"story": "Jack moved to a new city for his job. At first he felt lonely, but he soon made new friends at work."}', 0.28, 'A2', 'approved', 'manual', 'work', 'practice', :'t6_a2s1_id', 4),
('story_retelling', '{"story": "Emma planted vegetables in her garden. She watered them every day, and soon they grew big and healthy."}', 0.29, 'A2', 'approved', 'manual', 'nature', 'practice', :'t6_a2s1_id', 5),
('story_retelling', '{"story": "Leo missed the morning bus to school. He had to walk, so he arrived a little late but learned to leave earlier."}', 0.31, 'A2', 'approved', 'manual', 'transport', 'practice', :'t6_a2s2_id', 1),
('story_retelling', '{"story": "Nina wanted to cook a new dish. She watched a video and followed the steps. Her family loved the meal."}', 0.32, 'A2', 'approved', 'manual', 'food', 'practice', :'t6_a2s2_id', 2),
('story_retelling', '{"story": "Omar trained every day for a local race. On race day, he finished faster than he expected."}', 0.33, 'A2', 'approved', 'manual', 'sports', 'practice', :'t6_a2s2_id', 3),
('story_retelling', '{"story": "Sofia lost her keys one morning. She searched everywhere and finally found them in her bag."}', 0.34, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t6_a2s2_id', 4),
('story_retelling', '{"story": "Alex started reading one book every month. By the end of the year, he had read twelve books."}', 0.35, 'A2', 'approved', 'manual', 'education', 'practice', :'t6_a2s2_id', 5),
('story_retelling', '{"story": "After losing her job, Hannah decided to start her own bakery. It was difficult at first, but her hard work paid off and the bakery became popular in her neighborhood."}', 0.45, 'B1', 'approved', 'manual', 'work', 'practice', :'t6_b1s1_id', 1),
('story_retelling', '{"story": "A small town suffered from flooding every rainy season. The local council built new drainage systems, and the flooding stopped completely the following year."}', 0.46, 'B1', 'approved', 'manual', 'environment', 'practice', :'t6_b1s1_id', 2),
('story_retelling', '{"story": "Daniel had always been afraid of public speaking. He joined a speaking club, practiced every week, and eventually gave a confident speech at a company event."}', 0.48, 'B1', 'approved', 'manual', 'work', 'practice', :'t6_b1s1_id', 3),
('story_retelling', '{"story": "A group of students noticed their school had no recycling program. They proposed one to the principal, and within months, the whole school was recycling."}', 0.49, 'B1', 'approved', 'manual', 'environment', 'practice', :'t6_b1s1_id', 4),
('story_retelling', '{"story": "After an injury ended her football career, Grace became a coach instead. She later led her team to their first championship win."}', 0.51, 'B1', 'approved', 'manual', 'sports', 'practice', :'t6_b1s1_id', 5),
('story_retelling', '{"story": "A farmer struggled with poor harvests for years. After attending training on new farming methods, his crops improved dramatically the next season."}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', :'t6_b1s2_id', 1),
('story_retelling', '{"story": "When her company moved online, Elena had to learn new software quickly. She practiced every evening and became the team''s go-to expert within weeks."}', 0.54, 'B1', 'approved', 'manual', 'technology', 'practice', :'t6_b1s2_id', 2),
('story_retelling', '{"story": "A young doctor volunteered in a rural clinic with few resources. Over two years, she helped build it into a well-equipped health center for the community."}', 0.55, 'B1', 'approved', 'manual', 'health', 'practice', :'t6_b1s2_id', 3),
('story_retelling', '{"story": "After years of renting, Marcus finally saved enough to buy his first home. The process taught him a great deal about managing his finances."}', 0.57, 'B1', 'approved', 'manual', 'finance', 'practice', :'t6_b1s2_id', 4),
('story_retelling', '{"story": "A retired teacher started tutoring children in her neighborhood for free. Word spread, and soon she was helping dozens of students improve their grades."}', 0.58, 'B1', 'approved', 'manual', 'education', 'practice', :'t6_b1s2_id', 5);

-- ===================== email_writing =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('email_writing', 'A1 - Beginner', 1) RETURNING id \gset t7_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('email_writing', 'A2 - Elementary', 2) RETURNING id \gset t7_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('email_writing', 'B1 - Intermediate', 3) RETURNING id \gset t7_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t7_a1_id', 'Set 1', 1) RETURNING id \gset t7_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t7_a1_id', 'Set 2', 2) RETURNING id \gset t7_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t7_a2_id', 'Set 1', 1) RETURNING id \gset t7_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t7_a2_id', 'Set 2', 2) RETURNING id \gset t7_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t7_b1_id', 'Set 1', 1) RETURNING id \gset t7_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t7_b1_id', 'Set 2', 2) RETURNING id \gset t7_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('email_writing', '{"prompt": "Write a short email to a friend inviting them to lunch."}', 0.1, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t7_a1s1_id', 1),
('email_writing', '{"prompt": "Write a short email to your teacher saying you will be late."}', 0.11, 'A1', 'approved', 'manual', 'education', 'practice', :'t7_a1s1_id', 2),
('email_writing', '{"prompt": "Write a short email to a friend about your weekend."}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t7_a1s1_id', 3),
('email_writing', '{"prompt": "Write a short email asking a friend to play football."}', 0.12, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t7_a1s1_id', 4),
('email_writing', '{"prompt": "Write a short email to your mother saying you are fine."}', 0.12, 'A1', 'approved', 'manual', 'family', 'practice', :'t7_a1s1_id', 5),
('email_writing', '{"prompt": "Write a short email to a friend about your new pet."}', 0.13, 'A1', 'approved', 'manual', 'nature', 'practice', :'t7_a1s2_id', 1),
('email_writing', '{"prompt": "Write a short email inviting a friend to your birthday."}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t7_a1s2_id', 2),
('email_writing', '{"prompt": "Write a short email asking a friend for their phone number."}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t7_a1s2_id', 3),
('email_writing', '{"prompt": "Write a short email to a friend about your favorite food."}', 0.14, 'A1', 'approved', 'manual', 'food', 'practice', :'t7_a1s2_id', 4),
('email_writing', '{"prompt": "Write a short email to your teacher asking for homework help."}', 0.15, 'A1', 'approved', 'manual', 'education', 'practice', :'t7_a1s2_id', 5),
('email_writing', '{"prompt": "Write an email to a colleague asking to reschedule a meeting."}', 0.25, 'A2', 'approved', 'manual', 'work', 'practice', :'t7_a2s1_id', 1),
('email_writing', '{"prompt": "Write an email to a friend describing your recent holiday."}', 0.26, 'A2', 'approved', 'manual', 'travel', 'practice', :'t7_a2s1_id', 2),
('email_writing', '{"prompt": "Write an email to a shop asking about their opening hours."}', 0.27, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t7_a2s1_id', 3),
('email_writing', '{"prompt": "Write an email to a friend inviting them to a weekend trip."}', 0.28, 'A2', 'approved', 'manual', 'travel', 'practice', :'t7_a2s1_id', 4),
('email_writing', '{"prompt": "Write an email to your landlord about a broken light."}', 0.29, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t7_a2s1_id', 5),
('email_writing', '{"prompt": "Write an email to a friend recommending a good restaurant."}', 0.31, 'A2', 'approved', 'manual', 'food', 'practice', :'t7_a2s2_id', 1),
('email_writing', '{"prompt": "Write an email to your manager explaining you will work from home."}', 0.32, 'A2', 'approved', 'manual', 'work', 'practice', :'t7_a2s2_id', 2),
('email_writing', '{"prompt": "Write an email to a friend asking for advice about a new job."}', 0.33, 'A2', 'approved', 'manual', 'work', 'practice', :'t7_a2s2_id', 3),
('email_writing', '{"prompt": "Write an email thanking a friend for their help moving house."}', 0.34, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t7_a2s2_id', 4),
('email_writing', '{"prompt": "Write an email to a teacher asking about an upcoming exam."}', 0.35, 'A2', 'approved', 'manual', 'education', 'practice', :'t7_a2s2_id', 5),
('email_writing', '{"prompt": "Write an email to your manager proposing a new idea to improve team productivity."}', 0.45, 'B1', 'approved', 'manual', 'work', 'practice', :'t7_b1s1_id', 1),
('email_writing', '{"prompt": "Write an email to a hotel complaining about a problem with your recent stay."}', 0.46, 'B1', 'approved', 'manual', 'travel', 'practice', :'t7_b1s1_id', 2),
('email_writing', '{"prompt": "Write an email to a university requesting information about a course."}', 0.48, 'B1', 'approved', 'manual', 'education', 'practice', :'t7_b1s1_id', 3),
('email_writing', '{"prompt": "Write an email to a client apologizing for a delayed delivery."}', 0.49, 'B1', 'approved', 'manual', 'work', 'practice', :'t7_b1s1_id', 4),
('email_writing', '{"prompt": "Write an email to a friend explaining why you could not attend their event."}', 0.51, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t7_b1s1_id', 5),
('email_writing', '{"prompt": "Write an email to your team summarizing the outcomes of a recent project."}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', :'t7_b1s2_id', 1),
('email_writing', '{"prompt": "Write an email to a local council suggesting an improvement for your neighborhood."}', 0.54, 'B1', 'approved', 'manual', 'environment', 'practice', :'t7_b1s2_id', 2),
('email_writing', '{"prompt": "Write an email to a former colleague asking for a professional reference."}', 0.55, 'B1', 'approved', 'manual', 'work', 'practice', :'t7_b1s2_id', 3),
('email_writing', '{"prompt": "Write an email to an airline requesting a refund for a cancelled flight."}', 0.57, 'B1', 'approved', 'manual', 'travel', 'practice', :'t7_b1s2_id', 4),
('email_writing', '{"prompt": "Write an email to a mentor thanking them for their guidance over the past year."}', 0.58, 'B1', 'approved', 'manual', 'work', 'practice', :'t7_b1s2_id', 5);

-- ===================== typing =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('typing', 'A1 - Beginner', 1) RETURNING id \gset t8_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('typing', 'A2 - Elementary', 2) RETURNING id \gset t8_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('typing', 'B1 - Intermediate', 3) RETURNING id \gset t8_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t8_a1_id', 'Set 1', 1) RETURNING id \gset t8_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t8_a1_id', 'Set 2', 2) RETURNING id \gset t8_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t8_a2_id', 'Set 1', 1) RETURNING id \gset t8_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t8_a2_id', 'Set 2', 2) RETURNING id \gset t8_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t8_b1_id', 'Set 1', 1) RETURNING id \gset t8_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t8_b1_id', 'Set 2', 2) RETURNING id \gset t8_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('typing', '{"text": "I have a dog. My dog is small."}', 0.1, 'A1', 'approved', 'manual', 'nature', 'practice', :'t8_a1s1_id', 1),
('typing', '{"text": "She likes tea. I like coffee."}', 0.11, 'A1', 'approved', 'manual', 'food', 'practice', :'t8_a1s1_id', 2),
('typing', '{"text": "We go to school. School is fun."}', 0.11, 'A1', 'approved', 'manual', 'education', 'practice', :'t8_a1s1_id', 3),
('typing', '{"text": "He has a red car. The car is new."}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t8_a1s1_id', 4),
('typing', '{"text": "I live with my family. We are happy."}', 0.12, 'A1', 'approved', 'manual', 'family', 'practice', :'t8_a1s1_id', 5),
('typing', '{"text": "The sun is bright. The sky is blue."}', 0.13, 'A1', 'approved', 'manual', 'weather', 'practice', :'t8_a1s2_id', 1),
('typing', '{"text": "She reads a book. The book is long."}', 0.13, 'A1', 'approved', 'manual', 'education', 'practice', :'t8_a1s2_id', 2),
('typing', '{"text": "We play games. Games are fun."}', 0.14, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t8_a1s2_id', 3),
('typing', '{"text": "He eats an apple. Apples are healthy."}', 0.14, 'A1', 'approved', 'manual', 'food', 'practice', :'t8_a1s2_id', 4),
('typing', '{"text": "I walk to work. Work starts at nine."}', 0.15, 'A1', 'approved', 'manual', 'work', 'practice', :'t8_a1s2_id', 5),
('typing', '{"text": "She usually wakes up early and goes for a short walk before breakfast."}', 0.25, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t8_a2s1_id', 1),
('typing', '{"text": "The train was delayed, so we waited at the station for twenty minutes."}', 0.26, 'A2', 'approved', 'manual', 'transport', 'practice', :'t8_a2s1_id', 2),
('typing', '{"text": "He has been learning to cook and now makes dinner twice a week."}', 0.27, 'A2', 'approved', 'manual', 'food', 'practice', :'t8_a2s1_id', 3),
('typing', '{"text": "They are planning a trip to the mountains for the summer holidays."}', 0.28, 'A2', 'approved', 'manual', 'travel', 'practice', :'t8_a2s1_id', 4),
('typing', '{"text": "My sister works at a hospital and often has night shifts."}', 0.29, 'A2', 'approved', 'manual', 'family', 'practice', :'t8_a2s1_id', 5),
('typing', '{"text": "We need to finish this report before the meeting tomorrow morning."}', 0.31, 'A2', 'approved', 'manual', 'work', 'practice', :'t8_a2s2_id', 1),
('typing', '{"text": "The children were excited about their first day at the new school."}', 0.32, 'A2', 'approved', 'manual', 'education', 'practice', :'t8_a2s2_id', 2),
('typing', '{"text": "She enjoys gardening and spends most weekends growing vegetables."}', 0.33, 'A2', 'approved', 'manual', 'nature', 'practice', :'t8_a2s2_id', 3),
('typing', '{"text": "The weather has been unusually cold for this time of year."}', 0.34, 'A2', 'approved', 'manual', 'weather', 'practice', :'t8_a2s2_id', 4),
('typing', '{"text": "He saved enough money to buy his first car last month."}', 0.35, 'A2', 'approved', 'manual', 'finance', 'practice', :'t8_a2s2_id', 5),
('typing', '{"text": "Despite the challenges of working remotely, many employees have reported higher productivity levels."}', 0.45, 'B1', 'approved', 'manual', 'work', 'practice', :'t8_b1s1_id', 1),
('typing', '{"text": "The local government has introduced new policies aimed at reducing traffic congestion in the city center."}', 0.46, 'B1', 'approved', 'manual', 'transport', 'practice', :'t8_b1s1_id', 2),
('typing', '{"text": "Researchers discovered that regular exercise significantly improves both physical and mental health."}', 0.48, 'B1', 'approved', 'manual', 'health', 'practice', :'t8_b1s1_id', 3),
('typing', '{"text": "The company''s quarterly report showed a steady increase in revenue despite market uncertainty."}', 0.49, 'B1', 'approved', 'manual', 'work', 'practice', :'t8_b1s1_id', 4),
('typing', '{"text": "Volunteers spent the weekend cleaning up the local park, which had been neglected for years."}', 0.51, 'B1', 'approved', 'manual', 'environment', 'practice', :'t8_b1s1_id', 5),
('typing', '{"text": "After years of preparation, the team finally secured funding for their environmental research project."}', 0.52, 'B1', 'approved', 'manual', 'environment', 'practice', :'t8_b1s2_id', 1),
('typing', '{"text": "The university announced a new scholarship program to support students from low-income families."}', 0.54, 'B1', 'approved', 'manual', 'education', 'practice', :'t8_b1s2_id', 2),
('typing', '{"text": "Although the project faced several delays, the construction was completed ahead of the revised schedule."}', 0.55, 'B1', 'approved', 'manual', 'work', 'practice', :'t8_b1s2_id', 3),
('typing', '{"text": "Many small businesses struggled during the economic downturn, but some managed to adapt and thrive."}', 0.57, 'B1', 'approved', 'manual', 'finance', 'practice', :'t8_b1s2_id', 4),
('typing', '{"text": "The committee reviewed several proposals before selecting the most sustainable option for the new building."}', 0.58, 'B1', 'approved', 'manual', 'work', 'practice', :'t8_b1s2_id', 5);

-- ===================== passage_comprehension =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('passage_comprehension', 'A1 - Beginner', 1) RETURNING id \gset t9_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('passage_comprehension', 'A2 - Elementary', 2) RETURNING id \gset t9_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('passage_comprehension', 'B1 - Intermediate', 3) RETURNING id \gset t9_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t9_a1_id', 'Set 1', 1) RETURNING id \gset t9_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t9_a1_id', 'Set 2', 2) RETURNING id \gset t9_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t9_a2_id', 'Set 1', 1) RETURNING id \gset t9_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t9_a2_id', 'Set 2', 2) RETURNING id \gset t9_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t9_b1_id', 'Set 1', 1) RETURNING id \gset t9_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t9_b1_id', 'Set 2', 2) RETURNING id \gset t9_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('passage_comprehension', '{"story": "Ana has a dog. The dog is brown.", "question": "What color is Ana''s dog?"}', 0.1, 'A1', 'approved', 'manual', 'nature', 'practice', :'t9_a1s1_id', 1),
('passage_comprehension', '{"story": "Tom has a red ball. He plays with it every day.", "question": "What color is Tom''s ball?"}', 0.11, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t9_a1s1_id', 2),
('passage_comprehension', '{"story": "Mia has two cats. The cats are white.", "question": "How many cats does Mia have?"}', 0.11, 'A1', 'approved', 'manual', 'nature', 'practice', :'t9_a1s1_id', 3),
('passage_comprehension', '{"story": "I drink milk every morning. Milk is healthy.", "question": "When do I drink milk?"}', 0.12, 'A1', 'approved', 'manual', 'food', 'practice', :'t9_a1s1_id', 4),
('passage_comprehension', '{"story": "She has a blue bag. The bag is new.", "question": "What color is her bag?"}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t9_a1s1_id', 5),
('passage_comprehension', '{"story": "We live in a big house. The house has a garden.", "question": "Does the house have a garden?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t9_a1s2_id', 1),
('passage_comprehension', '{"story": "He goes to school by bike. The school is near.", "question": "How does he go to school?"}', 0.13, 'A1', 'approved', 'manual', 'transport', 'practice', :'t9_a1s2_id', 2),
('passage_comprehension', '{"story": "My sister likes apples. She eats one every day.", "question": "What fruit does my sister like?"}', 0.14, 'A1', 'approved', 'manual', 'food', 'practice', :'t9_a1s2_id', 3),
('passage_comprehension', '{"story": "The cat sleeps on the bed. It sleeps all day.", "question": "Where does the cat sleep?"}', 0.14, 'A1', 'approved', 'manual', 'nature', 'practice', :'t9_a1s2_id', 4),
('passage_comprehension', '{"story": "I have three books. The books are on the table.", "question": "How many books do I have?"}', 0.15, 'A1', 'approved', 'manual', 'education', 'practice', :'t9_a1s2_id', 5),
('passage_comprehension', '{"story": "Maria joined a swimming class last month. She practices twice a week at the local pool.", "question": "How often does Maria practice swimming?"}', 0.25, 'A2', 'approved', 'manual', 'sports', 'practice', :'t9_a2s1_id', 1),
('passage_comprehension', '{"story": "The train to the city leaves every thirty minutes. It takes about an hour to arrive.", "question": "How long does the train journey take?"}', 0.26, 'A2', 'approved', 'manual', 'transport', 'practice', :'t9_a2s1_id', 2),
('passage_comprehension', '{"story": "David works at a bakery. He starts work at five in the morning.", "question": "What time does David start work?"}', 0.27, 'A2', 'approved', 'manual', 'work', 'practice', :'t9_a2s1_id', 3),
('passage_comprehension', '{"story": "Priya is saving money to buy a laptop. She has saved half the amount so far.", "question": "What is Priya saving money for?"}', 0.28, 'A2', 'approved', 'manual', 'finance', 'practice', :'t9_a2s1_id', 4),
('passage_comprehension', '{"story": "The museum is open from nine to five, except on Mondays.", "question": "When is the museum closed?"}', 0.29, 'A2', 'approved', 'manual', 'education', 'practice', :'t9_a2s1_id', 5),
('passage_comprehension', '{"story": "Leo missed his bus and had to walk to school. It took him forty minutes.", "question": "How did Leo get to school?"}', 0.31, 'A2', 'approved', 'manual', 'transport', 'practice', :'t9_a2s2_id', 1),
('passage_comprehension', '{"story": "Emma grows vegetables in her garden. She waters them every evening.", "question": "When does Emma water her plants?"}', 0.32, 'A2', 'approved', 'manual', 'nature', 'practice', :'t9_a2s2_id', 2),
('passage_comprehension', '{"story": "The shop closes early on Sundays, at around two in the afternoon.", "question": "What time does the shop close on Sundays?"}', 0.33, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t9_a2s2_id', 3),
('passage_comprehension', '{"story": "Nina cooked a new dish for dinner. Her family really enjoyed it.", "question": "Did Nina''s family enjoy the dish?"}', 0.34, 'A2', 'approved', 'manual', 'food', 'practice', :'t9_a2s2_id', 4),
('passage_comprehension', '{"story": "Omar trains every morning before work. He is preparing for a race.", "question": "What is Omar preparing for?"}', 0.35, 'A2', 'approved', 'manual', 'sports', 'practice', :'t9_a2s2_id', 5),
('passage_comprehension', '{"story": "After months of research, scientists confirmed that the river''s pollution levels had dropped significantly, thanks to new filtering systems installed by the city.", "question": "Why did the pollution levels drop?"}', 0.45, 'B1', 'approved', 'manual', 'environment', 'practice', :'t9_b1s1_id', 1),
('passage_comprehension', '{"story": "The company reported a rise in profits last quarter, which executives credited to a new marketing strategy launched in the spring.", "question": "What caused the rise in profits?"}', 0.46, 'B1', 'approved', 'manual', 'work', 'practice', :'t9_b1s1_id', 2),
('passage_comprehension', '{"story": "Despite early setbacks, the construction team completed the bridge two months ahead of schedule, surprising the entire city council.", "question": "How far ahead of schedule was the bridge completed?"}', 0.48, 'B1', 'approved', 'manual', 'work', 'practice', :'t9_b1s1_id', 3),
('passage_comprehension', '{"story": "A recent study found that employees who work flexible hours report higher job satisfaction and lower stress levels.", "question": "What did employees with flexible hours report?"}', 0.49, 'B1', 'approved', 'manual', 'work', 'practice', :'t9_b1s1_id', 4),
('passage_comprehension', '{"story": "The local library introduced free coding classes for teenagers, and within weeks, every session was fully booked.", "question": "What did the library introduce for teenagers?"}', 0.51, 'B1', 'approved', 'manual', 'education', 'practice', :'t9_b1s1_id', 5),
('passage_comprehension', '{"story": "The farmer adopted new irrigation techniques after a difficult year, and his harvest improved considerably the following season.", "question": "What improved after the farmer adopted new techniques?"}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', :'t9_b1s2_id', 1),
('passage_comprehension', '{"story": "A young entrepreneur launched an online store during a difficult economic period, yet her business grew steadily within the first year.", "question": "What happened to the entrepreneur''s business in its first year?"}', 0.54, 'B1', 'approved', 'manual', 'work', 'practice', :'t9_b1s2_id', 2),
('passage_comprehension', '{"story": "City officials announced a new cycling path to reduce traffic congestion and encourage healthier commuting habits.", "question": "What is the new cycling path meant to reduce?"}', 0.55, 'B1', 'approved', 'manual', 'transport', 'practice', :'t9_b1s2_id', 3),
('passage_comprehension', '{"story": "The hospital expanded its emergency department after reporting a steady increase in patient numbers over the past five years.", "question": "Why did the hospital expand its emergency department?"}', 0.57, 'B1', 'approved', 'manual', 'health', 'practice', :'t9_b1s2_id', 4),
('passage_comprehension', '{"story": "A nonprofit organization raised enough funds to build a new school in a rural area that previously had no access to education.", "question": "What did the nonprofit organization build?"}', 0.58, 'B1', 'approved', 'manual', 'education', 'practice', :'t9_b1s2_id', 5);

-- ===================== summary_and_opinion =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('summary_and_opinion', 'A1 - Beginner', 1) RETURNING id \gset t10_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('summary_and_opinion', 'A2 - Elementary', 2) RETURNING id \gset t10_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('summary_and_opinion', 'B1 - Intermediate', 3) RETURNING id \gset t10_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t10_a1_id', 'Set 1', 1) RETURNING id \gset t10_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t10_a1_id', 'Set 2', 2) RETURNING id \gset t10_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t10_a2_id', 'Set 1', 1) RETURNING id \gset t10_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t10_a2_id', 'Set 2', 2) RETURNING id \gset t10_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t10_b1_id', 'Set 1', 1) RETURNING id \gset t10_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t10_b1_id', 'Set 2', 2) RETURNING id \gset t10_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('summary_and_opinion', '{"passage": "Many people like pets. Pets make people happy."}', 0.1, 'A1', 'approved', 'manual', 'nature', 'practice', :'t10_a1s1_id', 1),
('summary_and_opinion', '{"passage": "Students learn many things at school. School is important."}', 0.11, 'A1', 'approved', 'manual', 'education', 'practice', :'t10_a1s1_id', 2),
('summary_and_opinion', '{"passage": "Families eat dinner together. It is a happy time."}', 0.11, 'A1', 'approved', 'manual', 'family', 'practice', :'t10_a1s1_id', 3),
('summary_and_opinion', '{"passage": "Many people play sports. Sports keep us healthy."}', 0.12, 'A1', 'approved', 'manual', 'health', 'practice', :'t10_a1s1_id', 4),
('summary_and_opinion', '{"passage": "Children like to play games. Games are fun."}', 0.12, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t10_a1s1_id', 5),
('summary_and_opinion', '{"passage": "People drink water every day. Water is good for health."}', 0.13, 'A1', 'approved', 'manual', 'health', 'practice', :'t10_a1s2_id', 1),
('summary_and_opinion', '{"passage": "Many people travel on holidays. Travel is exciting."}', 0.13, 'A1', 'approved', 'manual', 'travel', 'practice', :'t10_a1s2_id', 2),
('summary_and_opinion', '{"passage": "Students read books at school. Books teach us new things."}', 0.14, 'A1', 'approved', 'manual', 'education', 'practice', :'t10_a1s2_id', 3),
('summary_and_opinion', '{"passage": "People like to eat fruit. Fruit is healthy."}', 0.14, 'A1', 'approved', 'manual', 'food', 'practice', :'t10_a1s2_id', 4),
('summary_and_opinion', '{"passage": "Many families have a car. Cars help people travel."}', 0.15, 'A1', 'approved', 'manual', 'transport', 'practice', :'t10_a1s2_id', 5),
('summary_and_opinion', '{"passage": "Working from home has become common. Some people like the flexibility, while others miss talking to coworkers."}', 0.25, 'A2', 'approved', 'manual', 'work', 'practice', :'t10_a2s1_id', 1),
('summary_and_opinion', '{"passage": "Many cities are building more parks. Parks give people a place to relax and exercise outdoors."}', 0.26, 'A2', 'approved', 'manual', 'environment', 'practice', :'t10_a2s1_id', 2),
('summary_and_opinion', '{"passage": "Online shopping has grown quickly. It is convenient, but some people prefer visiting real shops."}', 0.27, 'A2', 'approved', 'manual', 'technology', 'practice', :'t10_a2s1_id', 3),
('summary_and_opinion', '{"passage": "Public transport helps reduce traffic. However, in some cities buses and trains are often late."}', 0.28, 'A2', 'approved', 'manual', 'transport', 'practice', :'t10_a2s1_id', 4),
('summary_and_opinion', '{"passage": "Learning a new language takes time and practice. Many people find it rewarding despite the challenges."}', 0.29, 'A2', 'approved', 'manual', 'education', 'practice', :'t10_a2s1_id', 5),
('summary_and_opinion', '{"passage": "Eating fast food is convenient, but many doctors suggest eating fresh food more often."}', 0.31, 'A2', 'approved', 'manual', 'health', 'practice', :'t10_a2s2_id', 1),
('summary_and_opinion', '{"passage": "Social media connects people around the world. At the same time, some people spend too much time online."}', 0.32, 'A2', 'approved', 'manual', 'technology', 'practice', :'t10_a2s2_id', 2),
('summary_and_opinion', '{"passage": "Recycling helps protect the environment. Many communities are now encouraging people to recycle more."}', 0.33, 'A2', 'approved', 'manual', 'environment', 'practice', :'t10_a2s2_id', 3),
('summary_and_opinion', '{"passage": "Part-time jobs give students extra income. However, they can make it harder to focus on studies."}', 0.34, 'A2', 'approved', 'manual', 'work', 'practice', :'t10_a2s2_id', 4),
('summary_and_opinion', '{"passage": "Traveling to new places teaches people about different cultures. It can also be expensive."}', 0.35, 'A2', 'approved', 'manual', 'travel', 'practice', :'t10_a2s2_id', 5),
('summary_and_opinion', '{"passage": "Remote work has reshaped how companies operate. While it offers employees flexibility and saves commuting time, some managers worry it weakens team collaboration and company culture."}', 0.45, 'B1', 'approved', 'manual', 'work', 'practice', :'t10_b1s1_id', 1),
('summary_and_opinion', '{"passage": "Renewable energy use is increasing worldwide. Supporters say it reduces pollution and dependence on fossil fuels, while critics point to the high initial costs of switching to new systems."}', 0.46, 'B1', 'approved', 'manual', 'environment', 'practice', :'t10_b1s1_id', 2),
('summary_and_opinion', '{"passage": "Universities are offering more online courses. This makes education more accessible, but some students feel they miss the personal interaction of a traditional classroom."}', 0.48, 'B1', 'approved', 'manual', 'education', 'practice', :'t10_b1s1_id', 3),
('summary_and_opinion', '{"passage": "Automation is changing many industries. It increases efficiency and lowers costs for businesses, but it also raises concerns about job losses for workers in traditional roles."}', 0.49, 'B1', 'approved', 'manual', 'technology', 'practice', :'t10_b1s1_id', 4),
('summary_and_opinion', '{"passage": "Urban areas are becoming more crowded. City planners argue for more public housing, while some residents worry about rising costs and strain on local infrastructure."}', 0.51, 'B1', 'approved', 'manual', 'environment', 'practice', :'t10_b1s1_id', 5),
('summary_and_opinion', '{"passage": "Social media has transformed how businesses advertise. It allows companies to reach wider audiences cheaply, though it has also made misinformation easier to spread."}', 0.52, 'B1', 'approved', 'manual', 'technology', 'practice', :'t10_b1s2_id', 1),
('summary_and_opinion', '{"passage": "Flexible working hours are becoming more popular. Employees report better work-life balance, but some companies struggle to coordinate schedules across teams."}', 0.54, 'B1', 'approved', 'manual', 'work', 'practice', :'t10_b1s2_id', 2),
('summary_and_opinion', '{"passage": "Electric vehicles are gaining popularity. They produce fewer emissions, yet limited charging infrastructure remains a barrier for many potential buyers."}', 0.55, 'B1', 'approved', 'manual', 'environment', 'practice', :'t10_b1s2_id', 3),
('summary_and_opinion', '{"passage": "Globalization has connected economies worldwide. It has created new opportunities for trade, but it has also increased competition for local businesses."}', 0.57, 'B1', 'approved', 'manual', 'finance', 'practice', :'t10_b1s2_id', 4),
('summary_and_opinion', '{"passage": "Preventive healthcare is being promoted more widely. Regular checkups can catch problems early, although access to healthcare still varies greatly between regions."}', 0.58, 'B1', 'approved', 'manual', 'health', 'practice', :'t10_b1s2_id', 5);

-- ===================== reading_selective =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('reading_selective', 'A1 - Beginner', 1) RETURNING id \gset t11_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('reading_selective', 'A2 - Elementary', 2) RETURNING id \gset t11_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('reading_selective', 'B1 - Intermediate', 3) RETURNING id \gset t11_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t11_a1_id', 'Set 1', 1) RETURNING id \gset t11_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t11_a1_id', 'Set 2', 2) RETURNING id \gset t11_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t11_a2_id', 'Set 1', 1) RETURNING id \gset t11_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t11_a2_id', 'Set 2', 2) RETURNING id \gset t11_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t11_b1_id', 'Set 1', 1) RETURNING id \gset t11_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t11_b1_id', 'Set 2', 2) RETURNING id \gset t11_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('reading_selective', '{"text": "CLOSED on Sunday.", "question": "Is it open Sunday?"}', 0.1, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t11_a1s1_id', 1),
('reading_selective', '{"text": "OPEN 9 AM to 6 PM.", "question": "Is it open at 7 PM?"}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t11_a1s1_id', 2),
('reading_selective', '{"text": "NO SMOKING in this area.", "question": "Can you smoke here?"}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t11_a1s1_id', 3),
('reading_selective', '{"text": "SALE: 50% off today only.", "question": "Is the sale only today?"}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t11_a1s1_id', 4),
('reading_selective', '{"text": "PUSH to open the door.", "question": "Should you pull the door?"}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t11_a1s1_id', 5),
('reading_selective', '{"text": "PARKING for customers only.", "question": "Can anyone park here?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t11_a1s2_id', 1),
('reading_selective', '{"text": "WET FLOOR, be careful.", "question": "Is the floor dry?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t11_a1s2_id', 2),
('reading_selective', '{"text": "EXIT this way.", "question": "Does this sign show the way out?"}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t11_a1s2_id', 3),
('reading_selective', '{"text": "FREE WIFI available here.", "question": "Do you have to pay for wifi?"}', 0.14, 'A1', 'approved', 'manual', 'technology', 'practice', :'t11_a1s2_id', 4),
('reading_selective', '{"text": "QUIET please, library area.", "question": "Should you be loud here?"}', 0.15, 'A1', 'approved', 'manual', 'education', 'practice', :'t11_a1s2_id', 5),
('reading_selective', '{"text": "Notice: The office will be closed for maintenance from 2 PM to 4 PM today.", "question": "Can you visit the office at 3 PM today?"}', 0.25, 'A2', 'approved', 'manual', 'work', 'practice', :'t11_a2s1_id', 1),
('reading_selective', '{"text": "All visitors must sign in at the front desk before entering the building.", "question": "Can visitors enter without signing in?"}', 0.26, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t11_a2s1_id', 2),
('reading_selective', '{"text": "Flight 204 to London has been delayed by two hours.", "question": "Is the flight on time?"}', 0.27, 'A2', 'approved', 'manual', 'travel', 'practice', :'t11_a2s1_id', 3),
('reading_selective', '{"text": "Members receive a 20% discount on all purchases this weekend.", "question": "Do non-members get the discount?"}', 0.28, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t11_a2s1_id', 4),
('reading_selective', '{"text": "The gym is open 24 hours for registered members only.", "question": "Can anyone use the gym at any time?"}', 0.29, 'A2', 'approved', 'manual', 'health', 'practice', :'t11_a2s1_id', 5),
('reading_selective', '{"text": "Please keep your ticket; it will be checked again at the exit.", "question": "Should you throw away your ticket?"}', 0.31, 'A2', 'approved', 'manual', 'travel', 'practice', :'t11_a2s2_id', 1),
('reading_selective', '{"text": "The conference room is booked from 10 AM to 11 AM for the sales team.", "question": "Is the room free at 10:30 AM?"}', 0.32, 'A2', 'approved', 'manual', 'work', 'practice', :'t11_a2s2_id', 2),
('reading_selective', '{"text": "New employees must complete training within their first two weeks.", "question": "Is training required for new employees?"}', 0.33, 'A2', 'approved', 'manual', 'work', 'practice', :'t11_a2s2_id', 3),
('reading_selective', '{"text": "The pharmacy is open every day except public holidays.", "question": "Is the pharmacy open on public holidays?"}', 0.34, 'A2', 'approved', 'manual', 'health', 'practice', :'t11_a2s2_id', 4),
('reading_selective', '{"text": "Refunds are only given with a valid receipt within 14 days.", "question": "Can you get a refund without a receipt?"}', 0.35, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t11_a2s2_id', 5),
('reading_selective', '{"text": "Due to scheduled maintenance, the website will be unavailable between midnight and 3 AM on Saturday. Users are advised to complete transactions beforehand.", "question": "When will the website be unavailable?"}', 0.45, 'B1', 'approved', 'manual', 'technology', 'practice', :'t11_b1s1_id', 1),
('reading_selective', '{"text": "Applicants must submit all required documents at least five working days before the interview date to avoid delays in processing.", "question": "How many days before the interview should documents be submitted?"}', 0.46, 'B1', 'approved', 'manual', 'work', 'practice', :'t11_b1s1_id', 2),
('reading_selective', '{"text": "The warranty covers manufacturing defects only and does not apply to damage caused by misuse or accidents.", "question": "Does the warranty cover accidental damage?"}', 0.48, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t11_b1s1_id', 3),
('reading_selective', '{"text": "Passengers with connecting flights departing within 90 minutes should proceed directly to their next gate without collecting luggage.", "question": "Should passengers with a short connection collect their luggage first?"}', 0.49, 'B1', 'approved', 'manual', 'travel', 'practice', :'t11_b1s1_id', 4),
('reading_selective', '{"text": "The scholarship is awarded based on academic merit and financial need, and recipients must maintain a minimum grade average to retain it.", "question": "What must recipients do to keep the scholarship?"}', 0.51, 'B1', 'approved', 'manual', 'education', 'practice', :'t11_b1s1_id', 5),
('reading_selective', '{"text": "Employees requesting leave during the holiday period must notify their manager at least three weeks in advance.", "question": "How far in advance must holiday leave be requested?"}', 0.52, 'B1', 'approved', 'manual', 'work', 'practice', :'t11_b1s2_id', 1),
('reading_selective', '{"text": "The new regulation requires all restaurants to clearly display allergen information on their menus starting next year.", "question": "What must restaurants display on their menus?"}', 0.54, 'B1', 'approved', 'manual', 'food', 'practice', :'t11_b1s2_id', 2),
('reading_selective', '{"text": "Residents in the affected zone are advised to boil tap water before drinking until further notice from the water authority.", "question": "What should residents do before drinking tap water?"}', 0.55, 'B1', 'approved', 'manual', 'health', 'practice', :'t11_b1s2_id', 3),
('reading_selective', '{"text": "The library''s extended hours apply only during final exam weeks and will not continue into the regular semester.", "question": "When do the library''s extended hours apply?"}', 0.57, 'B1', 'approved', 'manual', 'education', 'practice', :'t11_b1s2_id', 4),
('reading_selective', '{"text": "Customers who cancel within 24 hours of booking will receive a full refund; cancellations after that period incur a 50% fee.", "question": "What happens if you cancel after 24 hours?"}', 0.58, 'B1', 'approved', 'manual', 'travel', 'practice', :'t11_b1s2_id', 5);

-- ===================== speaking_situations =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('speaking_situations', 'A1 - Beginner', 1) RETURNING id \gset t12_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('speaking_situations', 'A2 - Elementary', 2) RETURNING id \gset t12_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('speaking_situations', 'B1 - Intermediate', 3) RETURNING id \gset t12_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t12_a1_id', 'Set 1', 1) RETURNING id \gset t12_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t12_a1_id', 'Set 2', 2) RETURNING id \gset t12_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t12_a2_id', 'Set 1', 1) RETURNING id \gset t12_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t12_a2_id', 'Set 2', 2) RETURNING id \gset t12_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t12_b1_id', 'Set 1', 1) RETURNING id \gset t12_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t12_b1_id', 'Set 2', 2) RETURNING id \gset t12_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('speaking_situations', '{"situation": "Your friend is late to meet you. What do you say when they arrive?"}', 0.1, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t12_a1s1_id', 1),
('speaking_situations', '{"situation": "You want to order a coffee at a cafe. What do you say?"}', 0.11, 'A1', 'approved', 'manual', 'food', 'practice', :'t12_a1s1_id', 2),
('speaking_situations', '{"situation": "You meet a new classmate. What do you say to introduce yourself?"}', 0.11, 'A1', 'approved', 'manual', 'education', 'practice', :'t12_a1s1_id', 3),
('speaking_situations', '{"situation": "You want to ask the time. What do you say?"}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t12_a1s1_id', 4),
('speaking_situations', '{"situation": "Someone helps you carry your bag. What do you say?"}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t12_a1s1_id', 5),
('speaking_situations', '{"situation": "You want to ask for the price of an item. What do you say?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t12_a1s2_id', 1),
('speaking_situations', '{"situation": "You bump into someone by accident. What do you say?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t12_a1s2_id', 2),
('speaking_situations', '{"situation": "You want to ask where the toilet is. What do you say?"}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t12_a1s2_id', 3),
('speaking_situations', '{"situation": "A friend gives you a gift. What do you say?"}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t12_a1s2_id', 4),
('speaking_situations', '{"situation": "You want to say goodbye to a friend. What do you say?"}', 0.15, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t12_a1s2_id', 5),
('speaking_situations', '{"situation": "You arrive at a hotel and need to check in. What do you say to the receptionist?"}', 0.25, 'A2', 'approved', 'manual', 'travel', 'practice', :'t12_a2s1_id', 1),
('speaking_situations', '{"situation": "You want to return a faulty item to a shop. What do you say?"}', 0.26, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t12_a2s1_id', 2),
('speaking_situations', '{"situation": "A colleague asks you to cover their shift. How do you respond?"}', 0.27, 'A2', 'approved', 'manual', 'work', 'practice', :'t12_a2s1_id', 3),
('speaking_situations', '{"situation": "You are lost and need to ask someone for directions. What do you say?"}', 0.28, 'A2', 'approved', 'manual', 'travel', 'practice', :'t12_a2s1_id', 4),
('speaking_situations', '{"situation": "You want to cancel a restaurant reservation. What do you say on the phone?"}', 0.29, 'A2', 'approved', 'manual', 'food', 'practice', :'t12_a2s1_id', 5),
('speaking_situations', '{"situation": "Your friend invites you to a party, but you cannot go. How do you respond?"}', 0.31, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t12_a2s2_id', 1),
('speaking_situations', '{"situation": "You need to explain to your teacher why your homework is late. What do you say?"}', 0.32, 'A2', 'approved', 'manual', 'education', 'practice', :'t12_a2s2_id', 2),
('speaking_situations', '{"situation": "You want to ask a coworker for help with a task. What do you say?"}', 0.33, 'A2', 'approved', 'manual', 'work', 'practice', :'t12_a2s2_id', 3),
('speaking_situations', '{"situation": "You are at a doctor''s office and need to describe your symptoms. What do you say?"}', 0.34, 'A2', 'approved', 'manual', 'health', 'practice', :'t12_a2s2_id', 4),
('speaking_situations', '{"situation": "You want to compliment a friend on their new haircut. What do you say?"}', 0.35, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t12_a2s2_id', 5),
('speaking_situations', '{"situation": "You need to explain to your manager why a project deadline will be missed. What do you say?"}', 0.45, 'B1', 'approved', 'manual', 'work', 'practice', :'t12_b1s1_id', 1),
('speaking_situations', '{"situation": "A friend asks for your honest opinion about their business idea, which you think is risky. How do you respond?"}', 0.46, 'B1', 'approved', 'manual', 'work', 'practice', :'t12_b1s1_id', 2),
('speaking_situations', '{"situation": "You disagree with a decision made in a team meeting. How do you politely raise your concern?"}', 0.48, 'B1', 'approved', 'manual', 'work', 'practice', :'t12_b1s1_id', 3),
('speaking_situations', '{"situation": "You need to negotiate a lower price for a used car. What do you say to the seller?"}', 0.49, 'B1', 'approved', 'manual', 'finance', 'practice', :'t12_b1s1_id', 4),
('speaking_situations', '{"situation": "A close friend is going through a difficult time. How do you offer support?"}', 0.51, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t12_b1s1_id', 5),
('speaking_situations', '{"situation": "You need to persuade your landlord to fix a problem in your apartment quickly. What do you say?"}', 0.52, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t12_b1s2_id', 1),
('speaking_situations', '{"situation": "You are interviewing for a new job and asked about your weaknesses. How do you respond?"}', 0.54, 'B1', 'approved', 'manual', 'work', 'practice', :'t12_b1s2_id', 2),
('speaking_situations', '{"situation": "You need to explain a complicated technical issue to someone with no technical background. What do you say?"}', 0.55, 'B1', 'approved', 'manual', 'technology', 'practice', :'t12_b1s2_id', 3),
('speaking_situations', '{"situation": "A customer is upset about a delayed order. How do you calm them down and explain the situation?"}', 0.57, 'B1', 'approved', 'manual', 'work', 'practice', :'t12_b1s2_id', 4),
('speaking_situations', '{"situation": "You want to suggest an improvement to how your team works, but worry it might upset a colleague. How do you bring it up?"}', 0.58, 'B1', 'approved', 'manual', 'work', 'practice', :'t12_b1s2_id', 5);

-- ===================== conversations =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('conversations', 'A1 - Beginner', 1) RETURNING id \gset t13_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('conversations', 'A2 - Elementary', 2) RETURNING id \gset t13_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('conversations', 'B1 - Intermediate', 3) RETURNING id \gset t13_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t13_a1_id', 'Set 1', 1) RETURNING id \gset t13_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t13_a1_id', 'Set 2', 2) RETURNING id \gset t13_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t13_a2_id', 'Set 1', 1) RETURNING id \gset t13_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t13_a2_id', 'Set 2', 2) RETURNING id \gset t13_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t13_b1_id', 'Set 1', 1) RETURNING id \gset t13_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t13_b1_id', 'Set 2', 2) RETURNING id \gset t13_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('conversations', '{"dialogue": "A: Do you want tea or coffee? B: Coffee, please.", "question": "What does the person want?"}', 0.1, 'A1', 'approved', 'manual', 'food', 'practice', :'t13_a1s1_id', 1),
('conversations', '{"dialogue": "A: Is it raining? B: Yes, it is.", "question": "Is it raining?"}', 0.11, 'A1', 'approved', 'manual', 'weather', 'practice', :'t13_a1s1_id', 2),
('conversations', '{"dialogue": "A: Where is the bank? B: It is next to the shop.", "question": "Where is the bank?"}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t13_a1s1_id', 3),
('conversations', '{"dialogue": "A: Do you have a pen? B: Yes, here you are.", "question": "Does B have a pen?"}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t13_a1s1_id', 4),
('conversations', '{"dialogue": "A: What time is it? B: It is three o''clock.", "question": "What time is it?"}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t13_a1s1_id', 5),
('conversations', '{"dialogue": "A: Is this your book? B: No, it is not mine.", "question": "Is the book B''s?"}', 0.13, 'A1', 'approved', 'manual', 'education', 'practice', :'t13_a1s2_id', 1),
('conversations', '{"dialogue": "A: How old are you? B: I am ten years old.", "question": "How old is B?"}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t13_a1s2_id', 2),
('conversations', '{"dialogue": "A: Do you like dogs? B: Yes, I love them.", "question": "Does B like dogs?"}', 0.14, 'A1', 'approved', 'manual', 'nature', 'practice', :'t13_a1s2_id', 3),
('conversations', '{"dialogue": "A: Where do you live? B: I live in Delhi.", "question": "Where does B live?"}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t13_a1s2_id', 4),
('conversations', '{"dialogue": "A: Can you help me? B: Of course, I can.", "question": "Will B help?"}', 0.15, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t13_a1s2_id', 5),
('conversations', '{"dialogue": "A: Have you finished the report? B: Not yet, I will finish it by tonight.", "question": "When will the report be finished?"}', 0.25, 'A2', 'approved', 'manual', 'work', 'practice', :'t13_a2s1_id', 1),
('conversations', '{"dialogue": "A: Why were you late? B: The bus was delayed by twenty minutes.", "question": "Why was the person late?"}', 0.26, 'A2', 'approved', 'manual', 'transport', 'practice', :'t13_a2s1_id', 2),
('conversations', '{"dialogue": "A: Would you like to join us for dinner? B: I would love to, thank you.", "question": "Does B want to join for dinner?"}', 0.27, 'A2', 'approved', 'manual', 'food', 'practice', :'t13_a2s1_id', 3),
('conversations', '{"dialogue": "A: How was your trip? B: It was great, but the flight was very long.", "question": "What was a problem with the trip?"}', 0.28, 'A2', 'approved', 'manual', 'travel', 'practice', :'t13_a2s1_id', 4),
('conversations', '{"dialogue": "A: Can you recommend a good doctor? B: Yes, mine is excellent.", "question": "Does A need a doctor recommendation?"}', 0.29, 'A2', 'approved', 'manual', 'health', 'practice', :'t13_a2s1_id', 5),
('conversations', '{"dialogue": "A: Did you pass the exam? B: Yes, I got a very good grade.", "question": "Did B pass the exam?"}', 0.31, 'A2', 'approved', 'manual', 'education', 'practice', :'t13_a2s2_id', 1),
('conversations', '{"dialogue": "A: What time does the meeting start? B: It starts at ten, but I might be a few minutes late.", "question": "What time does the meeting start?"}', 0.32, 'A2', 'approved', 'manual', 'work', 'practice', :'t13_a2s2_id', 2),
('conversations', '{"dialogue": "A: Is this seat taken? B: No, please sit down.", "question": "Is the seat free?"}', 0.33, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t13_a2s2_id', 3),
('conversations', '{"dialogue": "A: How long have you lived here? B: About five years now.", "question": "How long has B lived here?"}', 0.34, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t13_a2s2_id', 4),
('conversations', '{"dialogue": "A: Can we reschedule our call? B: Sure, how about tomorrow afternoon?", "question": "When does B suggest rescheduling the call?"}', 0.35, 'A2', 'approved', 'manual', 'work', 'practice', :'t13_a2s2_id', 5),
('conversations', '{"dialogue": "A: I heard the project deadline was moved up. B: Yes, we now have to finish by Friday instead of next week.", "question": "When is the new project deadline?"}', 0.45, 'B1', 'approved', 'manual', 'work', 'practice', :'t13_b1s1_id', 1),
('conversations', '{"dialogue": "A: What did you think of the proposal? B: Honestly, I think it needs more research before we approve it.", "question": "What does B think the proposal needs?"}', 0.46, 'B1', 'approved', 'manual', 'work', 'practice', :'t13_b1s1_id', 2),
('conversations', '{"dialogue": "A: Why did the flight get cancelled? B: Apparently there was a technical issue with the aircraft.", "question": "Why was the flight cancelled?"}', 0.48, 'B1', 'approved', 'manual', 'travel', 'practice', :'t13_b1s1_id', 3),
('conversations', '{"dialogue": "A: Are you considering changing careers? B: I''ve thought about it, but I''m worried about the financial risk.", "question": "What is B worried about regarding a career change?"}', 0.49, 'B1', 'approved', 'manual', 'work', 'practice', :'t13_b1s1_id', 4),
('conversations', '{"dialogue": "A: The new policy seems unpopular. B: True, several employees have already raised concerns with HR.", "question": "Who have employees raised concerns with?"}', 0.51, 'B1', 'approved', 'manual', 'work', 'practice', :'t13_b1s1_id', 5),
('conversations', '{"dialogue": "A: How did the negotiation go? B: Better than expected, we agreed on a price lower than our target.", "question": "How did the negotiation turn out?"}', 0.52, 'B1', 'approved', 'manual', 'finance', 'practice', :'t13_b1s2_id', 1),
('conversations', '{"dialogue": "A: Why is the construction delayed again? B: There have been ongoing issues with material deliveries.", "question": "Why is construction delayed?"}', 0.54, 'B1', 'approved', 'manual', 'work', 'practice', :'t13_b1s2_id', 2),
('conversations', '{"dialogue": "A: Did the council approve the new park? B: Yes, after months of debate, it was finally approved last week.", "question": "When was the new park approved?"}', 0.55, 'B1', 'approved', 'manual', 'environment', 'practice', :'t13_b1s2_id', 3),
('conversations', '{"dialogue": "A: What''s the biggest challenge with remote teams? B: I''d say it''s maintaining clear communication across time zones.", "question": "What is the biggest challenge with remote teams?"}', 0.57, 'B1', 'approved', 'manual', 'work', 'practice', :'t13_b1s2_id', 4),
('conversations', '{"dialogue": "A: Are you happy with the new software? B: Mostly, though it took a while for the team to adjust.", "question": "What took a while for the team?"}', 0.58, 'B1', 'approved', 'manual', 'technology', 'practice', :'t13_b1s2_id', 5);

-- ===================== response_selection =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('response_selection', 'A1 - Beginner', 1) RETURNING id \gset t14_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('response_selection', 'A2 - Elementary', 2) RETURNING id \gset t14_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('response_selection', 'B1 - Intermediate', 3) RETURNING id \gset t14_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t14_a1_id', 'Set 1', 1) RETURNING id \gset t14_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t14_a1_id', 'Set 2', 2) RETURNING id \gset t14_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t14_a2_id', 'Set 1', 1) RETURNING id \gset t14_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t14_a2_id', 'Set 2', 2) RETURNING id \gset t14_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t14_b1_id', 'Set 1', 1) RETURNING id \gset t14_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t14_b1_id', 'Set 2', 2) RETURNING id \gset t14_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('response_selection', '{"text": "How are you?", "options": ["Fine, thanks.", "Blue.", "Tuesday."]}', 0.1, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t14_a1s1_id', 1),
('response_selection', '{"text": "What is your name?", "options": ["I am from India.", "My name is Sam.", "It is Monday."]}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t14_a1s1_id', 2),
('response_selection', '{"text": "Where do you live?", "options": ["I live in Delhi.", "I am ten.", "I like tea."]}', 0.11, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t14_a1s1_id', 3),
('response_selection', '{"text": "Do you like coffee?", "options": ["Yes, I do.", "It is five o''clock.", "I am a student."]}', 0.12, 'A1', 'approved', 'manual', 'food', 'practice', :'t14_a1s1_id', 4),
('response_selection', '{"text": "How old are you?", "options": ["I am twelve.", "I live here.", "I like it."]}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t14_a1s1_id', 5),
('response_selection', '{"text": "What time is it?", "options": ["It is three o''clock.", "I am happy.", "She is my sister."]}', 0.13, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t14_a1s2_id', 1),
('response_selection', '{"text": "Is it raining?", "options": ["Yes, it is.", "I am a teacher.", "It is red."]}', 0.13, 'A1', 'approved', 'manual', 'weather', 'practice', :'t14_a1s2_id', 2),
('response_selection', '{"text": "What do you want to eat?", "options": ["I want rice.", "I live in a house.", "It is cold."]}', 0.14, 'A1', 'approved', 'manual', 'food', 'practice', :'t14_a1s2_id', 3),
('response_selection', '{"text": "Where is the shop?", "options": ["It is next to the bank.", "I am fine.", "Yes, I do."]}', 0.14, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t14_a1s2_id', 4),
('response_selection', '{"text": "Can you help me?", "options": ["Yes, of course.", "It is blue.", "I am ten."]}', 0.15, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t14_a1s2_id', 5),
('response_selection', '{"text": "Would you like to join us for lunch tomorrow?", "options": ["I''d love to, thank you.", "It took two hours.", "She works at a bank."]}', 0.25, 'A2', 'approved', 'manual', 'food', 'practice', :'t14_a2s1_id', 1),
('response_selection', '{"text": "Why were you late for the meeting?", "options": ["The bus was delayed.", "I like reading books.", "It is very cold today."]}', 0.26, 'A2', 'approved', 'manual', 'work', 'practice', :'t14_a2s1_id', 2),
('response_selection', '{"text": "How was your weekend?", "options": ["It was relaxing, thanks.", "He has two brothers.", "The shop opens at nine."]}', 0.27, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t14_a2s1_id', 3),
('response_selection', '{"text": "Could you recommend a good restaurant nearby?", "options": ["Sure, try the one on Main Street.", "I have lived here for years.", "It starts at ten o''clock."]}', 0.28, 'A2', 'approved', 'manual', 'food', 'practice', :'t14_a2s1_id', 4),
('response_selection', '{"text": "Have you finished your homework yet?", "options": ["Not yet, almost done.", "She lives in Mumbai.", "The weather is nice."]}', 0.29, 'A2', 'approved', 'manual', 'education', 'practice', :'t14_a2s1_id', 5),
('response_selection', '{"text": "Did you enjoy your trip to the mountains?", "options": ["Yes, it was wonderful.", "He works from nine to five.", "I need a new phone."]}', 0.31, 'A2', 'approved', 'manual', 'travel', 'practice', :'t14_a2s2_id', 1),
('response_selection', '{"text": "Can we reschedule our meeting to Friday?", "options": ["Sure, Friday works for me.", "I drink tea every morning.", "It is a small house."]}', 0.32, 'A2', 'approved', 'manual', 'work', 'practice', :'t14_a2s2_id', 2),
('response_selection', '{"text": "What time does the pharmacy close?", "options": ["It closes at eight.", "She has two cats.", "The book is interesting."]}', 0.33, 'A2', 'approved', 'manual', 'health', 'practice', :'t14_a2s2_id', 3),
('response_selection', '{"text": "Is this seat available?", "options": ["Yes, please sit down.", "I am from Chennai.", "It rained yesterday."]}', 0.34, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t14_a2s2_id', 4),
('response_selection', '{"text": "How long have you worked here?", "options": ["About three years now.", "I like the color blue.", "She is reading a book."]}', 0.35, 'A2', 'approved', 'manual', 'work', 'practice', :'t14_a2s2_id', 5),
('response_selection', '{"text": "What do you think caused the delay in the project?", "options": ["Mainly supply chain issues with materials.", "I usually wake up at seven.", "She enjoys hiking on weekends."]}', 0.45, 'B1', 'approved', 'manual', 'work', 'practice', :'t14_b1s1_id', 1),
('response_selection', '{"text": "How do you feel about the new remote work policy?", "options": ["I think it offers good flexibility, though teamwork can suffer.", "The train arrives at six.", "He bought a new car last year."]}', 0.46, 'B1', 'approved', 'manual', 'work', 'practice', :'t14_b1s1_id', 2),
('response_selection', '{"text": "Why did the company decide to expand overseas?", "options": ["To access new markets and reduce costs.", "She studies at the university nearby.", "The weather has been quite mild."]}', 0.48, 'B1', 'approved', 'manual', 'work', 'practice', :'t14_b1s1_id', 3),
('response_selection', '{"text": "What''s your opinion on the proposed changes to the curriculum?", "options": ["I believe they will better prepare students for real jobs.", "I usually have cereal for breakfast.", "The library closes at nine."]}', 0.49, 'B1', 'approved', 'manual', 'education', 'practice', :'t14_b1s1_id', 4),
('response_selection', '{"text": "How would you handle a disagreement with a coworker?", "options": ["I''d try to understand their perspective and find common ground.", "I take the bus to work every day.", "She has lived here since childhood."]}', 0.51, 'B1', 'approved', 'manual', 'work', 'practice', :'t14_b1s1_id', 5),
('response_selection', '{"text": "What challenges do small businesses face when going digital?", "options": ["Limited budgets and a lack of technical expertise.", "He likes to play chess on Sundays.", "The museum is free on weekends."]}', 0.52, 'B1', 'approved', 'manual', 'technology', 'practice', :'t14_b1s2_id', 1),
('response_selection', '{"text": "Why is it important for companies to invest in employee training?", "options": ["It improves productivity and reduces staff turnover.", "She visits her grandparents every month.", "The weather forecast predicts rain."]}', 0.54, 'B1', 'approved', 'manual', 'work', 'practice', :'t14_b1s2_id', 2),
('response_selection', '{"text": "What''s the main advantage of renewable energy sources?", "options": ["They reduce long-term environmental impact.", "He finished the race in good time.", "The office opens at eight thirty."]}', 0.55, 'B1', 'approved', 'manual', 'environment', 'practice', :'t14_b1s2_id', 3),
('response_selection', '{"text": "How do you plan to address the budget shortfall this quarter?", "options": ["By cutting non-essential expenses and reviewing contracts.", "I enjoy reading on the weekend.", "The flight departs at noon."]}', 0.57, 'B1', 'approved', 'manual', 'finance', 'practice', :'t14_b1s2_id', 4),
('response_selection', '{"text": "What makes a mentorship program successful?", "options": ["Clear goals and consistent, honest communication.", "She drinks coffee every morning.", "The gym closes at ten."]}', 0.58, 'B1', 'approved', 'manual', 'work', 'practice', :'t14_b1s2_id', 5);

-- ===================== free_writing =====================

INSERT INTO units (item_type_id, name, order_index) VALUES ('free_writing', 'A1 - Beginner', 1) RETURNING id \gset t15_a1_
INSERT INTO units (item_type_id, name, order_index) VALUES ('free_writing', 'A2 - Elementary', 2) RETURNING id \gset t15_a2_
INSERT INTO units (item_type_id, name, order_index) VALUES ('free_writing', 'B1 - Intermediate', 3) RETURNING id \gset t15_b1_

INSERT INTO sets (unit_id, name, order_index) VALUES (:'t15_a1_id', 'Set 1', 1) RETURNING id \gset t15_a1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t15_a1_id', 'Set 2', 2) RETURNING id \gset t15_a1s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t15_a2_id', 'Set 1', 1) RETURNING id \gset t15_a2s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t15_a2_id', 'Set 2', 2) RETURNING id \gset t15_a2s2_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t15_b1_id', 'Set 1', 1) RETURNING id \gset t15_b1s1_
INSERT INTO sets (unit_id, name, order_index) VALUES (:'t15_b1_id', 'Set 2', 2) RETURNING id \gset t15_b1s2_

INSERT INTO items (item_type_id, content, difficulty, cefr_level, status, pipeline_version, topic, pool, set_id, set_order) VALUES
('free_writing', '{"prompt": "Write 2-3 sentences about what you did this morning."}', 0.1, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t15_a1s1_id', 1),
('free_writing', '{"prompt": "Write 2-3 sentences about your family."}', 0.11, 'A1', 'approved', 'manual', 'family', 'practice', :'t15_a1s1_id', 2),
('free_writing', '{"prompt": "Write 2-3 sentences about your favorite food."}', 0.11, 'A1', 'approved', 'manual', 'food', 'practice', :'t15_a1s1_id', 3),
('free_writing', '{"prompt": "Write 2-3 sentences about your best friend."}', 0.12, 'A1', 'approved', 'manual', 'family', 'practice', :'t15_a1s1_id', 4),
('free_writing', '{"prompt": "Write 2-3 sentences about your house."}', 0.12, 'A1', 'approved', 'manual', 'daily-life', 'practice', :'t15_a1s1_id', 5),
('free_writing', '{"prompt": "Write 2-3 sentences about your school."}', 0.13, 'A1', 'approved', 'manual', 'education', 'practice', :'t15_a1s2_id', 1),
('free_writing', '{"prompt": "Write 2-3 sentences about your favorite animal."}', 0.13, 'A1', 'approved', 'manual', 'nature', 'practice', :'t15_a1s2_id', 2),
('free_writing', '{"prompt": "Write 2-3 sentences about what you like to do on weekends."}', 0.14, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t15_a1s2_id', 3),
('free_writing', '{"prompt": "Write 2-3 sentences about the weather today."}', 0.14, 'A1', 'approved', 'manual', 'weather', 'practice', :'t15_a1s2_id', 4),
('free_writing', '{"prompt": "Write 2-3 sentences about your favorite game."}', 0.15, 'A1', 'approved', 'manual', 'hobbies', 'practice', :'t15_a1s2_id', 5),
('free_writing', '{"prompt": "Write a short paragraph about a memorable trip you took."}', 0.25, 'A2', 'approved', 'manual', 'travel', 'practice', :'t15_a2s1_id', 1),
('free_writing', '{"prompt": "Write a short paragraph about your daily routine."}', 0.26, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t15_a2s1_id', 2),
('free_writing', '{"prompt": "Write a short paragraph about a hobby you enjoy and why."}', 0.27, 'A2', 'approved', 'manual', 'hobbies', 'practice', :'t15_a2s1_id', 3),
('free_writing', '{"prompt": "Write a short paragraph about your favorite season and what you like about it."}', 0.28, 'A2', 'approved', 'manual', 'weather', 'practice', :'t15_a2s1_id', 4),
('free_writing', '{"prompt": "Write a short paragraph about a book or movie you recently enjoyed."}', 0.29, 'A2', 'approved', 'manual', 'entertainment', 'practice', :'t15_a2s1_id', 5),
('free_writing', '{"prompt": "Write a short paragraph describing your hometown."}', 0.31, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t15_a2s2_id', 1),
('free_writing', '{"prompt": "Write a short paragraph about a skill you would like to learn."}', 0.32, 'A2', 'approved', 'manual', 'education', 'practice', :'t15_a2s2_id', 2),
('free_writing', '{"prompt": "Write a short paragraph about your typical weekend."}', 0.33, 'A2', 'approved', 'manual', 'daily-life', 'practice', :'t15_a2s2_id', 3),
('free_writing', '{"prompt": "Write a short paragraph about a person who inspires you."}', 0.34, 'A2', 'approved', 'manual', 'family', 'practice', :'t15_a2s2_id', 4),
('free_writing', '{"prompt": "Write a short paragraph about your favorite meal to cook."}', 0.35, 'A2', 'approved', 'manual', 'food', 'practice', :'t15_a2s2_id', 5),
('free_writing', '{"prompt": "Write a paragraph discussing the advantages and disadvantages of social media."}', 0.45, 'B1', 'approved', 'manual', 'technology', 'practice', :'t15_b1s1_id', 1),
('free_writing', '{"prompt": "Write a paragraph about a challenge you overcame and what you learned from it."}', 0.46, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t15_b1s1_id', 2),
('free_writing', '{"prompt": "Write a paragraph describing how technology has changed the way we work."}', 0.48, 'B1', 'approved', 'manual', 'work', 'practice', :'t15_b1s1_id', 3),
('free_writing', '{"prompt": "Write a paragraph about the importance of protecting the environment."}', 0.49, 'B1', 'approved', 'manual', 'environment', 'practice', :'t15_b1s1_id', 4),
('free_writing', '{"prompt": "Write a paragraph about a goal you are currently working toward."}', 0.51, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t15_b1s1_id', 5),
('free_writing', '{"prompt": "Write a paragraph comparing life in a big city versus a small town."}', 0.52, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t15_b1s2_id', 1),
('free_writing', '{"prompt": "Write a paragraph about how education has changed over the past decade."}', 0.54, 'B1', 'approved', 'manual', 'education', 'practice', :'t15_b1s2_id', 2),
('free_writing', '{"prompt": "Write a paragraph discussing the benefits of regular exercise."}', 0.55, 'B1', 'approved', 'manual', 'health', 'practice', :'t15_b1s2_id', 3),
('free_writing', '{"prompt": "Write a paragraph about a piece of advice that changed how you think."}', 0.57, 'B1', 'approved', 'manual', 'daily-life', 'practice', :'t15_b1s2_id', 4),
('free_writing', '{"prompt": "Write a paragraph about what makes a good leader."}', 0.58, 'B1', 'approved', 'manual', 'work', 'practice', :'t15_b1s2_id', 5);

COMMIT;