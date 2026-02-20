-- Service Diagnostics table for dynamic diagnostic types in Services section
CREATE TABLE IF NOT EXISTS service_diagnostics (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    test_profiles TEXT,
    highlights TEXT,
    thumbnail_image BYTEA,
    thumbnail_image_content_type VARCHAR(100),
    hero_image BYTEA,
    hero_image_content_type VARCHAR(100),
    published BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0
);

-- Insert default Clinical Research data (migrated from static page)
INSERT INTO service_diagnostics (title, subtitle, description, test_profiles, highlights, published, display_order)
VALUES (
    'Clinical Research & Medical Testing',
    'Advanced Testing Solutions at Uyirgene Research Lab',
    'Welcome to Uyir Tech Research and Medical Testing Labs. We are your partner for quality assurance and advanced testing solutions. Our laboratory offers a wide range of clinical diagnostic testing services including blood culture testing, hormonal profiling, infectious disease screening, and nutritional assessments.

Our team of experienced professionals utilizes advanced equipment and methods to deliver accurate and reliable results, helping healthcare providers make informed decisions for patient care.',
    '[{"title": "Thyroid Profile Total (T3, T4 & TSH)", "description": "Measures thyroid hormone levels including TSH, T4 (total), and T3 (total). Used to diagnose hyperthyroidism and hypothyroidism. Recommended during pregnancy and for individuals with thyroid-related symptoms.", "reportingTime": "6 Hrs", "category": "Hormonal"}, {"title": "Dengue Profile - ELISA", "description": "Comprehensive diagnostic tool for early detection and management of dengue fever. Includes Dengue NS1 Antigen (ELISA), Dengue IgG (ELISA), and Dengue IgM (ELISA) testing components.", "reportingTime": "8 Hrs", "category": "Infectious Disease"}, {"title": "Dengue PCR Test", "description": "Molecular diagnostic technique to detect dengue virus RNA. Offers early detection capability with high accuracy for serotype differentiation, essential for targeted treatment.", "reportingTime": "8 Hrs", "category": "Molecular"}, {"title": "Identification of Sepsis-Causing Bacteria", "description": "Culture tests including aspirate, blood, CSF, ear, eye, HVS, nasal, pleural, pus, sputum, stool, throat, urethral, urine, and wound swab cultures for comprehensive pathogen identification.", "reportingTime": "3-5 Days", "category": "Bacteriology"}, {"title": "Vitamin D - 25 Hydroxy", "description": "Essential test for bone health and immunity assessment. Addresses deficiency commonly resulting from indoor lifestyles. Critical for monitoring calcium absorption and overall health.", "reportingTime": "6 Hrs", "category": "Nutritional"}, {"title": "Vitamin B12 Test", "description": "Blood examination measuring cobalamin levels. Detects deficiency symptoms including fatigue, dizziness, and neurological issues. Important for vegetarians and the elderly.", "reportingTime": "6 Hrs", "category": "Nutritional"}]',
    '[{"title": "Advanced Equipment", "description": "State-of-the-art laboratory equipment for precise and accurate diagnostic results."}, {"title": "Rapid Turnaround", "description": "Quick reporting times to ensure timely diagnosis and treatment decisions."}, {"title": "Expert Team", "description": "Experienced professionals dedicated to delivering reliable testing outcomes."}, {"title": "Comprehensive Testing", "description": "Wide range of diagnostic services from hormonal profiling to infectious disease screening."}]',
    TRUE,
    1
);
