-- 本草医案 - 数据库安全策略（RLS）
-- 适用：Supabase PostgreSQL
-- 创建时间：2026-06-17
-- 版本：v0.6.0

-- ============================================
-- 1. 启用 RLS（行级安全）
-- ============================================

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tcm_options ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. 创建安全策略
-- ============================================

-- 诊所表：只能访问自己诊所的数据
CREATE POLICY "Clinic data isolation"
  ON clinics
  FOR ALL USING (id = current_setting('app.current_clinic_id')::uuid);

-- 诊所成员表：只能访问自己诊所的成员
CREATE POLICY "Clinic members isolation"
  ON clinic_members
  FOR ALL USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

-- 患者表：只能访问自己诊所的患者
CREATE POLICY "Patients isolation by clinic"
  ON patients
  FOR SELECT USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Patients insert for clinic"
  ON patients
  FOR INSERT WITH CHECK (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Patients update for clinic"
  ON patients
  FOR UPDATE USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Patients delete for clinic"
  ON patients
  FOR DELETE USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

-- 病历表：只能访问自己诊所的病历
CREATE POLICY "Medical records isolation by clinic"
  ON medical_records
  FOR SELECT USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Medical records insert for clinic"
  ON medical_records
  FOR INSERT WITH CHECK (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Medical records update for clinic"
  ON medical_records
  FOR UPDATE USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Medical records delete for clinic"
  ON medical_records
  FOR DELETE USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

-- 处方药材表：只能访问自己诊所的处方
CREATE POLICY "Prescription items isolation by clinic"
  ON prescription_items
  FOR SELECT USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Prescription items insert for clinic"
  ON prescription_items
  FOR INSERT WITH CHECK (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Prescription items update for clinic"
  ON prescription_items
  FOR UPDATE USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Prescription items delete for clinic"
  ON prescription_items
  FOR DELETE USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

-- 治疗项目表：只能访问自己诊所的治疗记录
CREATE POLICY "Treatment items isolation by clinic"
  ON treatment_items
  FOR SELECT USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Treatment items insert for clinic"
  ON treatment_items
  FOR INSERT WITH CHECK (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Treatment items update for clinic"
  ON treatment_items
  FOR UPDATE USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY "Treatment items delete for clinic"
  ON treatment_items
  FOR DELETE USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

-- TCM 选项库：公开只读访问
CREATE POLICY "TCM options read only"
  ON tcm_options
  FOR SELECT USING (true);

-- ============================================
-- 3. 强制 SSL 连接
-- ============================================

ALTER DATABASE "postgres" SET ssl = 'on';

-- ============================================
-- 4. 启用审计日志
-- ============================================

ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = '0';
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';

-- 应用配置
SELECT pg_reload_conf();

-- ============================================
-- 5. 创建视图（便于查询）
-- ============================================

-- 患者完整视图（包含过敏和慢病信息）
CREATE VIEW patient_full AS
SELECT
  p.id,
  p.name,
  p.gender,
  p.age,
  p.phone,
  p.occupation,
  p.constitution,
  p.allergies,
  p.chronic_diseases,
  p.visit_count,
  p.first_visit,
  p.note,
  p.created_at,
  p.updated_at
FROM patients p
WHERE p.clinic_id = current_setting('app.current_clinic_id')::uuid;

-- 病历完整视图（包含处方和治疗）
CREATE VIEW record_full AS
SELECT
  mr.id,
  mr.patient_id,
  mr.record_type,
  mr.date,
  mr.chief_complaint,
  mr.present_illness,
  mr.tongue,
  mr.pulse,
  mr.diagnosis,
  mr.summary,
  mr.ai_suggested,
  mr.created_at,
  (SELECT json_agg(row_to_json(pi)) FROM prescription_items pi WHERE pi.record_id = mr.id) AS prescriptions,
  (SELECT json_agg(row_to_json(ti)) FROM treatment_items ti WHERE ti.record_id = mr.id) AS treatments
FROM medical_records mr
WHERE mr.clinic_id = current_setting('app.current_clinic_id')::uuid;

-- ============================================
-- 6. 创建索引（优化查询性能）
-- ============================================

CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_clinic_id ON medical_records(clinic_id);
CREATE INDEX idx_medical_records_date ON medical_records(date);
CREATE INDEX idx_prescription_items_record_id ON prescription_items(record_id);
CREATE INDEX idx_treatment_items_record_id ON treatment_items(record_id);

-- ============================================
-- 验证策略是否生效
-- ============================================

-- 查看所有表的 RLS 状态
SELECT 
  relname AS table_name, 
  rowsecurity AS rls_enabled,
  relrowsecurity AS rls_enforced
FROM pg_class 
WHERE relname IN ('clinics', 'clinic_members', 'patients', 'medical_records', 'prescription_items', 'treatment_items', 'tcm_options');

-- 查看所有安全策略
SELECT 
  polname AS policy_name,
  relname AS table_name,
  polcmd AS command_type,
  polpermissive AS is_permissive
FROM pg_policy
JOIN pg_class ON pg_policy.polrelid = pg_class.oid;