-- V37: Add flagship video progress support
-- video_progress currently requires video_id NOT NULL — relax to allow flagship_video rows

-- 1. Make video_id nullable
ALTER TABLE video_progress ALTER COLUMN video_id DROP NOT NULL;

-- 2. Add flagship_video_id FK
ALTER TABLE video_progress
    ADD COLUMN IF NOT EXISTS flagship_video_id BIGINT
        REFERENCES flagship_video(id) ON DELETE CASCADE;

-- 3. Partial unique index so each user has at most one progress row per flagship video
CREATE UNIQUE INDEX IF NOT EXISTS uq_progress_user_flagship_video
    ON video_progress(user_id, flagship_video_id)
    WHERE flagship_video_id IS NOT NULL;
