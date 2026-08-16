const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db.js');
const { emitToAdmin } = require('../socket');
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// Records an admin/nurse/doctor action for the audit log. Fire-and-forget —
// a logging failure shouldn't fail the actual request.
async function logAction(req, action, entityType, entityId, details = null) {
  try {
    await pool.query(
      `INSERT INTO audit_log (actor_id, actor_name, actor_role, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.name, req.user.role, action, entityType, String(entityId), details]
    );
  } catch (err) {
    console.error('Audit log write failed:', err);
  }
}

router.get('/summary', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalRevenue
       FROM transactions WHERE status = 'Paid'`
    );
    const [[{ pendingAppointments }]] = await pool.query(
      `SELECT COUNT(*) AS pendingAppointments
       FROM appointments WHERE status = 'Pending'`
    );
    const [[{ activeDoctors }]] = await pool.query(
      `SELECT COUNT(*) AS activeDoctors
       FROM users WHERE role = 'Doctor'`
    );
    const [[{ lowStockProducts }]] = await pool.query(
  `SELECT COUNT(*) AS lowStockProducts FROM products WHERE stock <= 10`
    );
    const [[{ unreadMessages }]] = await pool.query(
      `SELECT COUNT(*) AS unreadMessages FROM messages WHERE sender_role != 'Admin' AND read_by_admin_at IS NULL`
    );

    res.json({ totalRevenue, pendingAppointments, activeDoctors, lowStockProducts, unreadMessages });
  } catch (err) {
    console.error('Admin summary error:', err);
    res.status(500).json({ error: 'Failed to load summary' });
  }
});
// GET all users
router.get('/users', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, phone, specialty, status, is_verified, created_at AS joined
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// CREATE user
router.post('/users', auth, requireRole('Admin'), async (req, res) => {
  const { name, email, role, phone, specialty, status, password } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  if (!password) return res.status(400).json({ error: 'A temporary password is required so this user can log in' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, role, phone, specialty, status, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, role || 'Customer', phone || null, specialty || null, status || 'Active', hashed]
    );
    await logAction(req, 'create', 'user', result.insertId, `Created ${role || 'Customer'} "${name}" (${email})`);
    res.status(201).json({ id: result.insertId, name, email, role, phone, specialty, status });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// UPDATE user
router.put('/users/:id', auth, requireRole('Admin'), async (req, res) => {
  const { name, email, role, phone, specialty, status } = req.body;
  try {
    await pool.query(
      `UPDATE users SET name = ?, email = ?, role = ?, phone = ?, specialty = ?, status = ?
       WHERE id = ?`,
      [name, email, role, phone, specialty, status, req.params.id]
    );
    await logAction(req, 'update', 'user', req.params.id, `Updated "${name}" (${email})`);
    res.json({ id: req.params.id, name, email, role, phone, specialty, status });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user
// Full hard delete — wipes every record tied to this user (orders, order
// items, appointments booked by them, appointments they were the assigned
// doctor for, reviews, transactions) so the FK constraints on those tables
// never block the delete. This is intentionally destructive and
// irreversible: it also erases their payment/appointment history, not just
// the account. There is no soft-delete option here — Suspend the account
// via Edit instead if the history needs to be kept.
router.delete('/users/:id', auth, requireRole('Admin'), async (req, res) => {
  const userId = req.params.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orders] = await conn.query(`SELECT id FROM orders WHERE user_id = ?`, [userId]);
    const orderIds = orders.map(o => o.id);
    if (orderIds.length) {
      await conn.query(`DELETE FROM order_items WHERE order_id IN (?)`, [orderIds]);
    }
    await conn.query(`DELETE FROM orders WHERE user_id = ?`, [userId]);
    await conn.query(`DELETE FROM appointments WHERE user_id = ? OR doctor_id = ?`, [userId, userId]);
    await conn.query(`DELETE FROM reviews WHERE user_id = ?`, [userId]);
    await conn.query(`DELETE FROM users WHERE id = ?`, [userId]);

    await conn.commit();
    await logAction(req, 'delete', 'user', userId);
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    conn.release();
  }
});
// GET all products — this is also the public shop catalog fetch
// (ShopContext.jsx / Shop.jsx call this same route for every visitor,
// logged in or not), so it stays unauthenticated. Only the mutating
// routes below (create/edit/delete/stock) are role-restricted.
router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, description, price, image, category AS cat, brand, stock
       FROM products ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// CREATE product
router.post('/products', auth, requireRole('Admin', 'Nurse'), async (req, res) => {
  const { name, cat, brand, price, stock, image, description } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });
  try {
    const [result] = await pool.query(
      `INSERT INTO products (name, category, brand, price, stock, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, cat, brand || null, price, stock || 0, image || null, description || null]
    );
    await logAction(req, 'create', 'product', result.insertId, `Created "${name}"`);
    res.status(201).json({ id: result.insertId, name, cat, brand, price, stock, image, description });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// UPDATE product (full edit — name/price/description/etc.)
router.put('/products/:id', auth, requireRole('Admin', 'Nurse'), async (req, res) => {
  const { name, cat, brand, price, stock, image, description } = req.body;
  try {
    await pool.query(
      `UPDATE products SET name = ?, category = ?, brand = ?, price = ?, stock = ?, image = ?, description = ?
       WHERE id = ?`,
      [name, cat, brand || null, price, stock, image, description, req.params.id]
    );
    await logAction(req, 'update', 'product', req.params.id, `Updated "${name}"`);
    res.json({ id: req.params.id, name, cat, brand, price, stock, image, description });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Stock-only adjustment — used by the restock quick-action in the
// product edit modal (Admin and Nurse both have full product access now,
// but this stays as the single place stock changes get applied so it
// doesn't require re-sending the whole product payload).
router.patch('/products/:id/stock', auth, requireRole('Admin', 'Nurse'), async (req, res) => {
  const delta = Number(req.body.delta);
  if (!Number.isFinite(delta) || delta === 0) {
    return res.status(400).json({ error: 'A non-zero delta is required' });
  }
  try {
    const [result] = await pool.query(
      `UPDATE products SET stock = GREATEST(stock + ?, 0) WHERE id = ?`,
      [delta, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    const [[row]] = await pool.query(`SELECT id, stock FROM products WHERE id = ?`, [req.params.id]);
    await logAction(req, 'restock', 'product', req.params.id, `${delta > 0 ? '+' : ''}${delta} units`);
    res.json(row);
  } catch (err) {
    console.error('Restock product error:', err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// DELETE product
router.delete('/products/:id', auth, requireRole('Admin', 'Nurse'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM products WHERE id = ?`, [req.params.id]);
    await logAction(req, 'delete', 'product', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});
// GET all banners — this is also the public banner fetch used by
// ExtraBanners.jsx on Home/Shop/Services/etc. for every visitor, so it
// stays unauthenticated. Only the mutating routes below are Admin-only.
router.get('/banners', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, banner_key AS bannerKey, page, type, sort_order AS sortOrder,
              tag, title, description, price, original_price AS originalPrice,
              cta_text AS ctaText, image, alt
       FROM banners ORDER BY page, type, sort_order, banner_key`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get banners error:', err);
    res.status(500).json({ error: 'Failed to load banners' });
  }
});

// CREATE a new promo-card banner (an admin-added "section") on a page.
// Hero slots are fixed one-per-page and are never created this way.
router.post('/banners', auth, requireRole('Admin'), async (req, res) => {
  const { page, tag, title, description, price, originalPrice, ctaText, image, alt } = req.body;
  if (!page || !title) return res.status(400).json({ error: 'Page and title are required' });
  try {
    const bannerKey = `${page}_custom_${Date.now()}`;
    const [[{ maxOrder }]] = await pool.query(
      `SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM banners WHERE page = ? AND type = 'offer'`,
      [page]
    );
    await pool.query(
      `INSERT INTO banners (banner_key, page, type, sort_order, tag, title, description, price, original_price, cta_text, image, alt)
       VALUES (?, ?, 'offer', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bannerKey, page, maxOrder + 1, tag || null, title, description || null, price || null, originalPrice || null, ctaText || null, image || null, alt || null]
    );
    await logAction(req, 'create', 'banner', bannerKey, `Added "${title}" to ${page}`);
    res.status(201).json({ bannerKey, page, type: 'offer', sortOrder: maxOrder + 1, tag, title, description, price, originalPrice, ctaText, image, alt });
  } catch (err) {
    console.error('Create banner error:', err);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// UPDATE a banner slot (slots are seeded by migration, never created/deleted via API)
router.put('/banners/:key', auth, requireRole('Admin'), async (req, res) => {
  const { tag, title, description, price, originalPrice, ctaText, image, alt } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE banners SET tag = ?, title = ?, description = ?, price = ?,
              original_price = ?, cta_text = ?, image = ?, alt = ?
       WHERE banner_key = ?`,
      [tag || null, title || null, description || null, price || null,
       originalPrice || null, ctaText || null, image || null, alt || null, req.params.key]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Unknown banner slot' });
    await logAction(req, 'update', 'banner', req.params.key, `Updated "${title}"`);
    res.json({ bannerKey: req.params.key, tag, title, description, price, originalPrice, ctaText, image, alt });
  } catch (err) {
    console.error('Update banner error:', err);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// DELETE an admin-added promo-card banner. Fixed hero slots refuse deletion
// since every page expects exactly one hero to render.
router.delete('/banners/:key', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT type FROM banners WHERE banner_key = ?', [req.params.key]);
    if (!row) return res.status(404).json({ error: 'Unknown banner slot' });
    if (row.type === 'hero') return res.status(400).json({ error: 'Hero banners cannot be deleted, only edited' });
    await pool.query('DELETE FROM banners WHERE banner_key = ?', [req.params.key]);
    await logAction(req, 'delete', 'banner', req.params.key);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete banner error:', err);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// GET all appointments (with doctor name via join). A Doctor only ever
// gets their own appointments — enforced server-side regardless of what
// the client asks for. Admin may narrow the list to one doctor via
// ?doctorId= (used by the scheduling overview); Nurse sees everything,
// same as before.
router.get('/appointments', auth, requireRole('Admin', 'Doctor', 'Nurse'), async (req, res) => {
  try {
    const params = [];
    let where = '';
    if (req.user.role === 'Doctor') {
      where = 'WHERE a.doctor_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'Admin' && req.query.doctorId) {
      where = 'WHERE a.doctor_id = ?';
      params.push(req.query.doctorId);
    }
    const [rows] = await pool.query(
      `SELECT a.id, a.pet_name AS petName, a.owner_name AS ownerName, a.service,
              DATE_FORMAT(a.appt_date, '%Y-%m-%d') AS date, a.appt_time AS time,
              a.status, u.name AS doctor, a.doctor_notes AS doctorNotes,
              a.prescription, a.checked_in_at AS checkedInAt
       FROM appointments a
       LEFT JOIN users u ON a.doctor_id = u.id
       ${where}
       ORDER BY a.appt_date, a.appt_time`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Failed to load appointments' });
  }
});

// UPDATE status only. A Doctor can only change the status of their own
// appointments — the UPDATE is scoped to doctor_id so guessing another
// appointment's id has no effect.
router.patch('/appointments/:id', auth, requireRole('Admin', 'Doctor', 'Nurse'), async (req, res) => {
  const { status } = req.body;
  try {
    if (req.user.role === 'Doctor') {
      const [result] = await pool.query(
        `UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ?`,
        [status, req.params.id, req.user.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
    } else {
      await pool.query(`UPDATE appointments SET status = ? WHERE id = ?`, [status, req.params.id]);
    }
    emitToAdmin('appointment:statusChanged', { id: req.params.id, status });
    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Doctor's own visit notes + prescription for an appointment they own.
router.patch('/appointments/:id/notes', auth, requireRole('Doctor'), async (req, res) => {
  const { doctorNotes, prescription } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE appointments SET doctor_notes = ?, prescription = ? WHERE id = ? AND doctor_id = ?`,
      [doctorNotes || null, prescription || null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ id: req.params.id, doctorNotes, prescription });
  } catch (err) {
    console.error('Update appointment notes error:', err);
    res.status(500).json({ error: 'Failed to save notes' });
  }
});

// Nurse (or Admin) marks a patient as arrived/checked in.
router.patch('/appointments/:id/checkin', auth, requireRole('Admin', 'Nurse'), async (req, res) => {
  try {
    await pool.query(`UPDATE appointments SET checked_in_at = NOW() WHERE id = ?`, [req.params.id]);
    const [[row]] = await pool.query(
      `SELECT checked_in_at AS checkedInAt FROM appointments WHERE id = ?`,
      [req.params.id]
    );
    res.json({ id: req.params.id, checkedInAt: row?.checkedInAt || null });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Failed to check in patient' });
  }
});

// DELETE appointment
router.delete('/appointments/:id', auth, requireRole('Admin', 'Nurse'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM appointments WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});
// GET all transactions (with customer name + derived type/reference)
router.get('/transactions', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id,
              DATE_FORMAT(t.created_at, '%Y-%m-%d') AS date,
              u.name AS customer,
              CASE
                WHEN t.order_id IS NOT NULL THEN 'Product'
                WHEN t.appointment_id IS NOT NULL THEN 'Appointment'
                ELSE 'Other'
              END AS type,
              CASE
                WHEN t.order_id IS NOT NULL THEN CONCAT('ORD-', t.order_id)
                WHEN t.appointment_id IS NOT NULL THEN CONCAT('A-', t.appointment_id)
                ELSE ''
              END AS reference,
              t.payment_method AS method,
              t.amount,
              t.status,
              t.order_id AS orderId,
              t.appointment_id AS appointmentId,
              t.refund_reason AS refundReason,
              t.refunded_at AS refundedAt
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
});

// Record-only refund: marks the transaction (and the order/appointment it
// belongs to) as refunded, with a reason and who did it. Does NOT call
// PayHere's refund API — the actual money movement still happens through
// the PayHere merchant portal; this just records that it was done.
router.post('/transactions/:id/refund', auth, requireRole('Admin'), async (req, res) => {
  const { reason } = req.body;
  try {
    const [[txn]] = await pool.query(
      `SELECT id, status, order_id AS orderId, appointment_id AS appointmentId FROM transactions WHERE id = ?`,
      [req.params.id]
    );
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    if (txn.status === 'Refunded') return res.status(400).json({ error: 'Already refunded' });

    await pool.query(
      `UPDATE transactions SET status = 'Refunded', refund_reason = ?, refunded_at = NOW(), refunded_by = ?
       WHERE id = ?`,
      [reason || null, req.user.id, req.params.id]
    );
    if (txn.orderId) {
      await pool.query(`UPDATE orders SET payment_status = 'refunded' WHERE id = ?`, [txn.orderId]);
    }
    if (txn.appointmentId) {
      await pool.query(`UPDATE appointments SET payment_status = 'refunded' WHERE id = ?`, [txn.appointmentId]);
    }
    await logAction(req, 'refund', 'transaction', req.params.id, reason || null);
    res.json({ id: req.params.id, status: 'Refunded', refundReason: reason || null });
  } catch (err) {
    console.error('Refund transaction error:', err);
    res.status(500).json({ error: 'Failed to record refund' });
  }
});

// Aggregate scheduling overview across all doctors — upcoming unavailable
// dates and upcoming appointment load, so Admin doesn't need to open each
// doctor's calendar individually.
router.get('/doctors/scheduling', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [doctors] = await pool.query(
      `SELECT id, name, specialty FROM users WHERE role = 'Doctor' ORDER BY name`
    );
    const [upcomingCounts] = await pool.query(
      `SELECT doctor_id AS doctorId, COUNT(*) AS upcomingAppointments
       FROM appointments
       WHERE doctor_id IS NOT NULL
         AND appt_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
         AND status IN ('Pending', 'Confirmed')
       GROUP BY doctor_id`
    );
    const [unavailable] = await pool.query(
      `SELECT doctor_id AS doctorId, DATE_FORMAT(date, '%Y-%m-%d') AS date
       FROM doctor_unavailability
       WHERE date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
       ORDER BY date`
    );

    const countsByDoctor = Object.fromEntries(upcomingCounts.map(r => [r.doctorId, r.upcomingAppointments]));
    const datesByDoctor = {};
    unavailable.forEach(r => {
      (datesByDoctor[r.doctorId] ||= []).push(r.date);
    });

    res.json(doctors.map(d => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      upcomingAppointments: countsByDoctor[d.id] || 0,
      upcomingUnavailableDates: datesByDoctor[d.id] || [],
    })));
  } catch (err) {
    console.error('Doctor scheduling error:', err);
    res.status(500).json({ error: 'Failed to load scheduling overview' });
  }
});

