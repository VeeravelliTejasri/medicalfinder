import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(dbDir, 'medifind.db');
export const db = new DatabaseSync(dbPath);

// Enable Foreign Keys and WAL mode for reliability and performance
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

export function initDatabase() {
  console.log(`📦 Initializing MediFind database at: ${dbPath}`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pharmacies (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      license_number TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 1,
      is_24_7 INTEGER NOT NULL DEFAULT 0,
      open_time TEXT DEFAULT '08:00 AM',
      close_time TEXT DEFAULT '10:00 PM',
      rating REAL DEFAULT 4.5,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      category TEXT NOT NULL,
      strength TEXT NOT NULL,
      dosage_form TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      description TEXT,
      requires_prescription INTEGER NOT NULL DEFAULT 0,
      is_emergency INTEGER NOT NULL DEFAULT 0,
      average_price REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
      medicine_id TEXT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL,
      availability_status TEXT NOT NULL,
      low_stock_threshold INTEGER DEFAULT 10,
      last_updated TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(pharmacy_id, medicine_id)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      reservation_code TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      pharmacy_id TEXT NOT NULL REFERENCES pharmacies(id),
      medicine_id TEXT NOT NULL REFERENCES medicines(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      total_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      pickup_deadline TEXT,
      notes TEXT,
      rejection_reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      file_name TEXT NOT NULL,
      file_path TEXT,
      file_type TEXT NOT NULL,
      extracted_text TEXT,
      status TEXT NOT NULL DEFAULT 'PROCESSED',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prescription_medicines (
      id TEXT PRIMARY KEY,
      prescription_id TEXT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
      detected_name TEXT NOT NULL,
      matched_medicine_id TEXT REFERENCES medicines(id),
      dosage TEXT,
      confidence REAL DEFAULT 0.9,
      is_confirmed INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'SYSTEM',
      is_read INTEGER NOT NULL DEFAULT 0,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stock_alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      medicine_id TEXT NOT NULL REFERENCES medicines(id),
      pharmacy_id TEXT REFERENCES pharmacies(id),
      is_triggered INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, medicine_id, pharmacy_id)
    );

    CREATE TABLE IF NOT EXISTS search_history (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      search_term TEXT NOT NULL,
      category TEXT,
      latitude REAL,
      longitude REAL,
      results_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Create indexes for ultra-fast queries
    CREATE INDEX IF NOT EXISTS idx_inv_pharm_med ON inventory(pharmacy_id, medicine_id);
    CREATE INDEX IF NOT EXISTS idx_inv_status ON inventory(availability_status);
    CREATE INDEX IF NOT EXISTS idx_med_name ON medicines(name);
    CREATE INDEX IF NOT EXISTS idx_med_generic ON medicines(generic_name);
    CREATE INDEX IF NOT EXISTS idx_med_category ON medicines(category);
    CREATE INDEX IF NOT EXISTS idx_pharm_coords ON pharmacies(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_res_user ON reservations(user_id);
    CREATE INDEX IF NOT EXISTS idx_res_pharm ON reservations(pharmacy_id);
    CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);
  `);

  console.log('✅ Database tables and indexes verified/created.');
}
