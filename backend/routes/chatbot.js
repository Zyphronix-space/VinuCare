const express = require('express');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const auth    = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { buildSystemPrompt } = require('../data/chatbotKnowledge');
const bootId  = require('../bootId');

const router = express.Router();

// Logging an unanswered question should work for guests too, so this
// doesn't use the strict `auth` middleware (which 401s with no token).
// It just attaches a user id if a valid token happens to be present.
function optionalAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Only trust tokens issued by the current server process — see
      // bootId.js. A pre-restart token just falls back to "no user"
      // here instead of a hard 401, since this route works for guests too.
      if (decoded.bootId === bootId) {
        req.user = decoded;
      }
    } catch {
      // Invalid/expired token — just log the question without a user id.
    }
  }
  next();
}

// POST /api/chatbot/unanswered
// Saves a question the chatbot couldn't match, so it can be reviewed later.
router.post('/unanswered', optionalAuth, async (req, res) => {
  const { question, page } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ message: 'Question is required' });
  }
  try {
    await db.query(
      'INSERT INTO chatbot_unanswered (question, page, user_id) VALUES (?, ?, ?)',
      [question.trim().slice(0, 1000), page ? String(page).slice(0, 100) : null, req.user?.id || null]
    );
    res.status(201).json({ message: 'Logged' });
  } catch (err) {
    console.error('Log unanswered chatbot question error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/chatbot/unanswered  (Admin only)
// Lets an admin review what the chatbot couldn't answer.
router.get('/unanswered', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cu.id, cu.question, cu.page, cu.created_at, u.name AS userName
       FROM chatbot_unanswered cu
       LEFT JOIN users u ON cu.user_id = u.id
       ORDER BY cu.created_at DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get unanswered chatbot questions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/chatbot/appointment-status  (logged-in user)
// Returns the logged-in user's own appointments, most recent first.
router.get('/appointment-status', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, service, DATE_FORMAT(appt_date, '%Y-%m-%d') AS appt_date,
              appt_time, status
       FROM appointments
       WHERE user_id = ?
       ORDER BY appt_date DESC, appt_time DESC
       LIMIT 5`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Chatbot appointment-status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/chatbot/order-status  (logged-in user)
// Returns the logged-in user's own recent orders with item count and
// payment status (joined from the transactions table if present).
router.get('/order-status', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.id, o.total, DATE_FORMAT(o.created_at, '%Y-%m-%d') AS created_at,
              COUNT(oi.id) AS item_count,
              t.status AS payment_status
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN transactions t ON t.order_id = o.id
       WHERE o.user_id = ?
       GROUP BY o.id, o.total, o.created_at, t.status
       ORDER BY o.created_at DESC
       LIMIT 5`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Chatbot order-status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------------------------------------------------------------
// AI fallback — POST /api/chatbot/ask
// Used when the frontend's fast keyword matcher can't find an FAQ hit.
// Grounds Claude in the VinuCare knowledge base (chatbotKnowledge.js) and
// gives it two tools so it can pull the person's own live data (appointments,
// orders) when the question calls for it, instead of guessing.
// ---------------------------------------------------------------------------

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL   = 'claude-sonnet-4-6';

const TOOLS = [
  {
    name: 'get_appointment_status',
    description: "Get the logged-in user's recent appointments (service, date, time, status). Use this whenever they ask about their own appointment(s).",
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_order_status',
    description: "Get the logged-in user's recent shop orders (items, total, payment status, date). Use this whenever they ask about their own order(s) or a purchase.",
    input_schema: { type: 'object', properties: {} },
  },
];

async function runTool(name, userId) {
  if (name === 'get_appointment_status') {
    const [rows] = await db.query(
      `SELECT service, DATE_FORMAT(appt_date, '%Y-%m-%d') AS appt_date, appt_time, status
       FROM appointments WHERE user_id = ? ORDER BY appt_date DESC, appt_time DESC LIMIT 5`,
      [userId]
    );
    return rows;
  }
  if (name === 'get_order_status') {
    const [rows] = await db.query(
      `SELECT o.id, o.total, DATE_FORMAT(o.created_at, '%Y-%m-%d') AS created_at,
              COUNT(oi.id) AS item_count, t.status AS payment_status
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN transactions t ON t.order_id = o.id
       WHERE o.user_id = ?
       GROUP BY o.id, o.total, o.created_at, t.status
       ORDER BY o.created_at DESC LIMIT 5`,
      [userId]
    );
    return rows;
  }
  throw new Error(`Unknown tool: ${name}`);
}

async function callClaude(messages, tools) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 500,
      system: buildSystemPrompt(),
      tools,
      messages,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Claude API error');
  return data;
}

// optionalAuth so guests can still ask general questions — they just won't
// get tools/live data (get_appointment_status / get_order_status are only
// offered when we actually have a logged-in user id to query with).
router.post('/ask', optionalAuth, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'message is required' });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({ message: 'AI assistant is not configured on the server yet.' });
  }

  const userId = req.user?.id || null;
  const tools = userId ? TOOLS : [];
  const messages = [{ role: 'user', content: message.trim().slice(0, 1000) }];

  try {
    let data = await callClaude(messages, tools);

    // Handle up to a couple rounds of tool use (Claude asks for data, we
    // fetch it from the DB, feed it back, then it writes the final answer).
    let rounds = 0;
    while (data.stop_reason === 'tool_use' && rounds < 3) {
      rounds++;
      messages.push({ role: 'assistant', content: data.content });

      const toolResults = [];
      for (const block of data.content) {
        if (block.type !== 'tool_use') continue;
        try {
          const result = await runTool(block.name, userId);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        } catch (err) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: 'Error running tool',
            is_error: true,
          });
        }
      }
      messages.push({ role: 'user', content: toolResults });
      data = await callClaude(messages, tools);
    }

    const answer = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim() || "Sorry, I couldn't come up with an answer to that.";

    res.json({ answer });
  } catch (err) {
    console.error('Chatbot AI ask error:', err);
    res.status(500).json({ message: 'Could not reach the AI assistant right now.' });
  }
});

module.exports = router;