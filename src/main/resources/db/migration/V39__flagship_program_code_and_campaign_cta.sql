-- V39: Add program_code to flagship_program
--      CTA buttons are now embedded inline in htmlBody via [[CTA:CODE|Label]] placeholders
--      No separate cta_label / cta_url columns required.

-- Flagship program code (unique identifier, like course code)
ALTER TABLE flagship_program ADD COLUMN IF NOT EXISTS program_code VARCHAR(50);

-- Auto-populate existing programs with a generated code based on slug
UPDATE flagship_program
SET program_code = 'FP-' || UPPER(SUBSTRING(REPLACE(slug, '-', ''), 1, 20))
WHERE program_code IS NULL;

ALTER TABLE flagship_program ADD CONSTRAINT uq_flagship_program_code UNIQUE (program_code);
