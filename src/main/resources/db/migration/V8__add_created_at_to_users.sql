-- Add created_at column to users table for tracking user growth
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

-- Backfill existing users: set created_at to current timestamp for users that don't have it
UPDATE app_user SET created_at = NOW() WHERE created_at IS NULL;
