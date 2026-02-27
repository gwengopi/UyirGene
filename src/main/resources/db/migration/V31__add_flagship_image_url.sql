-- Add external image URL fallback for flagship programs
-- Used when no admin-uploaded BYTEA image is available
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS background_image_url VARCHAR(500);

-- Seed image URLs for the two flagship programs
UPDATE flagship_program
   SET background_image_url = 'https://images.pexels.com/photos/5947541/pexels-photo-5947541.jpeg?auto=compress&cs=tinysrgb&w=800'
 WHERE slug = 'haccp-practitioner-level-4';

UPDATE flagship_program
   SET background_image_url = 'https://images.pexels.com/photos/3807571/pexels-photo-3807571.jpeg?auto=compress&cs=tinysrgb&w=800'
 WHERE slug = 'food-safety-officer-level-3';
