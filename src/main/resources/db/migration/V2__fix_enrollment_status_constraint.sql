-- Fix enrollment status check constraint to allow PENDING status

-- Drop the existing constraint if it exists
ALTER TABLE enrollment DROP CONSTRAINT IF EXISTS enrollment_status_check;

-- Add new constraint that includes PENDING status
ALTER TABLE enrollment ADD CONSTRAINT enrollment_status_check
    CHECK (status IN ('PENDING', 'ENROLLED', 'COMPLETED'));
