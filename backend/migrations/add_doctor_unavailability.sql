-- Migration: Let a doctor mark specific dates as unavailable, so the
-- public booking calendar can gray those days out for that doctor.

CREATE TABLE IF NOT EXISTS doctor_unavailability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_doctor_date (doctor_id, date),
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);
