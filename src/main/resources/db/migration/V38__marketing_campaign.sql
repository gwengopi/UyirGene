-- V38: Marketing Campaign Mail System

-- User opt-out columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_out BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_out_token VARCHAR(64);

-- Give each existing user a unique unsubscribe token (md5 available without extensions)
UPDATE users SET marketing_opt_out_token = md5(random()::text || id::text || clock_timestamp()::text) || md5(clock_timestamp()::text || id::text || random()::text)
WHERE marketing_opt_out_token IS NULL;

-- Campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaign (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_body TEXT NOT NULL,
    total_recipients INT NOT NULL DEFAULT 0,
    total_batches INT NOT NULL DEFAULT 0,
    batches_sent INT NOT NULL DEFAULT 0,
    batch_size INT NOT NULL DEFAULT 500,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    triggered_by VARCHAR(255),
    triggered_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Per-recipient log
CREATE TABLE IF NOT EXISTS marketing_mail_log (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES marketing_campaign(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    batch_number INT NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMP,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_marketing_log_campaign_batch ON marketing_mail_log(campaign_id, batch_number);
CREATE INDEX IF NOT EXISTS idx_marketing_log_status ON marketing_mail_log(campaign_id, status);
