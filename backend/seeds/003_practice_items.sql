-- Adds a real daily-practice content bank, separate from the 40 placement-
-- test items. Until now the "Today's Plan" dashboard feature computed item
-- counts as if there were enough distinct content to fill many days of
-- practice, but the only items in the table were placement-test content
-- (4 per type), meant to be taken once. This adds 12 items per item type
-- (120 total) tagged pool='practice', spread across a genuine difficulty
-- range (~0.15 easy to ~0.9 hard) so a multi-day plan can serve fresh,
-- level-appropriate content instead of exhausting after a day or two.
-- Re-runnable: psql "$DATABASE_URL" -f seeds/003_practice_items.sql

BEGIN;

-- Reading — pronunciation practice, no listening component, ungraded
INSERT INTO items (item_type_id, content, difficulty, status, pipeline_version, topic, pool) VALUES
('reading', '{"text": "My brother works at a hospital downtown."}', 0.15, 'approved', 'manual', 'daily-life', 'practice'),
('reading', '{"text": "We should leave early to avoid the traffic."}', 0.25, 'approved', 'manual', 'transport', 'practice'),
('reading', '{"text": "Could you please pass me the salt and pepper?"}', 0.30, 'approved', 'manual', 'dining', 'practice'),
('reading', '{"text": "The library closes at nine o''clock on weekdays."}', 0.35, 'approved', 'manual', 'daily-life', 'practice'),
('reading', '{"text": "She''s been learning to play the guitar since April."}', 0.45, 'approved', 'manual', 'hobbies', 'practice'),
('reading', '{"text": "Our flight was delayed because of the storm."}', 0.50, 'approved', 'manual', 'travel', 'practice'),
('reading', '{"text": "He apologized for arriving late to the meeting."}', 0.55, 'approved', 'manual', 'work', 'practice'),
('reading', '{"text": "The recipe calls for two cups of flour and a pinch of salt."}', 0.60, 'approved', 'manual', 'cooking', 'practice'),
('reading', '{"text": "Despite the rain, hundreds of people attended the outdoor concert."}', 0.70, 'approved', 'manual', 'events', 'practice'),
('reading', '{"text": "The professor''s explanation clarified several points that had confused the students."}', 0.75, 'approved', 'manual', 'education', 'practice'),
('reading', '{"text": "Negotiations between the two companies collapsed after months of discussion."}', 0.85, 'approved', 'manual', 'business', 'practice'),
('reading', '{"text": "The committee acknowledged the proposal''s merits while questioning its feasibility."}', 0.90, 'approved', 'manual', 'business', 'practice');

-- Repeats — hear it, repeat it exactly
INSERT INTO items (item_type_id, content, answer_set, difficulty, status, pipeline_version, topic, pool) VALUES
('repeats', '{"text": "I need to buy some milk."}', '{"exact": "I need to buy some milk."}', 0.15, 'approved', 'manual', 'daily-life', 'practice'),
('repeats', '{"text": "Turn left at the next corner."}', '{"exact": "Turn left at the next corner."}', 0.20, 'approved', 'manual', 'directions', 'practice'),
('repeats', '{"text": "She is reading a book right now."}', '{"exact": "She is reading a book right now."}', 0.30, 'approved', 'manual', 'daily-life', 'practice'),
('repeats', '{"text": "We arrived just in time for the show."}', '{"exact": "We arrived just in time for the show."}', 0.35, 'approved', 'manual', 'entertainment', 'practice'),
('repeats', '{"text": "He forgot his keys at the office again."}', '{"exact": "He forgot his keys at the office again."}', 0.45, 'approved', 'manual', 'work', 'practice'),
('repeats', '{"text": "The weather has been unusually warm this week."}', '{"exact": "The weather has been unusually warm this week."}', 0.50, 'approved', 'manual', 'weather', 'practice'),
('repeats', '{"text": "They decided to postpone the trip until next month."}', '{"exact": "They decided to postpone the trip until next month."}', 0.55, 'approved', 'manual', 'travel', 'practice'),
('repeats', '{"text": "I would rather walk than take the bus today."}', '{"exact": "I would rather walk than take the bus today."}', 0.60, 'approved', 'manual', 'daily-life', 'practice'),
('repeats', '{"text": "The company announced a new policy affecting all employees."}', '{"exact": "The company announced a new policy affecting all employees."}', 0.70, 'approved', 'manual', 'work', 'practice'),
('repeats', '{"text": "Her argument was both persuasive and well researched."}', '{"exact": "Her argument was both persuasive and well researched."}', 0.75, 'approved', 'manual', 'education', 'practice'),
('repeats', '{"text": "The government''s new regulations sparked widespread debate among economists."}', '{"exact": "The government''s new regulations sparked widespread debate among economists."}', 0.85, 'approved', 'manual', 'politics', 'practice'),
('repeats', '{"text": "Although he disagreed with the decision, he respected the committee''s authority."}', '{"exact": "Although he disagreed with the decision, he respected the committee''s authority."}', 0.90, 'approved', 'manual', 'work', 'practice');

