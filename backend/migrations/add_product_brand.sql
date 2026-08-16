-- Migration: Add a real brand column to products.
-- The Home page's "Shop by Brand" section previously just linked every
-- brand tile to the unfiltered shop page — there was no brand data or
-- filter logic behind it at all, and only Royal Canin actually had any
-- matching products.

ALTER TABLE products
  ADD COLUMN brand VARCHAR(100) DEFAULT NULL;

UPDATE products SET brand = 'Royal Canin' WHERE name LIKE 'Royal Canin%';
