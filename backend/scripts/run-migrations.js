// One-off migration runner. This project has no migration tracking table
// and no runner script — the 19 files in backend/migrations/ were always
// meant to be pasted into a MySQL client by hand. That's how production
// silently drifted out of sync with the code (error_logs table and
// appointments.reminder_sent_at were both missing on Railway's DB).
//
// Safe to run repeatedly and against a DB that already has some/all of
// these applied: every statement here is naturally idempotent (CREATE
// TABLE IF NOT EXISTS, INSERT IGNORE, UPDATE-to-same-value) except plain
// ALTER TABLE ADD COLUMN/INDEX, which errors on a column/index that
// already exists — those specific "already there" errors are caught and
// reported as skipped rather than failed.
//
// Usage:
//   node scripts/run-migrations.js
// Connects using the same DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME
// env vars as db.js (via backend/.env, or injected by `railway run`).

const fs   = require('fs');
const path = require('path');
const pool = require('../db');

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');

// Explicit order — mostly alphabetical, but a few files ALTER a table
// that a different file CREATEs, so those pairs are pinned together
// regardless of filename sort order.
const ORDER = [
  'add_banners_table.sql',
  'add_banner_type_and_more_heroes.sql',
  'add_holidays_table.sql',
  'add_2026_sri_lanka_holidays.sql',
  'add_slot_locking_and_transactions.sql',
  'add_transaction_refund_fields.sql',
  'add_audit_log_table.sql',
  'add_doctor_unavailability.sql',
  'add_email_verification.sql',
  'add_google_auth.sql',
  'add_password_reset.sql',
  'add_payment_fields.sql',
  'add_appointment_clinical_fields.sql',
  'add_appointment_reminder_column.sql',
  'add_product_brand.sql',
  'add_error_logs_table.sql',
  'add_staff_messages_table.sql',
  'add_message_edited_at.sql',
  'add_user_avatar.sql',
  'chatbot_unanswered.sql',
  'fix_banner_prices_to_lkr.sql',
];

// MySQL error codes that mean "this exact change is already applied" —
// safe to treat as a no-op rather than a real failure.
const ALREADY_APPLIED = new Set([
  1050, // ER_TABLE_EXISTS_ERROR
  1060, // ER_DUP_FIELDNAME (ADD COLUMN that already exists)
  1061, // ER_DUP_KEYNAME (ADD INDEX/UNIQUE that already exists)
]);

function splitStatements(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function run() {
  const onDisk = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));
  const missingFromOrder = onDisk.filter((f) => !ORDER.includes(f));
  if (missingFromOrder.length) {
    console.error('Found .sql files not listed in ORDER — add them before running:', missingFromOrder);
    process.exit(1);
  }

  const applied = [];
  const skipped = [];
  const failed = [];

  for (const file of ORDER) {
    const fullPath = path.join(MIGRATIONS_DIR, file);
    if (!fs.existsSync(fullPath)) continue;
    const statements = splitStatements(fs.readFileSync(fullPath, 'utf8'));

    let fileFailed = false;
    for (const statement of statements) {
      try {
        await pool.query(statement);
        applied.push(`${file}: ${statement.slice(0, 60).replace(/\s+/g, ' ')}…`);
      } catch (err) {
        if (ALREADY_APPLIED.has(err.errno)) {
          skipped.push(`${file}: ${statement.slice(0, 60).replace(/\s+/g, ' ')}…`);
        } else {
          fileFailed = true;
          failed.push({ file, statement, err });
        }
      }
    }
    console.log(`${fileFailed ? '✗' : '✓'} ${file}`);
  }

  console.log('\n--- Summary ---');
  console.log(`${applied.length} statement(s) applied`);
  console.log(`${skipped.length} statement(s) already in place (skipped)`);
  console.log(`${failed.length} statement(s) failed`);

  if (failed.length) {
    console.log('\n--- Failures ---');
    for (const { file, statement, err } of failed) {
      console.log(`\n[${file}]`);
      console.log(statement);
      console.log(`-> (${err.code}/${err.errno}) ${err.sqlMessage || err.message}`);
    }
  }

  process.exit(failed.length ? 1 : 0);
}

run().catch((err) => {
  console.error('Migration runner crashed:', err);
  process.exit(1);
});
