-- Up Migration
-- Separates practice-module content from placement-test content. Until now
-- every row in `items` was placement-test content, and the "Today's Plan"
-- dashboard feature assumed a bottomless supply of daily practice material
-- that didn't actually exist — the only items in the table were the 40
-- placement-test questions, meant to be taken once. `pool` lets a practice
-- session draw from a separate, dedicated bank instead of reusing (or
-- exhausting) the placement bank.
ALTER TABLE items ADD COLUMN pool TEXT NOT NULL DEFAULT 'placement';
ALTER TABLE items ADD CONSTRAINT items_pool_check CHECK (pool IN ('placement', 'practice'));
CREATE INDEX idx_items_pool ON items(pool);
