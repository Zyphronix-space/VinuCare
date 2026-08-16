-- The original seed data in add_banners_table.sql mistakenly used USD ($)
-- placeholder prices instead of LKR. Any DB that already ran that seed
-- (INSERT IGNORE, so re-running it doesn't fix already-inserted rows)
-- is stuck showing $ figures on the home page. This corrects those three
-- known rows back to the site's LKR prices, but only if an admin hasn't
-- since customized them through Admin > Banners.
UPDATE banners SET price = 'Rs 2,900', original_price = 'Rs 7,500'
  WHERE banner_key = 'home_offer_1' AND price = '$29' AND original_price = '$75';
UPDATE banners SET price = 'Rs 6,500', original_price = 'Rs 11,000'
  WHERE banner_key = 'home_offer_2' AND price = '$65' AND original_price = '$110';
UPDATE banners SET price = 'Rs 14,900', original_price = 'Rs 22,000'
  WHERE banner_key = 'home_offer_3' AND price = '$149' AND original_price = '$220';
