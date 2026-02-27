-- Allow certificates to be issued for flagship programs (no course required)

-- 1. Make course_id nullable on certificate
ALTER TABLE certificate ALTER COLUMN course_id DROP NOT NULL;

-- 2. Add flagship_program_id FK
ALTER TABLE certificate
    ADD COLUMN IF NOT EXISTS flagship_program_id BIGINT
        REFERENCES flagship_program(id) ON DELETE CASCADE;

-- 3. Replace the old UNIQUE(user_id, course_id) constraint with partial indexes
--    so each user can have at most one certificate per course AND one per flagship program.
ALTER TABLE certificate DROP CONSTRAINT IF EXISTS certificate_user_id_course_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_cert_user_course
    ON certificate(user_id, course_id)
    WHERE course_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_cert_user_flagship
    ON certificate(user_id, flagship_program_id)
    WHERE flagship_program_id IS NOT NULL;