-- Short Answer Questions — hear a question, answer in a few words
INSERT INTO items (item_type_id, content, answer_set, difficulty, status, pipeline_version, topic, pool) VALUES
('short_answer', '{"question": "What do you call the meal you eat in the morning?"}', '{"acceptable_answers": ["breakfast"]}', 0.15, 'approved', 'manual', 'daily-life', 'practice'),
('short_answer', '{"question": "What is the opposite of ''hot''?"}', '{"acceptable_answers": ["cold"]}', 0.20, 'approved', 'manual', 'vocabulary', 'practice'),
('short_answer', '{"question": "What do you use to write on a whiteboard?"}', '{"acceptable_answers": ["a marker", "marker"]}', 0.30, 'approved', 'manual', 'daily-life', 'practice'),
('short_answer', '{"question": "What''s the name for a doctor who treats teeth?"}', '{"acceptable_answers": ["a dentist", "dentist"]}', 0.35, 'approved', 'manual', 'health', 'practice'),
('short_answer', '{"question": "What do you call a place where you borrow books?"}', '{"acceptable_answers": ["a library", "library"]}', 0.40, 'approved', 'manual', 'daily-life', 'practice'),
('short_answer', '{"question": "What''s another word for ''happy''?"}', '{"acceptable_answers": ["glad", "joyful", "cheerful", "pleased"]}', 0.50, 'approved', 'manual', 'vocabulary', 'practice'),
('short_answer', '{"question": "What do you call someone who studies the stars and planets?"}', '{"acceptable_answers": ["an astronomer", "astronomer"]}', 0.55, 'approved', 'manual', 'education', 'practice'),
('short_answer', '{"question": "What''s the term for a written agreement between two companies?"}', '{"acceptable_answers": ["a contract", "contract"]}', 0.60, 'approved', 'manual', 'business', 'practice'),
('short_answer', '{"question": "What''s the word for a fear of small, enclosed spaces?"}', '{"acceptable_answers": ["claustrophobia"]}', 0.65, 'approved', 'manual', 'health', 'practice'),
('short_answer', '{"question": "What''s the term for money paid regularly for the use of a rented property?"}', '{"acceptable_answers": ["rent"]}', 0.70, 'approved', 'manual', 'daily-life', 'practice'),
('short_answer', '{"question": "What''s the word meaning ''very unwilling to spend money''?"}', '{"acceptable_answers": ["stingy", "miserly"]}', 0.80, 'approved', 'manual', 'vocabulary', 'practice'),
('short_answer', '{"question": "What''s the term for a sudden, significant rise in prices across an economy?"}', '{"acceptable_answers": ["inflation"]}', 0.85, 'approved', 'manual', 'economics', 'practice');

