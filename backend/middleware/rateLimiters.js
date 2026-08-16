const rateLimit = require('express-rate-limit');

// Login/signup attempts — generous enough that a real user fumbling their
// password a few times never gets blocked, tight enough to stop a script
// from brute-forcing passwords or mass-creating accounts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Railway's proxy chain doesn't match what express-rate-limit's strict
  // X-Forwarded-For validation expects even with `trust proxy` set, so it
  // throws on every request instead of just keying by req.ip. We already
  // trust Railway's proxy (app.set('trust proxy', 1) in server.js), so
  // this check is redundant here — safe to turn off.
  validate: { xForwardedForHeader: false },
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

// Forgot-password / resend-verification — these each trigger an outbound
// email, so on top of abuse prevention this also stops someone from using
// the form to spam a stranger's inbox.
const emailActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { message: 'Too many requests. Please try again in an hour.' },
});

module.exports = { authLimiter, emailActionLimiter };
