-- Rename app_user to users (User entity uses @Table(name = "users"))
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_user')
  AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE app_user RENAME TO users;
  END IF;
END $$;

-- Add missing image_url column to blog table
ALTER TABLE blog ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Add missing legacy image columns to course table
ALTER TABLE course ADD COLUMN IF NOT EXISTS image BYTEA;
ALTER TABLE course ADD COLUMN IF NOT EXISTS image_content_type VARCHAR(100);
