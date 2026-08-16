-- Migration: full 2026 Sri Lankan public holiday calendar, including
-- moveable/lunar Poya days — sourced from officeholidays.com/countries/
-- sri-lanka/2026 (no free, keyless holiday API covers Sri Lanka; a
-- couple of other dedicated Sri Lanka holiday sites blocked automated
-- fetches). INSERT IGNORE so this doesn't collide with the handful of
-- fixed-date holidays already seeded in add_holidays_table.sql.
--
-- IMPORTANT: Poya and other lunar/moveable holiday dates shift every
-- year — this list is 2026-specific and will need a fresh migration
-- (or manual entries via the admin Holidays page) for 2027 onward.

INSERT IGNORE INTO holidays (date, name) VALUES
  ('2026-01-03', 'Duruthu Full Moon Poya Day'),
  ('2026-01-15', 'Tamil Thai Pongal Day'),
  ('2026-02-01', 'Navam Full Moon Poya Day'),
  ('2026-02-15', 'Mahasivarathri Day'),
  ('2026-03-02', 'Madin Full Moon Poya Day'),
  ('2026-03-21', 'Id-Ul-Fitr'),
  ('2026-04-01', 'Bak Full Moon Poya Day'),
  ('2026-04-03', 'Good Friday'),
  ('2026-04-13', 'Sinhala and Tamil New Year Eve'),
  ('2026-04-14', 'Sinhala and Tamil New Year'),
  ('2026-05-28', 'Idul Adha'),
  ('2026-05-30', 'Vesak Full Moon Poya (in lieu)'),
  ('2026-05-31', 'Vesak Full Moon Poya Holiday'),
  ('2026-06-29', 'Poson Full Moon Poya Day'),
  ('2026-07-29', 'Esala Full Moon Poya Day'),
  ('2026-08-26', 'Milad-Un-Nabi'),
  ('2026-08-27', 'Nikini Full Moon Poya Day'),
  ('2026-09-26', 'Binara Full Moon Poya Day'),
  ('2026-10-25', 'Vap Full Moon Poya Day'),
  ('2026-11-08', 'Deepavali Festival Day'),
  ('2026-11-24', 'Il Full Moon Poya Day'),
  ('2026-12-23', 'Unduvap Full Moon Poya Day');
