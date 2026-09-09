-- Replaces the 113 synthetic Practice Bank items (retired) with content
-- grounded in "Versant_Question_Bank_v2" — real sourced/verified examples
-- from Pearson's official VEPT/VPET Test-Taker Guides (2024) and
-- test-prep-guides.com practice pages. Real sourced items are tagged
-- pipeline_version='sourced-v2' (topic carries a short source citation);
-- supplementary items written to fill the levels/types the source file
-- doesn't reach (mostly A1 and C2, plus thin types like Response Selection)
-- are tagged 'styled-v2', modeled on the same conversational/workplace
-- register as the verified examples, not literary/academic vocabulary.
-- Re-runnable: psql "$DATABASE_URL" -f seeds/006_versant_sourced_bank.sql

BEGIN;

-- ============ Read Aloud (reading) ============
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('reading', '{"text": "My name is Tom. I work at a store."}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('reading', '{"text": "I go to the gym after work most days."}', 'A2', 0.25, 'approved', 'styled-v2', 'daily-life', 'practice'),
('reading', '{"text": "Please see the updated course information and reading material that are attached to this message. All students are requested to bring their handouts to every class."}', 'B1', 0.45, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part A', 'practice'),
('reading', '{"text": "Moving to a new city can be a lonely experience. A person might be busy at work, but feel lonely in the evenings."}', 'B1', 0.50, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part A', 'practice'),
('reading', '{"text": "Many offices are becoming more and more diverse in the current global market. The key to a successful work environment is to appreciate each other''s background."}', 'B2', 0.65, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part A', 'practice'),
('reading', '{"text": "Recent research shows that social media platforms may actually be making us antisocial. Survey results indicate that many people would prefer to interact online rather than see friends and family in person."}', 'C1', 0.80, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part A', 'practice'),
('reading', '{"text": "The board ultimately concluded that the proposed changes, while well-intentioned, would create more administrative burden than the benefits could justify."}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Repeat (repeats) — graded exact match ============
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('repeats', '{"text": "I like tea."}', '{"exact": "I like tea."}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('repeats', '{"text": "Leave town on the next train."}', '{"exact": "Leave town on the next train."}', 'A2', 0.25, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part B', 'practice'),
('repeats', '{"text": "Do you know what''s wrong with the printer?"}', '{"exact": "Do you know what''s wrong with the printer?"}', 'A2', 0.30, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part B', 'practice'),
('repeats', '{"text": "You are allowed 30 minutes for a lunch break."}', '{"exact": "You are allowed 30 minutes for a lunch break."}', 'B1', 0.45, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part A', 'practice'),
('repeats', '{"text": "The files for the company are on the external drive."}', '{"exact": "The files for the company are on the external drive."}', 'B1', 0.50, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part A', 'practice'),
('repeats', '{"text": "It is company policy that uniforms should always be cleaned and pressed."}', '{"exact": "It is company policy that uniforms should always be cleaned and pressed."}', 'B2', 0.60, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part A', 'practice'),
('repeats', '{"text": "We couldn''t have finished the project without you."}', '{"exact": "We couldn''t have finished the project without you."}', 'B2', 0.65, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part A', 'practice'),
('repeats', '{"text": "The Human Resources Department will make the announcement on Monday."}', '{"exact": "The Human Resources Department will make the announcement on Monday."}', 'B2', 0.70, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part A', 'practice'),
('repeats', '{"text": "More students are taking business studies courses than ever before."}', '{"exact": "More students are taking business studies courses than ever before."}', 'C1', 0.80, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part B', 'practice'),
('repeats', '{"text": "The committee ultimately decided to postpone the vote until further clarification could be obtained from legal counsel."}', '{"exact": "The committee ultimately decided to postpone the vote until further clarification could be obtained from legal counsel."}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Sentence Builds ============
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('sentence_builds', '{"groups": ["is", "this", "my bag"]}', '{"correct": "This is my bag."}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('sentence_builds', '{"groups": ["was reading", "my mother", "her favorite magazine"]}', '{"correct": "My mother was reading her favorite magazine."}', 'A2', 0.25, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part C', 'practice'),
('sentence_builds', '{"groups": ["anything", "see", "I didn''t"]}', '{"correct": "I didn''t see anything."}', 'A2', 0.30, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part C', 'practice'),
('sentence_builds', '{"groups": ["staying here", "how long", "is he"]}', '{"correct": "How long is he staying here?"}', 'A2', 0.35, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part C', 'practice'),
('sentence_builds', '{"groups": ["the train", "thirty minutes late", "had arrived"]}', '{"correct": "The train had arrived thirty minutes late."}', 'B1', 0.45, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part C', 'practice'),
('sentence_builds', '{"groups": ["to wear", "was too dirty", "the shirt"]}', '{"correct": "The shirt was too dirty to wear."}', 'B1', 0.50, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part D', 'practice'),
('sentence_builds', '{"groups": ["a recent report", "in detail", "described the findings"]}', '{"correct": "A recent report described the findings in detail."}', 'B2', 0.65, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part B', 'practice'),
('sentence_builds', '{"groups": ["were told about", "members of staff", "the pay cut"]}', '{"correct": "Members of staff were told about the pay cut."}', 'B2', 0.70, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part B', 'practice'),
('sentence_builds', '{"groups": ["is more important", "experience", "than training"]}', '{"correct": "Experience is more important than training."}', 'B2', 0.65, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part C', 'practice'),
('sentence_builds', '{"groups": ["had the manager", "not approved the budget", "the project", "would not have started"]}', '{"correct": "Had the manager not approved the budget, the project would not have started."}', 'C1', 0.80, 'approved', 'styled-v2', 'business', 'practice'),
('sentence_builds', '{"groups": ["only after reviewing the contract", "did the lawyer", "raise any concerns"]}', '{"correct": "Only after reviewing the contract did the lawyer raise any concerns."}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Conversations — graded short answer ============
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('conversations', '{"dialogue": "A: Do you want tea or coffee? B: Coffee, please.", "question": "What does the person want?"}', '{"acceptable_answers": ["coffee"]}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('conversations', '{"dialogue": "A: Where are my keys? B: They''re right beside the newspaper. A: Okay, thanks!", "question": "Where are the keys?"}', '{"acceptable_answers": ["beside the newspaper", "next to the newspaper"]}', 'A2', 0.25, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part C', 'practice'),
('conversations', '{"dialogue": "A: I want to eat a cheeseburger. B: Are you going to get something to drink with it? A: Lemonade would be great.", "question": "What will the person order to drink?"}', '{"acceptable_answers": ["a lemonade", "lemonade"]}', 'A2', 0.30, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part C', 'practice'),
('conversations', '{"dialogue": "A: Lucy, can you come to the office early tomorrow? B: Sure, what time? A: 7:30 would be great.", "question": "What will Lucy have to do tomorrow morning?"}', '{"acceptable_answers": ["go to the office early", "go in at 7:30", "come to the office at 7:30"]}', 'B1', 0.45, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part D', 'practice'),
('conversations', '{"dialogue": "A: Is the train the quickest way to get to your house? B: Actually, I think the bus is faster. The train has a lot of delays. A: Thanks for letting me know.", "question": "How will the man travel to the woman''s house?"}', '{"acceptable_answers": ["the bus", "by bus"]}', 'B1', 0.50, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part D', 'practice'),
('conversations', '{"dialogue": "A: The client called about the invoice. B: I''ll look into it right away.", "question": "What will the person do?"}', '{"acceptable_answers": ["look into the invoice", "look into it right away", "check the invoice"]}', 'B2', 0.65, 'approved', 'styled-v2', 'business', 'practice'),
('conversations', '{"dialogue": "A: We need to decide on the vendor by Friday. B: Let''s schedule a call with the team today.", "question": "What will they do today?"}', '{"acceptable_answers": ["schedule a call with the team", "have a call with the team"]}', 'C1', 0.80, 'approved', 'styled-v2', 'business', 'practice'),
('conversations', '{"dialogue": "A: The board wants a revised proposal before the meeting. B: I''ll have it ready by tomorrow morning.", "question": "When will the proposal be ready?"}', '{"acceptable_answers": ["tomorrow morning", "by tomorrow morning"]}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Reading (Selective) — this exact task name has no confirmed
-- official source (flagged as a gap in Versant_Question_Bank_v2); kept as
-- an honest best-effort construction, not claimed as Pearson-sourced.
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('reading_selective', '{"text": "CLOSED on Sunday.", "question": "Is it open Sunday?"}', '{"acceptable_answers": ["no"]}', 'A1', 0.10, 'approved', 'styled-v2-unverified', 'daily-life', 'practice'),
('reading_selective', '{"text": "Meeting moved to 3pm.", "question": "What time is the meeting now?"}', '{"acceptable_answers": ["3pm", "3 pm", "three pm"]}', 'A2', 0.25, 'approved', 'styled-v2-unverified', 'work', 'practice'),
('reading_selective', '{"text": "Staff parking is reserved for permit holders only between 8am-6pm, Mon-Fri.", "question": "When does the permit rule NOT apply?"}', '{"acceptable_answers": ["evenings, nights, and weekends", "outside 8am-6pm mon-fri", "weekends and evenings"]}', 'B1', 0.45, 'approved', 'unverified-illustrative', 'work', 'practice'),
('reading_selective', '{"text": "Parking lot closed for repairs this week.", "question": "Can you park there this week?"}', '{"acceptable_answers": ["no"]}', 'B2', 0.65, 'approved', 'styled-v2-unverified', 'daily-life', 'practice'),
('reading_selective', '{"text": "The order will ship once payment is confirmed.", "question": "What has to happen before shipping?"}', '{"acceptable_answers": ["payment must be confirmed", "payment confirmed", "confirm payment"]}', 'C1', 0.80, 'approved', 'styled-v2-unverified', 'business', 'practice'),
('reading_selective', '{"text": "Staff should submit expenses within 30 days, or the claim may be delayed.", "question": "What happens if you submit an expense claim late?"}', '{"acceptable_answers": ["the claim may be delayed", "it may be delayed", "delayed"]}', 'C2', 0.95, 'approved', 'styled-v2-unverified', 'business', 'practice');

-- ============ Questions (Simple) — short_answer ============
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('short_answer', '{"question": "Is orange juice a liquid or a solid?"}', '{"acceptable_answers": ["a liquid", "liquid"]}', 'A1', 0.10, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part C', 'practice'),
('short_answer', '{"question": "Is a lemon sweet or sour?"}', '{"acceptable_answers": ["sour"]}', 'A1', 0.15, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part C', 'practice'),
('short_answer', '{"question": "What month comes after September and before November?"}', '{"acceptable_answers": ["october"]}', 'A2', 0.25, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part C', 'practice'),
('short_answer', '{"question": "Tyler is under the weather. Is he ill or on the beach?"}', '{"acceptable_answers": ["ill", "he is ill"]}', 'B1', 0.45, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part C', 'practice'),
('short_answer', '{"question": "Jude was threatened with a demotion. Will he lose his job or get a lower position?"}', '{"acceptable_answers": ["get a lower position", "a lower position"]}', 'B2', 0.65, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part C', 'practice'),
('short_answer', '{"question": "The company decided to do away with twenty sales people. Did they hire them or fire them?"}', '{"acceptable_answers": ["fire them", "fired them"]}', 'B2', 0.70, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part C', 'practice'),
('short_answer', '{"question": "The shipment was delayed. Did it arrive early or late?"}', '{"acceptable_answers": ["late"]}', 'C1', 0.80, 'approved', 'styled-v2', 'business', 'practice'),
('short_answer', '{"question": "The team exceeded their target. Did they do better or worse than expected?"}', '{"acceptable_answers": ["better"]}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Passage Comprehension ============
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('passage_comprehension', '{"story": "Ana has a dog. The dog is brown.", "question": "What color is Ana''s dog?"}', '{"acceptable_answers": ["brown"]}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('passage_comprehension', '{"story": "Tom works at a bank. He starts at 9.", "question": "Where does Tom work?"}', '{"acceptable_answers": ["a bank", "bank"]}', 'A2', 0.25, 'approved', 'styled-v2', 'work', 'practice'),
('passage_comprehension', '{"story": "Jason woke up feeling sick. He called his boss and explained that he couldn''t come into work. Immediately after making the phone call, he took some medicine. A short while later, he started to feel better, so he decided to go to work after all.", "question": "What problem did Jason have when he woke up?"}', '{"acceptable_answers": ["he felt sick", "felt sick", "he was sick"]}', 'B1', 0.45, 'approved', 'sourced-v2', 'Pearson VPET Official Guide (2024), Part G', 'practice'),
('passage_comprehension', '{"story": "Jason woke up feeling sick. He called his boss and explained that he couldn''t come into work. Immediately after making the phone call, he took some medicine. A short while later, he started to feel better, so he decided to go to work after all.", "question": "What did he do right after calling his boss?"}', '{"acceptable_answers": ["took medicine", "took some medicine", "he took medicine"]}', 'B1', 0.50, 'approved', 'sourced-v2', 'Pearson VPET Official Guide (2024), Part G', 'practice'),
('passage_comprehension', '{"story": "Jason woke up feeling sick. He called his boss and explained that he couldn''t come into work. Immediately after making the phone call, he took some medicine. A short while later, he started to feel better, so he decided to go to work after all.", "question": "What did Jason do after that?"}', '{"acceptable_answers": ["he went to work", "went to work"]}', 'B1', 0.55, 'approved', 'sourced-v2', 'Pearson VPET Official Guide (2024), Part G', 'practice'),
('passage_comprehension', '{"story": "The team finished the project a week early, so the manager gave them Friday off.", "question": "What did the manager do?"}', '{"acceptable_answers": ["gave them friday off", "gave them the day off"]}', 'B2', 0.65, 'approved', 'styled-v2', 'work', 'practice'),
('passage_comprehension', '{"story": "The client asked for changes to the design, so the team had to redo part of the work before the deadline.", "question": "Why did the team redo the work?"}', '{"acceptable_answers": ["the client asked for changes", "client requested changes"]}', 'C1', 0.80, 'approved', 'styled-v2', 'business', 'practice'),
('passage_comprehension', '{"story": "Sales were lower this quarter, so the company decided to cut costs instead of raising prices.", "question": "What did the company decide to do?"}', '{"acceptable_answers": ["cut costs"]}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Story Retellings — ungraded ============
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('story_retelling', '{"story": "Sam has a cat. The cat likes to sleep all day."}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('story_retelling', '{"story": "Maria bought bread and milk at the store. Then she went home."}', 'A2', 0.25, 'approved', 'styled-v2', 'daily-life', 'practice'),
('story_retelling', '{"story": "Stephanie had a pet rabbit that she had gotten from the pet store. She paid a lot of money for the rabbit, but after a few weeks, she realized that her pet was not well. She took the rabbit to the vet, who said that her pet had a bad stomach infection. Stephanie got some special medicine for the rabbit, and after about five days, her pet was much better."}', 'B1', 0.45, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part E', 'practice'),
('story_retelling', '{"story": "Scott is a scientist and works for a company that investigates and explores outer space. He researches how stars are made and how they travel through space. After having worked for the company for forty years, it is now time for him to retire. He has decided to get a large telescope to use at home in his free time."}', 'B2', 0.65, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part E', 'practice'),
('story_retelling', '{"story": "The team worked over the weekend to fix a problem with the website. By Monday morning, everything was working again."}', 'C1', 0.80, 'approved', 'styled-v2', 'work', 'practice'),
('story_retelling', '{"story": "The company lost a major client last year, so they changed their sales approach and focused on smaller customers instead. Within months, they had more clients than before."}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Open Questions — ungraded ============
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('open_questions', '{"prompt": "What is your favorite food?"}', 'A1', 0.10, 'approved', 'styled-v2', 'opinion', 'practice'),
('open_questions', '{"prompt": "What do you do after work?"}', 'A2', 0.25, 'approved', 'styled-v2', 'daily-life', 'practice'),
('open_questions', '{"prompt": "Tell me about your job."}', 'B1', 0.45, 'approved', 'styled-v2', 'work', 'practice'),
('open_questions', '{"prompt": "Should people give up cars and motorcycles to avoid causing pollution? Please explain your answer and give examples."}', 'B2', 0.65, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part F', 'practice'),
('open_questions', '{"prompt": "Should workers get paid according to their education or their effort? Please explain your answer and give examples."}', 'C1', 0.80, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant English Speaking Exam Part F', 'practice'),
('open_questions', '{"prompt": "Do you think it is better for a company to grow quickly or grow slowly? Why?"}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Dictation — graded exact match ============
INSERT INTO items (item_type_id, content, answer_set, word_count, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('dictation', '{"text": "I have a pen."}', '{"exact": "I have a pen."}', 4, 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('dictation', '{"text": "Can you work on Monday?"}', '{"exact": "Can you work on Monday?"}', 5, 'A2', 0.25, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part G', 'practice'),
('dictation', '{"text": "It will be ready on Monday."}', '{"exact": "It will be ready on Monday."}', 6, 'A2', 0.30, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part G', 'practice'),
('dictation', '{"text": "I''m afraid I disagree with you."}', '{"exact": "I''m afraid I disagree with you."}', 6, 'B1', 0.45, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part G', 'practice'),
('dictation', '{"text": "The agreement will be drawn up by the legal department."}', '{"exact": "The agreement will be drawn up by the legal department."}', 10, 'B2', 0.65, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part E', 'practice'),
('dictation', '{"text": "Profits were much higher than the company had expected."}', '{"exact": "Profits were much higher than the company had expected."}', 9, 'B2', 0.70, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part G', 'practice'),
('dictation', '{"text": "Companies can apply for certain tax credits and incentives."}', '{"exact": "Companies can apply for certain tax credits and incentives."}', 9, 'C1', 0.80, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part E', 'practice'),
('dictation', '{"text": "The company had to delay the launch after the team found a problem during testing."}', '{"exact": "The company had to delay the launch after the team found a problem during testing."}', 15, 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Response Selection — graded MCQ ============
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('response_selection', '{"text": "How are you?", "options": ["Fine, thanks.", "Blue.", "Tuesday."]}', '{"correctIndex": 0}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('response_selection', '{"text": "What time is it now?", "options": ["I like reading newspapers.", "Food is getting expensive.", "It''s nine o''clock."]}', '{"correctIndex": 2}', 'A2', 0.25, 'approved', 'sourced-v2', 'Pearson VPET Official Guide (2024), Part F', 'practice'),
('response_selection', '{"text": "Could you send me the file today?", "options": ["Sure, I''ll send it by 5pm.", "I like files.", "The office is closed."]}', '{"correctIndex": 0}', 'B1', 0.45, 'approved', 'styled-v2', 'work', 'practice'),
('response_selection', '{"text": "The client wants to move the meeting.", "options": ["Okay, let''s find a new time.", "I enjoy meetings.", "The printer is broken."]}', '{"correctIndex": 0}', 'B2', 0.65, 'approved', 'styled-v2', 'work', 'practice'),
('response_selection', '{"text": "The numbers in this report don''t add up.", "options": ["Let me check them again.", "The weather is nice today.", "I completely agree, no issues at all."]}', '{"correctIndex": 0}', 'C1', 0.80, 'approved', 'styled-v2', 'business', 'practice'),
('response_selection', '{"text": "We might lose the contract if we don''t respond today.", "options": ["I''ll call the client right away.", "That sounds fine.", "Let''s wait until next week."]}', '{"correctIndex": 0}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Speaking Situations — ungraded ============
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('speaking_situations', '{"situation": "Your friend is late to meet you. What do you say when they arrive?"}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('speaking_situations', '{"situation": "You want to borrow a pen from a coworker. What do you say?"}', 'A2', 0.25, 'approved', 'styled-v2', 'work', 'practice'),
('speaking_situations', '{"situation": "You borrowed a jacket from your friend, Mark. However, you spilled coffee on it, and it left a large stain. Mark calls and says he needs his jacket. What would you say to him?"}', 'B1', 0.45, 'approved', 'sourced-v2', 'Pearson VPET Official Guide (2024), Part I', 'practice'),
('speaking_situations', '{"situation": "Your team missed a deadline. Explain the situation to your manager."}', 'B2', 0.65, 'approved', 'styled-v2', 'work', 'practice'),
('speaking_situations', '{"situation": "A client is upset about a late delivery. Respond to them and offer a solution."}', 'C1', 0.80, 'approved', 'styled-v2', 'business', 'practice'),
('speaking_situations', '{"situation": "Two coworkers disagree about how to handle a project. Help them find a way forward."}', 'C2', 0.95, 'approved', 'styled-v2', 'work', 'practice');

-- ============ Passage Reconstruction — ungraded (real two-phase mechanic) ============
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('passage_reconstruction', '{"passage": "Ben has a cat. The cat is white."}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('passage_reconstruction', '{"passage": "John quit his previous job a week ago. His new job will not start for another two weeks. He decided to read as many books as he can while he was not working."}', 'A2', 0.25, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part H', 'practice'),
('passage_reconstruction', '{"passage": "Thomas hates to clean. One day his mother asked him to help clean the house. Thomas did not want his mother to be mad at him. He decided to clean the kitchen. While he was washing the dishes, he dropped a plate. It fell on the floor and broke. He told his mother. She was upset, but she forgave Thomas."}', 'B1', 0.45, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part H', 'practice'),
('passage_reconstruction', '{"passage": "Mike went for ten job interviews. At the last interview, he finally received a job offer."}', 'B1', 0.50, 'approved', 'sourced-v2', 'Pearson VPET Official Guide (2024), Part B', 'practice'),
('passage_reconstruction', '{"passage": "Mark your calendar for the company picnic on Saturday June 11th. This year we are going to have a barbeque and live music from a band called Infinity. Please bring your spouse and children."}', 'B1', 0.55, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part H', 'practice'),
('passage_reconstruction', '{"passage": "Matt was trying to organize a farewell party for Liz. He secretly informed all of the other co-workers about his plan. The head of the department sent a fake email to Liz, telling her to come to the conference room for her exit interview."}', 'B2', 0.65, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part F', 'practice'),
('passage_reconstruction', '{"passage": "The team had some technical problems at first, but they fixed everything and finished the project on time."}', 'C1', 0.80, 'approved', 'styled-v2', 'work', 'practice'),
('passage_reconstruction', '{"passage": "The company was slow to change at first, but once customers started asking for it, they updated their whole approach within a few months."}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Summary and Opinion — ungraded ============
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('summary_and_opinion', '{"passage": "Many people like pets. Pets make people happy."}', 'A1', 0.10, 'approved', 'styled-v2', 'opinion', 'practice'),
('summary_and_opinion', '{"passage": "Some people like to study alone. Others like to study in groups."}', 'A2', 0.25, 'approved', 'styled-v2', 'education', 'practice'),
('summary_and_opinion', '{"passage": "Working from home saves time, but some people miss seeing their coworkers."}', 'B1', 0.45, 'approved', 'styled-v2', 'work', 'practice'),
('summary_and_opinion', '{"passage": "Today, many people communicate using e-mail and instant messaging. It is easy, fast, and convenient. However, face-to-face communication is the best way to communicate. Today, too many people depend on e-mail and instant messaging."}', 'B2', 0.65, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part I', 'practice'),
('summary_and_opinion', '{"passage": "Credit card debt is a major cause of over one million bankruptcies each year. The reason is that many people get a credit card without researching and reading the fine print. Ultimately, the real cause of the financial mess is a lack of self-discipline."}', 'C1', 0.80, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part I', 'practice'),
('summary_and_opinion', '{"passage": "Some people think fast growth is best for a company, but growing slowly can help a company stay stable and avoid mistakes."}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Reading Comprehension — graded MCQ (distractor options
-- are original where the source only gave passage+question+answer) ============
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('reading_comprehension', '{"passage": "Shop open 9am-5pm. Closed Sunday.", "question": "Is the shop open on Sunday?", "options": ["Yes", "No", "Only in the morning", "Only in the afternoon"]}', '{"correctIndex": 1}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('reading_comprehension', '{"passage": "Bus leaves at 8:00, 8:30, 9:00.", "question": "What time is the second bus?", "options": ["8:00", "8:30", "9:00", "9:30"]}', '{"correctIndex": 1}', 'A2', 0.25, 'approved', 'styled-v2', 'travel', 'practice'),
('reading_comprehension', '{"passage": "Movie House Saturday Schedule - Theater 1: The King''s Army, 7:00/9:30/11:45. Theater 2: Anna''s Plan, 1:20/3:15/6:30. Theater 3: The Storm, 12:15/4:45/7:30. Theater 4: Magic Beans, 2:15/5:00/8:30.", "question": "What movie starts first?", "options": ["The King''s Army", "Anna''s Plan", "The Storm", "Magic Beans"]}', '{"correctIndex": 1}', 'B1', 0.45, 'approved', 'sourced-v2', 'Pearson VPET Official Guide (2024), Part C', 'practice'),
('reading_comprehension', '{"passage": "Flight Schedule: Flight A 6:00am on time. Flight B 7:15am delayed 1hr. Flight C 9:00am cancelled.", "question": "Which flight is delayed?", "options": ["Flight A", "Flight B", "Flight C", "None of them"]}', '{"correctIndex": 1}', 'B2', 0.65, 'approved', 'styled-v2', 'travel', 'practice'),
('reading_comprehension', '{"passage": "The survey found that 70% of people liked the idea, but only 40% said they would pay more for it.", "question": "What percentage liked the idea but wouldn''t pay more?", "options": ["70%", "40%", "30%", "110%"]}', '{"correctIndex": 2}', 'C1', 0.80, 'approved', 'styled-v2', 'business', 'practice'),
('reading_comprehension', '{"passage": "The report showed that sales went up this year, but costs went up even more, so overall profit actually went down.", "question": "What happened to profit?", "options": ["It went up", "It went down", "It stayed the same", "It doubled"]}', '{"correctIndex": 1}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Sentence Completion — graded, single word ============
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('sentence_completion', '{"sentence": "I ___ a teacher."}', '{"acceptable_answers": ["am"]}', 'A1', 0.10, 'approved', 'styled-v2', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "It''s ___ tonight. Bring your sweater."}', '{"acceptable_answers": ["cold"]}', 'A2', 0.25, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part F', 'practice'),
('sentence_completion', '{"sentence": "It is so bright and clear today. There isn''t a ___ in the sky."}', '{"acceptable_answers": ["cloud"]}', 'A2', 0.30, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part F', 'practice'),
('sentence_completion', '{"sentence": "What do you ___ for a living?"}', '{"acceptable_answers": ["do"]}', 'A2', 0.35, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part F', 'practice'),
('sentence_completion', '{"sentence": "I had to take out a loan from the ___ to cover the cost of replacing the roof of my house."}', '{"acceptable_answers": ["bank"]}', 'B1', 0.45, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part F', 'practice'),
('sentence_completion', '{"sentence": "We all worked hard to find a solution to the ___."}', '{"acceptable_answers": ["problem"]}', 'B1', 0.48, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part F', 'practice'),
('sentence_completion', '{"sentence": "He always kept a flashlight in his car in case of an ___."}', '{"acceptable_answers": ["emergency"]}', 'B1', 0.50, 'approved', 'sourced-v2', 'Pearson VPET Official Guide (2024), Part A', 'practice'),
('sentence_completion', '{"sentence": "She was ___ from the New York branch to the Los Angeles branch."}', '{"acceptable_answers": ["transferred"]}', 'B1', 0.55, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part D', 'practice'),
('sentence_completion', '{"sentence": "Littering is ___ the law, and if you do so, you will have to pay a fine."}', '{"acceptable_answers": ["against"]}', 'B1', 0.58, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part F', 'practice'),
('sentence_completion', '{"sentence": "I''m sorry to inform you of this at such short ___, but everyone is going to need to work late tonight."}', '{"acceptable_answers": ["notice"]}', 'B2', 0.65, 'approved', 'sourced-v2', 'test-prep-guides.com, 4-Skills Professional Essential Exam Part D', 'practice'),
('sentence_completion', '{"sentence": "An increasing ___ of families are experiencing financial problems."}', '{"acceptable_answers": ["number"]}', 'B2', 0.70, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part F', 'practice'),
('sentence_completion', '{"sentence": "The report''s numbers were ___ with what we had expected."}', '{"acceptable_answers": ["consistent"]}', 'C1', 0.80, 'approved', 'styled-v2', 'business', 'practice'),
('sentence_completion', '{"sentence": "The two sides finally reached an ___ after weeks of talks."}', '{"acceptable_answers": ["agreement"]}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ Typing — ungraded ============
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('typing', '{"text": "I have a dog. My dog is small."}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('typing', '{"text": "Every day, I get up at seven and go to work."}', 'A2', 0.25, 'approved', 'styled-v2', 'daily-life', 'practice'),
('typing', '{"text": "Our office moved to a new building last month. It''s bigger and brighter."}', 'B1', 0.45, 'approved', 'styled-v2', 'work', 'practice'),
('typing', '{"text": "Leadership is a popular topic in today''s organizations. After centuries of studying leaders, it would seem that there would be an agreed upon definition of leadership. However, this is not the case."}', 'B2', 0.65, 'approved', 'sourced-v2', 'Pearson VEPT Official Guide (2024), Part E', 'practice'),
('typing', '{"text": "Diners in restaurants sometimes ask why their servers aren''t able to cope with some of their requests. Is it fair to suggest that members of the service industry typically deliver below-par service to customers?"}', 'B2', 0.70, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Writing Exam Typing section', 'practice'),
('typing', '{"text": "The use of computers in the stock market helps to control national and international finance. These controls were originally designed in order to create long-term monetary stability."}', 'C1', 0.80, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Student Placement Exam Part E', 'practice'),
('typing', '{"text": "The company decided the long-term benefits of the merger were worth the short-term cost, even though it meant some difficult changes for staff."}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

-- ============ E-Mail Writing — ungraded ============
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('email_writing', '{"prompt": "Write a short email to a friend inviting them to lunch."}', 'A1', 0.10, 'approved', 'styled-v2', 'daily-life', 'practice'),
('email_writing', '{"prompt": "Write a short email to a colleague asking to change tomorrow''s call time."}', 'A2', 0.25, 'approved', 'styled-v2', 'work', 'practice'),
('email_writing', '{"prompt": "Write to your bosses giving 60 days'' notice: you are a manager becoming self-employed and resigning."}', 'B1', 0.45, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Writing Exam, Email Writing exercises', 'practice'),
('email_writing', '{"prompt": "After 25 years, your company must close. Write an email to customers announcing a clearance sale."}', 'B1', 0.50, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Writing Exam, Email Writing exercises', 'practice'),
('email_writing', '{"prompt": "You are the manager of an accounting firm trying to acquire new clients, especially in banking, investment, and financial services. Write an email to senior accountants explaining this and proposing they: join a local club, attend networking classes, and arrange meetings with acquaintances in financial services."}', 'B2', 0.65, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Writing Exam, Email Writing section', 'practice'),
('email_writing', '{"prompt": "Inventory doesn''t match usage logs. Write an email reminding employees of the office supplies policy."}', 'B2', 0.70, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Writing Exam, Email Writing exercises', 'practice'),
('email_writing', '{"prompt": "Too many sorting/shipping errors. Write an email asking the team for more diligence."}', 'B2', 0.68, 'approved', 'sourced-v2', 'test-prep-guides.com, Versant Writing Exam, Email Writing exercises', 'practice'),
('email_writing', '{"prompt": "Write an email to your manager suggesting a faster way to approve requests."}', 'C1', 0.80, 'approved', 'styled-v2', 'work', 'practice'),
('email_writing', '{"prompt": "Write an email to a client explaining you can''t take on a new project right now, while keeping a good relationship with them."}', 'C2', 0.95, 'approved', 'styled-v2', 'business', 'practice');

COMMIT;
