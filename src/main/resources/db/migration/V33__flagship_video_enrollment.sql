-- V33: Flagship programs become standalone (no course link), add video table,
--       add content fields, and add flagship enrollment support

-- 1. Remove course link and single videoLink from flagship_program
ALTER TABLE flagship_program DROP COLUMN IF EXISTS course_id;
ALTER TABLE flagship_program DROP COLUMN IF EXISTS video_link;

-- 2. Add content fields matching Course entity
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS assessment     TEXT;
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS outcome        TEXT;
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS exam_details   TEXT;

-- 3. Flagship video table (mirrors the video table structure)
CREATE TABLE IF NOT EXISTS flagship_video (
    id                  BIGSERIAL PRIMARY KEY,
    flagship_program_id BIGINT       NOT NULL REFERENCES flagship_program(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    url                 TEXT         NOT NULL,
    order_index         INT          NOT NULL DEFAULT 0,
    duration_seconds    INT,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flagship_video_program ON flagship_video(flagship_program_id);

-- 4. Extend enrollment to support flagship programs
--    First, make course_id nullable (was NOT NULL via optional=false in JPA)
ALTER TABLE enrollment ALTER COLUMN course_id DROP NOT NULL;

--    Add flagship_program_id FK (nullable)
ALTER TABLE enrollment
    ADD COLUMN IF NOT EXISTS flagship_program_id BIGINT REFERENCES flagship_program(id) ON DELETE SET NULL;

-- 5. Replace the existing unique constraint (user_id, course_id) with partial unique indexes
--    so that each combination is unique only when the FK is present.
DO $$
DECLARE
    cname text;
BEGIN
    SELECT tc.constraint_name INTO cname
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema    = kcu.table_schema
    WHERE tc.table_name       = 'enrollment'
      AND tc.constraint_type  = 'UNIQUE'
      AND kcu.column_name     = 'course_id'
    LIMIT 1;

    IF cname IS NOT NULL THEN
        EXECUTE 'ALTER TABLE enrollment DROP CONSTRAINT "' || cname || '"';
    END IF;
END $$;

-- Deduplicate: keep only the enrollment with the highest ID per (user_id, course_id).
-- Duplicate PENDING rows can accumulate when a user retries enrollment.
DELETE FROM enrollment
WHERE course_id IS NOT NULL
  AND id NOT IN (
      SELECT MAX(id)
      FROM enrollment
      WHERE course_id IS NOT NULL
      GROUP BY user_id, course_id
  );

CREATE UNIQUE INDEX IF NOT EXISTS uq_enrollment_user_course
    ON enrollment(user_id, course_id)
    WHERE course_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_enrollment_user_flagship
    ON enrollment(user_id, flagship_program_id)
    WHERE flagship_program_id IS NOT NULL;
