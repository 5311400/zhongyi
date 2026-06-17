scripts\security\SECURITY_GUIDE.md

⚠️ 需要优化的内容
1. CORS 配置位置建议调整
typescript
// next.config.ts
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          // ...
        ],
      },
    ];
  },
};
问题：Next.js 中 CORS 配置更推荐在 middleware.ts 中处理，支持动态判断（如根据环境变量控制允许的域名）。

建议：改为在 middleware.ts 中统一处理，并支持多个允许域名。

typescript
// src/middleware.ts
const allowedOrigins = [
  'https://yourdomain.com',
  'https://staging.yourdomain.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
].filter(Boolean);

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    // 设置 CORS 头
  }
}
2. 敏感数据解密函数的安全风险
typescript
function decryptPatientData(encryptedData: string, userId: string, resourceId: string): Patient {
  if (!hasAccess(userId, resourceId)) {
    throw new Error('Unauthorized');
  }
  return decrypt(encryptedData);
}
问题：hasAccess 的实现未展示，存在权限检查逻辑复杂、易出错的风险。

建议：补充 hasAccess 的完整实现，或明确说明依赖 RLS 进行二次验证。

typescript
// 推荐：依赖 Supabase RLS + 应用层二次确认
async function decryptPatientData(encryptedData: string, userId: string, resourceId: string): Promise<Patient> {
  // 1. 先通过 Supabase 查询验证权限（RLS 自动过滤）
  const { data, error } = await supabase
    .from('patients')
    .select('id')
    .eq('id', resourceId)
    .single();

  if (error || !data) {
    throw new Error('Access denied');
  }

  // 2. 解密数据
  return decrypt(encryptedData);
}
3. 审计日志的 action 字段缺少枚举定义
typescript
interface AuditLog {
  action: string; // ⚠️ 自由字符串，可能不一致
  resourceType: string; // ⚠️ 同样缺少约束
}
问题：action 和 resourceType 使用自由字符串，团队协作中容易出现不一致（如 'CREATE' vs 'create'）。

建议：定义为枚举类型。

typescript
type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT';
type ResourceType = 'PATIENT' | 'RECORD' | 'PRESCRIPTION' | 'TREATMENT' | 'USER' | 'CLINIC';

interface AuditLog {
  action: AuditAction;
  resourceType: ResourceType;
  // ...
}
4. P0 事件响应时间「15分钟」过于理想化
级别	定义	响应时间
P0	数据泄露/系统入侵	立即（15 分钟内）
问题：15 分钟内完成检测 + 评估 + 遏制，在现实中几乎不可能。GDPR 要求的数据泄露通知是 72 小时，这 15 分钟可能会给团队带来不必要的压力。

建议：调整为更现实的时间，并区分"响应"和"通知"。

级别	定义	响应时间	通知时间
P0	数据泄露/系统入侵	1 小时内	72 小时内
P1	服务中断/数据丢失	4 小时内	24 小时内
P2	安全漏洞发现	24 小时内	-
P3	安全配置问题	72 小时内	-
说明：P0 的 72 小时通知期限符合 GDPR 第 33 条要求，同时也给团队留出了合理的时间进行评估和通知准备。

5. 缺少 user_roles 表的 RLS 策略
问题：附录中定义了 user_roles 表，但 RLS 策略文件中未包含该表的策略。

建议：在 rls-policies.sql 中补充 user_roles 表的 RLS 策略。

sql
-- 用户角色表策略
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User roles select for self"
  ON user_roles
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "User roles admin manage"
  ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
6. 缺少数据库连接池配置建议
问题：Supabase 默认连接池限制为 200，如果应用服务器连接数过多可能耗尽。

建议：补充连接池配置。

typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key, {
  auth: { /* ... */ },
  db: {
    pool: {
      min: 2,
      max: 20,
    },
  },
});
7. 安全测试清单中「每年至少 2 次渗透测试」缺少预算说明
建议：注明渗透测试通常需要专业安全公司，建议在项目预算中预留 5-10 万元/年。

🚀 补充建议
1. 添加安全标头（Security Headers）
typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  return response;
}
2. 添加 SQL 注入防护建议
typescript
// 使用 Supabase 的查询构建器（自动防 SQL 注入）
const { data } = await supabase
  .from('patients')
  .select('*')
  .eq('id', patientId); // 参数化查询

// 避免使用原始 SQL 拼接
3. 补充「数据最小化原则」
只收集必要的患者信息

不存储不需要的敏感数据

定期清理过期数据

4. 数据脱敏规则表
字段	脱敏规则	示例
姓名	保留姓，名用*代替	张**
手机号	保留前3后4位	138****5678
身份证号	保留前6后4位	110105********1234
地址	保留街道，门牌号隐藏	朝阳区*路号