-- Sentence Builds — hear 3 word/phrase groups, speak them in the correct order.
-- All strictly subject/verb-phrase/object chunks (no separate movable
-- adverbial group) so each item has exactly one grammatical ordering.
INSERT INTO items (item_type_id, content, answer_set, difficulty, status, pipeline_version, topic, pool) VALUES
('sentence_builds', '{"groups": ["a new laptop", "needs", "my colleague"]}', '{"correct": "My colleague needs a new laptop."}', 0.15, 'approved', 'manual', 'work', 'practice'),
('sentence_builds', '{"groups": ["is cooking", "dinner", "my mother"]}', '{"correct": "My mother is cooking dinner."}', 0.20, 'approved', 'manual', 'daily-life', 'practice'),
('sentence_builds', '{"groups": ["enjoys hiking on weekends", "our neighbor"]}', '{"correct": "Our neighbor enjoys hiking on weekends."}', 0.30, 'approved', 'manual', 'hobbies', 'practice'),
('sentence_builds', '{"groups": ["a difficult decision", "has made", "the manager"]}', '{"correct": "The manager has made a difficult decision."}', 0.40, 'approved', 'manual', 'work', 'practice'),
('sentence_builds', '{"groups": ["completed", "the project", "the engineering team"]}', '{"correct": "The engineering team completed the project."}', 0.45, 'approved', 'manual', 'work', 'practice'),
('sentence_builds', '{"groups": ["is reviewing", "the new contract", "our lawyer"]}', '{"correct": "Our lawyer is reviewing the new contract."}', 0.50, 'approved', 'manual', 'business', 'practice'),
('sentence_builds', '{"groups": ["several concerns", "raised", "the shareholders"]}', '{"correct": "The shareholders raised several concerns."}', 0.55, 'approved', 'manual', 'business', 'practice'),
('sentence_builds', '{"groups": ["has significantly improved", "customer satisfaction", "the updated software"]}', '{"correct": "The updated software has significantly improved customer satisfaction."}', 0.60, 'approved', 'manual', 'technology', 'practice'),
('sentence_builds', '{"groups": ["a comprehensive review", "requested", "the board of directors"]}', '{"correct": "The board of directors requested a comprehensive review."}', 0.65, 'approved', 'manual', 'business', 'practice'),
('sentence_builds', '{"groups": ["a substantial pay increase", "negotiated", "the union representatives"]}', '{"correct": "The union representatives negotiated a substantial pay increase."}', 0.70, 'approved', 'manual', 'work', 'practice'),
('sentence_builds', '{"groups": ["the company''s quarterly earnings", "significantly exceeded", "analysts'' expectations"]}', '{"correct": "The company''s quarterly earnings significantly exceeded analysts'' expectations."}', 0.80, 'approved', 'manual', 'business', 'practice'),
('sentence_builds', '{"groups": ["a formal complaint", "filed", "the dissatisfied customer"]}', '{"correct": "The dissatisfied customer filed a formal complaint."}', 0.85, 'approved', 'manual', 'business', 'practice');

-- Story Retelling — hear a short story, retell it in your own words, ungraded
INSERT INTO items (item_type_id, content, difficulty, status, pipeline_version, topic, pool) VALUES
('story_retelling', '{"story": "Maria lost her wallet at the mall, but a kind stranger found it and returned it to the lost-and-found desk."}', 0.15, 'approved', 'manual', 'daily-life', 'practice'),
('story_retelling', '{"story": "Jake was late for his flight, so he ran through the airport and just made it before the gate closed."}', 0.25, 'approved', 'manual', 'travel', 'practice'),
('story_retelling', '{"story": "The Chen family planted a small vegetable garden in their backyard, and by summer they were harvesting fresh tomatoes and peppers every week."}', 0.35, 'approved', 'manual', 'family', 'practice'),
('story_retelling', '{"story": "After weeks of practice, Aisha finally performed her piano piece at the school concert without a single mistake."}', 0.40, 'approved', 'manual', 'education', 'practice'),
('story_retelling', '{"story": "A sudden power outage left the office in darkness, so everyone gathered in the break room and told stories by candlelight until the lights came back on."}', 0.50, 'approved', 'manual', 'work', 'practice'),
('story_retelling', '{"story": "When the local bakery announced it was closing after 40 years, longtime customers organized a farewell event to thank the owners for their service."}', 0.55, 'approved', 'manual', 'community', 'practice'),
('story_retelling', '{"story": "David spent his weekend fixing his neighbor''s fence after a storm knocked it down, refusing any payment for the work."}', 0.60, 'approved', 'manual', 'community', 'practice'),
('story_retelling', '{"story": "The research team spent three years studying coral reefs before publishing findings that changed how scientists understood ocean temperature effects."}', 0.70, 'approved', 'manual', 'science', 'practice'),
('story_retelling', '{"story": "Facing budget cuts, the small nonprofit had to choose between reducing staff or scaling back its community programs, ultimately deciding to ask donors for emergency support instead."}', 0.75, 'approved', 'manual', 'nonprofit', 'practice'),
('story_retelling', '{"story": "The startup''s founders disagreed sharply over whether to accept a buyout offer, a conflict that eventually led one of them to leave the company entirely."}', 0.80, 'approved', 'manual', 'business', 'practice'),
('story_retelling', '{"story": "After the merger was announced, employees at both companies grew anxious about layoffs, prompting management to hold a series of town halls to address concerns directly."}', 0.85, 'approved', 'manual', 'business', 'practice'),
('story_retelling', '{"story": "The city council debated for months over the proposed transit expansion, weighing environmental benefits against the financial burden on taxpayers before finally approving a scaled-down version."}', 0.90, 'approved', 'manual', 'civic', 'practice');

