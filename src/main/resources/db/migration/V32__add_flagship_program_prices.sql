-- Add standalone price and test link to flagship programs
ALTER TABLE flagship_program
    ADD COLUMN IF NOT EXISTS price NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS test_link VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS test_description TEXT,
    ADD COLUMN IF NOT EXISTS video_link VARCHAR(1000);

-- Country-specific pricing table for flagship programs (mirrors course_price)
CREATE TABLE IF NOT EXISTS flagship_program_price (
    id                  BIGSERIAL PRIMARY KEY,
    flagship_program_id BIGINT NOT NULL REFERENCES flagship_program(id) ON DELETE CASCADE,
    country_code        VARCHAR(10) NOT NULL,
    currency_code       VARCHAR(10) NOT NULL,
    amount              NUMERIC(10,2) NOT NULL,
    UNIQUE (flagship_program_id, country_code)
);

-- Seed base prices
UPDATE flagship_program SET price = 15000 WHERE slug = 'haccp-practitioner-level-4';
UPDATE flagship_program SET price = 9999  WHERE slug = 'food-safety-officer-level-3';

-- Seed country prices for HACCP Practitioner Level 4
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'US', 'USD', 180  FROM flagship_program WHERE slug = 'haccp-practitioner-level-4' ON CONFLICT DO NOTHING;
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'GB', 'GBP', 145  FROM flagship_program WHERE slug = 'haccp-practitioner-level-4' ON CONFLICT DO NOTHING;
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'AE', 'AED', 660  FROM flagship_program WHERE slug = 'haccp-practitioner-level-4' ON CONFLICT DO NOTHING;
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'AU', 'AUD', 270  FROM flagship_program WHERE slug = 'haccp-practitioner-level-4' ON CONFLICT DO NOTHING;
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'CA', 'CAD', 245  FROM flagship_program WHERE slug = 'haccp-practitioner-level-4' ON CONFLICT DO NOTHING;
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'SG', 'SGD', 240  FROM flagship_program WHERE slug = 'haccp-practitioner-level-4' ON CONFLICT DO NOTHING;

-- Seed country prices for Food Safety Officer Level 3
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'US', 'USD', 120  FROM flagship_program WHERE slug = 'food-safety-officer-level-3' ON CONFLICT DO NOTHING;
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'GB', 'GBP', 95   FROM flagship_program WHERE slug = 'food-safety-officer-level-3' ON CONFLICT DO NOTHING;
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'AE', 'AED', 440  FROM flagship_program WHERE slug = 'food-safety-officer-level-3' ON CONFLICT DO NOTHING;
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'AU', 'AUD', 180  FROM flagship_program WHERE slug = 'food-safety-officer-level-3' ON CONFLICT DO NOTHING;
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'CA', 'CAD', 165  FROM flagship_program WHERE slug = 'food-safety-officer-level-3' ON CONFLICT DO NOTHING;
INSERT INTO flagship_program_price (flagship_program_id, country_code, currency_code, amount)
SELECT id, 'SG', 'SGD', 160  FROM flagship_program WHERE slug = 'food-safety-officer-level-3' ON CONFLICT DO NOTHING;
