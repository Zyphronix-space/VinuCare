-- Adds payment tracking columns to orders and appointments.
-- Run this once against your vinucare database.

ALTER TABLE orders
  ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN payment_method VARCHAR(20) NULL,
  ADD COLUMN payhere_payment_id VARCHAR(50) NULL,
  ADD COLUMN paypal_order_id VARCHAR(50) NULL,
  ADD COLUMN paid_at DATETIME NULL;

ALTER TABLE appointments
  ADD COLUMN amount DECIMAL(10,2) NULL,
  ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN payment_method VARCHAR(20) NULL,
  ADD COLUMN payhere_payment_id VARCHAR(50) NULL,
  ADD COLUMN paypal_order_id VARCHAR(50) NULL,
  ADD COLUMN paid_at DATETIME NULL;