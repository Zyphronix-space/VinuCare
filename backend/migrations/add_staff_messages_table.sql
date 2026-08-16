-- Migration: internal DM system so a Doctor or Nurse can message Admin
-- directly, and Admin can reply. One thread per staff member — `staff_id`
-- identifies whose thread a row belongs to, `sender_id`/`sender_role`
-- says who actually wrote that particular message (the staff member
-- themselves, or an Admin replying).

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  sender_id INT NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(20) NOT NULL,
  body TEXT NOT NULL,
  read_by_admin_at DATETIME NULL,
  read_by_staff_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_staff_created (staff_id, created_at)
);
