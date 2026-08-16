// Embedded in every login JWT (see routes/auth.js) and checked in
// authMiddleware/chatbot's optionalAuth: a token carrying a different
// bootId is rejected.
//
// Derived from JWT_SECRET rather than randomised per process: it needs to
// invalidate every outstanding token when the secret changes (the one
// case you actually want a mass logout), but must NOT change on an
// ordinary restart. A random-per-process id did that on every restart,
// which is fine for `node server.js` on a laptop but not on a host like
// Railway, where the container gets respawned on its own (idle respins,
// health-check restarts) far more often than a deliberate deploy — each
// one was silently logging every user out and, for anyone with a request
// in flight right as it happened, turning into stray 401s/403s that look
// like a broken route rather than an expired session.
const crypto = require('crypto');

module.exports = crypto.createHash('sha256').update(process.env.JWT_SECRET || '').digest('hex').slice(0, 16);
