-- Migration: Add "forgot password" support to users table.
-- Separate columns from verification_token/verification_token_expires —
-- a user could plausibly need a password reset while also being
-- unverified, so the two flows shouldn't share (and clobber) one token.

ALTER TABLE users
  ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL,
  ADD COLUMN reset_token_expires DATETIME DEFAULT NULL;
