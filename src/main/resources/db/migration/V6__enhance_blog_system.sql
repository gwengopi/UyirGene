-- V6: Enhance blog system with additional fields and subscription feature

-- Add new columns to blog table
ALTER TABLE blog ADD COLUMN IF NOT EXISTS short_description VARCHAR(300);
ALTER TABLE blog ADD COLUMN IF NOT EXISTS author_name VARCHAR(100) DEFAULT 'Editorial Team';
ALTER TABLE blog ADD COLUMN IF NOT EXISTS tags VARCHAR(500);
ALTER TABLE blog ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'DRAFT';
ALTER TABLE blog ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP;
ALTER TABLE blog ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'PUBLIC';
ALTER TABLE blog ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE blog ADD COLUMN IF NOT EXISTS url_slug VARCHAR(100);
ALTER TABLE blog ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 1;
ALTER TABLE blog ADD COLUMN IF NOT EXISTS featured_image BYTEA;
ALTER TABLE blog ADD COLUMN IF NOT EXISTS featured_image_content_type VARCHAR(100);
ALTER TABLE blog ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0;

-- Add unique constraint on url_slug (if not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_url_slug ON blog(url_slug) WHERE url_slug IS NOT NULL;

-- Create blog_subscription table for newsletter
CREATE TABLE IF NOT EXISTS blog_subscription (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    active BOOLEAN DEFAULT true,
    unsubscribe_token VARCHAR(100) UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_blog_subscription_active ON blog_subscription(active) WHERE active = true;

-- Update existing blogs to have default values
UPDATE blog SET status = 'PUBLISHED' WHERE status IS NULL;
UPDATE blog SET visibility = 'PUBLIC' WHERE visibility IS NULL;
UPDATE blog SET author_name = 'Editorial Team' WHERE author_name IS NULL;
UPDATE blog SET language = 'en' WHERE language IS NULL;

-- Generate URL slugs for existing blogs without one
UPDATE blog
SET url_slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE url_slug IS NULL AND title IS NOT NULL;
