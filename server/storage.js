import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRANSFERS_FILE = path.join(__dirname, "data", "transfers.json");
const DATABASE_URL = process.env.DATABASE_URL || "";
const DATABASE_SSL = process.env.DATABASE_SSL !== "false";

let pool = null;

function mapRowToTransfer(row) {
  return {
    id: row.id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    pickup: row.pickup,
    dropoff: row.dropoff,
    date: row.transfer_date,
    time: row.transfer_time,
    passengers: row.passengers,
    vehicleType: row.vehicle_type ?? "",
    flightNumber: row.flight_number ?? "",
    luggage: row.luggage ?? "",
    childSeat: Boolean(row.child_seat),
    notes: row.notes ?? "",
  };
}

async function ensureDataFile() {
  const folder = path.dirname(TRANSFERS_FILE);
  await fs.mkdir(folder, { recursive: true });
  try {
    await fs.access(TRANSFERS_FILE);
  } catch {
    await fs.writeFile(TRANSFERS_FILE, "[]", "utf-8");
  }
}

async function readTransfersFromFile() {
  await ensureDataFile();
  const content = await fs.readFile(TRANSFERS_FILE, "utf-8");
  return JSON.parse(content);
}

async function writeTransfersToFile(transfers) {
  await fs.writeFile(TRANSFERS_FILE, JSON.stringify(transfers, null, 2), "utf-8");
}

async function initDatabase() {
  if (!DATABASE_URL) {
    return;
  }

  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      pickup TEXT NOT NULL,
      dropoff TEXT NOT NULL,
      transfer_date TEXT NOT NULL,
      transfer_time TEXT NOT NULL,
      passengers TEXT NOT NULL,
      vehicle_type TEXT,
      flight_number TEXT,
      luggage TEXT,
      child_seat BOOLEAN DEFAULT FALSE,
      notes TEXT
    )
  `);
}

export async function initStorage() {
  if (DATABASE_URL) {
    await initDatabase();
    return;
  }

  await ensureDataFile();
}

export function getStorageMode() {
  return pool ? "postgres" : "json-file";
}

export async function saveTransfer(transfer) {
  if (pool) {
    await pool.query(
      `INSERT INTO transfers (
        id, created_at, name, email, phone, pickup, dropoff, transfer_date, transfer_time,
        passengers, vehicle_type, flight_number, luggage, child_seat, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15
      )`,
      [
        transfer.id,
        transfer.createdAt,
        transfer.name,
        transfer.email,
        transfer.phone || null,
        transfer.pickup,
        transfer.dropoff,
        transfer.date,
        transfer.time,
        transfer.passengers,
        transfer.vehicleType || null,
        transfer.flightNumber || null,
        transfer.luggage || null,
        Boolean(transfer.childSeat),
        transfer.notes || null,
      ],
    );
    return;
  }

  const transfers = await readTransfersFromFile();
  transfers.unshift(transfer);
  await writeTransfersToFile(transfers);
}

export async function getTransfers() {
  if (pool) {
    const result = await pool.query(`
      SELECT
        id, created_at, name, email, phone, pickup, dropoff,
        transfer_date, transfer_time, passengers, vehicle_type,
        flight_number, luggage, child_seat, notes
      FROM transfers
      ORDER BY created_at DESC
    `);
    return result.rows.map(mapRowToTransfer);
  }

  return readTransfersFromFile();
}
