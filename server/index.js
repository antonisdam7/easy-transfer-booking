import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-super-secret";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const TRANSFERS_FILE = path.join(__dirname, "data", "transfers.json");
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const MAIL_TO = process.env.MAIL_TO || "";
const EMAIL_SEND_TIMEOUT_MS = Number(process.env.EMAIL_SEND_TIMEOUT_MS || 8000);

app.use(cors());
app.use(express.json());

const mailTransporter =
  SMTP_HOST && SMTP_USER && SMTP_PASS && MAIL_TO
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    : null;

async function ensureDataFile() {
  const folder = path.dirname(TRANSFERS_FILE);
  await fs.mkdir(folder, { recursive: true });
  try {
    await fs.access(TRANSFERS_FILE);
  } catch {
    await fs.writeFile(TRANSFERS_FILE, "[]", "utf-8");
  }
}

async function readTransfers() {
  await ensureDataFile();
  const content = await fs.readFile(TRANSFERS_FILE, "utf-8");
  return JSON.parse(content);
}

async function writeTransfers(transfers) {
  await fs.writeFile(TRANSFERS_FILE, JSON.stringify(transfers, null, 2), "utf-8");
}

function buildTransferEmail(transfer) {
  const lines = [
    `New transfer request received`,
    ``,
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
    ``,
    `Request ID: ${transfer.id}`,
    `Created At: ${transfer.createdAt}`,
  ];

  return {
    subject: `New transfer booking: ${transfer.name} (${transfer.date} ${transfer.time})`,
    text: lines.join("\n"),
  };
}

async function sendTransferNotification(transfer) {
  if (!mailTransporter || !MAIL_FROM || !MAIL_TO) {
    console.log("Email notifications are disabled. Configure SMTP env vars to enable.");
    return;
  }

  const message = buildTransferEmail(transfer);
  await mailTransporter.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    subject: message.subject,
    text: message.text,
  });
}

async function sendTransferNotificationWithTimeout(transfer) {
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Email send timed out after ${EMAIL_SEND_TIMEOUT_MS}ms`));
    }, EMAIL_SEND_TIMEOUT_MS);
    timeoutId.unref?.();
  });

  await Promise.race([sendTransferNotification(transfer), timeoutPromise]);
}

function queueTransferNotification(transfer) {
  // Do not block API response on SMTP delays.
  setImmediate(async () => {
    try {
      await sendTransferNotificationWithTimeout(transfer);
    } catch (error) {
      console.error("Failed to send transfer notification email:", error);
    }
  });
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing auth token." });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body ?? {};

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ role: "admin", username }, JWT_SECRET, { expiresIn: "12h" });
  return res.json({ token });
});

app.post("/api/transfers", async (req, res) => {
  const transfer = req.body ?? {};
  const requiredFields = ["name", "email", "pickup", "dropoff", "date", "time", "passengers"];
  const missingField = requiredFields.find((field) => !transfer[field]);

  if (missingField) {
    return res.status(400).json({ message: `Missing required field: ${missingField}` });
  }

  const transfers = await readTransfers();
  const newTransfer = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...transfer,
  };

  transfers.unshift(newTransfer);
  await writeTransfers(transfers);

  queueTransferNotification(newTransfer);

  return res.status(201).json({ id: newTransfer.id });
});

app.get("/api/admin/transfers", requireAdmin, async (_req, res) => {
  const transfers = await readTransfers();
  res.json({ transfers });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  if (!mailTransporter) {
    console.log("SMTP is not configured yet. Set SMTP_* env vars to enable email notifications.");
  }
});
