-- Migration: Support inline profile pictures on users
-- `avatar` already existed as VARCHAR(500), sized for a URL/path — but
-- this codebase has no cloud image storage configured, so images are
-- stored as base64 data URLs straight in the row (same approach already
-- used for product images in AdminProducts, whose `image` column is
-- LONGTEXT). VARCHAR(500) can't hold that, so widen it to match.

ALTER TABLE users
  MODIFY COLUMN avatar LONGTEXT DEFAULT NULL;
