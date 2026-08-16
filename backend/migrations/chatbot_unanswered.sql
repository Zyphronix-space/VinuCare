-- Run this once against your `vinucare` database (same way you've run the
-- other migrations — e.g. paste into MySQL Workbench / CLI).

CREATE TABLE IF NOT EXISTS chatbot_unanswered (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  page VARCHAR(100) DEFAULT NULL,
  user_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);