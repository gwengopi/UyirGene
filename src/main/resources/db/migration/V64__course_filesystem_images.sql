-- Migrate course images from BYTEA columns to filesystem paths.
-- Existing image data will be lost after this migration; images must be re-uploaded.

ALTER TABLE course ADD COLUMN IF NOT EXISTS thumbnail_image_path VARCHAR(255);
ALTER TABLE course ADD COLUMN IF NOT EXISTS description_image_path VARCHAR(255);
ALTER TABLE course ADD COLUMN IF NOT EXISTS image_path VARCHAR(255);

ALTER TABLE course DROP COLUMN IF EXISTS thumbnail_image;
ALTER TABLE course DROP COLUMN IF EXISTS description_image;
ALTER TABLE course DROP COLUMN IF EXISTS image;
