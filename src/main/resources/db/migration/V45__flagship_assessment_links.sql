-- V45: Add assessment_links to flagship_program and course
-- Stores a JSON array of {title, url} objects for multiple assessment links
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS assessment_links TEXT;
ALTER TABLE course ADD COLUMN IF NOT EXISTS assessment_links TEXT;
