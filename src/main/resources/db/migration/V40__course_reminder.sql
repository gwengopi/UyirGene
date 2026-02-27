-- V40: Course completion reminder emails
-- reminder_days: admin sets how many days after enrollment the reminder should fire (null = disabled)
-- reminder_sent_at: tracks that a reminder was already sent for this enrollment (prevents duplicates)

ALTER TABLE course ADD COLUMN IF NOT EXISTS reminder_days INTEGER;
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP;
