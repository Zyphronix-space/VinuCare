// Flat booking fee (LKR) charged at the time of appointment booking, per service.
// This is a deposit/booking fee, not the full treatment cost, which is billed in person.
// Keep the keys in sync with the <option value="..."> values in AppoinmentForm.jsx.
const APPOINTMENT_FEES = {
  'Veterinary Check-ups':        1500,
  'Grooming & Styling':          2000,
  'Emergency & Critical Care':   3000,
  'Boarding & Daycare':          1000,
  'Training & Behaviour':        1800,
  'Spa & Wellness':              2200,
  'Dental Health':               2500,
  'Nutrition & Dietary Care':    1200,
};

const DEFAULT_FEE = 1500;

function getAppointmentFee(service) {
  return APPOINTMENT_FEES[service] ?? DEFAULT_FEE;
}

module.exports = { getAppointmentFee, APPOINTMENT_FEES };