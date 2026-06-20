// 种子数据：把 tcm-data.ts 中的 mock 数据导入 SQLite
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 'clinic.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 建表（和 index.ts 一样）
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, gender TEXT, birth_date TEXT,
    phone TEXT, constitution TEXT, allergies TEXT DEFAULT '[]',
    chronic_diseases TEXT DEFAULT '[]', next_visit_date TEXT, notes TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id),
    visit_date TEXT NOT NULL, visit_type TEXT DEFAULT '初诊',
    chief_complaint TEXT, tongue TEXT, pulse TEXT, face TEXT, spirit TEXT,
    syndrome_location TEXT, syndrome_nature TEXT, diagnosis TEXT,
    treatment_plan TEXT, prescription_items TEXT DEFAULT '[]',
    treatment_items TEXT DEFAULT '[]', doctor_advice TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS consultation_codes (
    id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, patient_name TEXT, phone TEXT,
    expires_at TEXT NOT NULL, used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS pending_consultations (
    id TEXT PRIMARY KEY, code_id TEXT REFERENCES consultation_codes(id),
    patient_name TEXT, phone TEXT, form_data TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS billing_records (
    id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id),
    type TEXT NOT NULL, amount REAL NOT NULL, date TEXT NOT NULL, notes TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
`);

// 示例患者数据
const patients = [
  { name: '陈秀英', gender: '女', birth_date: '1968-03-15', phone: '138****1234', constitution: '气郁质', allergies: '["青霉素"]', chronic_diseases: '["高血压","糖尿病"]', next_visit_date: new Date().toISOString().slice(0, 10), notes: '肝郁脾虚，需长期调理' },
  { name: '刘建国', gender: '男', birth_date: '1981-07-22', phone: '139****5678', constitution: '平和质', allergies: '[]', chronic_diseases: '[]', next_visit_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), notes: '风寒感冒，近期复诊' },
  { name: '张小敏', gender: '女', birth_date: '1994-11-08', phone: '137****9012', constitution: '气虚质', allergies: '["磺胺类"]', chronic_diseases: '["月经不调"]', next_visit_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), notes: '月经不调，气血两虚' },
  { name: '李子轩', gender: '男', birth_date: '2018-05-12', phone: '136****3456', constitution: '特禀质', allergies: '["花生","牛奶"]', chronic_diseases: '[]', next_visit_date: null, notes: '脾胃虚弱，发育迟缓' },
  { name: '黄美华', gender: '女', birth_date: '1959-01-25', phone: '135****7890', constitution: '痰湿质', allergies: '[]', chronic_diseases: '["高血压","冠心病"]', next_visit_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), notes: '高血压伴痰湿体质' },
];

const insertPatient = db.prepare(`
  INSERT INTO patients (id, name, gender, birth_date, phone, constitution, allergies, chronic_diseases, next_visit_date, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertRecord = db.prepare(`
  INSERT INTO medical_records (id, patient_id, visit_date, visit_type, chief_complaint, tongue, pulse, diagnosis, treatment_plan, doctor_advice)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const patientIds: string[] = [];
const transaction = db.transaction(() => {
  for (const p of patients) {
    const id = randomUUID();
    patientIds.push(id);
    insertPatient.run(id, p.name, p.gender, p.birth_date, p.phone, p.constitution, p.allergies, p.chronic_diseases, p.next_visit_date, p.notes);
  }

  // 给每个患者加一条病历
  const records = [
    { pi: 0, date: '2026-06-19', type: '复诊', complaint: '胁肋胀痛，情志不畅', tongue: '舌淡红苔薄白', pulse: '脉弦细', diagnosis: '肝郁脾虚', plan: '疏肝健脾，逍遥散加减', advice: '保持心情舒畅，忌辛辣' },
    { pi: 1, date: '2026-06-18', type: '初诊', complaint: '恶寒发热，鼻塞流涕', tongue: '舌淡苔薄白', pulse: '脉浮紧', diagnosis: '风寒感冒', plan: '辛温解表，荆防败毒散加减', advice: '多饮热水，注意保暖' },
    { pi: 2, date: '2026-06-15', type: '复诊', complaint: '月经延期，量少色淡', tongue: '舌淡苔薄', pulse: '脉细弱', diagnosis: '气血两虚', plan: '补气养血，八珍汤加减', advice: '加强营养，适当运动' },
    { pi: 3, date: '2026-06-10', type: '初诊', complaint: '食欲不振，面色萎黄', tongue: '舌淡苔白腻', pulse: '脉缓弱', diagnosis: '脾胃虚弱', plan: '健脾益胃，参苓白术散加减', advice: '饮食清淡，少食多餐' },
    { pi: 4, date: '2026-06-12', type: '复诊', complaint: '头晕头重，胸闷痰多', tongue: '舌胖大苔白腻', pulse: '脉滑', diagnosis: '痰湿中阻', plan: '化痰祛湿，半夏白术天麻汤加减', advice: '低盐低脂饮食，适当运动' },
  ];

  for (const r of records) {
    insertRecord.run(randomUUID(), patientIds[r.pi], r.date, r.type, r.complaint, r.tongue, r.pulse, r.diagnosis, r.plan, r.advice);
  }
});

transaction();

console.log(`✅ 种子数据导入完成：${patients.length} 位患者，${patients.length} 条病历`);
console.log(`📁 数据库位置：${DB_PATH}`);