-- Open Questions — spoken opinion, ungraded
INSERT INTO items (item_type_id, content, difficulty, status, pipeline_version, topic, pool) VALUES
('open_questions', '{"prompt": "What did you do last weekend?"}', 0.15, 'approved', 'manual', 'daily-life', 'practice'),
('open_questions', '{"prompt": "Describe your favorite place to relax."}', 0.20, 'approved', 'manual', 'lifestyle', 'practice'),
('open_questions', '{"prompt": "What''s a hobby you''d like to try someday?"}', 0.30, 'approved', 'manual', 'hobbies', 'practice'),
('open_questions', '{"prompt": "Tell me about a meal you really enjoyed recently."}', 0.35, 'approved', 'manual', 'food', 'practice'),
('open_questions', '{"prompt": "What''s the best piece of advice someone has given you?"}', 0.45, 'approved', 'manual', 'opinion', 'practice'),
('open_questions', '{"prompt": "Do you prefer working in a team or alone? Why?"}', 0.50, 'approved', 'manual', 'work', 'practice'),
('open_questions', '{"prompt": "What''s a skill you think everyone should learn?"}', 0.55, 'approved', 'manual', 'opinion', 'practice'),
('open_questions', '{"prompt": "How has technology changed the way you communicate with friends and family?"}', 0.65, 'approved', 'manual', 'technology', 'practice'),
('open_questions', '{"prompt": "Do you think it''s better to specialize in one field or have knowledge in many? Explain your view."}', 0.70, 'approved', 'manual', 'opinion', 'practice'),
('open_questions', '{"prompt": "What''s a difficult decision you''ve had to make, and how did you approach it?"}', 0.75, 'approved', 'manual', 'opinion', 'practice'),
('open_questions', '{"prompt": "Do you think remote work will remain common in the future? Why or why not?"}', 0.80, 'approved', 'manual', 'work', 'practice'),
('open_questions', '{"prompt": "How do you think artificial intelligence will change the job market in the next decade?"}', 0.90, 'approved', 'manual', 'technology', 'practice');

-- Dictation — type exactly what is heard
INSERT INTO items (item_type_id, content, answer_set, word_count, difficulty, status, pipeline_version, topic, pool) VALUES
('dictation', '{"text": "I like tea."}', '{"exact": "I like tea."}', 3, 0.15, 'approved', 'manual', 'daily-life', 'practice'),
('dictation', '{"text": "She has two cats."}', '{"exact": "She has two cats."}', 4, 0.20, 'approved', 'manual', 'daily-life', 'practice'),
('dictation', '{"text": "We walked to the park."}', '{"exact": "We walked to the park."}', 5, 0.25, 'approved', 'manual', 'daily-life', 'practice'),
('dictation', '{"text": "He always arrives on time."}', '{"exact": "He always arrives on time."}', 5, 0.30, 'approved', 'manual', 'daily-life', 'practice'),
('dictation', '{"text": "The children played outside all afternoon."}', '{"exact": "The children played outside all afternoon."}', 6, 0.40, 'approved', 'manual', 'family', 'practice'),
('dictation', '{"text": "Our team finished the report early."}', '{"exact": "Our team finished the report early."}', 6, 0.45, 'approved', 'manual', 'work', 'practice'),
('dictation', '{"text": "She apologized for the misunderstanding immediately."}', '{"exact": "She apologized for the misunderstanding immediately."}', 6, 0.50, 'approved', 'manual', 'work', 'practice'),
('dictation', '{"text": "The train was delayed by almost an hour."}', '{"exact": "The train was delayed by almost an hour."}', 8, 0.55, 'approved', 'manual', 'travel', 'practice'),
('dictation', '{"text": "Investors reacted quickly to the surprising announcement."}', '{"exact": "Investors reacted quickly to the surprising announcement."}', 7, 0.65, 'approved', 'manual', 'business', 'practice'),
('dictation', '{"text": "The professor postponed the exam until next Friday."}', '{"exact": "The professor postponed the exam until next Friday."}', 8, 0.60, 'approved', 'manual', 'education', 'practice'),
('dictation', '{"text": "Rising costs forced the company to reconsider its expansion plans."}', '{"exact": "Rising costs forced the company to reconsider its expansion plans."}', 10, 0.75, 'approved', 'manual', 'business', 'practice'),
('dictation', '{"text": "The committee unanimously approved the proposal after lengthy deliberation."}', '{"exact": "The committee unanimously approved the proposal after lengthy deliberation."}', 9, 0.85, 'approved', 'manual', 'business', 'practice');

