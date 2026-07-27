import nodemailer from "nodemailer";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const MAIL_TO = process.env.MAIL_TO || "";
const EMAIL_SEND_TIMEOUT_MS = Number(process.env.EMAIL_SEND_TIMEOUT_MS || 15000);
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || "auto").toLowerCase();

const mailTransporter =
  SMTP_HOST && SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    : null;

const resendReady = Boolean(RESEND_API_KEY && MAIL_FROM && MAIL_TO);
const smtpReady = Boolean(mailTransporter && MAIL_FROM && MAIL_TO);

function resolveProvider() {
  if (EMAIL_PROVIDER === "resend") return resendReady ? "resend" : "none";
  if (EMAIL_PROVIDER === "smtp") return smtpReady ? "smtp" : "none";
  if (resendReady) return "resend";
  if (smtpReady) return "smtp";
  return "none";
}

export function getEmailStatus() {
  const provider = resolveProvider();
  const missing = [];

  if (!MAIL_TO) missing.push("MAIL_TO");
  if (!MAIL_FROM) missing.push("MAIL_FROM");

  if (provider === "resend" || (EMAIL_PROVIDER === "resend" && !resendReady)) {
    if (!RESEND_API_KEY) missing.push("RESEND_API_KEY");
  }

  if (provider === "smtp" || (EMAIL_PROVIDER === "smtp" && !smtpReady)) {
    if (!SMTP_HOST) missing.push("SMTP_HOST");
    if (!SMTP_USER) missing.push("SMTP_USER");
    if (!SMTP_PASS) missing.push("SMTP_PASS");
  }

  if (provider === "none" && EMAIL_PROVIDER === "auto") {
    if (!RESEND_API_KEY) missing.push("RESEND_API_KEY (recommended on Render free tier)");
    if (!SMTP_HOST) missing.push("SMTP_HOST");
    if (!SMTP_USER) missing.push("SMTP_USER");
    if (!SMTP_PASS) missing.push("SMTP_PASS");
  }

  return {
    configured: provider !== "none",
    provider,
    missingEnv: [...new Set(missing)],
    mailTo: MAIL_TO ? "(set)" : null,
    mailFrom: MAIL_FROM ? "(set)" : null,
    smtpHost: SMTP_HOST || null,
    smtpPort: SMTP_PORT,
    note:
      provider === "smtp"
        ? "SMTP may time out on Render free tier (ports 587/465 blocked). Use Resend instead."
        : provider === "resend"
          ? "Using Resend HTTP API (works on Render free tier)."
          : null,
  };
}

export function buildTransferEmail(transfer) {
  const lines = [
    "New transfer request received",
    "",
    `Name: ${transfer.name}`,
    `Email: ${transfer.email}`,
    `Phone: ${transfer.phone || "-"}`,
    `Pickup: ${transfer.pickup}`,
    `Dropoff: ${transfer.dropoff}`,
    `Date: ${transfer.date}`,
    `Time: ${transfer.time}`,
    `Passengers: ${transfer.passengers}`,
    `Vehicle: ${transfer.vehicleType || "-"}`,
    `Flight Number: ${transfer.flightNumber || "-"}`,
    `Luggage: ${transfer.luggage || "-"}`,
    `Child Seat: ${transfer.childSeat ? "Yes" : "No"}`,
    `Notes: ${transfer.notes || "-"}`,
    "",
    `Request ID: ${transfer.id}`,
    `Created At: ${transfer.createdAt}`,
  ];

  return {
    subject: `New transfer booking: ${transfer.name} (${transfer.date} ${transfer.time})`,
    text: lines.join("\n"),
  };
}

async function sendViaResend(message) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [MAIL_TO],
      subject: message.subject,
      text: message.text,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.message || data?.error || JSON.stringify(data);
    throw new Error(`Resend API error (${response.status}): ${detail}`);
  }

  return data;
}

async function sendViaSmtp(message) {
  await mailTransporter.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    subject: message.subject,
    text: message.text,
  });
}

async function sendTransferNotification(transfer) {
  const provider = resolveProvider();
  const message = buildTransferEmail(transfer);

  if (provider === "none") {
    console.log("Email notifications are disabled. Set RESEND_API_KEY or SMTP_* plus MAIL_FROM and MAIL_TO.");
    return;
  }

  if (provider === "resend") {
    await sendViaResend(message);
    return;
  }

  await sendViaSmtp(message);
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const id = setTimeout(() => reject(new Error(`Email send timed out after ${ms}ms`)), ms);
      id.unref?.();
    }),
  ]);
}

export async function sendTransferNotificationWithTimeout(transfer) {
  await withTimeout(sendTransferNotification(transfer), EMAIL_SEND_TIMEOUT_MS);
}

export function queueTransferNotification(transfer) {
  setImmediate(async () => {
    try {
      await sendTransferNotificationWithTimeout(transfer);
      console.log(
        `Transfer notification email sent (${resolveProvider()}) for request ${transfer.id}`,
      );
    } catch (error) {
      console.error("Failed to send transfer notification email:", error?.message || error);
    }
  });
}

export function logEmailStartupStatus() {
  const status = getEmailStatus();
  if (!status.configured) {
    console.log(
      "Email notifications disabled.",
      status.missingEnv.length ? `Missing: ${status.missingEnv.join(", ")}` : "",
    );
    return;
  }

  console.log(`Email notifications enabled via ${status.provider}.`);
  if (status.note) {
    console.log(status.note);
  }
}
