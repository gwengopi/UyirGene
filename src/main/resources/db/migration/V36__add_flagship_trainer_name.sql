-- Add trainer name to flagship_program (used as default when generating certificates)
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS trainer_name VARCHAR(255);
