-- Migration: clinic-wide public holidays, so the booking calendar and
-- doctor calendar can gray out days nobody can be booked on, regardless
-- of which doctor is selected. Admin manages this list going forward via
-- the Holidays tab — only a few confident fixed-date holidays are seeded
-- here; moveable/lunar holidays (Poya days, etc.) vary every year and
-- should be added by an admin rather than guessed.

CREATE TABLE IF NOT EXISTS holidays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO holidays (date, name) VALUES
  ('2026-01-01', 'New Year''s Day'),
  ('2026-02-04', 'Independence Day'),
  ('2026-05-01', 'May Day'),
  ('2026-12-25', 'Christmas Day'),
  ('2027-01-01', 'New Year''s Day');
