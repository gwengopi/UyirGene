-- Create site_config table for storing site-wide configurations
CREATE TABLE IF NOT EXISTS site_config (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    config_type VARCHAR(50),
    category VARCHAR(50),
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create master_data table for dropdown configurations
CREATE TABLE IF NOT EXISTS master_data (
    id BIGSERIAL PRIMARY KEY,
    data_type VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    icon_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    parent_id BIGINT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(data_type, code),
    FOREIGN KEY (parent_id) REFERENCES master_data(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_site_config_key ON site_config(config_key);
CREATE INDEX idx_site_config_category ON site_config(category);
CREATE INDEX idx_site_config_type ON site_config(config_type);
CREATE INDEX idx_master_data_type ON master_data(data_type);
CREATE INDEX idx_master_data_parent ON master_data(parent_id);

-- Seed default site configurations (images)
INSERT INTO site_config (config_key, config_value, config_type, category, description, is_active) VALUES
('LOGO_MAIN', 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:80,cg:true,m/qt=q:100/ll', 'IMAGE', 'LOGO', 'Main logo', true),
('LOGO_SMALL', 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:40,cg:true,m/qt=q:100/ll', 'IMAGE', 'LOGO', 'Small logo for navbar', true),
('HERO_MAIN', 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/blob-91a7f99.png/:/rs=w:1920,h:1080,cg:true,m/qt=q:95', 'IMAGE', 'HERO', 'Main hero background', true),
('HERO_LEARNING', 'https://img1.wsimg.com/isteam/getty/2246976642/:/rs=w:1280,h:720,cg:true,m/qt=q:90', 'IMAGE', 'HERO', 'Learning hero image', true),
('COURSE_PLACEHOLDER', 'https://img1.wsimg.com/isteam/getty/2165387046/:/rs=w:400,h:300,cg:true,m/qt=q:85', 'IMAGE', 'COURSE', 'Default course placeholder', true),
('COURSE_TRAINERS', 'https://img1.wsimg.com/isteam/getty/2156390491/:/rs=w:600,h:400,cg:true,m/qt=q:90', 'IMAGE', 'COURSE', 'Trainers image', true),
('COURSE_PRACTICAL', 'https://img1.wsimg.com/isteam/getty/1938554573/:/rs=w:600,h:400,cg:true,m/qt=q:90', 'IMAGE', 'COURSE', 'Practical learning image', true),
('COURSE_CERTIFICATION', 'https://img1.wsimg.com/isteam/getty/1341288264/:/rs=w:600,h:400,cg:true,m/qt=q:90', 'IMAGE', 'COURSE', 'Certification image', true),
('COURSE_REGULATORY', 'https://img1.wsimg.com/isteam/getty/2165387046/:/rs=w:600,h:400,cg:true,m/qt=q:90', 'IMAGE', 'COURSE', 'Regulatory courses image', true),
('ABOUT_MISSION', 'https://img1.wsimg.com/isteam/getty/852586044/:/rs=w:800,h:600,cg:true,m/qt=q:90', 'IMAGE', 'ABOUT', 'About mission image', true),
('ABOUT_TEAM', 'https://img1.wsimg.com/isteam/getty/1754192862/:/rs=w:800,h:600,cg:true,m/qt=q:90', 'IMAGE', 'ABOUT', 'Team image', true),
('BG_TECHNOLOGY', 'https://img1.wsimg.com/isteam/getty/2210258491/:/rs=w:1920,h:1080,cg:true,m/qt=q:90', 'IMAGE', 'BACKGROUND', 'Technology background', true)
ON CONFLICT (config_key) DO NOTHING;

-- Seed default master data (course categories)
INSERT INTO master_data (data_type, code, label, display_order, is_active) VALUES
('COURSE_CATEGORY', 'PROGRAMMING', 'Programming', 1, true),
('COURSE_CATEGORY', 'WEB_DEVELOPMENT', 'Web Development', 2, true),
('COURSE_CATEGORY', 'MOBILE_DEVELOPMENT', 'Mobile Development', 3, true),
('COURSE_CATEGORY', 'DATA_SCIENCE', 'Data Science', 4, true),
('COURSE_CATEGORY', 'MACHINE_LEARNING', 'Machine Learning', 5, true),
('COURSE_CATEGORY', 'FOOD_SAFETY', 'Food Safety', 6, true),
('COURSE_CATEGORY', 'QUALITY_MANAGEMENT', 'Quality Management', 7, true),
('COURSE_CATEGORY', 'ISO_STANDARDS', 'ISO Standards', 8, true),
('COURSE_CATEGORY', 'MICROBIOLOGY', 'Microbiology', 9, true),
('COURSE_CATEGORY', 'REGULATORY', 'Regulatory Compliance', 10, true),
('COURSE_CATEGORY', 'BUSINESS', 'Business', 11, true),
('COURSE_CATEGORY', 'DESIGN', 'Design', 12, true),
('COURSE_CATEGORY', 'OTHER', 'Other', 99, true)
ON CONFLICT (data_type, code) DO NOTHING;

-- Seed skill levels
INSERT INTO master_data (data_type, code, label, display_order, is_active) VALUES
('SKILL_LEVEL', 'BEGINNER', 'Beginner', 1, true),
('SKILL_LEVEL', 'INTERMEDIATE', 'Intermediate', 2, true),
('SKILL_LEVEL', 'ADVANCED', 'Advanced', 3, true),
('SKILL_LEVEL', 'EXPERT', 'Expert', 4, true)
ON CONFLICT (data_type, code) DO NOTHING;

-- Seed duration types
INSERT INTO master_data (data_type, code, label, display_order, is_active) VALUES
('DURATION_TYPE', 'SELF_PACED', 'Self-Paced', 1, true),
('DURATION_TYPE', 'FIXED_SCHEDULE', 'Fixed Schedule', 2, true),
('DURATION_TYPE', 'LIVE_CLASSES', 'Live Classes', 3, true)
ON CONFLICT (data_type, code) DO NOTHING;
