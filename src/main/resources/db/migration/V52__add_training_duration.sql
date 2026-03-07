-- V52: Add training_duration field to flagship_program table
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS training_duration VARCHAR(255);
