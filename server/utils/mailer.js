// ===========================================================================
// server/utils/mailer.js
// Sends transactional email through a Gmail account using Nodemailer.
//
// Auth uses a Google "App Password" (NOT the account's login password):
//   Google Account -> Security -> 2-Step Verification -> App passwords.
// Put the address + 16-char app password in server/.env as:
//   GMAIL_USER, GMAIL_APP_PASSWORD
//
// Free and needs no custom domain. Caveats: ~500 emails/day and mail is "from"
// the Gmail address (may occasionally land in spam). Fine for password resets.
// ===========================================================================

const nodemailer = require('nodemailer');

// True only when both credentials are present. When false we skip sending (and
// log) instead of crashing — lets the app run locally without email configured.
const emailConfigured = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

// One reusable transport (a pooled connection to Gmail's SMTP).
const transporter = emailConfigured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null;

// Send the password-reset email containing the one-time reset link.
// Returns true if an email was sent, false if email isn't configured.
async function sendPasswordResetEmail(to, resetUrl) {
  if (!emailConfigured) {
    // No credentials -> don't blow up; make it obvious in the server log.
    console.warn('[mailer] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping reset email. Link:', resetUrl);
    return false;
  }

  await transporter.sendMail({
    from: `Pharm-Assist <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your Pharm-Assist password',
    text:
      'We received a request to reset your Pharm-Assist password.\n\n' +
      `Reset it here (this link expires in 1 hour):\n${resetUrl}\n\n` +
      "If you didn't request this, you can safely ignore this email — your password won't change.",
    html:
      '<p>We received a request to reset your Pharm-Assist password.</p>' +
      `<p><a href="${resetUrl}">Reset your password</a> (this link expires in 1 hour).</p>` +
      "<p>If you didn't request this, you can safely ignore this email — your password won't change.</p>",
  });
  return true;
}

module.exports = { sendPasswordResetEmail, emailConfigured };