-- Sentence Completion — typed grammar item
INSERT INTO items (item_type_id, content, answer_set, difficulty, status, pipeline_version, topic, pool) VALUES
('sentence_completion', '{"sentence": "He ___ (play) football every weekend.", "hint_word": "play"}', '{"acceptable_answers": ["plays"]}', 0.15, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "They ___ (be) very tired after the trip.", "hint_word": "be"}', '{"acceptable_answers": ["were"]}', 0.20, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "I ___ (not/like) spicy food.", "hint_word": "not/like"}', '{"acceptable_answers": ["don''t like", "do not like"]}', 0.30, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "If it ___ (rain) tomorrow, we will cancel the picnic.", "hint_word": "rain"}', '{"acceptable_answers": ["rains"]}', 0.40, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "She ___ (study) English for three years.", "hint_word": "study"}', '{"acceptable_answers": ["has studied", "has been studying"]}', 0.45, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "By the time we arrived, the movie ___ (already/start).", "hint_word": "already/start"}', '{"acceptable_answers": ["had already started"]}', 0.55, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "The report ___ (submit) by the manager before the deadline.", "hint_word": "submit"}', '{"acceptable_answers": ["was submitted"]}', 0.55, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "The new policy ___ (implement) next quarter.", "hint_word": "implement"}', '{"acceptable_answers": ["will be implemented"]}', 0.60, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "She wishes she ___ (bring) an umbrella; it started raining halfway through the walk.", "hint_word": "bring"}', '{"acceptable_answers": ["had brought"]}', 0.65, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "Had they ___ (check) the forecast, they wouldn''t have gone hiking in the storm.", "hint_word": "check"}', '{"acceptable_answers": ["checked"]}', 0.75, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "The proposal ___ (reject) unless further evidence is provided.", "hint_word": "reject"}', '{"acceptable_answers": ["will be rejected"]}', 0.80, 'approved', 'manual', 'grammar', 'practice'),
('sentence_completion', '{"sentence": "Had the negotiations not collapsed, the merger ___ (finalize) by now.", "hint_word": "finalize"}', '{"acceptable_answers": ["would have been finalized"]}', 0.90, 'approved', 'manual', 'grammar', 'practice');

