-- Migration: audit log for admin CRUD actions (users/products/banners).
-- Nothing tracked who changed what before this — useful now that both
-- Admin and Nurse accounts can edit products, and Admin manages Users
-- and Banners directly.

CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT NULL,
  actor_name VARCHAR(255),
  actor_role VARCHAR(20),
  action VARCHAR(50),
  entity_type VARCHAR(50),
  entity_id VARCHAR(50),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);
