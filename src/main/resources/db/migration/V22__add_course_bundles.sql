-- Course bundle table
CREATE TABLE IF NOT EXISTS course_bundle (
    id BIGSERIAL PRIMARY KEY,
    bundle_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    original_price DOUBLE PRECISION,
    published BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    thumbnail_image BYTEA,
    thumbnail_image_content_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bundle <-> Course join table (many-to-many)
CREATE TABLE IF NOT EXISTS course_bundle_course (
    bundle_id BIGINT NOT NULL REFERENCES course_bundle(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    PRIMARY KEY (bundle_id, course_id)
);

-- Bundle multi-currency pricing
CREATE TABLE IF NOT EXISTS bundle_price (
    id BIGSERIAL PRIMARY KEY,
    bundle_id BIGINT NOT NULL REFERENCES course_bundle(id) ON DELETE CASCADE,
    country_code VARCHAR(3) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    UNIQUE(bundle_id, country_code)
);

CREATE INDEX IF NOT EXISTS idx_bundle_price_bundle ON bundle_price(bundle_id);

-- Track bundle source on existing enrollments
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS bundle_id BIGINT REFERENCES course_bundle(id);
