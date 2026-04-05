-- Guest enrollment support: magic link access + phone number on user accounts
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS magic_link_token VARCHAR(128),
    ADD COLUMN IF NOT EXISTS magic_link_token_created_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_magic_link_token ON users (magic_link_token)
    WHERE magic_link_token IS NOT NULL;
