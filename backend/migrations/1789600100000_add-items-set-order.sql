-- created_at can't reliably order a set's items: a single multi-row INSERT
-- resolves now() once for the whole statement, so every item in a set gets
-- the exact same timestamp — ORDER BY created_at then has no defined tie-
-- break and can return a different order than authored (confirmed directly:
-- a real query returned item 5 first). set_order is explicit and unique
-- per set, so "same order every time" is actually guaranteed.
BEGIN;
ALTER TABLE items ADD COLUMN set_order integer;
COMMIT;
