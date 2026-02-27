CREATE TABLE flagship_program (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    card_description TEXT,
    card_highlights TEXT,
    background_image BYTEA,
    background_image_content_type VARCHAR(100),
    sections TEXT,
    course_id BIGINT REFERENCES course(id),
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flagship_program_slug ON flagship_program(slug);
CREATE INDEX IF NOT EXISTS idx_flagship_program_active ON flagship_program(active);
