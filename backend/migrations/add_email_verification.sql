-- Migration: Add email verification support to users table
-- New users default to unverified; existing users are marked verified
-- so current accounts aren't disrupted.

ALTER TABLE users
  ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN verification_token VARCHAR(255) DEFAULT NULL,
  ADD COLUMN verification_token_expires DATETIME DEFAULT NULL;

-- Mark all existing users as verified so they aren't locked out
UPDATE users SET is_verified = 1;