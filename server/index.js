import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { getStorageMode, getTransfers, initStorage, saveTransfer } from "./storage.js";
import {
  getEmailStatus,
  logEmailStartupStatus,
  queueTransferNotification,
} from "./email.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-super-secret";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

app.use(cors());
app.use(express.json());

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
  res.json({ status: "ok", storage: getStorageMode(), email: getEmailStatus() });
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

  const newTransfer = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...transfer,
  };

  await saveTransfer(newTransfer);

  queueTransferNotification(newTransfer);

  return res.status(201).json({ id: newTransfer.id });
});

app.get("/api/admin/transfers", requireAdmin, async (_req, res) => {
  const transfers = await getTransfers();
  res.json({ transfers });
});

async function startServer() {
  try {
    await initStorage();
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
      console.log(`Storage mode: ${getStorageMode()}`);
      logEmailStartupStatus();
    });
  } catch (error) {
    console.error("Failed to initialize server storage:", error);
    process.exit(1);
  }
}

startServer();
