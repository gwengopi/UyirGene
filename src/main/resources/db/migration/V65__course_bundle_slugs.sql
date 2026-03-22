-- Add slug columns to course and course_bundle tables

ALTER TABLE course ADD COLUMN IF NOT EXISTS slug VARCHAR(200);
ALTER TABLE course_bundle ADD COLUMN IF NOT EXISTS slug VARCHAR(200);

-- Populate slugs from titles (lowercase, replace non-alphanumeric with hyphens, trim hyphens)
UPDATE course
SET slug = LOWER(REGEXP_REPLACE(TRIM(BOTH '-' FROM REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')), '-{2,}', '-', 'g'))
WHERE slug IS NULL;

UPDATE course_bundle
SET slug = LOWER(REGEXP_REPLACE(TRIM(BOTH '-' FROM REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')), '-{2,}', '-', 'g'))
WHERE slug IS NULL;

-- Resolve duplicates in course by appending -2, -3, etc.
DO $$
DECLARE
    rec RECORD;
    counter INT;
    base_slug VARCHAR(200);
    new_slug VARCHAR(200);
BEGIN
    FOR rec IN
        SELECT id, slug FROM course ORDER BY id
    LOOP
        base_slug := rec.slug;
        new_slug := base_slug;
        counter := 2;
        WHILE EXISTS (SELECT 1 FROM course WHERE slug = new_slug AND id != rec.id) LOOP
            new_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        IF new_slug != rec.slug THEN
            UPDATE course SET slug = new_slug WHERE id = rec.id;
        END IF;
    END LOOP;
END $$;

-- Resolve duplicates in course_bundle
DO $$
DECLARE
    rec RECORD;
    counter INT;
    base_slug VARCHAR(200);
    new_slug VARCHAR(200);
BEGIN
    FOR rec IN
        SELECT id, slug FROM course_bundle ORDER BY id
    LOOP
        base_slug := rec.slug;
        new_slug := base_slug;
        counter := 2;
        WHILE EXISTS (SELECT 1 FROM course_bundle WHERE slug = new_slug AND id != rec.id) LOOP
            new_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        IF new_slug != rec.slug THEN
            UPDATE course_bundle SET slug = new_slug WHERE id = rec.id;
        END IF;
    END LOOP;
END $$;

-- Add unique constraints
ALTER TABLE course ADD CONSTRAINT uq_course_slug UNIQUE (slug);
ALTER TABLE course_bundle ADD CONSTRAINT uq_bundle_slug UNIQUE (slug);
