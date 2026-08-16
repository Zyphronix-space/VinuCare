-- Migration: Add Google Sign-In support to users table
-- Google-authenticated accounts never set a local password, so
-- password_hash has to become optional. Existing password accounts are
-- untouched and keep working exactly as before.

ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) DEFAULT NULL UNIQUE,
  MODIFY COLUMN password_hash VARCHAR(255) DEFAULT NULL;
