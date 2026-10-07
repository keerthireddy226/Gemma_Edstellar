-- Up Migration
-- Expands the badge list from the 4 already live on the dashboard (computed
-- live, never persisted) to 9, and actually persists unlocks going forward
-- via user_achievements — enables a real earned_at timestamp and a future
-- "new badge" notification, neither possible with a purely live computation.
INSERT INTO achievements (id, title, description, icon) VALUES
  ('first_session', 'First Session', 'Completed your first practice session.', 'trophy'),
  ('ten_questions', '10 Questions', 'Answered 10 practice questions.', 'list-checks'),
  ('streak_3', '3-Day Streak', 'Practiced 3 days in a row.', 'flame'),
  ('sharp', 'Sharp', 'Reached 80% accuracy or higher.', 'target'),
  ('streak_7', '7-Day Streak', 'Practiced 7 days in a row.', 'flame'),
  ('streak_30', '30-Day Streak', 'Practiced 30 days in a row.', 'flame'),
  ('full_coverage', 'Full Coverage', 'Tried every skill at least once.', 'layers'),
  ('first_placement', 'First Placement', 'Completed your placement test.', 'award'),
  ('level_up', 'Leveling Up', 'Mastered a skill and reached Level 2.', 'star')
ON CONFLICT (id) DO NOTHING;

-- Down Migration
DELETE FROM achievements WHERE id IN (
  'first_session', 'ten_questions', 'streak_3', 'sharp', 'streak_7',
  'streak_30', 'full_coverage', 'first_placement', 'level_up'
);
