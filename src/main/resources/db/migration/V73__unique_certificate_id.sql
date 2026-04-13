-- Add unique constraint on certificate.certificate_id to prevent duplicate cert numbers
-- (e.g. if admin resets the sequence to a value already in use).
ALTER TABLE certificate ADD CONSTRAINT uq_certificate_certificate_id UNIQUE (certificate_id);
