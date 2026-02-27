CREATE TABLE standard (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    file_name VARCHAR(255),
    file_content_type VARCHAR(100),
    file_size BIGINT,
    file_data BYTEA,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data (files to be uploaded by admin)
INSERT INTO standard (title, description, category, display_order) VALUES
(
  'HACCP Principles & Application Guidelines',
  'Comprehensive guide covering the seven principles of Hazard Analysis and Critical Control Points (HACCP) and their practical application in food processing environments. Includes hazard identification, critical control point determination, monitoring procedures, and corrective actions.',
  'HACCP',
  1
),
(
  'Food Safety Management System Manual',
  'A complete manual for establishing, implementing, and maintaining a Food Safety Management System (FSMS) in compliance with ISO 22000 and FSSC 22000 standards. Covers prerequisite programmes, HACCP plans, management responsibility, and continual improvement.',
  'Food Safety',
  2
),
(
  'Good Manufacturing Practices (GMP) Guidelines',
  'Detailed guidelines for Good Manufacturing Practices applicable to food and beverage processing facilities. Covers personnel hygiene, equipment design and maintenance, cleaning and sanitation, pest control, water quality, and process controls for safe food production.',
  'GMP',
  3
);
