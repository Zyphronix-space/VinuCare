-- Migration: clinical fields for appointments — visit notes, a simple
-- prescription field the doctor can fill in after seeing the patient,
-- and a check-in timestamp the nurse sets when the patient arrives
-- (separate from `status`, which tracks the booking lifecycle itself).

ALTER TABLE appointments
  ADD COLUMN doctor_notes TEXT NULL,
  ADD COLUMN prescription TEXT NULL,
  ADD COLUMN checked_in_at DATETIME NULL;
