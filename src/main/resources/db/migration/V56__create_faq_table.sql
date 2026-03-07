CREATE TABLE IF NOT EXISTS faq (
    id           BIGSERIAL PRIMARY KEY,
    category     VARCHAR(50)  NOT NULL,
    question     VARCHAR(500) NOT NULL,
    answer       TEXT         NOT NULL,
    display_order INTEGER     DEFAULT 0,
    is_active    BOOLEAN      DEFAULT TRUE,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faq_category ON faq(category);
CREATE INDEX IF NOT EXISTS idx_faq_active ON faq(is_active) WHERE is_active = TRUE;
