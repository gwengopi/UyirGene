-- Country-specific pricing for courses
CREATE TABLE IF NOT EXISTS course_price (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    country_code VARCHAR(3) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    UNIQUE(course_id, country_code)
);

CREATE INDEX IF NOT EXISTS idx_course_price_course ON course_price(course_id);

-- Track payment currency and amount on enrollment
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(3);
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS payment_amount DOUBLE PRECISION;
