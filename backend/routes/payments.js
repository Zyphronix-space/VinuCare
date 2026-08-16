const express = require('express');
const crypto  = require('crypto');
const db      = require('../db');
const auth    = require('../middleware/authMiddleware');

const router = express.Router();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const PAYHERE_MERCHANT_ID     = process.env.PAYHERE_MERCHANT_ID;
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
// Defaults to PayHere's sandbox so nobody accidentally goes live with real
// card charges — set PAYHERE_MODE=live in .env (with live merchant
// credentials from an approved PayHere business account) when ready.
const PAYHERE_CHECKOUT_URL = process.env.PAYHERE_MODE === 'live'
  ? 'https://www.payhere.lk/pay/checkout'
  : 'https://sandbox.payhere.lk/pay/checkout';
const PAYHERE_API_BASE = process.env.PAYHERE_MODE === 'live'
  ? 'https://www.payhere.lk'
  : 'https://sandbox.payhere.lk';

// App ID/App Secret for PayHere's REST API (OAuth) — these are NOT the same
// as PAYHERE_MERCHANT_ID/PAYHERE_MERCHANT_SECRET used for the checkout hash.
// Get them from the PayHere merchant portal: Settings > Domains & Credentials
// > Add Domain/App (sandbox apps live under the sandbox account). Only used
// as a fallback below when notify_url can't reach this server (e.g. running
// on localhost without a public tunnel).
const PAYHERE_APP_ID     = process.env.PAYHERE_APP_ID;
const PAYHERE_APP_SECRET = process.env.PAYHERE_APP_SECRET;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// orderType is 'shop' | 'appointment'. Looks up the row and returns the
// authoritative amount (LKR) + owning user_id + current payment_status,
// so we never trust an amount sent from the browser.
async function findPayable(orderType, orderId) {
  if (orderType === 'shop') {
    const [rows] = await db.query(
      'SELECT id, user_id, total AS amount, payment_status FROM orders WHERE id = ?',
      [orderId]
    );
    return rows[0] || null;
  }
  if (orderType === 'appointment') {
    const [rows] = await db.query(
      'SELECT id, user_id, amount, payment_status FROM appointments WHERE id = ?',
      [orderId]
    );
    return rows[0] || null;
  }
  return null;
}

async function markPaid(orderType, orderId, { method, payhereId }) {
  const table = orderType === 'shop' ? 'orders' : 'appointments';
  const amountColumn = orderType === 'shop' ? 'total' : 'amount';
  await db.query(
    `UPDATE ${table}
       SET payment_status = 'paid',
           payment_method = ?,
           payhere_payment_id = COALESCE(?, payhere_payment_id),
           paid_at = NOW()
     WHERE id = ?`,
    [method, payhereId || null, orderId]
  );

  // Admin dashboard (/api/admin/transactions, /summary, /analytics) reads
  // exclusively from this table -- without this insert 'Total Revenue' etc.
  // stay at 0 even though orders/appointments are correctly marked paid.
  const [[row]] = await db.query(
    `SELECT user_id, ${amountColumn} AS amount FROM ${table} WHERE id = ?`,
    [orderId]
  );
  await db.query(
    `INSERT INTO transactions (user_id, order_id, appointment_id, payment_method, amount, status)
     VALUES (?, ?, ?, ?, ?, 'Paid')`,
    [
      row.user_id,
      orderType === 'shop' ? orderId : null,
      orderType === 'appointment' ? orderId : null,
      method,
      row.amount,
    ]
  );
}

// PayHere order_id must be a single string, so we encode type+id into it and
// decode it again when the notify_url callback comes back.
function encodePayHereOrderId(orderType, orderId) {
  return `${orderType === 'appointment' ? 'APPT' : 'SHOP'}-${orderId}`;
}
function decodePayHereOrderId(payhereOrderId) {
  const [prefix, idStr] = String(payhereOrderId).split('-');
  return {
    orderType: prefix === 'APPT' ? 'appointment' : 'shop',
    orderId: Number(idStr),
  };
}

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// ---------------------------------------------------------------------------
// PayHere — Retrieve Payment API (fallback for when notify_url can't reach us)
// ---------------------------------------------------------------------------

// Cached in memory since tokens are valid for a while (PayHere returns
// expires_in, typically ~1hr) and this route may be polled every couple
// seconds by the frontend.
let cachedToken = null; // { accessToken, expiresAt }

// PaymentReturn.jsx polls /api/payments/status up to 5 times, 2s apart, per
// page visit — with bad/revoked app credentials every single poll used to
// re-attempt the oauth request (cachedToken never gets set on failure),
// hammering PayHere with repeated 401s and spamming this log. Remember a
// failure for a bit so a broken credential fails fast and quiet instead.
let tokenFetchFailedUntil = 0;
const TOKEN_FAILURE_COOLDOWN_MS = 60_000;

