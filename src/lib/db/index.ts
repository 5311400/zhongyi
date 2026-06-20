import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'clinic.db');

// 确保 data 目录存在
import fs from 'fs';
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// 开启 WAL 模式（更好的并发性能）
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 自动建表
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT,
    birth_date TEXT,
    phone TEXT,
    constitution TEXT,
    allergies TEXT DEFAULT '[]',
    chronic_diseases TEXT DEFAULT '[]',
    next_visit_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    visit_date TEXT NOT NULL,
    visit_type TEXT DEFAULT '初诊',
    chief_complaint TEXT,
    tongue TEXT,
    pulse TEXT,
    face TEXT,
    spirit TEXT,
    syndrome_location TEXT,
    syndrome_nature TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    prescription_items TEXT DEFAULT '[]',
    treatment_items TEXT DEFAULT '[]',
    doctor_advice TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS consultation_codes (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    patient_name TEXT,
    phone TEXT,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS pending_consultations (
    id TEXT PRIMARY KEY,
    code_id TEXT REFERENCES consultation_codes(id),
    patient_name TEXT,
    phone TEXT,
    form_data TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS billing_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
`);

export default db;
