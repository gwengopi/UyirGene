-- Fix any courses that have course_code = '' (empty string) instead of NULL.
-- Empty strings violate the partial unique index idx_course_code_unique
-- because '' IS NOT NULL evaluates to true.
UPDATE course SET course_code = NULL WHERE course_code = '';
