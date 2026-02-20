-- Add page description configurations for dynamic content

-- Certification page description
INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active, created_at, updated_at)
VALUES (
    'CERTIFICATION_PAGE_DESCRIPTION',
    'Uyir Tech International is an ISO 9001 certified independent organization collaborated with Uyirgenetics Research Pvt Ltd, globally providing certification services and professional development training in Food Safety, FSMS, QMS, HACCP certification, and Industrial Microbiology Technical Programs for students, individuals, and organizations.

Certification of your management system demonstrates your commitment to controlling hazards and managing the safety and quality of your products and services.',
    'TEXT',
    'SERVICE',
    'Description shown on the Certification services page',
    true,
    NOW(),
    NOW()
) ON CONFLICT (config_key) DO NOTHING;

-- Testing page description
INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active, created_at, updated_at)
VALUES (
    'TESTING_PAGE_DESCRIPTION',
    'At Uyir Tech Testing Lab, we understand the importance of quality assurance in today''s competitive market. We offer a wide range of testing services, including blood culture testing, food product microbiology, and GMO analysis. Our experienced scientists and technicians use advanced equipment and methods to deliver accurate and reliable results.

Our testing services ensure your products comply with both national and international regulations, giving you confidence in your quality assurance processes.',
    'TEXT',
    'SERVICE',
    'Description shown on the Testing services page',
    true,
    NOW(),
    NOW()
) ON CONFLICT (config_key) DO NOTHING;
