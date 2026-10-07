-- Up Migration
-- Practice Tests (full Versant mock exams) content link — mirrors the
-- items.set_id/set_order pattern used for Modules' Units/Sets. An exam row
-- is one parallel form of a product (e.g. "4-Skills Essentials, Set 3");
-- exam_parts breaks it into its real task sections (Repeats, Dictation,
-- etc.), each with its own real item count per the Pearson spec.

ALTER TABLE items ADD COLUMN exam_part_id uuid REFERENCES exam_parts(id);
ALTER TABLE items ADD COLUMN exam_order integer;

ALTER TABLE sessions DROP CONSTRAINT sessions_session_type_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_session_type_check
  CHECK (session_type = ANY (ARRAY['diagnostic'::text, 'practice'::text, 'placement'::text, 'drill'::text, 'coach'::text, 'mocktest'::text]));

-- Down Migration
ALTER TABLE sessions DROP CONSTRAINT sessions_session_type_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_session_type_check
  CHECK (session_type = ANY (ARRAY['diagnostic'::text, 'practice'::text, 'placement'::text, 'drill'::text, 'coach'::text]));

ALTER TABLE items DROP COLUMN exam_order;
ALTER TABLE items DROP COLUMN exam_part_id;
