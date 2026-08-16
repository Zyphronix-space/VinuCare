// Single source of truth for VinuCare's contact details, backend side.
// Mirrors src/data/contactInfo.js on the frontend — update both by hand
// when a value changes, since the frontend can't import server files.

module.exports = {
  PHONE: '+94 11 234 5678',
  EMERGENCY_PHONE: '+94 77 999 0000',
  EMAIL: 'vinuagency@gmail.com',
  ADDRESS: 'VINU Care Agency, Thathsara, Kamburugamuwa',
  HOURS: 'Mon–Sat: 8AM – 7PM',
};