-- Add unenrolled_at timestamp to track when a user unenrolled from a course.
-- Enrollment rows are now soft-deleted (status = 'UNENROLLED') instead of hard-deleted,
-- preserving audit history while preventing re-enrollment from creating duplicate rows
-- (the partial unique indexes on user_id+course_id and user_id+flagship_program_id still apply).
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS unenrolled_at TIMESTAMP;
