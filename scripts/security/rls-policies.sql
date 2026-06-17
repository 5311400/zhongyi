-- 本草医案 - 数据库安全策略（RLS）
-- 适用：Supabase PostgreSQL
-- 创建时间：2026-06-17
-- 版本：v0.6.8

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
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. 诊所表策略（特殊处理）
-- ============================================

-- 移除可能存在的旧策略
DROP POLICY IF EXISTS "Clinic data isolation" ON clinics;
DROP POLICY IF EXISTS "Clinics select for member" ON clinics;
DROP POLICY IF EXISTS "Clinics insert for authenticated" ON clinics;
DROP POLICY IF EXISTS "Clinics update for owner" ON clinics;
DROP POLICY IF EXISTS "Clinics delete for owner" ON clinics;

-- 用户只能查看自己的诊所（强制要求设置上下文，无 fallback）
CREATE POLICY "Clinics select for member"
  ON clinics
  FOR SELECT USING (
    id = current_setting('app.current_clinic_id')::uuid
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

-- 允许诊所所有者删除诊所
CREATE POLICY "Clinics delete for owner"
  ON clinics
  FOR DELETE USING (
    id = current_setting('app.current_clinic_id')::uuid
    AND EXISTS (
      SELECT 1 FROM clinic_members
      WHERE clinic_id = id AND user_id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- 3. 诊所成员表策略
-- ============================================

DROP POLICY IF EXISTS "Clinic members isolation" ON clinic_members;
DROP POLICY IF EXISTS "Clinic members select" ON clinic_members;
DROP POLICY IF EXISTS "Clinic members insert" ON clinic_members;
DROP POLICY IF EXISTS "Clinic members update" ON clinic_members;
DROP POLICY IF EXISTS "Clinic members delete" ON clinic_members;

-- 用户只能查看自己诊所的成员
CREATE POLICY "Clinic members select"
  ON clinic_members
  FOR SELECT USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

-- 用户只能将自己添加到当前诊所（AND 限制）
CREATE POLICY "Clinic members insert"
  ON clinic_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND clinic_id = current_setting('app.current_clinic_id')::uuid
  );

-- 用户只能更新自己诊所的成员
CREATE POLICY "Clinic members update"
  ON clinic_members
  FOR UPDATE USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );

-- 用户只能删除自己诊所的成员
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
DROP POLICY IF EXISTS "Patients select" ON patients;
DROP POLICY IF EXISTS "Patients insert" ON patients;
DROP POLICY IF EXISTS "Patients update" ON patients;
DROP POLICY IF EXISTS "Patients delete" ON patients;

CREATE POLICY "Patients select"
  ON patients
  FOR SELECT USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
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
DROP POLICY IF EXISTS "Medical records select" ON medical_records;
DROP POLICY IF EXISTS "Medical records insert" ON medical_records;
DROP POLICY IF EXISTS "Medical records update" ON medical_records;
DROP POLICY IF EXISTS "Medical records delete" ON medical_records;

CREATE POLICY "Medical records select"
  ON medical_records
  FOR SELECT USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
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
DROP POLICY IF EXISTS "Prescription items select" ON prescription_items;
DROP POLICY IF EXISTS "Prescription items insert" ON prescription_items;
DROP POLICY IF EXISTS "Prescription items update" ON prescription_items;
DROP POLICY IF EXISTS "Prescription items delete" ON prescription_items;

CREATE POLICY "Prescription items select"
  ON prescription_items
  FOR SELECT USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
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
DROP POLICY IF EXISTS "Treatment items select" ON treatment_items;
DROP POLICY IF EXISTS "Treatment items insert" ON treatment_items;
DROP POLICY IF EXISTS "Treatment items update" ON treatment_items;
DROP POLICY IF EXISTS "Treatment items delete" ON treatment_items;

CREATE POLICY "Treatment items select"
  ON treatment_items
  FOR SELECT USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
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
-- 9. 用户角色表策略
-- ============================================

DROP POLICY IF EXISTS "User roles select for self" ON user_roles;
DROP POLICY IF EXISTS "User roles admin manage" ON user_roles;

-- 用户只能查看自己的角色
CREATE POLICY "User roles select for self"
  ON user_roles
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- 管理员可以管理所有角色
CREATE POLICY "User roles admin manage"
  ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 10. 审计日志表策略
-- ============================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit logs select for self" ON audit_logs;
DROP POLICY IF EXISTS "Audit logs admin select" ON audit_logs;
DROP POLICY IF EXISTS "Audit logs insert for authenticated" ON audit_logs;

-- 允许经过认证的用户插入审计日志（触发器自动设置 user_id）
CREATE POLICY "Audit logs insert for authenticated"
  ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 用户只能查看自己操作的审计日志
CREATE POLICY "Audit logs select for self"
  ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- 管理员可以查看所有审计日志
CREATE POLICY "Audit logs admin select"
  ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 11. 索引
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
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- 12. 视图
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
WHERE p.clinic_id = current_setting('app.current_clinic_id')::uuid;

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
WHERE mr.clinic_id = current_setting('app.current_clinic_id')::uuid;

-- ============================================
-- 12. 辅助函数：设置诊所上下文（ SECURITY INVOKER）
-- ============================================

CREATE OR REPLACE FUNCTION set_clinic_context(clinic_id uuid)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_clinic_id', clinic_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- 辅助函数：获取当前诊所上下文（用于调试）
CREATE OR REPLACE FUNCTION get_clinic_context()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_clinic_id', true)::uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 13. 审计日志触发器（可选）
-- ============================================

-- 创建审计日志表（如果不存在）
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  record_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic_id ON audit_logs(clinic_id);

-- 患者表审计触发器
CREATE OR REPLACE FUNCTION audit_patient_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, user_id, clinic_id, changed_at, details)
  VALUES (
    'patients',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    auth.uid(),
    COALESCE(NEW.clinic_id, OLD.clinic_id),
    NOW(),
    jsonb_build_object(
      'name', COALESCE(NEW.name, OLD.name),
      'phone', COALESCE(NEW.phone, OLD.phone)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 病历表审计触发器
CREATE OR REPLACE FUNCTION audit_record_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, user_id, clinic_id, changed_at, details)
  VALUES (
    'medical_records',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    auth.uid(),
    COALESCE(NEW.clinic_id, OLD.clinic_id),
    NOW(),
    jsonb_build_object(
      'patient_id', COALESCE(NEW.patient_id, OLD.patient_id),
      'record_type', COALESCE(NEW.record_type, OLD.record_type)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 处方药材表审计触发器
CREATE OR REPLACE FUNCTION audit_prescription_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, user_id, clinic_id, changed_at, details)
  VALUES (
    'prescription_items',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    auth.uid(),
    COALESCE(NEW.clinic_id, OLD.clinic_id),
    NOW(),
    jsonb_build_object(
      'record_id', COALESCE(NEW.record_id, OLD.record_id),
      'medicine_name', COALESCE(NEW.medicine_name, OLD.medicine_name)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 治疗项目表审计触发器
CREATE OR REPLACE FUNCTION audit_treatment_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, user_id, clinic_id, changed_at, details)
  VALUES (
    'treatment_items',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    auth.uid(),
    COALESCE(NEW.clinic_id, OLD.clinic_id),
    NOW(),
    jsonb_build_object(
      'record_id', COALESCE(NEW.record_id, OLD.record_id),
      'treatment_type', COALESCE(NEW.treatment_type, OLD.treatment_type)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 诊所成员表审计触发器
CREATE OR REPLACE FUNCTION audit_clinic_member_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, user_id, clinic_id, changed_at, details)
  VALUES (
    'clinic_members',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    auth.uid(),
    COALESCE(NEW.clinic_id, OLD.clinic_id),
    NOW(),
    jsonb_build_object(
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'role', COALESCE(NEW.role, OLD.role)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 用户角色表审计触发器
CREATE OR REPLACE FUNCTION audit_user_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, user_id, clinic_id, changed_at, details)
  VALUES (
    'user_roles',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END,
    auth.uid(),
    NULL,
    NOW(),
    jsonb_build_object(
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'role', COALESCE(NEW.role, OLD.role)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS audit_patients ON patients;
DROP TRIGGER IF EXISTS audit_medical_records ON medical_records;
DROP TRIGGER IF EXISTS audit_prescription_items ON prescription_items;
DROP TRIGGER IF EXISTS audit_treatment_items ON treatment_items;
DROP TRIGGER IF EXISTS audit_clinic_members ON clinic_members;
DROP TRIGGER IF EXISTS audit_user_roles ON user_roles;

CREATE TRIGGER audit_patients
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION audit_patient_changes();

CREATE TRIGGER audit_medical_records
AFTER INSERT OR UPDATE OR DELETE ON medical_records
FOR EACH ROW EXECUTE FUNCTION audit_record_changes();

CREATE TRIGGER audit_prescription_items
AFTER INSERT OR UPDATE OR DELETE ON prescription_items
FOR EACH ROW EXECUTE FUNCTION audit_prescription_changes();

CREATE TRIGGER audit_treatment_items
AFTER INSERT OR UPDATE OR DELETE ON treatment_items
FOR EACH ROW EXECUTE FUNCTION audit_treatment_changes();

CREATE TRIGGER audit_clinic_members
AFTER INSERT OR UPDATE OR DELETE ON clinic_members
FOR EACH ROW EXECUTE FUNCTION audit_clinic_member_changes();

CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION audit_user_role_changes();

-- ============================================
-- 14. 验证 RLS 状态
-- ============================================

SELECT
  relname AS table_name,
  rowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN ('clinics', 'clinic_members', 'patients', 'medical_records', 'prescription_items', 'treatment_items', 'tcm_options', 'user_roles');

-- 查看所有安全策略
SELECT
  polname AS policy_name,
  relname AS table_name,
  polcmd AS command_type,
  polpermissive AS is_permissive
FROM pg_policy
JOIN pg_class ON pg_policy.polrelid = pg_class.oid;
