-- V74 added UNENROLLED status but forgot to update the check constraint.
ALTER TABLE enrollment DROP CONSTRAINT IF EXISTS enrollment_status_check;
ALTER TABLE enrollment ADD CONSTRAINT enrollment_status_check
    CHECK (status IN ('PENDING', 'ENROLLED', 'COMPLETED', 'UNENROLLED'));
