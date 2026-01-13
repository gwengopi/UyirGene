-- Initial schema migration for Uyirgene Learning Platform

-- Users table
CREATE TABLE IF NOT EXISTS app_user (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true
);

-- Courses table
CREATE TABLE IF NOT EXISTS course (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    duration_hours INTEGER,
    price DOUBLE PRECISION,
    published BOOLEAN DEFAULT false
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollment (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    UNIQUE(user_id, course_id),
    CONSTRAINT fk_enrollment_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
);

-- Videos table
CREATE TABLE IF NOT EXISTS video (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT,
    title VARCHAR(255),
    url VARCHAR(500),
    duration_seconds INTEGER,
    sequence_order INTEGER,
    CONSTRAINT fk_video_course FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
);

-- Video progress tracking table
CREATE TABLE IF NOT EXISTS video_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    video_id BIGINT NOT NULL,
    last_position_seconds INTEGER DEFAULT 0,
    watched_at TIMESTAMP NOT NULL,
    completed BOOLEAN DEFAULT false,
    UNIQUE(user_id, video_id),
    CONSTRAINT fk_video_progress_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_video_progress_video FOREIGN KEY (video_id) REFERENCES video(id) ON DELETE CASCADE
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificate (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    certificate_id VARCHAR(255),
    file_path VARCHAR(500),
    UNIQUE(user_id, course_id),
    CONSTRAINT fk_certificate_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_certificate_course FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
);

-- Blog table
CREATE TABLE IF NOT EXISTS blog (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    author_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES app_user(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollment_user ON enrollment(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_course ON enrollment(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON enrollment(status);
CREATE INDEX IF NOT EXISTS idx_video_course ON video(course_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_certificate_user ON certificate(user_id);
CREATE INDEX IF NOT EXISTS idx_certificate_course ON certificate(course_id);
CREATE INDEX IF NOT EXISTS idx_blog_author ON blog(author_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON app_user(email);
