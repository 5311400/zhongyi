scripts\security\rls-policies.sql

🔴 必须修复的安全问题
1. COALESCE fallback 可能导致数据泄露（高危）
sql
-- ❌ 未设置 app.current_clinic_id 时会返回所有数据
CREATE POLICY "Patients select"
  ON patients
  FOR SELECT USING (
    clinic_id = COALESCE(current_setting('app.current_clinic_id', true)::uuid, clinic_id)
  );
风险：如果应用层忘记设置 app.current_clinic_id（如未调用 set_clinic_context），用户将能看到所有诊所的数据（包括其他诊所的患者）。

修复：移除 fallback，强制要求设置上下文。

sql
-- ✅ 强制检查，未设置则返回空
CREATE POLICY "Patients select"
  ON patients
  FOR SELECT USING (
    clinic_id = current_setting('app.current_clinic_id')::uuid
  );
如果担心开发环境，可在应用层确保每次请求都设置，或使用 set_config 的 is_local 参数设置为 false，使其在当前会话中生效。

2. 诊所成员表插入策略过于宽松（高危）
sql
-- ❌ 允许用户将自己添加到任何诊所
CREATE POLICY "Clinic members insert"
  ON clinic_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR clinic_id = current_setting('app.current_clinic_id', true)::uuid
  );
风险：任何认证用户都可以创建记录，将自己添加到任意诊所（通过第一个条件 auth.uid() = user_id 不限制 clinic_id）。

修复：限制插入时 clinic_id 必须等于当前诊所上下文，并且 user_id 必须是当前用户。

sql
-- ✅ 只能将自己添加到当前诊所
CREATE POLICY "Clinic members insert"
  ON clinic_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND clinic_id = current_setting('app.current_clinic_id')::uuid
  );
补充：如果是创建诊所时的初始成员，应由应用层在创建诊所的同时插入，并设置上下文，此策略可以覆盖。

3. set_clinic_context 使用 SECURITY DEFINER 带来的权限提升风险
sql
CREATE OR REPLACE FUNCTION set_clinic_context(clinic_id uuid)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_clinic_id', clinic_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
风险：SECURITY DEFINER 会以函数所有者权限执行，如果所有者是超级用户，那么任何调用此函数的用户都可以设置任意 clinic_id，可能导致越权访问。

修复：改为 SECURITY INVOKER（默认），或明确所有者权限，并确保函数只在可信上下文中调用。

sql
-- ✅ 使用 SECURITY INVOKER（默认）
CREATE OR REPLACE FUNCTION set_clinic_context(clinic_id uuid)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_clinic_id', clinic_id::text, false);
END;
$$ LANGUAGE plpgsql;
注意：set_config 本身不需要特殊权限，普通用户即可调用。

⚠️ 需要关注的问题
问题	说明	建议
索引创建缺少 IF NOT EXISTS	如 CREATE INDEX idx_patients_clinic_id ON patients(clinic_id); 重复执行会报错	全部添加 IF NOT EXISTS
诊所表缺少 DELETE 策略	当前没有定义 DELETE 策略，默认拒绝删除	如有需要，可添加策略允许诊所所有者删除
prescription_items 和 treatment_items 需确认有 clinic_id 字段	策略依赖该字段，确保表结构包含	在表设计时务必包含
视图 record_full 中子查询可能性能不佳	使用 json_agg 聚合大结果集时可能慢	对于大批量数据，建议在应用层分步查询或使用物化视图（如果必要）
🚀 优化建议
1. 为 clinics 表添加 DELETE 策略
sql
-- 允许诊所所有者（或拥有适当权限的用户）删除诊所
CREATE POLICY "Clinics delete for owner"
  ON clinics
  FOR DELETE USING (
    id = current_setting('app.current_clinic_id')::uuid
    AND EXISTS (
      SELECT 1 FROM clinic_members
      WHERE clinic_id = id AND user_id = auth.uid() AND role = 'owner'
    )
  );
2. 使用 IF NOT EXISTS 创建索引
sql
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
-- 其他索引同理
3. 移除视图中的 COALESCE fallback（与策略同步）
sql
CREATE OR REPLACE VIEW patient_full AS
SELECT ...
FROM patients p
WHERE p.clinic_id = current_setting('app.current_clinic_id')::uuid;
4. 添加 clinics 表的 INSERT 策略检查（可选）
虽然已有 Clinics insert for authenticated，但可进一步限制每个用户只能创建一个诊所（如通过唯一约束或应用逻辑），策略层面无法完全阻止。

5. 添加数据库函数以确保上下文已设置
sql
CREATE OR REPLACE FUNCTION require_clinic_context()
RETURNS VOID AS $$
BEGIN
  IF current_setting('app.current_clinic_id', true) IS NULL THEN
    RAISE EXCEPTION 'Clinic context not set. Call set_clinic_context first.';
  END IF;
END;
$$ LANGUAGE plpgsql;
可在每个策略中调用（但会增加开销），更推荐在应用层保证。

✅ 验证脚本补充
执行验证后，检查策略是否如预期工作：

sql
-- 测试：未设置上下文时查询应返回空（如果移除 fallback）
SELECT * FROM patients;  -- 应返回 0 行

-- 测试：设置上下文后查询
SELECT set_clinic_context('your-clinic-uuid');
SELECT * FROM patients;  -- 应返回该诊所的患者
