-- Migration: slot-conflict protection + transactions table for analytics
-- Run this once against your vinucare database (same way as the other
-- migrations — paste into MySQL Workbench / CLI / mysql < file).

-- ---------------------------------------------------------------------
-- 1) Prevent double-booking the same doctor at the same date + time.
--    This is enforced at the DATABASE level (not just in app code), so
--    even two requests arriving at the exact same millisecond cannot
--    both succeed — MySQL guarantees the second INSERT is rejected.
--
--    NULL doctor_id ("no preference") rows are intentionally NOT
--    covered — MySQL treats each NULL as distinct in a unique index,
--    so "no preference" bookings never collide with each other. Those
--    get manually assigned to a doctor by an admin.
-- ---------------------------------------------------------------------

-- If you already have accidental duplicate bookings in your data, this
-- ALTER will fail with a duplicate-key error. Run this first to check:
--   SELECT doctor_id, appt_date, appt_time, COUNT(*) c
--   FROM appointments
--   WHERE doctor_id IS NOT NULL
--   GROUP BY doctor_id, appt_date, appt_time
--   HAVING c > 1;
-- ...and resolve any conflicts (e.g. cancel/reschedule the duplicate)
-- before running the ALTER below.

ALTER TABLE appointments
  ADD UNIQUE INDEX uniq_doctor_slot (doctor_id, appt_date, appt_time);

-- ---------------------------------------------------------------------
-- 2) transactions table — the admin dashboard's revenue queries
--    (/api/admin/summary, /api/admin/transactions, /api/admin/analytics)
--    already SELECT from this table, but nothing was ever INSERTing
--    into it, so "Total Revenue" has always shown 0. payments.js now
--    writes a row here every time a payment is confirmed (PayHere
--    notify, PayPal capture).
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  order_id INT NULL,
  appointment_id INT NULL,
  payment_method VARCHAR(20) NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);