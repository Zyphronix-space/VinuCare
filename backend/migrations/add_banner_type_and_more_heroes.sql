-- Migration: extend banners for the "customize every page hero" +
-- "add new sections" request -- adds a type column (hero vs offer) so the
-- admin UI can tell fixed one-per-page heroes apart from the freely
-- addable/deletable promo-card offers, a sort_order for ordering offers,
-- and seeds hero slots for Shop/Appointments/Reviews (Services already existed).
ALTER TABLE banners ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'offer';
ALTER TABLE banners ADD COLUMN sort_order INT NOT NULL DEFAULT 0;

UPDATE banners SET type = 'hero' WHERE banner_key = 'services_hero';
UPDATE banners SET type = 'offer', sort_order = 1 WHERE banner_key = 'home_offer_1';
UPDATE banners SET type = 'offer', sort_order = 2 WHERE banner_key = 'home_offer_2';
UPDATE banners SET type = 'offer', sort_order = 3 WHERE banner_key = 'home_offer_3';

INSERT IGNORE INTO banners (banner_key, page, type, tag, title, description) VALUES
('shop_hero', 'shop', 'hero', 'Pet Shop', 'Premium Pet Products', 'Vet-approved food, accessories, health supplements and more — delivered to your door.'),
('appointments_hero', 'appointments', 'hero', 'Online Booking', 'Schedule Your Visit', 'Easy online booking — we confirm within 2 hours. Select your pet, service and preferred time.'),
('reviews_hero', 'reviews', 'hero', 'Customer Love', 'What Our Pet Families Say', 'Real stories from real pet owners who trust VinuCare with the animals they love.');
