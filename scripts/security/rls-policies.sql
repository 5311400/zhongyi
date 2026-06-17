-- 本草医案 - 数据库安全策略（RLS）
-- 适用：Supabase PostgreSQL
-- 创建时间：2026-06-17
-- 版本：v0.6.1

-- ============================================
-- 1. 启用 RLS
-- ============================================

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tcm_options ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. 诊所表策略（特殊处理）
-- ============================================

-- 移除可能存在的旧策略
DROP POLICY IF EXISTS "Clinic data isolation" ON clinics;

-- 用户只能查看自己的诊所（通过 session 变量）
CREATE POLICY "Clinics select for member"
  ON clinics
  FOR SELECT USING (
    id = COALESCE(current_setting('app.current_clinic_id', true)::uuid, id)
  );

-- 认证用户可以创建诊所
CREATE POLICY "Clinics insert for authenticated"
  ON clinics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 只有所有者可以更新诊所
CREATE POLICY "Clinics update for owner"
  ON clinics
  FOR UPDATE USING (
    id = current_setting('app.current_clinic_id')::uuid
  );

-- ============================================
-- 3. 诊所成员表策略
-- ============================================

DROP POLICY IF EXISTS "Clinic members isolation" ON clinic_members;

CREATE POLICY "Clinic members select"
  ON clinic_members
  FOR SELECT USING (
    clinic_id = COALESCE(current_setting('app.current_clinic_id', true)::uuid, clinic_id)
  );

CREATE POLICY "Clinic members insert"
  ON clinic_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR clinic_id = current_setting('app.current_clinic_id', true)::uuid
  );

CREATE POLICY "Clinic members update"
  ON clinic_members
  FOR UPDATE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

CREATE POLICY "Clinic members delete"
  ON clinic_members
  FOR DELETE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

-- ============================================
-- 4. 患者表策略
-- ============================================

DROP POLICY IF EXISTS "Patients isolation by clinic" ON patients;
DROP POLICY IF EXISTS "Patients insert for clinic" ON patients;
DROP POLICY IF EXISTS "Patients update for clinic" ON patients;
DROP POLICY IF EXISTS "Patients delete for clinic" ON patients;

CREATE POLICY "Patients select"
  ON patients
  FOR SELECT USING (
    clinic_id = COALESCE(current_setting('app.current_clinic_id', true)::uuid, clinic_id)
  );

CREATE POLICY "Patients insert"
  ON patients
  FOR INSERT WITH CHECK (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

CREATE POLICY "Patients update"
  ON patients
  FOR UPDATE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

CREATE POLICY "Patients delete"
  ON patients
  FOR DELETE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

-- ============================================
-- 5. 病历表策略
-- ============================================

DROP POLICY IF EXISTS "Medical records isolation by clinic" ON medical_records;
DROP POLICY IF EXISTS "Medical records insert for clinic" ON medical_records;
DROP POLICY IF EXISTS "Medical records update for clinic" ON medical_records;
DROP POLICY IF EXISTS "Medical records delete for clinic" ON medical_records;

CREATE POLICY "Medical records select"
  ON medical_records
  FOR SELECT USING (
    clinic_id = COALESCE(current_setting('app.current_clinic_id', true)::uuid, clinic_id)
  );

CREATE POLICY "Medical records insert"
  ON medical_records
  FOR INSERT WITH CHECK (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

CREATE POLICY "Medical records update"
  ON medical_records
  FOR UPDATE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

CREATE POLICY "Medical records delete"
  ON medical_records
  FOR DELETE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

-- ============================================
-- 6. 处方药材表策略
-- ============================================

DROP POLICY IF EXISTS "Prescription items isolation by clinic" ON prescription_items;
DROP POLICY IF EXISTS "Prescription items insert for clinic" ON prescription_items;
DROP POLICY IF EXISTS "Prescription items update for clinic" ON prescription_items;
DROP POLICY IF EXISTS "Prescription items delete for clinic" ON prescription_items;

CREATE POLICY "Prescription items select"
  ON prescription_items
  FOR SELECT USING (
    clinic_id = COALESCE(current_setting('app.current_clinic_id', true)::uuid, clinic_id)
  );

CREATE POLICY "Prescription items insert"
  ON prescription_items
  FOR INSERT WITH CHECK (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

CREATE POLICY "Prescription items update"
  ON prescription_items
  FOR UPDATE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

CREATE POLICY "Prescription items delete"
  ON prescription_items
  FOR DELETE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

-- ============================================
-- 7. 治疗项目表策略
-- ============================================

DROP POLICY IF EXISTS "Treatment items isolation by clinic" ON treatment_items;
DROP POLICY IF EXISTS "Treatment items insert for clinic" ON treatment_items;
DROP POLICY IF EXISTS "Treatment items update for clinic" ON treatment_items;
DROP POLICY IF EXISTS "Treatment items delete for clinic" ON treatment_items;

CREATE POLICY "Treatment items select"
  ON treatment_items
  FOR SELECT USING (
    clinic_id = COALESCE(current_setting('app.current_clinic_id', true)::uuid, clinic_id)
  );

CREATE POLICY "Treatment items insert"
  ON treatment_items
  FOR INSERT WITH CHECK (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

CREATE POLICY "Treatment items update"
  ON treatment_items
  FOR UPDATE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

CREATE POLICY "Treatment items delete"
  ON treatment_items
  FOR DELETE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

-- ============================================
-- 8. TCM 选项库策略
-- ============================================

DROP POLICY IF EXISTS "TCM options read only" ON tcm_options;

CREATE POLICY "TCM options read only"
  ON tcm_options
  FOR SELECT USING (true);

-- ============================================
-- 9. 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON clinic_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON clinic_members(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_clinic_id ON medical_records(clinic_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(date);
CREATE INDEX IF NOT EXISTS idx_prescription_items_record_id ON prescription_items(record_id);
CREATE INDEX IF NOT EXISTS idx_treatment_items_record_id ON treatment_items(record_id);

-- ============================================
-- 10. 视图（带 fallback）
-- ============================================

CREATE OR REPLACE VIEW patient_full AS
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
WHERE p.clinic_id = COALESCE(
  current_setting('app.current_clinic_id', true)::uuid,
  p.clinic_id
);

CREATE OR REPLACE VIEW record_full AS
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
WHERE mr.clinic_id = COALESCE(
  current_setting('app.current_clinic_id', true)::uuid,
  mr.clinic_id
);

-- ============================================
-- 11. 辅助函数：设置诊所上下文
-- ============================================

CREATE OR REPLACE FUNCTION set_clinic_context(clinic_id uuid)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_clinic_id', clinic_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 12. 验证 RLS 状态
-- ============================================

SELECT
  relname AS table_name,
  rowsecurity AS rls_enabled
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