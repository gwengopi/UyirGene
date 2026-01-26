-- V7: Add trainer_name field to enrollment and certificate tables
-- This allows capturing the trainer at the time of marks entry for accurate certificate generation

-- Add trainer_name to enrollment table
-- This stores the trainer name when marks are entered (can be different from course default trainer)
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS trainer_name VARCHAR(255);

-- Add trainer_name to certificate table
-- This stores the trainer name that was printed on the certificate
ALTER TABLE certificate ADD COLUMN IF NOT EXISTS trainer_name VARCHAR(255);

-- Update existing enrollments to have trainer name from their course
UPDATE enrollment e
SET trainer_name = c.trainer_name
FROM course c
WHERE e.course_id = c.id
  AND e.trainer_name IS NULL
  AND c.trainer_name IS NOT NULL;

-- Update existing certificates to have trainer name from their course
UPDATE certificate cert
SET trainer_name = c.trainer_name
FROM course c
WHERE cert.course_id = c.id
  AND cert.trainer_name IS NULL
  AND c.trainer_name IS NOT NULL;
