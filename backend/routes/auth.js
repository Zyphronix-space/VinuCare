const express = require('express');
const crypto  = require('crypto');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db      = require('../db');
const auth    = require('../middleware/authMiddleware');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/mailer');
const bootId  = require('../bootId');
const { authLimiter, emailActionLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (email verification link)

// BACKEND_URL is only used to build the link inside verification emails —
// unlike FRONTEND_URL (needed for CORS) it's easy to forget to set on a
// host like Railway, and a forgotten one silently falls back to
// localhost:5000, mailing out a verify link no real user's browser can
// ever reach. Since this only ever runs inside a request handler, we can
// read the actual host the request came in on instead of trusting an env
// var to be configured — req.protocol reports 'https' correctly here
// because server.js sets 'trust proxy' for exactly this reason.
function getBackendUrl(req) {
  return process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
}
const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // matches the JWT's own 7d expiry

// Session lives in an httpOnly cookie so the JWT is never readable from
// frontend JS (mitigates token theft via XSS) — the browser just sends it
// automatically on every request to this origin.
// In production the frontend and backend live on different domains
// (e.g. vercel.app vs railway.app), so the cookie must be sameSite:'none'
// to be sent on cross-origin fetch calls — 'lax' silently drops it there.
// 'none' requires secure:true, which only works over HTTPS, so dev (plain
// http://localhost) has to stay on 'lax'/non-secure or the cookie would
// never be set at all.
// Deriving this from FRONTEND_URL instead of NODE_ENV — hosts like Railway
// don't set NODE_ENV=production for you, and forgetting to set it there
// silently keeps cookies on sameSite:'lax'/secure:false in prod, which
// browsers then refuse to send back on cross-site requests (Vercel ->
// Railway), breaking every /api/auth/me-style call right after login.
const isProd = !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(FRONTEND_URL);
function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: '/',
  });
}

// Google Sign-In — only wired up once GOOGLE_CLIENT_ID is set in .env
// (see /google route below). Same client id the frontend uses to render
// the button; verifyIdToken checks the token was actually issued for it.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

function signUserToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, bootId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function makeVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function issueAndSendVerification(user, req) {
  const token   = makeVerificationToken();
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await db.query(
    'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
    [token, expires, user.id]
  );

  const verifyUrl = `${getBackendUrl(req)}/api/auth/verify-email?token=${token}`;
  // The account/token are already saved at this point — a transient SMTP
  // failure shouldn't fail the whole signup response over an email that
  // can be resent later (see the "Resend verification email" flow on
  // Login). Log it instead so it shows up in the admin Error Logs.
  try {
    await sendVerificationEmail(user.email, user.name, verifyUrl);
  } catch (err) {
    console.error('Failed to send verification email:', err);
  }
}

// ── SIGNUP ──────────────────────────────────────────────
const PHONE_REGEX = /^(?:\+94|0)[1-9]\d{8}$/;

router.post('/signup', authLimiter, async (req, res) => {
  const { name, email, password } = req.body;
  const phone = req.body.phone?.replace(/[\s-]/g, '');

  if (!name || !email || !phone || !password)
    return res.status(400).json({ message: 'All fields are required' });
  if (!PHONE_REGEX.test(phone))
    return res.status(400).json({ message: 'Enter a valid Sri Lankan phone number' });

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password_hash, is_verified) VALUES (?, ?, ?, ?, 0)',
      [name, email, phone, hashed]
    );

    await issueAndSendVerification({ id: result.insertId, name, email }, req);

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account before signing in.',
      email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── VERIFY EMAIL ────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.redirect(`${FRONTEND_URL}/verify-email?status=error&reason=missing`);
  }

  try {
    const [rows] = await db.query(
      'SELECT id, verification_token_expires FROM users WHERE verification_token = ?',
      [token]
    );

    if (rows.length === 0) {
      return res.redirect(`${FRONTEND_URL}/verify-email?status=error&reason=invalid`);
    }

    const user = rows[0];
    if (user.verification_token_expires && new Date(user.verification_token_expires) < new Date()) {
      return res.redirect(`${FRONTEND_URL}/verify-email?status=error&reason=expired`);
    }

    await db.query(
      'UPDATE users SET is_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
      [user.id]
    );

    // Fetch full user record so we can issue a login token immediately —
    // this lets the frontend auto-login the user right after verifying.
    const [freshRows] = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [user.id]
    );
    const freshUser = freshRows[0];

    const loginToken = jwt.sign(
      { id: freshUser.id, name: freshUser.name, email: freshUser.email, role: freshUser.role, bootId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set the cookie on this same response before the redirect — the browser
    // stores it as part of following the Location header, no token in the URL.
    setAuthCookie(res, loginToken);
    return res.redirect(`${FRONTEND_URL}/verify-email?status=success`);
  } catch (err) {
    console.error(err);
    return res.redirect(`${FRONTEND_URL}/verify-email?status=error&reason=server`);
  }
});

