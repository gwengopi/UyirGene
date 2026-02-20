-- Service Certifications table for dynamic certification types in Services section
CREATE TABLE IF NOT EXISTS service_certifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    what_is TEXT,
    key_elements TEXT,
    who_needs TEXT,
    certification_route TEXT,
    benefits TEXT,
    thumbnail_image BYTEA,
    thumbnail_image_content_type VARCHAR(100),
    hero_image BYTEA,
    hero_image_content_type VARCHAR(100),
    published BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0
);

-- Insert default ISO 22000 certification
INSERT INTO service_certifications (title, subtitle, description, what_is, key_elements, who_needs, certification_route, benefits, published, display_order)
VALUES (
    'ISO 22000 - Food Safety Certifications',
    'Global Training & Certification Services',
    'Uyir Tech International is an ISO 9001 certified independent organization collaborated with Uyirgenetics Research Pvt Ltd, globally providing certification services and professional development training in Food Safety, FSMS, QMS, HACCP certification, and Industrial Microbiology Technical Programs for students, individuals, and organizations.\n\nCertification of your food safety management system demonstrates your commitment to controlling food safety hazards and managing the safety of your products.',
    'ISO 22000 is compatible and harmonized with other international management system standards, including ISO 9001. It combines the following key elements:',
    '["Interactive Communication", "HACCP Principles", "System Management", "Prerequisite Programs"]',
    '["Food manufacturing", "Animal feed manufacturing", "Primary production (animals/plants)", "Transport & storage", "Wholesale and retail", "Catering", "Packaging material & cleaning agent industry", "Related services (pest control, machinery manufacturers)"]',
    '[{"label": "Enquiry & Quotation", "description": "Submit your enquiry and receive a detailed quotation tailored to your organization."}, {"label": "Certification Audit", "description": "Our skilled auditors conduct comprehensive assessments of your facilities and systems."}, {"label": "Certification Decision", "description": "Audit findings are reviewed and a certification decision is made based on compliance."}, {"label": "Certificate Issuance", "description": "Upon successful completion, your ISO certification is officially issued."}]',
    '["Build and operate a food safety management system within a well-defined and clear framework", "Understand actual risks for consumers and company", "Provide performance improvement tools", "Better meet legal compliance and corporate requirements", "Communicate with stakeholders about commitment to food safety"]',
    TRUE,
    1
);
