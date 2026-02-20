-- Google Reviews table
CREATE TABLE google_review (
    id BIGSERIAL PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    relative_time_description VARCHAR(255),
    profile_photo_url VARCHAR(1000),
    publish_time BIGINT,
    source VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_google_review_active ON google_review(is_active);
CREATE INDEX idx_google_review_source ON google_review(source);

-- Seed Google Review configuration entries
INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active, created_at, updated_at)
SELECT 'GOOGLE_REVIEW_LINK', '', 'URL', 'REVIEW', 'Google Maps review page link (for Leave a Review button)', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE config_key = 'GOOGLE_REVIEW_LINK');

INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active, created_at, updated_at)
SELECT 'GOOGLE_PLACE_ID', '', 'TEXT', 'REVIEW', 'Google Place ID for fetching reviews via Places API', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE config_key = 'GOOGLE_PLACE_ID');

INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active, created_at, updated_at)
SELECT 'GOOGLE_API_KEY', '', 'TEXT', 'REVIEW', 'Google Places API key for fetching reviews', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE config_key = 'GOOGLE_API_KEY');
