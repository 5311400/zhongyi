⚠️ 需要确认的细节
检查项	说明	建议
user_roles 是否有 clinic_id 字段？	策略未按诊所隔离，若表包含 clinic_id 需补充	确认表结构，必要时添加 clinic_id 过滤
admin 角色使用 FOR ALL	管理员拥有所有权限（含删除），符合预期	确认管理员权限范围
视图依赖 current_setting	未设置上下文时视图查询会报错	需在应用层确保每次请求都调用 set_clinic_context
prescription_items/treatment_items 需包含 clinic_id	策略依赖此字段	确认表结构包含
💡 可选优化建议
1. 为 user_roles 添加 clinic_id 隔离（如果表包含该字段）
sql
-- 如果 user_roles 包含 clinic_id
CREATE POLICY "User roles select for self"
  ON user_roles
  FOR SELECT USING (
    user_id = auth.uid()
    AND clinic_id = current_setting('app.current_clinic_id')::uuid
  );
2. 添加上下文检查辅助函数
sql
-- 用于调试：检查当前上下文是否已设置
CREATE OR REPLACE FUNCTION get_clinic_context()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_clinic_id', true)::uuid;
END;
$$ LANGUAGE plpgsql;
3. 添加审计日志触发函数（可选）
sql
-- 在患者表上添加审计触发器
CREATE OR REPLACE FUNCTION audit_patient_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, user_id, changed_at)
  VALUES ('patients', TG_OP, NEW.id, auth.uid(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_patients
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION audit_patient_changes();
✅ 验证建议
执行 RLS 策略后，建议通过以下 SQL 进行验证：

sql
-- 1. 检查 RLS 是否启用
SELECT relname, rowsecurity FROM pg_class
WHERE relname IN ('clinics', 'clinic_members', 'patients', 'medical_records', 'user_roles');

-- 2. 测试未设置上下文时查询应返回 0 行
SELECT * FROM patients;  -- 应返回 0 行

-- 3. 设置上下文后查询应返回正确数据
SELECT set_clinic_context('your-clinic-uuid');
SELECT * FROM patients;  -- 应返回该诊所的数据