const express = require('express');
const db      = require('../db');
const auth    = require('../middleware/authMiddleware');
const { getAppointmentFee } = require('../utils/appointmentFees');
const { emitToAdmin } = require('../socket');

const router = express.Router();

// Business hours: closed Sundays entirely; Saturdays only until 2 PM.
// Kept here (not in a DB table) since these are fixed weekly rules, not
// one-off dates like the `holidays` table.
const SATURDAY_CUTOFF_MINUTES = 14 * 60; // 2:00 PM

function timeStringToMinutes(timeStr) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((timeStr || '').trim());
  if (!match) return null;
  let [, h, m, period] = match;
  h = Number(h) % 12;
  if (period.toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(m);
}

// Returns an error message if the date/time falls outside business hours
// or on a clinic holiday, or null if it's bookable.
async function validateBookingWindow(apptDate, apptTime) {
  const dayOfWeek = new Date(`${apptDate}T00:00:00`).getDay(); // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0) {
    return 'The clinic is closed on Sundays — please pick another day.';
  }
  if (dayOfWeek === 6 && apptTime) {
    const minutes = timeStringToMinutes(apptTime);
    if (minutes !== null && minutes > SATURDAY_CUTOFF_MINUTES) {
      return 'The vet is only available until 2 PM on Saturdays — please pick an earlier time.';
    }
  }
  const [[holiday]] = await db.query('SELECT name FROM holidays WHERE date = ?', [apptDate]);
  if (holiday) {
    return `The clinic is closed for ${holiday.name} on this date — please pick another day.`;
  }
  return null;
}

// Get the list of doctors for the booking form dropdown (public - no auth needed)
router.get('/doctors', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, specialty FROM users WHERE role = 'Doctor' AND status != 'Inactive' ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upcoming clinic holidays (public - no auth needed) — the booking
// calendar grays these out regardless of which doctor is selected.
router.get('/holidays', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, name FROM holidays
       WHERE date >= CURDATE() ORDER BY date`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get holidays error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booked time slots for a specific date (public - no auth needed).
// doctorId is optional for backwards compatibility, but the booking form
// always sends it now — without it, a slot taken by Dr. A would incorrectly
// grey out that same time for Dr. B, even though only Dr. A is unavailable.
router.get('/slots', async (req, res) => {
  const { date, doctorId } = req.query;
  if (!date) return res.status(400).json({ message: 'Date required' });
  try {
    const params = [date];
    let sql = 'SELECT appt_time FROM appointments WHERE appt_date = ?';
    if (doctorId) {
      sql += ' AND doctor_id = ?';
      params.push(doctorId);
    }
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.appt_time).filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a doctor's unavailable dates (public - no auth needed), so the
// booking calendar can gray those days out. Only returns future dates —
// no reason to ever ask for a doctor's past unavailability here.
router.get('/doctor-unavailable', async (req, res) => {
  const { doctorId } = req.query;
  if (!doctorId) return res.json([]);
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date FROM doctor_unavailability
       WHERE doctor_id = ? AND date >= CURDATE() ORDER BY date`,
      [doctorId]
    );
    res.json(rows.map((r) => r.date));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save appointment.
//
// RACE CONDITION FIX: previously this just ran a bare INSERT, with the
// only "is this slot free?" check happening client-side against the
// GET /slots snapshot taken when the form loaded. If two people picked
// the same doctor + date + time and both hit "Confirm Booking" within
// the same second, both requests could pass the client-side check and
// both INSERTs would succeed — double-booking the doctor.
//
// This is fixed two ways, deliberately layered:
//   1. App-level: open a transaction and SELECT ... FOR UPDATE the
//      matching rows first. This takes a row lock so a second, concurrent
//      request for the exact same doctor/date/time has to wait for the
//      first transaction to commit or roll back before it can even read
//      the row — it can't race past the check.
//   2. DB-level: a UNIQUE INDEX on (doctor_id, appt_date, appt_time)
//      (see migrations/add_slot_locking_and_transactions.sql) means even
//      if the app-level check were somehow bypassed, MySQL itself refuses
//      the second INSERT. Belt and braces — the DB is the final authority
//      on data integrity, not the application code.
router.post('/', auth, async (req, res) => {
  const { ownerName, petName, service, apptDate, apptTime, notes, doctorId } = req.body;
  const userId = req.user.id;
  const fee = getAppointmentFee(service);
  const normalizedDoctorId = doctorId || null;

  const windowError = await validateBookingWindow(apptDate, apptTime);
  if (windowError) {
    return res.status(400).json({ message: windowError, code: 'OUTSIDE_BUSINESS_HOURS' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Only lock/check when a specific doctor was requested — "no
    // preference" bookings (doctorId null) aren't tied to a single
    // resource, so there's nothing to conflict on yet.
    if (normalizedDoctorId && apptTime) {
      const [existing] = await conn.query(
        `SELECT id FROM appointments
         WHERE doctor_id = ? AND appt_date = ? AND appt_time = ?
         FOR UPDATE`,
        [normalizedDoctorId, apptDate, apptTime]
      );
      if (existing.length > 0) {
        await conn.rollback();
        return res.status(409).json({
          message: 'That time slot was just booked by someone else. Please pick another.',
          code: 'SLOT_TAKEN',
        });
      }
    }

    const [result] = await conn.query(
      'INSERT INTO appointments (user_id, doctor_id, owner_name, pet_name, service, appt_date, appt_time, notes, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, normalizedDoctorId, ownerName, petName, service, apptDate, apptTime, notes || '', fee]
    );

    await conn.commit();

    const referenceNumber = `VC-${String(result.insertId).padStart(6, '0')}`;

    emitToAdmin('appointment:new', {
      id: result.insertId,
      ownerName,
      petName,
      service,
      apptDate,
      apptTime,
      fee,
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      referenceNumber,
      appointment: { id: result.insertId, fee, payment_status: 'pending' },
    });
  } catch (err) {
    await conn.rollback();
    // ER_DUP_ENTRY — the UNIQUE INDEX safety net caught a conflict the
    // row lock somehow missed (e.g. constraint added after some other
    // edge case). Report it the same friendly way as the app-level check.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'That time slot was just booked by someone else. Please pick another.',
        code: 'SLOT_TAKEN',
      });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
});

// Get appointments for logged in user (booking history) — includes doctor
// name via join and a formatted reference number, so the frontend (profile
// page) doesn't need a second round trip or to re-derive VC-000123 itself.
router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.pet_name AS petName, a.owner_name AS ownerName, a.service,
              DATE_FORMAT(a.appt_date, '%Y-%m-%d') AS apptDate, a.appt_time AS apptTime,
              a.notes, a.status, u.name AS doctorName, u.phone AS doctorPhone, u.email AS doctorEmail,
              a.amount, a.payment_status AS paymentStatus, a.payment_method AS paymentMethod,
              a.paid_at AS paidAt, a.created_at AS createdAt
       FROM appointments a
       LEFT JOIN users u ON a.doctor_id = u.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    const withRef = rows.map((r) => ({
      ...r,
      referenceNumber: `VC-${String(r.id).padStart(6, '0')}`,
    }));
    res.json(withRef);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;