-- Replaces the old hand-authored 160-item bank (now retired) with 113
-- items parsed from the user's "Versant Practice Bank A1-C2" — a systematic
-- A1->C2 ladder across all 18 reference item types, calibrated to real
-- Versant register (verified against Pearson's official VEPT/VPET guides
-- in the companion "Versant Question Bank v2" document).
--
-- difficulty is derived mechanically from cefr_level (never guessed
-- independently), per: A1=.10 A2=.25 B1=.45 B1+=.55 B2=.65 C1=.80 C2=.95
-- Re-runnable: psql "$DATABASE_URL" -f seeds/005_versant_leveled_bank.sql

BEGIN;

-- Read Aloud — ungraded (needs pronunciation scoring, not built)
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('reading', '{"text": "My name is Sam. I work in a shop."}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('reading', '{"text": "I take the bus to work every morning."}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('reading', '{"text": "Please remember to bring your ID badge when you come to the office."}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'work', 'practice'),
('reading', '{"text": "Our team meets every Monday to talk about the week''s plans."}', 'B1', 0.55, 'approved', 'versant-bank-v1', 'work', 'practice'),
('reading', '{"text": "The manager asked everyone to finish their reports before the end of the day."}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'work', 'practice'),
('reading', '{"text": "Even though the flight was delayed, most of the passengers still made their connecting flights on time."}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'travel', 'practice'),
('reading', '{"text": "The company decided to postpone the product launch until the safety review had been fully completed and approved by senior management."}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Repeat — graded exact match
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('repeats', '{"text": "I have a car."}', '{"exact": "I have a car."}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('repeats', '{"text": "She works in an office."}', '{"exact": "She works in an office."}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'work', 'practice'),
('repeats', '{"text": "He asked me to call him back later."}', '{"exact": "He asked me to call him back later."}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('repeats', '{"text": "Please make sure the door is locked before you leave."}', '{"exact": "Please make sure the door is locked before you leave."}', 'B1', 0.55, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('repeats', '{"text": "We couldn''t finish the report because the printer wasn''t working."}', '{"exact": "We couldn''t finish the report because the printer wasn''t working."}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'work', 'practice'),
('repeats', '{"text": "If the client hadn''t called this morning, we wouldn''t have known about the delay."}', '{"exact": "If the client hadn''t called this morning, we wouldn''t have known about the delay."}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'work', 'practice'),
('repeats', '{"text": "The company had to change its plans after the new regulations were announced last month."}', '{"exact": "The company had to change its plans after the new regulations were announced last month."}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Sentence Builds — graded, single correct ordering
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('sentence_builds', '{"groups": ["is", "this", "my pen"]}', '{"correct": "This is my pen."}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('sentence_builds', '{"groups": ["went", "to work", "she"]}', '{"correct": "She went to work."}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('sentence_builds', '{"groups": ["has finished", "he", "his lunch"]}', '{"correct": "He has finished his lunch."}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('sentence_builds', '{"groups": ["before noon", "needs to be", "the email", "sent"]}', '{"correct": "The email needs to be sent before noon."}', 'B1', 0.55, 'approved', 'versant-bank-v1', 'work', 'practice'),
('sentence_builds', '{"groups": ["would have", "if I had time", "called you"]}', '{"correct": "I would have called you if I had time."}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('sentence_builds', '{"groups": ["had the flight", "not been cancelled", "we would have", "arrived on time"]}', '{"correct": "Had the flight not been cancelled, we would have arrived on time."}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'travel', 'practice'),
('sentence_builds', '{"groups": ["only after the meeting", "did the manager", "explain the changes"]}', '{"correct": "Only after the meeting did the manager explain the changes."}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'work', 'practice');

-- Conversations — graded, short-answer style
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('conversations', '{"dialogue": "A: Do you like coffee? B: Yes, I drink it every morning.", "question": "What does the person drink every morning?"}', '{"acceptable_answers": ["coffee"]}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('conversations', '{"dialogue": "A: Where is the meeting room? B: It''s on the second floor.", "question": "Where is the meeting room?"}', '{"acceptable_answers": ["second floor", "on the second floor", "the second floor"]}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'work', 'practice'),
('conversations', '{"dialogue": "A: Can you send me the file today? B: I''m busy now, how about tomorrow?", "question": "When will the file be sent?"}', '{"acceptable_answers": ["tomorrow"]}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'work', 'practice'),
('conversations', '{"dialogue": "A: I heard the shipment is late again. B: Yes, the supplier had a problem this week.", "question": "Why is the shipment late?"}', '{"acceptable_answers": ["the supplier had a problem", "supplier had a problem", "a supplier problem"]}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'business', 'practice'),
('conversations', '{"dialogue": "A: The client wants to change the contract terms. B: Let''s set up a call to go over the details.", "question": "What will they do about the contract?"}', '{"acceptable_answers": ["set up a call", "have a call to discuss it", "set up a call to discuss it"]}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'business', 'practice'),
('conversations', '{"dialogue": "A: The numbers don''t match what we sent last week. B: I''ll check with accounting and get back to you today.", "question": "What will the speaker do?"}', '{"acceptable_answers": ["check with accounting", "check with accounting and get back today"]}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Reading (Selective) — graded, short-answer style
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('reading_selective', '{"text": "CLOSED on Sunday.", "question": "Is the shop open on Sunday?"}', '{"acceptable_answers": ["no"]}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('reading_selective', '{"text": "Meeting moved to 3pm.", "question": "What time is the meeting now?"}', '{"acceptable_answers": ["3pm", "3 pm", "three pm", "three o''clock"]}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'work', 'practice'),
('reading_selective', '{"text": "Send your form before Friday.", "question": "When is the form due?"}', '{"acceptable_answers": ["before friday", "friday"]}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'work', 'practice'),
('reading_selective', '{"text": "Parking lot closed for repairs this week.", "question": "Can you park there this week?"}', '{"acceptable_answers": ["no"]}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('reading_selective', '{"text": "The order will ship once payment is confirmed.", "question": "What has to happen before shipping?"}', '{"acceptable_answers": ["payment must be confirmed", "payment confirmed", "confirm payment", "payment needs to be confirmed"]}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'business', 'practice'),
('reading_selective', '{"text": "Staff should submit expenses within 30 days, or the claim may be delayed.", "question": "What happens if you submit an expense claim late?"}', '{"acceptable_answers": ["the claim may be delayed", "it may be delayed", "delayed"]}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Questions (Simple) — graded short answer
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('short_answer', '{"question": "What color is the sky?"}', '{"acceptable_answers": ["blue"]}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('short_answer', '{"question": "What do you use to cut paper?"}', '{"acceptable_answers": ["scissors", "a pair of scissors"]}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('short_answer', '{"question": "What do you call the person who fixes cars?"}', '{"acceptable_answers": ["a mechanic", "mechanic"]}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('short_answer', '{"question": "Is a year longer than a month?"}', '{"acceptable_answers": ["yes"]}', 'B1', 0.55, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('short_answer', '{"question": "If a meeting is cancelled, does it happen or not?"}', '{"acceptable_answers": ["no", "it does not happen", "not"]}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'work', 'practice'),
('short_answer', '{"question": "The order was delayed. Did it arrive on time or late?"}', '{"acceptable_answers": ["late"]}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'business', 'practice'),
('short_answer', '{"question": "The team missed the deadline. Did they finish on time?"}', '{"acceptable_answers": ["no"]}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'work', 'practice');

-- Passage Comprehension — graded short answer
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('passage_comprehension', '{"story": "Ana has a dog. The dog is brown.", "question": "What color is Ana''s dog?"}', '{"acceptable_answers": ["brown"]}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('passage_comprehension', '{"story": "Tom works at a bank. He starts at 9.", "question": "Where does Tom work?"}', '{"acceptable_answers": ["a bank", "bank"]}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'work', 'practice'),
('passage_comprehension', '{"story": "The store closed early because of the storm.", "question": "Why did the store close early?"}', '{"acceptable_answers": ["because of the storm", "the storm"]}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('passage_comprehension', '{"story": "The team finished the project a week early, so the manager gave them Friday off.", "question": "What did the manager do?"}', '{"acceptable_answers": ["gave them friday off", "gave them the day off"]}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'work', 'practice'),
('passage_comprehension', '{"story": "The client asked for changes to the design, so the team had to redo part of the work before the deadline.", "question": "Why did the team redo the work?"}', '{"acceptable_answers": ["the client asked for changes", "client requested changes", "the client wanted changes"]}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'business', 'practice'),
('passage_comprehension', '{"story": "Sales were lower this quarter, so the company decided to cut costs instead of raising prices.", "question": "What did the company decide to do?"}', '{"acceptable_answers": ["cut costs"]}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Story Retellings — ungraded
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('story_retelling', '{"story": "Sam has a cat. The cat likes to sleep all day."}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('story_retelling', '{"story": "Maria bought bread and milk at the store. Then she went home."}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('story_retelling', '{"story": "David missed the bus, so he walked to work instead. He was a little late."}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('story_retelling', '{"story": "The company released a new app, but customers found it hard to use. After some updates, more people started using it."}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'business', 'practice'),
('story_retelling', '{"story": "The team worked over the weekend to fix a problem with the website. By Monday morning, everything was working again."}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'work', 'practice'),
('story_retelling', '{"story": "The company lost a major client last year, so they changed their sales approach and focused on smaller customers instead. Within months, they had more clients than before."}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Open Questions — ungraded
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('open_questions', '{"prompt": "What is your favorite food?"}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'opinion', 'practice'),
('open_questions', '{"prompt": "What do you do after work?"}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('open_questions', '{"prompt": "Tell me about your job."}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'work', 'practice'),
('open_questions', '{"prompt": "What do you think makes a good manager?"}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'work', 'practice'),
('open_questions', '{"prompt": "How should companies handle employees who want to work from home?"}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'work', 'practice'),
('open_questions', '{"prompt": "Do you think it''s better for a company to grow quickly or grow slowly? Why?"}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Dictation — graded exact match
INSERT INTO items (item_type_id, content, answer_set, word_count, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('dictation', '{"text": "I have a pen."}', '{"exact": "I have a pen."}', 4, 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('dictation', '{"text": "She walks to the store every day."}', '{"exact": "She walks to the store every day."}', 7, 'A2', 0.25, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('dictation', '{"text": "We need to send this email by five o''clock."}', '{"exact": "We need to send this email by five o''clock."}', 9, 'B1', 0.45, 'approved', 'versant-bank-v1', 'work', 'practice'),
('dictation', '{"text": "The manager asked us to check the numbers again before the meeting."}', '{"exact": "The manager asked us to check the numbers again before the meeting."}', 12, 'B2', 0.65, 'approved', 'versant-bank-v1', 'work', 'practice'),
('dictation', '{"text": "If the shipment doesn''t arrive tomorrow, we''ll need to change our plans."}', '{"exact": "If the shipment doesn''t arrive tomorrow, we''ll need to change our plans."}', 12, 'C1', 0.80, 'approved', 'versant-bank-v1', 'business', 'practice'),
('dictation', '{"text": "The company had to delay the launch after the team found a problem during testing."}', '{"exact": "The company had to delay the launch after the team found a problem during testing."}', 15, 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Response Selection — graded MCQ
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('response_selection', '{"text": "How are you?", "options": ["Fine, thanks.", "Blue.", "Tuesday."]}', '{"correctIndex": 0}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('response_selection', '{"text": "Can I help you?", "options": ["I''m looking for the exit.", "It''s raining.", "Seven o''clock."]}', '{"correctIndex": 0}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('response_selection', '{"text": "Could you send me the file today?", "options": ["Sure, I''ll send it by 5pm.", "I like files.", "The office is closed."]}', '{"correctIndex": 0}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'work', 'practice'),
('response_selection', '{"text": "The client wants to move the meeting.", "options": ["Okay, let''s find a new time.", "I enjoy meetings.", "The printer is broken."]}', '{"correctIndex": 0}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'work', 'practice'),
('response_selection', '{"text": "The numbers in this report don''t add up.", "options": ["Let me check them again.", "The weather is nice today.", "I completely agree, no issues at all."]}', '{"correctIndex": 0}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'business', 'practice'),
('response_selection', '{"text": "We might lose the contract if we don''t respond today.", "options": ["I''ll call the client right away.", "That sounds fine.", "Let''s wait until next week."]}', '{"correctIndex": 0}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Speaking Situations — ungraded
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('speaking_situations', '{"situation": "Your friend is late to meet you. What do you say when they arrive?"}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('speaking_situations', '{"situation": "You want to borrow a pen from a coworker. What do you say?"}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'work', 'practice'),
('speaking_situations', '{"situation": "A colleague forgot about a meeting with you. What do you say to them?"}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'work', 'practice'),
('speaking_situations', '{"situation": "Your team missed a deadline. Explain the situation to your manager."}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'work', 'practice'),
('speaking_situations', '{"situation": "A client is upset about a late delivery. Respond to them and offer a solution."}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'business', 'practice'),
('speaking_situations', '{"situation": "Two coworkers disagree about how to handle a project. Help them find a way forward."}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'work', 'practice');

-- Passage Reconstruction — ungraded (real two-phase mechanic: read, it disappears, rewrite from memory)
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('passage_reconstruction', '{"passage": "Ben has a cat. The cat is white."}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('passage_reconstruction', '{"passage": "Every morning, Lucy has coffee before work."}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('passage_reconstruction', '{"passage": "James missed his train, so he waited for the next one."}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'travel', 'practice'),
('passage_reconstruction', '{"passage": "The company let employees work from home two days a week. Most people liked the change."}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'work', 'practice'),
('passage_reconstruction', '{"passage": "The team had some technical problems at first, but they fixed everything and finished the project on time."}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'work', 'practice'),
('passage_reconstruction', '{"passage": "The company was slow to change at first, but once customers started asking for it, they updated their whole approach within a few months."}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Summary and Opinion — ungraded
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('summary_and_opinion', '{"passage": "Many people like pets. Pets make people happy."}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'opinion', 'practice'),
('summary_and_opinion', '{"passage": "Some people like to study alone. Others like to study in groups."}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'education', 'practice'),
('summary_and_opinion', '{"passage": "Working from home saves time, but some people miss seeing their coworkers."}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'work', 'practice'),
('summary_and_opinion', '{"passage": "Some companies use social media to talk to customers, but this can feel less personal."}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'business', 'practice'),
('summary_and_opinion', '{"passage": "Automation can make work faster, but some people worry it will replace jobs that people need."}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'business', 'practice'),
('summary_and_opinion', '{"passage": "Some people think fast growth is best for a company, but growing slowly can help a company stay stable and avoid mistakes."}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Reading Comprehension — graded MCQ (distractor options are original, not from source file, since the file only gave passage/question/answer)
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('reading_comprehension', '{"passage": "Shop open 9am-5pm. Closed Sunday.", "question": "Is the shop open on Sunday?", "options": ["Yes", "No", "Only in the morning", "Only in the afternoon"]}', '{"correctIndex": 1}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('reading_comprehension', '{"passage": "Bus leaves at 8:00, 8:30, 9:00.", "question": "What time is the second bus?", "options": ["8:00", "8:30", "9:00", "9:30"]}', '{"correctIndex": 1}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'travel', 'practice'),
('reading_comprehension', '{"passage": "The gym is closed for cleaning on the first Monday of every month.", "question": "How often is the gym closed for cleaning?", "options": ["Every Monday", "Once a month", "Twice a month", "Never"]}', '{"correctIndex": 1}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('reading_comprehension', '{"passage": "Flight Schedule: Flight A 6:00am on time. Flight B 7:15am delayed 1hr. Flight C 9:00am cancelled.", "question": "Which flight is delayed?", "options": ["Flight A", "Flight B", "Flight C", "None of them"]}', '{"correctIndex": 1}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'travel', 'practice'),
('reading_comprehension', '{"passage": "The survey found that 70% of people liked the idea, but only 40% said they would pay more for it.", "question": "What percentage liked the idea but wouldn''t pay more?", "options": ["70%", "40%", "30%", "110%"]}', '{"correctIndex": 2}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'business', 'practice'),
('reading_comprehension', '{"passage": "The report showed that sales went up this year, but costs went up even more, so overall profit actually went down.", "question": "What happened to profit?", "options": ["It went up", "It went down", "It stayed the same", "It doubled"]}', '{"correctIndex": 1}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Sentence Completion — graded, single word
INSERT INTO items (item_type_id, content, answer_set, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('sentence_completion', '{"sentence": "I ___ a teacher."}', '{"acceptable_answers": ["am"]}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "She ___ to work by bus."}', '{"acceptable_answers": ["goes"]}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "He was ___ for arriving late three times."}', '{"acceptable_answers": ["warned"]}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "Please ___ the form and send it back."}', '{"acceptable_answers": ["fill in", "complete", "fill out"]}', 'B1', 0.55, 'approved', 'versant-bank-v1', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "The company decided to ___ into a new market."}', '{"acceptable_answers": ["expand"]}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'business', 'practice'),
('sentence_completion', '{"sentence": "The report''s numbers were ___ with what we had expected."}', '{"acceptable_answers": ["consistent"]}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'business', 'practice'),
('sentence_completion', '{"sentence": "The two sides finally reached an ___ after weeks of talks."}', '{"acceptable_answers": ["agreement"]}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- Typing — ungraded (measures speed/accuracy, not language ability directly)
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('typing', '{"text": "I have a dog. My dog is small."}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('typing', '{"text": "Every day, I get up at seven and go to work."}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('typing', '{"text": "Our office moved to a new building last month. It''s bigger and brighter."}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'work', 'practice'),
('typing', '{"text": "The company started a new policy that lets people choose their own work hours."}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'work', 'practice'),
('typing', '{"text": "The team had some problems with the new system, but they kept working until it was fixed."}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'work', 'practice'),
('typing', '{"text": "The company decided the long-term benefits of the merger were worth the short-term cost, even though it meant some difficult changes for staff."}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

-- E-Mail Writing — ungraded
INSERT INTO items (item_type_id, content, cefr_level, difficulty, status, pipeline_version, topic, pool) VALUES
('email_writing', '{"prompt": "Write a short email to a friend inviting them to lunch."}', 'A1', 0.10, 'approved', 'versant-bank-v1', 'daily-life', 'practice'),
('email_writing', '{"prompt": "Write a short email to a colleague asking to change tomorrow''s call time."}', 'A2', 0.25, 'approved', 'versant-bank-v1', 'work', 'practice'),
('email_writing', '{"prompt": "Write an email to your manager saying you will be late tomorrow."}', 'B1', 0.45, 'approved', 'versant-bank-v1', 'work', 'practice'),
('email_writing', '{"prompt": "Write an email to a supplier about a late delivery, asking for a replacement."}', 'B2', 0.65, 'approved', 'versant-bank-v1', 'business', 'practice'),
('email_writing', '{"prompt": "Write an email to your manager suggesting a faster way to approve requests."}', 'C1', 0.80, 'approved', 'versant-bank-v1', 'work', 'practice'),
('email_writing', '{"prompt": "Write an email to a client explaining you can''t take on a new project right now, while keeping a good relationship with them."}', 'C2', 0.95, 'approved', 'versant-bank-v1', 'business', 'practice');

COMMIT;
