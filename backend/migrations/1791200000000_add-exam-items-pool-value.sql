-- Up Migration
-- Practice Tests content needs its own pool value, distinct from
-- 'practice' — otherwise selectPracticeItems() (pool = 'practice', no
-- exam_part_id exclusion) would pull exam-only content into random Modules
-- sessions.
ALTER TABLE items DROP CONSTRAINT items_pool_check;
ALTER TABLE items ADD CONSTRAINT items_pool_check CHECK (pool IN ('placement', 'practice', 'exam'));

-- Down Migration
ALTER TABLE items DROP CONSTRAINT items_pool_check;
ALTER TABLE items ADD CONSTRAINT items_pool_check CHECK (pool IN ('placement', 'practice'));
