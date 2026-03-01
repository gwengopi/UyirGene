-- V46: Add pre_assessment_links and pre_assessment_instructions to flagship_program and course
-- pre_assessment_links: JSON array of {title, url} objects for practice/pre-assessment links
-- pre_assessment_instructions: admin-configurable instruction text shown above pre-assessment buttons
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS pre_assessment_links TEXT;
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS pre_assessment_instructions TEXT;
ALTER TABLE course ADD COLUMN IF NOT EXISTS pre_assessment_links TEXT;
ALTER TABLE course ADD COLUMN IF NOT EXISTS pre_assessment_instructions TEXT;
