-- Migration: record-only refund tracking for transactions.
-- 'Refunded' already existed as a status value in the frontend's
-- STATUS_OPTIONS list, but nothing ever wrote it — there was no action
-- anywhere that transitioned a transaction to that state. This adds the
-- fields needed to record who refunded a transaction, when, and why.
-- The actual money movement still happens manually through the PayHere
-- merchant portal — this is a record of that having been done.

ALTER TABLE transactions
  ADD COLUMN refund_reason TEXT NULL,
  ADD COLUMN refunded_at DATETIME NULL,
  ADD COLUMN refunded_by INT NULL,
  ADD FOREIGN KEY (refunded_by) REFERENCES users(id) ON DELETE SET NULL;
