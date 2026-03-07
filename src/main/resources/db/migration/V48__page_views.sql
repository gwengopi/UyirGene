CREATE TABLE page_view (
  id          BIGSERIAL PRIMARY KEY,
  path        VARCHAR(500) NOT NULL,
  session_id  VARCHAR(64)  NOT NULL,
  user_id     BIGINT REFERENCES app_user(id) ON DELETE SET NULL,
  referrer    VARCHAR(500),
  device_type VARCHAR(20),
  viewed_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pv_viewed_at  ON page_view(viewed_at);
CREATE INDEX idx_pv_path       ON page_view(path);
CREATE INDEX idx_pv_session_id ON page_view(session_id);
