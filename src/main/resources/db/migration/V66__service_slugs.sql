-- Add slug columns to service_certifications and service_testings tables

ALTER TABLE service_certifications ADD COLUMN IF NOT EXISTS slug VARCHAR(200);
ALTER TABLE service_testings ADD COLUMN IF NOT EXISTS slug VARCHAR(200);

-- Populate slugs from titles
UPDATE service_certifications
SET slug = LOWER(REGEXP_REPLACE(TRIM(BOTH '-' FROM REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')), '-{2,}', '-', 'g'))
WHERE slug IS NULL;

UPDATE service_testings
SET slug = LOWER(REGEXP_REPLACE(TRIM(BOTH '-' FROM REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')), '-{2,}', '-', 'g'))
WHERE slug IS NULL;

-- Resolve duplicates in service_certifications
DO $$
DECLARE
    rec RECORD;
    counter INT;
    base_slug VARCHAR(200);
    new_slug VARCHAR(200);
BEGIN
    FOR rec IN SELECT id, slug FROM service_certifications ORDER BY id LOOP
        base_slug := rec.slug;
        new_slug := base_slug;
        counter := 2;
        WHILE EXISTS (SELECT 1 FROM service_certifications WHERE slug = new_slug AND id != rec.id) LOOP
            new_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        IF new_slug != rec.slug THEN
            UPDATE service_certifications SET slug = new_slug WHERE id = rec.id;
        END IF;
    END LOOP;
END $$;

-- Resolve duplicates in service_testings
DO $$
DECLARE
    rec RECORD;
    counter INT;
    base_slug VARCHAR(200);
    new_slug VARCHAR(200);
BEGIN
    FOR rec IN SELECT id, slug FROM service_testings ORDER BY id LOOP
        base_slug := rec.slug;
        new_slug := base_slug;
        counter := 2;
        WHILE EXISTS (SELECT 1 FROM service_testings WHERE slug = new_slug AND id != rec.id) LOOP
            new_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        IF new_slug != rec.slug THEN
            UPDATE service_testings SET slug = new_slug WHERE id = rec.id;
        END IF;
    END LOOP;
END $$;

-- Add unique constraints
ALTER TABLE service_certifications ADD CONSTRAINT uq_svc_cert_slug UNIQUE (slug);
ALTER TABLE service_testings ADD CONSTRAINT uq_svc_testing_slug UNIQUE (slug);