async function getPayHereAccessToken() {
  if (!PAYHERE_APP_ID || !PAYHERE_APP_SECRET) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.accessToken;
  if (Date.now() < tokenFetchFailedUntil) return null;

  const basicAuth = Buffer.from(`${PAYHERE_APP_ID}:${PAYHERE_APP_SECRET}`).toString('base64');
  const res = await fetch(`${PAYHERE_API_BASE}/merchant/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    tokenFetchFailedUntil = Date.now() + TOKEN_FAILURE_COOLDOWN_MS;
    throw new Error(`PayHere oauth token request failed: ${res.status}`);
  }
  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    // Refresh a little early so we don't get caught by clock skew.
    expiresAt: Date.now() + (Number(data.expires_in || 3000) - 60) * 1000,
  };
  return cachedToken.accessToken;
}

// Actively asks PayHere for the status of a payment instead of waiting for
// notify_url — needed because in local/dev environments PayHere's servers
// usually can't reach notify_url (it points at localhost). Returns the
// status_code (2 = success) or null if it couldn't be determined (no app
// credentials configured, PayHere hasn't got a record yet, network error).
async function fetchPayHereStatus(payhereOrderId) {
  try {
    const token = await getPayHereAccessToken();
    if (!token) return null;

    const res = await fetch(
      `${PAYHERE_API_BASE}/merchant/v1/payment/search?order_id=${encodeURIComponent(payhereOrderId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const record = data?.data?.[0];
    return record ? record.status_code : null;
  } catch (err) {
    console.warn('PayHere status lookup failed:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// PayHere — Checkout API
// ---------------------------------------------------------------------------

// Generates the hash the browser needs to submit the hidden form to PayHere.
// The hash MUST be generated server-side so merchant_secret never reaches the client.
router.post('/payhere/hash', auth, async (req, res) => {
  const { orderId, orderType } = req.body;
  if (!PAYHERE_MERCHANT_ID || !PAYHERE_MERCHANT_SECRET) {
    return res.status(503).json({ message: 'PayHere is not configured on the server yet.' });
  }
  try {
    const payable = await findPayable(orderType, orderId);
    if (!payable) return res.status(404).json({ message: 'Order not found' });
    if (payable.user_id !== req.user.id) return res.status(403).json({ message: 'Not your order' });
    if (payable.payment_status === 'paid') return res.status(400).json({ message: 'Already paid' });

    const amount = Number(payable.amount).toFixed(2);
    const currency = 'LKR';
    const payhereOrderId = encodePayHereOrderId(orderType, orderId);

    const hashedSecret = md5(PAYHERE_MERCHANT_SECRET).toUpperCase();
    const hash = md5(
      PAYHERE_MERCHANT_ID + payhereOrderId + amount + currency + hashedSecret
    ).toUpperCase();

    // Falls back to BACKEND_URL for completeness, but that only works once
    // this server is reachable from the public internet (e.g. via ngrok) —
    // PayHere's servers call notify_url directly, not through the browser.
    const notifyUrl = process.env.PAYHERE_NOTIFY_URL
      || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/payhere/notify`;

    res.json({
      checkoutUrl: PAYHERE_CHECKOUT_URL,
      merchantId: PAYHERE_MERCHANT_ID,
      hash,
      amount,
      currency,
      orderId: payhereOrderId,
      notifyUrl,
    });
  } catch (err) {
    console.error('PayHere hash error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PayHere calls this server-to-server after a payment attempt. No auth
// middleware here on purpose — PayHere doesn't have (or send) a VinuCare JWT.
// Trust is instead established via the md5sig checksum below.
router.post('/payhere/notify', async (req, res) => {
  try {
    const {
      merchant_id, order_id, payhere_amount, payhere_currency,
      status_code, md5sig, payment_id,
    } = req.body;

    const localSig = md5(
      merchant_id + order_id + payhere_amount + payhere_currency +
      status_code + md5(PAYHERE_MERCHANT_SECRET).toUpperCase()
    ).toUpperCase();

    if (localSig !== md5sig) {
      console.warn('PayHere notify: signature mismatch, ignoring');
      return res.status(400).send('Invalid signature');
    }

    if (String(status_code) === '2') {
      const { orderType, orderId } = decodePayHereOrderId(order_id);
      await markPaid(orderType, orderId, { method: 'payhere', payhereId: payment_id });
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('PayHere notify error:', err);
    res.status(500).send('Server error');
  }
});

// ---------------------------------------------------------------------------
// Koko — not integrated yet (needs a business BNPL onboarding VinuCare
// doesn't have as a student project). PaymentModal already shows a friendly
// notice and falls back to the method list when this returns non-200.
// ---------------------------------------------------------------------------
router.post('/koko/initiate', auth, async (req, res) => {
  res.status(501).json({ message: 'Koko — Pay Later isn\u2019t available yet. Please use card instead.' });
});

// ---------------------------------------------------------------------------
// Status polling (used by PaymentReturn.jsx)
// ---------------------------------------------------------------------------
router.get('/status', auth, async (req, res) => {
  const { orderType, orderId } = req.query;
  try {
    const payable = await findPayable(orderType, Number(orderId));
    if (!payable) return res.status(404).json({ message: 'Order not found' });
    if (payable.user_id !== req.user.id) return res.status(403).json({ message: 'Not your order' });

    // Normally notify_url flips this to 'paid' before we ever get polled.
    // If it's still not paid, actively ask PayHere directly — covers local
    // dev where notify_url (pointing at localhost) never gets called.
    if (payable.payment_status !== 'paid') {
      const payhereOrderId = encodePayHereOrderId(orderType, Number(orderId));
      const statusCode = await fetchPayHereStatus(payhereOrderId);
      if (String(statusCode) === '2') {
        await markPaid(orderType, Number(orderId), { method: 'payhere', payhereId: null });
        return res.json({ payment_status: 'paid' });
      }
    }

    res.json({ payment_status: payable.payment_status });
  } catch (err) {
    console.error('Payment status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;