-- Add created_at column to users table for tracking user growth
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

-- Backfill existing users: set created_at to current timestamp for users that don't have it
UPDATE users SET created_at = NOW() WHERE created_at IS NULL;
