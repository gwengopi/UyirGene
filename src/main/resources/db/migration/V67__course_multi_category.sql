-- Convert single category values to JSON arrays for multi-category support
-- e.g. "HACCP" -> '["HACCP"]'
-- Rows already in JSON array format (starting with '[') are left unchanged
UPDATE course
SET category = '["' || replace(category, '"', '\"') || '"]'
WHERE category IS NOT NULL
  AND category != ''
  AND category NOT LIKE '[%';
