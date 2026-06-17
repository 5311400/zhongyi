💡 可选优化建议（非必须）
以下为锦上添花的建议，不影响文档的完整性和可用性。

1. 数据结构对齐
RLS 策略文件：user_roles.role 定义包含 'owner'，指南中只列了 'admin'、'auditor'、'user'

建议：保持一致，在文档中补充 'owner' 角色说明

typescript
// 建议更新为：
role TEXT NOT NULL CHECK (role IN ('admin', 'auditor', 'user', 'owner'))
2. 环境变量示例建议细化
当前 .env.example 未包含 NEXT_PUBLIC_SUPABASE_ANON_KEY 的实际使用说明，建议补充：

bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 数据库连接（仅服务端使用）
DATABASE_URL=postgres://postgres:password@db.xxxxx.supabase.co:5432/postgres
3. 补充 audit_logs 表结构定义（可选）
审计日志在文档中被多次引用，但未提供表结构：

sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
4. 附录 B 安全测试频率建议补充
测试项目	频率	预算参考
渗透测试	每年 2 次	5-10 万元/年
漏洞扫描	每月	1-2 万元/年
代码安全审计	每次发布	视范围而定
依赖项扫描	每周	-
安全演练	每季度	-