import db from './index';
import { randomUUID } from 'crypto';

// ==================== 患者 ====================

export interface Patient {
  id: string;
  name: string;
  gender: string | null;
  birth_date: string | null;
  phone: string | null;
  constitution: string | null;
  allergies: string;
  chronic_diseases: string;
  next_visit_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function getAllPatients(): Patient[] {
  return db.prepare('SELECT * FROM patients ORDER BY updated_at DESC').all() as Patient[];
}

export function getPatientById(id: string): Patient | undefined {
  return db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as Patient | undefined;
}

export function searchPatients(keyword: string): Patient[] {
  return db.prepare(
    "SELECT * FROM patients WHERE name LIKE ? OR phone LIKE ? OR constitution LIKE ? ORDER BY updated_at DESC"
  ).all(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`) as Patient[];
}

export function createPatient(data: Partial<Patient>): Patient {
  const id = randomUUID();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  db.prepare(`
    INSERT INTO patients (id, name, gender, birth_date, phone, constitution, allergies, chronic_diseases, next_visit_date, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.name, data.gender || null, data.birth_date || null,
    data.phone || null, data.constitution || null,
    data.allergies || '[]', data.chronic_diseases || '[]',
    data.next_visit_date || null, data.notes || null, now, now
  );
  return getPatientById(id)!;
}

export function updatePatient(id: string, data: Partial<Patient>): void {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const fields: string[] = [];
  const values: any[] = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (key !== 'id' && key !== 'created_at' && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  db.prepare(`UPDATE patients SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

export function deletePatient(id: string): void {
  db.prepare('DELETE FROM patients WHERE id = ?').run(id);
}

// ==================== 病历 ====================

export interface MedicalRecord {
  id: string;
  patient_id: string;
  visit_date: string;
  visit_type: string;
  chief_complaint: string | null;
  tongue: string | null;
  pulse: string | null;
  face: string | null;
  spirit: string | null;
  syndrome_location: string | null;
  syndrome_nature: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  prescription_items: string;
  treatment_items: string;
  doctor_advice: string | null;
  created_at: string;
  updated_at: string;
}

export function getRecordsByPatient(patientId: string): MedicalRecord[] {
  return db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC')
    .all(patientId) as MedicalRecord[];
}

export function getRecordById(id: string): MedicalRecord | undefined {
  return db.prepare('SELECT * FROM medical_records WHERE id = ?').get(id) as MedicalRecord | undefined;
}

export function createRecord(data: Partial<MedicalRecord>): MedicalRecord {
  const id = randomUUID();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  db.prepare(`
    INSERT INTO medical_records (id, patient_id, visit_date, visit_type, chief_complaint, tongue, pulse, face, spirit, syndrome_location, syndrome_nature, diagnosis, treatment_plan, prescription_items, treatment_items, doctor_advice, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.patient_id, data.visit_date, data.visit_type || '初诊',
    data.chief_complaint || null, data.tongue || null, data.pulse || null,
    data.face || null, data.spirit || null, data.syndrome_location || null,
    data.syndrome_nature || null, data.diagnosis || null, data.treatment_plan || null,
    data.prescription_items || '[]', data.treatment_items || '[]',
    data.doctor_advice || null, now, now
  );
  return getRecordById(id)!;
}

export function updateRecord(id: string, data: Partial<MedicalRecord>): void {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const fields: string[] = [];
  const values: any[] = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (key !== 'id' && key !== 'created_at' && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  db.prepare(`UPDATE medical_records SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

// ==================== 问诊验证码 ====================

export function generateConsultationCode(patientName?: string, phone?: string): { id: string; code: string } {
  const id = randomUUID();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ZH-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO consultation_codes (id, code, patient_name, phone, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, code, patientName || null, phone || null, expiresAt);
  
  return { id, code };
}

export function validateConsultationCode(code: string): { valid: boolean; codeId?: string; error?: string } {
  const row = db.prepare('SELECT * FROM consultation_codes WHERE code = ?').get(code) as any;
  if (!row) return { valid: false, error: '验证码不存在' };
  if (row.used) return { valid: false, error: '验证码已使用' };
  if (new Date(row.expires_at) < new Date()) return { valid: false, error: '验证码已过期' };
  return { valid: true, codeId: row.id };
}

export function markCodeUsed(codeId: string): void {
  db.prepare('UPDATE consultation_codes SET used = 1 WHERE id = ?').run(codeId);
}

export function getAllCodes() {
  return db.prepare('SELECT * FROM consultation_codes ORDER BY created_at DESC').all();
}

// ==================== 待导入问诊 ====================

export function createPendingConsultation(codeId: string, patientName: string, phone: string, formData: string) {
  const id = randomUUID();
  db.prepare(`
    INSERT INTO pending_consultations (id, code_id, patient_name, phone, form_data)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, codeId, patientName, phone, formData);
  return id;
}

export function getPendingConsultations() {
  return db.prepare("SELECT * FROM pending_consultations WHERE status = 'pending' ORDER BY created_at DESC").all();
}

export function importConsultation(id: string): string {
  const pending = db.prepare('SELECT * FROM pending_consultations WHERE id = ?').get(id) as any;
  if (!pending) throw new Error('问诊记录不存在');
  
  const formData = JSON.parse(pending.form_data);
  const patient = createPatient({
    name: pending.patient_name,
    phone: pending.phone,
    notes: `远程问诊导入\n${JSON.stringify(formData, null, 2)}`,
  });
  
  db.prepare("UPDATE pending_consultations SET status = 'imported' WHERE id = ?").run(id);
  return patient.id;
}

export function rejectConsultation(id: string): void {
  db.prepare("UPDATE pending_consultations SET status = 'rejected' WHERE id = ?").run(id);
}

// ==================== 收费记录 ====================

export interface BillingRecord {
  id: string;
  patient_id: string;
  type: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
}

export function getBillingByPatient(patientId: string): BillingRecord[] {
  return db.prepare('SELECT * FROM billing_records WHERE patient_id = ? ORDER BY date DESC')
    .all(patientId) as BillingRecord[];
}

export function getAllBilling(): BillingRecord[] {
  return db.prepare('SELECT b.*, p.name as patient_name FROM billing_records b LEFT JOIN patients p ON b.patient_id = p.id ORDER BY b.date DESC').all() as any[];
}

export function createBilling(data: Partial<BillingRecord>): BillingRecord {
  const id = randomUUID();
  db.prepare(`
    INSERT INTO billing_records (id, patient_id, type, amount, date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.patient_id, data.type, data.amount, data.date, data.notes || null);
  return db.prepare('SELECT * FROM billing_records WHERE id = ?').get(id) as BillingRecord;
}

export function getMonthlyBillingStats() {
  const month = new Date().toISOString().slice(0, 7);
  return db.prepare(`
    SELECT type, COUNT(*) as count, SUM(amount) as total
    FROM billing_records
    WHERE date LIKE ?
    GROUP BY type
  `).all(`${month}%`);
}

export function deleteBilling(id: string): void {
  db.prepare('DELETE FROM billing_records WHERE id = ?').run(id);
}

// ==================== 统计 ====================

export function getStats() {
  const totalPatients = (db.prepare('SELECT COUNT(*) as c FROM patients').get() as any).c;
  const month = new Date().toISOString().slice(0, 7);
  const monthlyRecords = (db.prepare('SELECT COUNT(*) as c FROM medical_records WHERE visit_date LIKE ?').get(`${month}%`) as any).c;
  
  const today = new Date().toISOString().slice(0, 10);
  const pendingVisits = (db.prepare("SELECT COUNT(*) as c FROM patients WHERE next_visit_date IS NOT NULL AND next_visit_date <= ?").get(today) as any).c;
  
  const pendingConsultations = (db.prepare("SELECT COUNT(*) as c FROM pending_consultations WHERE status = 'pending'").get() as any).c;
  
  const monthlyBilling = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM billing_records WHERE date LIKE ?
  `).get(`${month}%`) as any;
  
  return {
    totalPatients,
    monthlyRecords,
    pendingVisits,
    pendingConsultations,
    monthlyBilling: monthlyBilling?.total || 0,
  };
}

export function getRecentPatients(limit = 5) {
  return db.prepare(`
    SELECT p.*, 
      (SELECT COUNT(*) FROM medical_records WHERE patient_id = p.id) as visit_count,
      (SELECT visit_date FROM medical_records WHERE patient_id = p.id ORDER BY visit_date DESC LIMIT 1) as last_visit
    FROM patients p
    ORDER BY p.updated_at DESC
    LIMIT ?
  `).all(limit);
}

export function getTodayReminders() {
  const today = new Date().toISOString().slice(0, 10);
  return db.prepare(`
    SELECT id, name, next_visit_date, constitution,
      CASE 
        WHEN next_visit_date < ? THEN 'overdue'
        WHEN next_visit_date = ? THEN 'today'
        ELSE 'upcoming'
      END as priority
    FROM patients
    WHERE next_visit_date IS NOT NULL AND next_visit_date <= date(?, '+7 days')
    ORDER BY next_visit_date ASC
  `).all(today, today, today);
}
