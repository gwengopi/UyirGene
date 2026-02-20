-- Service Testings table for dynamic testing types in Services section
CREATE TABLE IF NOT EXISTS service_testings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    what_is TEXT,
    why_matters TEXT,
    certificate TEXT,
    testing_services TEXT,
    highlights TEXT,
    thumbnail_image BYTEA,
    thumbnail_image_content_type VARCHAR(100),
    hero_image BYTEA,
    hero_image_content_type VARCHAR(100),
    published BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0
);

-- Insert default GMO Testing data (migrated from static page)
INSERT INTO service_testings (title, subtitle, description, what_is, why_matters, certificate, testing_services, highlights, published, display_order)
VALUES (
    'GMO Testing Lab',
    'Your Partner for Quality Assurance',
    'At Uyir Tech Testing Lab, we understand the importance of quality assurance in today''s competitive market. We offer a wide range of testing services, including blood culture testing, food product microbiology, and GMO analysis. Our experienced scientists and technicians use advanced equipment and methods to deliver accurate and reliable results.',
    'GMO testing uses PCR (Polymerase Chain Reaction) to detect genetically modified organisms in food and feed samples, providing independent verification and instilling confidence in your trading endeavors. Our cutting-edge screening techniques offer a cost-effective approach to identify both authorized and unauthorized GMOs.',
    'The complexity of food production and the constant evolution of genetically modified organisms make detection increasingly challenging. Inadvertent mixing of GM and non-GM products requires detection throughout the entire supply chain to prevent cross-contamination.

NGOs routinely conduct testing, and businesses must stay informed on regulatory changes. Our testing services ensure your products comply with both national and international GMO regulations.',
    'A GMO certificate is issued upon completion of GMO certification, which includes sampling, inspections, audits, and document reviews to ensure full compliance with applicable regulations and standards.',
    '["PCR tests for seed samples", "PCR tests for food samples", "Ongoing research and development on detection procedures", "Consultation services for GMO testing needs"]',
    '[{"title": "Advanced PCR Technology", "description": "State-of-the-art polymerase chain reaction equipment for precise GMO detection at molecular level."}, {"title": "Regulatory Expertise", "description": "Deep knowledge of national and international GMO regulations to ensure your products meet all compliance requirements."}, {"title": "Cost-Effective Solutions", "description": "Cutting-edge screening techniques that offer an affordable approach to comprehensive GMO identification."}, {"title": "Reliable Results", "description": "Our experienced scientists and technicians deliver accurate and dependable testing outcomes you can trust."}]',
    TRUE,
    1
);
