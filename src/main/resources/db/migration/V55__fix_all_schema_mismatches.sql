-- Fix all schema mismatches between Java entities and DB tables.
-- Root cause: dev uses ddl-auto=update (Hibernate auto-adds columns),
-- prod uses ddl-auto=validate (strict check). These were never in migrations.

-- 1. blog: add missing updated_at column
ALTER TABLE blog ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- 2. video: entity field 'orderIndex' maps to 'order_index', but V1 created 'sequence_order'
--    Rename if old name exists and new name does not
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video' AND column_name = 'sequence_order'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE video RENAME COLUMN sequence_order TO order_index;
  END IF;
END $$;
-- Safety: add order_index if neither rename happened nor column exists yet
ALTER TABLE video ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- 3. video_progress: entity field 'lastSeenAt' maps to 'last_seen_at', but V1 created 'watched_at'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video_progress' AND column_name = 'watched_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video_progress' AND column_name = 'last_seen_at'
  ) THEN
    ALTER TABLE video_progress RENAME COLUMN watched_at TO last_seen_at;
  END IF;
END $$;
-- Safety: add last_seen_at if column doesn't exist yet
ALTER TABLE video_progress ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP;
