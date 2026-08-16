// System-wide error reporting for the admin dashboard.
//
// Nearly every route in this codebase already does `console.error(...)` in
// its catch block — instead of adding a logging call to every single one of
// those (dozens of files), this patches console.error itself, once, so any
// error already being logged today is automatically persisted and pushed to
// Admin in real time. The original console.error still runs first, so
// server console output is unchanged.
const originalConsoleError = console.error.bind(console);

function serializeArg(arg) {
  if (arg instanceof Error) return arg.stack || arg.message;
  if (typeof arg === 'string') return arg;
  try { return JSON.stringify(arg); } catch { return String(arg); }
}

// Lazily required so this module has no load-order dependency on
// db/socket being ready — by the time an error actually happens, both are.
async function persistAndNotify(message) {
  try {
    const db = require('./db');
    const { emitToAdmin } = require('./socket');
    const [result] = await db.query(
      'INSERT INTO error_logs (message) VALUES (?)',
      [message.slice(0, 4000)]
    );
    emitToAdmin('error:new', {
      id: result.insertId,
      message: message.slice(0, 300),
      createdAt: new Date(),
    });
  } catch (err) {
    // Use the ORIGINAL console.error here, not the patched one below —
    // otherwise a persistently-down DB would recurse into this same
    // function forever instead of just failing quietly once.
    originalConsoleError('Failed to persist error log:', err.message);
  }
}

function installErrorReporting() {
  console.error = (...args) => {
    originalConsoleError(...args);
    const message = args.map(serializeArg).join(' ');
    persistAndNotify(message).catch(() => {});
  };
}

module.exports = { installErrorReporting };