// ── RESEND VERIFICATION ─────────────────────────────────
router.post('/resend-verification', emailActionLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const [rows] = await db.query('SELECT id, name, email, is_verified FROM users WHERE email = ?', [email]);

    if (rows.length === 0 || rows[0].is_verified) {
      return res.json({ message: 'If that account needs verification, a new email has been sent.' });
    }

    await issueAndSendVerification(rows[0], req);
    res.json({ message: 'If that account needs verification, a new email has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── LOGIN ───────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const user = rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ message: 'This account uses Google Sign-In. Continue with Google instead.' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.is_verified) {
      return res.status(403).json({
        message: 'Please verify your email before signing in. Check your inbox for the verification link.',
        needsVerification: true,
        email: user.email,
      });
    }

    const token = signUserToken(user);
    setAuthCookie(res, token);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── FORGOT PASSWORD ─────────────────────────────────────
// Always responds with the same generic message regardless of whether
// the email exists, is Google-only, etc. — anything else would let
// someone enumerate registered emails by trying them here.
router.post('/forgot-password', emailActionLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const genericMessage = 'If an account with that email exists, a password reset link has been sent.';

  try {
    const [rows] = await db.query('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);
    const user = rows[0];

    // No account, or a Google-only account with no password to reset —
    // either way, nothing to email, but don't leak that distinction.
    if (!user || !user.password_hash) {
      return res.json({ message: genericMessage });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [token, expires, user.id]
    );

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    // Same reasoning as issueAndSendVerification — don't let an SMTP
    // hiccup surface as a 500 (which would also leak that the account
    // exists, undermining the generic-message anti-enumeration guard).
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (err) {
      console.error('Failed to send password reset email:', err);
    }

    res.json({ message: genericMessage });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── RESET PASSWORD ──────────────────────────────────────
router.post('/reset-password', authLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, reset_token_expires FROM users WHERE reset_token = ?',
      [token]
    );
    const user = rows[0];
    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid. Request a new one.' });
    }
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ message: 'This reset link has expired. Request a new one.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashed, user.id]
    );

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── LOGOUT ───────────────────────────────────────────────
router.post('/logout', (req, res) => {
  // Must match the attributes the cookie was set with (sameSite/secure) —
  // browsers won't clear a cookie whose scoping attributes don't match.
  res.clearCookie('token', { path: '/', sameSite: isProd ? 'none' : 'lax', secure: isProd });
  res.json({ message: 'Logged out' });
});

// ── GOOGLE SIGN-IN ───────────────────────────────────────
// Frontend posts the ID token (JWT credential) it got from Google
// Identity Services after the user picks an account. We verify it was
// really issued by Google for our client id, then find-or-create the
// matching user. Google has already verified the email address, so
// these accounts skip the usual email-verification step.
router.post('/google', authLimiter, async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Google credential is required' });
  if (!googleClient) {
    return res.status(503).json({ message: 'Google Sign-In is not configured on the server yet.' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ message: 'Google account has no email address' });

    const [rows] = await db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [payload.sub, payload.email]);
    let user = rows[0];

    if (!user) {
      const [result] = await db.query(
        'INSERT INTO users (name, email, google_id, is_verified) VALUES (?, ?, ?, 1)',
        [payload.name || payload.email, payload.email, payload.sub]
      );
      user = { id: result.insertId, name: payload.name || payload.email, email: payload.email, role: null };

      // Fire-and-forget — the welcome email is a courtesy, not a gate, so
      // it shouldn't block or fail the sign-in response if SMTP is slow.
      sendWelcomeEmail(user.email, user.name).catch((err) => {
        console.error('Welcome email failed:', err.message);
      });
    } else if (!user.google_id) {
      // Existing password account signing in with Google for the first
      // time — link it instead of creating a duplicate account.
      await db.query('UPDATE users SET google_id = ?, is_verified = 1 WHERE id = ?', [payload.sub, user.id]);
    }

    const token = signUserToken(user);
    setAuthCookie(res, token);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Google sign-in error:', err);
    res.status(401).json({ message: 'Could not verify Google sign-in' });
  }
});

// ── GET MY PROFILE ──────────────────────────────────────
// Powers the "View Profile" page — returns everything about the
// logged-in user except the password hash / verification internals.
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, role, phone, specialty, status, avatar, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── UPDATE MY PROFILE ───────────────────────────────────
// Deliberately only lets a user edit name/phone/avatar about themselves —
// email, role, and status changes go through the admin panel instead,
// so a customer can't quietly promote themselves to Admin by editing
// their own profile payload.
router.put('/me', auth, async (req, res) => {
  const { name, phone, avatar } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
  // avatar is a base64 data URL (same convention as product images in
  // AdminProducts) — undefined means "leave it alone" (the name/phone
  // edit form doesn't touch it), null means "remove photo".
  const touchingAvatar = avatar !== undefined;
  try {
    if (touchingAvatar) {
      await db.query(
        `UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?`,
        [name.trim(), phone || null, avatar || null, req.user.id]
      );
    } else {
      await db.query(
        `UPDATE users SET name = ?, phone = ? WHERE id = ?`,
        [name.trim(), phone || null, req.user.id]
      );
    }
    const [rows] = await db.query(
      `SELECT id, name, email, role, phone, specialty, status, avatar, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── CHANGE MY PASSWORD ──────────────────────────────────
router.put('/me/password', auth, authLimiter, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }
  try {
    const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;