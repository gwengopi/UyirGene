-- V34: Add tagline field to course table
ALTER TABLE course ADD COLUMN IF NOT EXISTS tagline VARCHAR(300);
