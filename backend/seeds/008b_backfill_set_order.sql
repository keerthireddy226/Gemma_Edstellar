-- Backfills set_order for the pilot content seeded by
-- 008_modules_units_sets_pilot.sql, matching each item's exact authored text
-- back to its intended position (created_at ties made the original
-- insertion order unrecoverable from the DB directly — see migration
-- 1789600100000). One-time, matches on unique text/question content.
BEGIN;

-- reading
UPDATE items SET set_order = 1 WHERE content->>'text' = 'I usually wake up at seven in the morning.';
UPDATE items SET set_order = 2 WHERE content->>'text' = 'Can you tell me where the nearest bank is?';
UPDATE items SET set_order = 3 WHERE content->>'text' = 'My sister is studying to become a nurse.';
UPDATE items SET set_order = 4 WHERE content->>'text' = 'We usually have dinner together on Sundays.';
UPDATE items SET set_order = 5 WHERE content->>'text' = 'It looks like it might rain later today.';
UPDATE items SET set_order = 1 WHERE content->>'text' = 'He plays football with his friends every weekend.';
UPDATE items SET set_order = 2 WHERE content->>'text' = 'The train to the city center leaves every ten minutes.';
UPDATE items SET set_order = 3 WHERE content->>'text' = 'Please remember to lock the door before you leave.';
UPDATE items SET set_order = 4 WHERE content->>'text' = 'I would like a cup of coffee with a little milk.';
UPDATE items SET set_order = 5 WHERE content->>'text' = 'The children were playing happily in the park.';
UPDATE items SET set_order = 1 WHERE content->>'text' = 'Despite the heavy traffic, we arrived at the airport on time.';
UPDATE items SET set_order = 2 WHERE content->>'text' = 'The manager explained the new procedure in great detail.';
UPDATE items SET set_order = 3 WHERE content->>'text' = 'She has been practicing the piano for almost ten years.';
UPDATE items SET set_order = 4 WHERE content->>'text' = 'The museum''s new exhibition attracted visitors from around the world.';
UPDATE items SET set_order = 5 WHERE content->>'text' = 'Scientists are still studying the long-term effects of the change.';
UPDATE items SET set_order = 1 WHERE content->>'text' = 'The committee postponed its decision until further evidence was available.';
UPDATE items SET set_order = 2 WHERE content->>'text' = 'Her dedication to the project impressed everyone on the team.';
UPDATE items SET set_order = 3 WHERE content->>'text' = 'The bridge was closed for repairs after the storm damaged its foundation.';
UPDATE items SET set_order = 4 WHERE content->>'text' = 'Negotiators from both sides expressed cautious optimism about the outcome.';
UPDATE items SET set_order = 5 WHERE content->>'text' = 'The professor encouraged students to question their own assumptions.';

-- repeats
UPDATE items SET set_order = 1 WHERE content->>'text' = 'I need to buy some bread.';
UPDATE items SET set_order = 2 WHERE content->>'text' = 'Turn right at the traffic light.';
UPDATE items SET set_order = 3 WHERE content->>'text' = 'She is cooking dinner right now.';
UPDATE items SET set_order = 4 WHERE content->>'text' = 'We got home just before dark.';
UPDATE items SET set_order = 5 WHERE content->>'text' = 'He lost his phone at the station.';
UPDATE items SET set_order = 1 WHERE content->>'text' = 'The weather is nice this weekend.';
UPDATE items SET set_order = 2 WHERE content->>'text' = 'They moved to a new apartment.';
UPDATE items SET set_order = 3 WHERE content->>'text' = 'I would rather stay home tonight.';
UPDATE items SET set_order = 4 WHERE content->>'text' = 'Our meeting starts at ten o''clock.';
UPDATE items SET set_order = 5 WHERE content->>'text' = 'She forgot to bring her umbrella.';
UPDATE items SET set_order = 1 WHERE content->>'text' = 'The company announced a new product line.';
UPDATE items SET set_order = 2 WHERE content->>'text' = 'Her argument was clear and well organized.';
UPDATE items SET set_order = 3 WHERE content->>'text' = 'The government introduced stricter regulations last month.';
UPDATE items SET set_order = 4 WHERE content->>'text' = 'Researchers discovered an unexpected pattern in the data.';
UPDATE items SET set_order = 5 WHERE content->>'text' = 'The negotiations lasted longer than anyone expected.';
UPDATE items SET set_order = 1 WHERE content->>'text' = 'The committee postponed the vote until next week.';
UPDATE items SET set_order = 2 WHERE content->>'text' = 'The bridge remained closed after the storm.';
UPDATE items SET set_order = 3 WHERE content->>'text' = 'His explanation clarified most of the confusion.';
UPDATE items SET set_order = 4 WHERE content->>'text' = 'The exhibition drew visitors from several countries.';
UPDATE items SET set_order = 5 WHERE content->>'text' = 'The proposal received mixed reactions from the board.';

-- reading_comprehension (unique by question field)
UPDATE items SET set_order = 1 WHERE content->>'question' = 'Is the cafe open on Monday?';
UPDATE items SET set_order = 2 WHERE content->>'question' = 'What time is the third train?';
UPDATE items SET set_order = 3 WHERE content->>'question' = 'What color is the recycling bin?';
UPDATE items SET set_order = 4 WHERE content->>'question' = 'Why is the library closed?';
UPDATE items SET set_order = 5 WHERE content->>'question' = 'How much off are shoes?';
UPDATE items SET set_order = 1 WHERE content->>'question' = 'What time does the gym open on weekends?';
UPDATE items SET set_order = 2 WHERE content->>'question' = 'How long is the delay?';
UPDATE items SET set_order = 3 WHERE content->>'question' = 'What is next to the pharmacy?';
UPDATE items SET set_order = 4 WHERE content->>'question' = 'What day is the meeting now?';
UPDATE items SET set_order = 5 WHERE content->>'question' = 'How many eggs does the recipe need?';
UPDATE items SET set_order = 1 WHERE content->>'question' = 'How did the project ultimately finish?';
UPDATE items SET set_order = 2 WHERE content->>'question' = 'What did most respondents prefer?';
UPDATE items SET set_order = 3 WHERE content->>'question' = 'Who is exempt from the new policy?';
UPDATE items SET set_order = 4 WHERE content->>'question' = 'Which part of the museum stayed open?';
UPDATE items SET set_order = 5 WHERE content->>'question' = 'What did economists warn about?';
UPDATE items SET set_order = 1 WHERE content->>'question' = 'How was the budget approved?';
UPDATE items SET set_order = 2 WHERE content->>'question' = 'What happened to the festival?';
UPDATE items SET set_order = 3 WHERE content->>'question' = 'What did students criticize?';
UPDATE items SET set_order = 4 WHERE content->>'question' = 'What is still unresolved?';
UPDATE items SET set_order = 5 WHERE content->>'question' = 'What happened in certain sectors?';

COMMIT;