// Holiday management — GET is intentionally Admin-only here (the public,
// unauthenticated version customers/the booking calendar use lives at
// GET /api/appointments/holidays); this one is the admin list/edit view.
router.get('/holidays', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') AS date, name FROM holidays ORDER BY date`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get holidays error:', err);
    res.status(500).json({ error: 'Failed to load holidays' });
  }
});

router.post('/holidays', auth, requireRole('Admin'), async (req, res) => {
  const { date, name } = req.body;
  if (!date || !name) return res.status(400).json({ error: 'Date and name are required' });
  try {
    const [result] = await pool.query(
      `INSERT INTO holidays (date, name) VALUES (?, ?)`,
      [date, name]
    );
    await logAction(req, 'create', 'holiday', result.insertId, `${date} — ${name}`);
    res.status(201).json({ id: result.insertId, date, name });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A holiday is already set for that date' });
    console.error('Create holiday error:', err);
    res.status(500).json({ error: 'Failed to add holiday' });
  }
});

router.delete('/holidays/:id', auth, requireRole('Admin'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM holidays WHERE id = ?`, [req.params.id]);
    await logAction(req, 'delete', 'holiday', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete holiday error:', err);
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
});

// GET recent admin/doctor/nurse actions for the audit log.
router.get('/audit-log', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, actor_id AS actorId, actor_name AS actorName, actor_role AS actorRole,
              action, entity_type AS entityType, entity_id AS entityId, details, created_at AS createdAt
       FROM audit_log ORDER BY created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get audit log error:', err);
    res.status(500).json({ error: 'Failed to load audit log' });
  }
});

router.get('/error-logs', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, message, route, method, read_at AS readAt, created_at AS createdAt
       FROM error_logs ORDER BY created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get error logs error:', err);
    res.status(500).json({ error: 'Failed to load error logs' });
  }
});

router.post('/error-logs/mark-read', auth, requireRole('Admin'), async (req, res) => {
  try {
    await pool.query('UPDATE error_logs SET read_at = NOW() WHERE read_at IS NULL');
    res.json({ success: true });
  } catch (err) {
    console.error('Mark error logs read error:', err);
    res.status(500).json({ error: 'Failed to mark error logs read' });
  }
});

// GET analytics — aggregated data for the Overview/Analytics charts.
// Everything here is derived from `transactions` (now that payments.js
// actually writes to it) plus `appointments` and `order_items`, so the
// numbers reflect real paid revenue rather than just "orders placed".
router.get('/analytics', auth, requireRole('Admin'), async (req, res) => {
  try {
    // Revenue for each of the last 14 days (fills in zero for days with
    // no transactions, so the chart doesn't have gaps).
    const [revenueRows] = await pool.query(
      `SELECT DATE(created_at) AS day, SUM(amount) AS revenue
       FROM transactions
       WHERE status = 'Paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(created_at)
       ORDER BY day`
    );
    const revenueByDay = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const match = revenueRows.find(r => {
        const rDay = r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day);
        return rDay === key;
      });
      revenueByDay.push({ date: key, revenue: match ? Number(match.revenue) : 0 });
    }

    // Revenue split by service, for paid appointments only.
    const [revenueByService] = await pool.query(
      `SELECT service, SUM(amount) AS revenue, COUNT(*) AS bookings
       FROM appointments
       WHERE payment_status = 'paid'
       GROUP BY service
       ORDER BY revenue DESC`
    );

    // Appointment funnel — how many are pending vs confirmed vs completed etc.
    const [appointmentsByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM appointments GROUP BY status`
    );

    // Best-selling products by revenue, only counting paid orders.
    const [topProducts] = await pool.query(
      `SELECT oi.product_name AS name,
              SUM(oi.quantity) AS unitsSold,
              SUM(oi.quantity * oi.price) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.payment_status = 'paid'
       GROUP BY oi.product_name
       ORDER BY revenue DESC
       LIMIT 5`
    );

    // Revenue split by how customers paid — useful for deciding which
    // payment gateway to prioritise supporting/promoting.
    const [revenueByMethod] = await pool.query(
      `SELECT COALESCE(payment_method, 'unknown') AS method, SUM(amount) AS revenue
       FROM transactions
       WHERE status = 'Paid'
       GROUP BY payment_method`
    );

    // Busiest doctors by appointment count.
    const [appointmentsByDoctor] = await pool.query(
      `SELECT u.name AS doctor, COUNT(*) AS appointments
       FROM appointments a
       JOIN users u ON u.id = a.doctor_id
       GROUP BY u.name
       ORDER BY appointments DESC`
    );

    res.json({
      revenueByDay,
      revenueByService: revenueByService.map(r => ({ ...r, revenue: Number(r.revenue) })),
      appointmentsByStatus,
      topProducts: topProducts.map(p => ({ ...p, revenue: Number(p.revenue) })),
      revenueByMethod: revenueByMethod.map(r => ({ ...r, revenue: Number(r.revenue) })),
      appointmentsByDoctor,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router;
