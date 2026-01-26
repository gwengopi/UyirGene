-- Add new course fields for certificate display
-- V5: Add course_code, trainer_name, and short_description to course table

-- Add course_code column (unique identifier like BIO-101)
ALTER TABLE course ADD COLUMN IF NOT EXISTS course_code VARCHAR(255);

-- Add unique constraint on course_code (allowing nulls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_code_unique ON course(course_code) WHERE course_code IS NOT NULL;

-- Add trainer_name column
ALTER TABLE course ADD COLUMN IF NOT EXISTS trainer_name VARCHAR(255);

-- Add short_description column (for certificate and previews)
ALTER TABLE course ADD COLUMN IF NOT EXISTS short_description VARCHAR(500);
