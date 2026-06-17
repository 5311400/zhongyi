⚠️ 需要确认的细节
检查项	建议
user_roles 是否有 clinic_id 字段？	策略按 user_id 而非 clinic_id 隔离。若表包含 clinic_id，应补充过滤
审计触发器性能	row_to_json(OLD) 会记录完整行数据，大表可能影响性能，建议仅记录关键字段
索引 idx_medical_records_clinic_id	确认 medical_records 表包含 clinic_id 字段
💡 可选优化建议
1. 审计日志性能优化（如需要）
sql
-- 仅记录关键字段，减少存储和性能开销
CREATE OR REPLACE FUNCTION audit_patient_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, user_id, changed_at, details)
  VALUES (
    'patients',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    auth.uid(),
    NOW(),
    jsonb_build_object(
      'name', COALESCE(NEW.name, OLD.name),
      'phone', COALESCE(NEW.phone, OLD.phone)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
2. 用户角色表策略（如需按诊所隔离）
sql
-- 如果 user_roles 包含 clinic_id
CREATE POLICY "User roles select for self"
  ON user_roles
  FOR SELECT USING (
    user_id = auth.uid()
    AND clinic_id = current_setting('app.current_clinic_id')::uuid
  );
3. 添加 idx_audit_logs_created_at 索引
sql
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
📋 验证建议
sql
-- 1. 验证 RLS 是否启用
SELECT relname, rowsecurity FROM pg_class
WHERE relname IN ('clinics', 'clinic_members', 'patients', 'medical_records', 'user_roles');

-- 2. 测试上下文未设置时返回空
SELECT * FROM patients;  -- 应返回 0 行

-- 3. 测试上下文设置后正常查询
SELECT set_clinic_context('your-clinic-uuid');
SELECT * FROM patients;  -- 应返回正确数据

-- 4. 验证审计触发器
INSERT INTO patients (name, clinic_id) VALUES ('测试', 'your-clinic-uuid');
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5;
