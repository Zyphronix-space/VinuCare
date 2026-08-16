-- Migration: Add a banners table so admins can customize the home page
-- promo banners and the services page hero banner without a code change.
-- banner_key identifies each fixed slot the frontend knows how to render;
-- image is a base64 data URL (LONGTEXT), same storage pattern as products.image.
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banner_key VARCHAR(50) NOT NULL UNIQUE,
  page VARCHAR(30) NOT NULL,
  tag VARCHAR(60) DEFAULT NULL,
  title VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  price VARCHAR(20) DEFAULT NULL,
  original_price VARCHAR(20) DEFAULT NULL,
  cta_text VARCHAR(60) DEFAULT NULL,
  image LONGTEXT DEFAULT NULL,
  alt VARCHAR(255) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed the 4 known slots with the current hardcoded copy as defaults, so
-- rendering is identical until an admin actually customizes one. image/alt
-- stay NULL here -- the frontend falls back to its bundled default photo
-- whenever a row's image is empty, so nothing breaks in the meantime.
INSERT IGNORE INTO banners (banner_key, page, tag, title, description, price, original_price, cta_text) VALUES
('home_offer_1', 'home', 'New Patients', 'First Wellness Exam, On Us', 'Complete health check, vaccination review and microchipping for new patients.', 'Rs 2,900', 'Rs 7,500', 'Book Now'),
('home_offer_2', 'home', 'Bundle Deal', 'Grooming + Dental, Bundled', 'Full grooming session combined with professional dental scaling for a healthy, fresh pup.', 'Rs 6,500', 'Rs 11,000', 'Book Now'),
('home_offer_3', 'home', 'Monthly Special', '5 Nights of Boarding Bliss', '5 nights of supervised boarding with daily enrichment activities and bedtime story updates.', 'Rs 14,900', 'Rs 22,000', 'Reserve a Spot'),
('services_hero', 'services', 'All Services', 'Comprehensive Pet Care Services', 'From routine wellness to specialist procedures -- we''re your one-stop pet health destination.', NULL, NULL, NULL);
