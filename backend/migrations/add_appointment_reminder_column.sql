-- Migration: tracks whether a reminder email has already gone out for an
-- appointment, so the reminder sweep never emails the same owner twice.
ALTER TABLE appointments ADD COLUMN reminder_sent_at TIMESTAMP NULL;
