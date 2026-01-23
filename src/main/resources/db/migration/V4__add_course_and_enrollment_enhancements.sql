-- V4: Add course and enrollment enhancements

-- Course table enhancements
ALTER TABLE course ADD COLUMN IF NOT EXISTS thumbnail_image BYTEA;
ALTER TABLE course ADD COLUMN IF NOT EXISTS thumbnail_image_content_type VARCHAR(100);
ALTER TABLE course ADD COLUMN IF NOT EXISTS description_image BYTEA;
ALTER TABLE course ADD COLUMN IF NOT EXISTS description_image_content_type VARCHAR(100);
ALTER TABLE course ADD COLUMN IF NOT EXISTS test_link VARCHAR(500);
ALTER TABLE course ADD COLUMN IF NOT EXISTS test_description VARCHAR(500);

-- Change description column to TEXT (unlimited length)
ALTER TABLE course ALTER COLUMN description TYPE TEXT;

-- Enrollment table enhancements
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS test_completed_at TIMESTAMP;
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS result_published_at TIMESTAMP;
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS marks DOUBLE PRECISION;
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS certificate_type VARCHAR(50);
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS payment_order_id VARCHAR(100);

-- Certificate table enhancements
ALTER TABLE certificate ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'COMPLETION';
ALTER TABLE certificate ADD COLUMN IF NOT EXISTS marks DOUBLE PRECISION;

-- Certificate template table
CREATE TABLE IF NOT EXISTS certificate_template (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50),
    course_id BIGINT REFERENCES course(id),
    template_file BYTEA,
    template_content_type VARCHAR(100),
    background_image BYTEA,
    background_image_content_type VARCHAR(100),
    template_config TEXT,
    header_text VARCHAR(255),
    body_template TEXT,
    active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Add index for certificate template lookups
CREATE INDEX IF NOT EXISTS idx_certificate_template_type ON certificate_template(type);
CREATE INDEX IF NOT EXISTS idx_certificate_template_course ON certificate_template(course_id);

-- Add index for enrollment payment order lookups
CREATE INDEX IF NOT EXISTS idx_enrollment_payment_order ON enrollment(payment_order_id);

-- Insert default site configurations for new settings
INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active, created_at, updated_at)
SELECT 'TALK_TO_EXPERT_URL', 'https://api.whatsapp.com/send/?phone=919943712383&text&type=phone_number&app_absent=0', 'URL', 'CONTACT', 'Talk to Expert WhatsApp URL', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE config_key = 'TALK_TO_EXPERT_URL');

INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active, created_at, updated_at)
SELECT 'CONTACT_PHONE', '+919943712383', 'TEXT', 'CONTACT', 'Contact phone number', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE config_key = 'CONTACT_PHONE');

INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active, created_at, updated_at)
SELECT 'CONTACT_EMAIL', 'info@uyirgene.com', 'TEXT', 'CONTACT', 'Contact email', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE config_key = 'CONTACT_EMAIL');

INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active, created_at, updated_at)
SELECT 'PASS_MARK_PERCENTAGE', '60', 'TEXT', 'SETTINGS', 'Pass mark percentage for course completion certificate', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE config_key = 'PASS_MARK_PERCENTAGE');

INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active, created_at, updated_at)
SELECT 'RESULT_DELAY_HOURS', '48', 'TEXT', 'SETTINGS', 'Hours to wait before publishing test results', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE config_key = 'RESULT_DELAY_HOURS');
