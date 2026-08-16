const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Lives inside backend/ (not the frontend's src/) so this module works
// standalone in production, where Railway's "root directory: backend"
// build only packages this folder — a sibling ../../src is never present
// in the deployed container.
const LOGO_PATH = path.resolve(__dirname, '../assets/vinucare-logo.png');
let LOGO_BUFFER = null;
try {
  LOGO_BUFFER = fs.readFileSync(LOGO_PATH);
} catch (err) {
  console.error('Mailer: could not load logo attachment, sending emails without it:', err.message);
}

// Sends over Resend's HTTPS API rather than raw SMTP — Railway (like most
// PaaS hosts) blocks outbound SMTP connections platform-wide as an
// anti-spam measure, so a direct nodemailer/Gmail transport just hangs
// until ETIMEDOUT there even though it works fine from a home network.
let resend = null;
function getClient() {
  if (resend) return resend;
  if (!process.env.RESEND_API_KEY) return null;
  resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

// No verified domain on the Resend account (this is a uni project with no
// real domain), so sending is restricted to onboarding@resend.dev as the
// sender and — until a domain is verified — only actually delivers to the
// email address the Resend account itself is registered under.
const FROM = 'VinuCare <onboarding@resend.dev>';

async function send(to, subject, html) {
  const client = getClient();

  if (!client) {
    console.log('\n──────────── EMAIL (RESEND_API_KEY not configured) ────────────');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('─────────────────────────────────────────────────────────────\n');
    return { simulated: true };
  }

  const { data, error } = await client.emails.send({
    from: FROM,
    to,
    subject,
    html,
    attachments: LOGO_BUFFER
      ? [{ filename: 'vinucare-logo.png', content: LOGO_BUFFER, content_id: 'vinucare-logo' }]
      : [],
  });
  if (error) throw new Error(error.message || 'Resend API error');
  return data;
}

async function sendVerificationEmail(to, name, verifyUrl) {
  const subject = 'Verify your VinuCare account';
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#faf9fd;">
    <div style="text-align:center; margin-bottom: 24px;">
      <img src="cid:vinucare-logo" alt="VinuCare" width="56" height="56" style="border-radius:14px; display:inline-block;" />
    </div>
    <h2 style="color:#2b2140; text-align:center; margin-bottom:8px;">Welcome to VinuCare, ${name}!</h2>
    <p style="color:#5c5470; text-align:center; font-size:14px; line-height:1.6;">
      Please confirm your email address to activate your account and start booking care for your pets.
    </p>
    <div style="text-align:center; margin: 28px 0;">
      <a href="${verifyUrl}" style="background:linear-gradient(135deg,#7C5CE8,#5B3FC4); color:#fff; text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:600; display:inline-block;">
        Verify My Email
      </a>
    </div>
    <p style="color:#9a93ab; text-align:center; font-size:12px; line-height:1.6;">
      This link expires in 24 hours. If the button doesn't work, copy and paste this URL into your browser:<br>
      <span style="word-break:break-all;">${verifyUrl}</span>
    </p>
    <p style="color:#c2bdd1; text-align:center; font-size:11px; margin-top:24px;">
      If you didn't create a VinuCare account, you can safely ignore this email.
    </p>
  </div>`;

  return send(to, subject, html);
}

// Google sign-ups skip the verification link entirely — Google already
// confirmed the email address — but they were getting no email at all,
// which read as broken. This is the welcome email for that path instead.
async function sendWelcomeEmail(to, name) {
  const subject = 'Welcome to VinuCare';
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#faf9fd;">
    <div style="text-align:center; margin-bottom: 24px;">
      <img src="cid:vinucare-logo" alt="VinuCare" width="56" height="56" style="border-radius:14px; display:inline-block;" />
    </div>
    <h2 style="color:#2b2140; text-align:center; margin-bottom:8px;">Welcome to VinuCare, ${name}!</h2>
    <p style="color:#5c5470; text-align:center; font-size:14px; line-height:1.6;">
      Your account is ready to go — you signed in with Google, so there's nothing
      else to confirm. You can start booking care for your pets right away.
    </p>
    <p style="color:#c2bdd1; text-align:center; font-size:11px; margin-top:24px;">
      If you didn't create a VinuCare account, you can safely ignore this email.
    </p>
  </div>`;

  return send(to, subject, html);
}

async function sendPasswordResetEmail(to, name, resetUrl) {
  const subject = 'Reset your VinuCare password';
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#faf9fd;">
    <div style="text-align:center; margin-bottom: 24px;">
      <img src="cid:vinucare-logo" alt="VinuCare" width="56" height="56" style="border-radius:14px; display:inline-block;" />
    </div>
    <h2 style="color:#2b2140; text-align:center; margin-bottom:8px;">Reset your password, ${name}</h2>
    <p style="color:#5c5470; text-align:center; font-size:14px; line-height:1.6;">
      We received a request to reset your VinuCare password. Click below to choose a new one.
    </p>
    <div style="text-align:center; margin: 28px 0;">
      <a href="${resetUrl}" style="background:linear-gradient(135deg,#7C5CE8,#5B3FC4); color:#fff; text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:600; display:inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color:#9a93ab; text-align:center; font-size:12px; line-height:1.6;">
      This link expires in 1 hour. If the button doesn't work, copy and paste this URL into your browser:<br>
      <span style="word-break:break-all;">${resetUrl}</span>
    </p>
    <p style="color:#c2bdd1; text-align:center; font-size:11px; margin-top:24px;">
      If you didn't request this, you can safely ignore this email — your password won't change.
    </p>
  </div>`;

  return send(to, subject, html);
}

// Sent when a doctor blocks off a day that already had bookings on it —
// those appointments get auto-cancelled server-side, and this is how the
// affected owner finds out and gets pointed at rebooking a new day ASAP.
async function sendAppointmentCancelledEmail(to, name, appt, rebookUrl) {
  const subject = 'Your VinuCare appointment needs to be rescheduled';
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#faf9fd;">
    <div style="text-align:center; margin-bottom: 24px;">
      <img src="cid:vinucare-logo" alt="VinuCare" width="56" height="56" style="border-radius:14px; display:inline-block;" />
    </div>
    <h2 style="color:#2b2140; text-align:center; margin-bottom:8px;">Hi ${name}, we need to reschedule</h2>
    <p style="color:#5c5470; text-align:center; font-size:14px; line-height:1.6;">
      Your doctor became unavailable on <strong>${appt.date}</strong>, so your appointment for
      <strong>${appt.petName}</strong> (${appt.service} at ${appt.time}) has been cancelled.
      We're sorry for the inconvenience — please pick a new day that works for you as soon as you can.
    </p>
    <div style="text-align:center; margin: 28px 0;">
      <a href="${rebookUrl}" style="background:linear-gradient(135deg,#7C5CE8,#5B3FC4); color:#fff; text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:600; display:inline-block;">
        Choose a New Day
      </a>
    </div>
    <p style="color:#9a93ab; text-align:center; font-size:12px; line-height:1.6;">
      If the button doesn't work, copy and paste this URL into your browser:<br>
      <span style="word-break:break-all;">${rebookUrl}</span>
    </p>
  </div>`;

  return send(to, subject, html);
}

// Sent by the reminder sweep (see backend/appointmentReminders.js) the day
// before a confirmed appointment.
async function sendAppointmentReminderEmail(to, name, appt) {
  const subject = `Reminder: ${appt.petName}'s appointment is tomorrow`;
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#faf9fd;">
    <div style="text-align:center; margin-bottom: 24px;">
      <img src="cid:vinucare-logo" alt="VinuCare" width="56" height="56" style="border-radius:14px; display:inline-block;" />
    </div>
    <h2 style="color:#2b2140; text-align:center; margin-bottom:8px;">See you tomorrow, ${name}!</h2>
    <p style="color:#5c5470; text-align:center; font-size:14px; line-height:1.6;">
      Just a reminder — <strong>${appt.petName}</strong> has a <strong>${appt.service}</strong>
      appointment tomorrow, <strong>${appt.apptDate}</strong> at <strong>${appt.apptTime}</strong>.
    </p>
    <p style="color:#c2bdd1; text-align:center; font-size:11px; margin-top:24px;">
      Need to reschedule? Sign in to VinuCare and update it from your appointments page.
    </p>
  </div>`;

  return send(to, subject, html);
}

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendAppointmentCancelledEmail, sendAppointmentReminderEmail };