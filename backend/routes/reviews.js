const express = require('express');
const db      = require('../db');
const auth    = require('../middleware/authMiddleware');

const router = express.Router();

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save a review
router.post('/', auth, async (req, res) => {
  const { name, pet, service, review, stars } = req.body;
  const userId = req.user.id;
  try {
    const [result] = await db.query(
      'INSERT INTO reviews (user_id, name, pet, service, review, stars) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, pet, service, review, stars]
    );
    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;