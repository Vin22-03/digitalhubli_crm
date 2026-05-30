/**
 * Brevo (formerly Sendinblue) email service
 * Install: npm install @getbrevo/brevo
 *
 * Set in your .env:
 *   BREVO_API_KEY=your_api_key_here
 *   EMAIL_FROM=no-reply@digitalhubli.com
 *   EMAIL_FROM_NAME=digitalhubli CRM
 *   APP_URL=https://yourapp.com
 */

import { BRAND } from "./branding.js";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL    = process.env.EMAIL_FROM      || "no-reply@digitalhubli.com";
const FROM_NAME     = process.env.EMAIL_FROM_NAME || `${BRAND.companyName} CRM`;
const APP_URL       = process.env.APP_URL         || "https://digitalhubli.com";

async function sendEmail({ to, toName, subject, htmlContent }) {
  if (!BREVO_API_KEY) {
    console.warn("⚠ BREVO_API_KEY not set — email skipped:", subject, "→", to);
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept":       "application/json",
      "api-key":      BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender:   { name: FROM_NAME, email: FROM_EMAIL },
      to:       [{ email: to, name: toName || to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("Brevo send error:", err);
    throw new Error(err?.message || "Email send failed");
  }

  const data = await res.json();
  console.log(`✉ Email sent → ${to} | msgId: ${data.messageId}`);
  return data;
}

/* ─────────────────────────────────────────────────────────
   EMAIL TEMPLATES
───────────────────────────────────────────────────────── */

function baseLayout(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${BRAND.companyName}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#1e3a8a,#0369a1);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
        <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 20px;">
          <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">${BRAND.companyName}</span>
        </div>
        <div style="font-size:12px;color:rgba(186,230,255,0.75);margin-top:6px;letter-spacing:0.5px;">${BRAND.tagline}</div>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#ffffff;padding:32px;border-radius:0;">
        ${bodyHtml}
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">
          © ${new Date().getFullYear()} ${BRAND.companyName} · ${BRAND.tagline}
        </p>
        <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">
          Support: ${BRAND.supportPhone}
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ── 1. Account Activated ── */
export async function sendActivationEmail({ to, name, expiryDate, amountPaid, loginUrl }) {
  const expiry  = new Date(expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const amount  = amountPaid ? `₹${Number(amountPaid).toLocaleString("en-IN")}` : "—";
  const url     = loginUrl || APP_URL;

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e293b;">
      🎉 Welcome to ${BRAND.companyName} CRM!
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      Hi <strong>${name}</strong>, your account has been activated. You can now login and start managing your leads, contacts and templates.
    </p>

    <!-- Details card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;">
          <span style="font-size:13px;color:#0369a1;font-weight:600;">✅ Status</span>
          <span style="float:right;font-size:13px;color:#1e293b;font-weight:600;">Active</span>
        </td>
      </tr>
      <tr><td style="border-top:1px solid #bae6fd;padding:6px 0;">
        <span style="font-size:13px;color:#0369a1;font-weight:600;">📅 Valid Until</span>
        <span style="float:right;font-size:13px;color:#1e293b;font-weight:600;">${expiry}</span>
      </td></tr>
      <tr><td style="border-top:1px solid #bae6fd;padding:6px 0;">
        <span style="font-size:13px;color:#0369a1;font-weight:600;">💰 Amount Paid</span>
        <span style="float:right;font-size:13px;color:#1e293b;font-weight:600;">${amount}</span>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td align="center">
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#0891b2);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;letter-spacing:0.2px;">
          Login to Dashboard →
        </a>
      </td></tr>
    </table>

    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
      Need help? Call or WhatsApp us at <strong style="color:#475569;">${BRAND.supportPhone}</strong>
    </p>`;

  return sendEmail({
    to, toName: name,
    subject: `✅ Your ${BRAND.companyName} CRM account is now active!`,
    htmlContent: baseLayout(body),
  });
}

/* ── 2. Signup Received (pending payment) ── */
export async function sendSignupReceivedEmail({ to, name, supportPhone }) {
  const phone = supportPhone || BRAND.supportPhone;

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e293b;">
      Account Registration Received
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      Hi <strong>${name}</strong>, we've received your registration on <strong>${BRAND.companyName} CRM</strong>.
    </p>
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:18px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">⏳ Next step: Complete payment</p>
      <p style="margin:8px 0 0;font-size:13px;color:#78350f;line-height:1.6;">
        Your account will be activated as soon as we confirm your payment of <strong>₹2,000/year</strong>.
        Please transfer the amount and share your payment screenshot on WhatsApp.
      </p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:24px;">
      <tr><td>
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1e293b;">Payment & Support</p>
        <p style="margin:0;font-size:13px;color:#475569;line-height:1.8;">
          📱 WhatsApp / Call: <strong>${phone}</strong><br/>
          💰 Amount: <strong>₹2,000/year</strong><br/>
          🏦 UPI / Bank details will be shared on WhatsApp
        </p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      Once payment is confirmed, you'll receive another email with your login details.
    </p>`;

  return sendEmail({
    to, toName: name,
    subject: `Registration received — ${BRAND.companyName} CRM`,
    htmlContent: baseLayout(body),
  });
}

/* ── 3. Subscription Expiry Reminder ── */
export async function sendExpiryReminderEmail({ to, name, expiryDate, daysLeft }) {
  const expiry = new Date(expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e293b;">
      Your subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      Hi <strong>${name}</strong>, your <strong>${BRAND.companyName} CRM</strong> subscription expires on <strong>${expiry}</strong>.
      Renew now to avoid any interruption to your work.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">⚠ Action required</p>
      <p style="margin:8px 0 0;font-size:13px;color:#7f1d1d;line-height:1.6;">
        Contact us on WhatsApp at <strong>${BRAND.supportPhone}</strong> to renew your subscription before ${expiry}.
      </p>
    </div>
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      Renewal: ₹2,000/year · ${BRAND.companyName} CRM
    </p>`;

  return sendEmail({
    to, toName: name,
    subject: `⚠ Your ${BRAND.companyName} CRM subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
    htmlContent: baseLayout(body),
  });
}

/* ── 4. Plan changed / extended by admin ── */
export async function sendPlanUpdatedEmail({ to, name, expiryDate, note }) {
  const expiry = new Date(expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e293b;">
      Your subscription has been updated
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      Hi <strong>${name}</strong>, your <strong>${BRAND.companyName} CRM</strong> subscription has been updated by the admin.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr><td style="padding:6px 0;">
        <span style="font-size:13px;color:#166534;font-weight:600;">📅 New expiry date</span>
        <span style="float:right;font-size:13px;color:#1e293b;font-weight:600;">${expiry}</span>
      </td></tr>
      ${note ? `<tr><td style="border-top:1px solid #86efac;padding:6px 0;">
        <span style="font-size:13px;color:#166534;font-weight:600;">📝 Note</span>
        <span style="float:right;font-size:13px;color:#1e293b;">${note}</span>
      </td></tr>` : ""}
    </table>
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      Questions? WhatsApp us at ${BRAND.supportPhone}
    </p>`;

  return sendEmail({
    to, toName: name,
    subject: `✅ Subscription updated — ${BRAND.companyName} CRM`,
    htmlContent: baseLayout(body),
  });
}

/* ── 5. Password Reset OTP ── */
export async function sendPasswordResetEmail({ to, name, otp }) {
  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e293b;">
      Password Reset Code
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      Hi <strong>${name}</strong>, we received a request to reset your <strong>${BRAND.companyName} CRM</strong> password.
    </p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:16px;padding:28px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#0369a1;font-weight:600;">Your verification code</p>
      <p style="margin:0;font-size:40px;font-weight:900;color:#0f172a;letter-spacing:8px;">${otp}</p>
      <p style="margin:12px 0 0;font-size:12px;color:#64748b;">This code expires in 15 minutes</p>
    </div>
    <p style="margin:0 0 12px;font-size:14px;color:#475569;line-height:1.6;">
      Enter this code on the password reset screen to set a new password.
    </p>
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
      If you didn't request this, ignore this email — your password stays unchanged.
    </p>`;

  return sendEmail({
    to, toName: name,
    subject: `${otp} is your ${BRAND.companyName} password reset code`,
    htmlContent: baseLayout(body),
  });
}