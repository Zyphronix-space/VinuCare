-- Migration: system-wide error log so Admin can see backend failures
-- (unhandled exceptions, failed queries, payment/notify errors, etc.)
-- instead of them only ever going to the server console.

CREATE TABLE IF NOT EXISTS error_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT NOT NULL,
  route VARCHAR(255),
  method VARCHAR(10),
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