-- Passage Reconstruction / Error Correction — fix a short passage with grammar errors
INSERT INTO items (item_type_id, content, answer_set, difficulty, status, pipeline_version, topic, pool) VALUES
('passage_reconstruction', '{"passage": "She don''t have no time today. He are busy too."}', '{"corrected": "She doesn''t have time today. He is busy too."}', 0.15, 'approved', 'manual', 'daily-life', 'practice'),
('passage_reconstruction', '{"passage": "Yesterday, I go to the store and buys some bread."}', '{"corrected": "Yesterday, I went to the store and bought some bread."}', 0.25, 'approved', 'manual', 'daily-life', 'practice'),
('passage_reconstruction', '{"passage": "My brother don''t like vegetables, but he eat fruit everyday."}', '{"corrected": "My brother doesn''t like vegetables, but he eats fruit every day."}', 0.30, 'approved', 'manual', 'family', 'practice'),
('passage_reconstruction', '{"passage": "There is many people at the concert last night. It was very loud."}', '{"corrected": "There were many people at the concert last night. It was very loud."}', 0.35, 'approved', 'manual', 'entertainment', 'practice'),
('passage_reconstruction', '{"passage": "The children was playing in the park when it start to rain suddenly."}', '{"corrected": "The children were playing in the park when it started to rain suddenly."}', 0.45, 'approved', 'manual', 'weather', 'practice'),
('passage_reconstruction', '{"passage": "She have been working here since three years and she enjoy her job."}', '{"corrected": "She has been working here for three years and she enjoys her job."}', 0.50, 'approved', 'manual', 'work', 'practice'),
('passage_reconstruction', '{"passage": "The manager ask us to finish the report until Friday, but we needed more time."}', '{"corrected": "The manager asked us to finish the report by Friday, but we needed more time."}', 0.55, 'approved', 'manual', 'work', 'practice'),
('passage_reconstruction', '{"passage": "If he would have checked his email before leaving, he would notice that the client had cancelled the site visit."}', '{"corrected": "If he had checked his email before leaving, he would have noticed that the client had cancelled the site visit."}', 0.60, 'approved', 'manual', 'work', 'practice'),
('passage_reconstruction', '{"passage": "The CEO, along with two senior directors, were present at the emergency meeting to address the failed acquisition."}', '{"corrected": "The CEO, along with two senior directors, was present at the emergency meeting to address the failed acquisition."}', 0.70, 'approved', 'manual', 'business', 'practice'),
('passage_reconstruction', '{"passage": "Despite the company announce record profits, the stock price continued to falling throughout the week."}', '{"corrected": "Despite the company announcing record profits, the stock price continued to fall throughout the week."}', 0.75, 'approved', 'manual', 'business', 'practice'),
('passage_reconstruction', '{"passage": "The engineers, whom had worked on the project for months, was surprised when it were cancelled without warning."}', '{"corrected": "The engineers, who had worked on the project for months, were surprised when it was cancelled without warning."}', 0.85, 'approved', 'manual', 'business', 'practice'),
('passage_reconstruction', '{"passage": "Had the board been informed sooner, the decision would been reversed before it cause irreversible damage to investor confidence."}', '{"corrected": "Had the board been informed sooner, the decision would have been reversed before it caused irreversible damage to investor confidence."}', 0.90, 'approved', 'manual', 'business', 'practice');

-- Free Writing — short typed response to a prompt, ungraded
INSERT INTO items (item_type_id, content, difficulty, status, pipeline_version, topic, pool) VALUES
('free_writing', '{"prompt": "Write 2-3 sentences about what you did this morning."}', 0.15, 'approved', 'manual', 'daily-life', 'practice'),
('free_writing', '{"prompt": "Describe your favorite season in 2-3 sentences."}', 0.20, 'approved', 'manual', 'lifestyle', 'practice'),
('free_writing', '{"prompt": "Write 2-3 sentences about a book or movie you enjoyed."}', 0.30, 'approved', 'manual', 'entertainment', 'practice'),
('free_writing', '{"prompt": "In 3-4 sentences, describe your ideal weekend."}', 0.35, 'approved', 'manual', 'lifestyle', 'practice'),
('free_writing', '{"prompt": "Write 3-4 sentences about a person who has influenced you."}', 0.45, 'approved', 'manual', 'opinion', 'practice'),
('free_writing', '{"prompt": "In 3-4 sentences, describe a challenge you overcame recently."}', 0.50, 'approved', 'manual', 'opinion', 'practice'),
('free_writing', '{"prompt": "Write 4-5 sentences about how you think cities could reduce traffic congestion."}', 0.60, 'approved', 'manual', 'opinion', 'practice'),
('free_writing', '{"prompt": "In 4-5 sentences, discuss the advantages and disadvantages of social media."}', 0.65, 'approved', 'manual', 'technology', 'practice'),
('free_writing', '{"prompt": "Write a short paragraph (4-6 sentences) about whether schools should teach financial literacy."}', 0.70, 'approved', 'manual', 'education', 'practice'),
('free_writing', '{"prompt": "In a short paragraph, explain what you think makes a good leader."}', 0.75, 'approved', 'manual', 'opinion', 'practice'),
('free_writing', '{"prompt": "Write a paragraph discussing whether governments should regulate artificial intelligence, and why."}', 0.85, 'approved', 'manual', 'technology', 'practice'),
('free_writing', '{"prompt": "In a short paragraph, argue for or against the idea that economic growth should be prioritized over environmental protection."}', 0.90, 'approved', 'manual', 'opinion', 'practice');

COMMIT;
