-- Careers table for dynamic career/job positions management
CREATE TABLE IF NOT EXISTS careers (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    why_join_title VARCHAR(255),
    why_join_description TEXT,
    benefits TEXT,
    positions TEXT,
    published BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0
);

-- Insert default careers data (migrated from static page)
INSERT INTO careers (title, subtitle, why_join_title, why_join_description, benefits, positions, published, display_order)
VALUES (
    'Join Our Team',
    'Help us transform education and empower learners around the world.',
    'Why Join Uyirgene?',
    'At Uyirgene, we''re on a mission to make quality education accessible to everyone. Join a team of passionate individuals who are dedicated to making a difference in people''s lives through learning.',
    '["Competitive salary and equity", "Flexible work arrangements", "Health insurance coverage", "Learning and development budget", "Annual team retreats", "Unlimited paid time off"]',
    '[{"title": "Senior Frontend Developer", "department": "Engineering", "location": "Chennai / Remote", "type": "Full-time", "description": "We are looking for an experienced frontend developer to help build our learning platform."}, {"title": "Content Writer", "department": "Content", "location": "Remote", "type": "Full-time", "description": "Create engaging educational content and course materials for our platform."}, {"title": "Customer Success Manager", "department": "Operations", "location": "Chennai", "type": "Full-time", "description": "Help our students succeed by providing excellent support and guidance."}, {"title": "Video Production Specialist", "department": "Content", "location": "Chennai", "type": "Contract", "description": "Produce high-quality video content for our online courses."}]',
    TRUE,
    1
);
