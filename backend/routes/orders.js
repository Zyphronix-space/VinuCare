const express = require('express');
const db      = require('../db');
const auth    = require('../middleware/authMiddleware');
const { emitToAdmin } = require('../socket');

const router = express.Router();

// Save order
router.post('/', auth, async (req, res) => {
  const { total, items } = req.body;
  const userId = req.user.id;
  try {
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total) VALUES (?, ?)',
      [userId, total]
    );
    const orderId = orderResult.insertId;
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, item.qty, item.price]
      );
    }
    emitToAdmin('order:new', { id: orderId, total, itemCount: items.length });

    res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get orders for logged in user (order + payment history). Item count is
// pulled from order_items rather than trusting a client-sent number, and
// each item's name/qty is included so the profile page can show a short
// summary (e.g. "Dog Food x2, Cat Litter x1") without a second fetch.
router.get('/my', auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT id, total, payment_status AS paymentStatus, payment_method AS paymentMethod,
              paid_at AS paidAt, created_at AS createdAt
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map((o) => o.id);
    const [items] = await db.query(
      `SELECT order_id AS orderId, product_name AS productName, quantity, price
       FROM order_items WHERE order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = {};
    for (const item of items) {
      (itemsByOrder[item.orderId] ||= []).push(item);
    }

    res.json(orders.map((o) => ({ ...o, items: itemsByOrder[o.id] || [] })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;