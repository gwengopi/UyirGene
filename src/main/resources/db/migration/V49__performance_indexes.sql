-- V49: Performance indexes for commonly queried columns
-- These eliminate full-table scans on hot query paths

-- Flagship program pricing lookups by country
CREATE INDEX IF NOT EXISTS idx_fpp_country_code
    ON flagship_program_price(country_code);

-- Enrollment payment confirmation lookups
CREATE INDEX IF NOT EXISTS idx_enrollment_payment_order_id
    ON enrollment(payment_order_id)
    WHERE payment_order_id IS NOT NULL;

-- Marketing mail log: batch processing queries (campaign + status)
CREATE INDEX IF NOT EXISTS idx_marketing_mail_log_campaign_status
    ON marketing_mail_log(campaign_id, status);

-- Blog list queries filter by status + visibility
CREATE INDEX IF NOT EXISTS idx_blog_status_visibility
    ON blog(status, visibility);

-- Page view analytics: device breakdown queries
CREATE INDEX IF NOT EXISTS idx_pv_device_type_viewed_at
    ON page_view(device_type, viewed_at);

-- Course bundle join table: lookup bundles containing a specific course
CREATE INDEX IF NOT EXISTS idx_course_bundle_course_course_id
    ON course_bundle_course(course_id);

-- Course price country lookups
CREATE INDEX IF NOT EXISTS idx_course_price_country_code
    ON course_price(country_code);
