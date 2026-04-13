-- Fix any pre-existing duplicate certificate_ids before adding the unique constraint.
-- Keeps the earliest row (lowest id) intact; suffixes duplicates with -DUP-<id>.
UPDATE certificate c
SET certificate_id = c.certificate_id || '-DUP-' || c.id
WHERE c.id NOT IN (
    SELECT MIN(id) FROM certificate GROUP BY certificate_id
);

-- Add unique constraint on certificate.certificate_id to prevent future duplicates
-- (e.g. if admin resets the sequence to a value already in use).
ALTER TABLE certificate DROP CONSTRAINT IF EXISTS uq_certificate_certificate_id;
ALTER TABLE certificate ADD CONSTRAINT uq_certificate_certificate_id UNIQUE (certificate_id);
