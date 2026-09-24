-- Modules content hierarchy: Type (existing item_types) -> Unit -> Set ->
-- Question. A Set is a fixed, ordered mini-lesson; Units group Sets (e.g. by
-- difficulty band) within one item type. Purely additive: existing practice
-- items keep set_id NULL and the old count-based session-start path is
-- untouched — this only adds a new, optional way to start a practice
-- session from a specific curated set.
BEGIN;

CREATE TABLE units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type_id text NOT NULL REFERENCES item_types(id),
  name text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_units_item_type_id ON units(item_type_id);

CREATE TABLE sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sets_unit_id ON sets(unit_id);

ALTER TABLE items ADD COLUMN set_id uuid REFERENCES sets(id);
CREATE INDEX idx_items_set_id ON items(set_id);

COMMIT;
