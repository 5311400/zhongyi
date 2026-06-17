# 本草医案 - 数据库安全配置指南

## 概述

本指南描述了本草医案系统在生产环境中的数据库安全配置方案，旨在保护患者隐私和医疗数据安全。

**免责声明**：本指南仅提供技术层面的安全配置建议。GDPR、HIPAA 等法规的合规性需要签署相应的法律协议，技术实现是合规的基础但非全部。

## 一、架构安全

### 1.1 网络隔离

- 使用 VPC 私有网络，禁止公网直接访问数据库
- 通过 Next.js API Route 作为唯一入口
- 配置安全组/防火墙规则，只允许应用服务器访问

### 1.2 访问控制

```typescript
// src/storage/database/supabase-client.ts - 认证流程
const client = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// API Route 中验证用户身份并设置诊所上下文
export async function authenticate(request: Request) {
  const token = request.headers.get('Authorization')?.split('Bearer ')[1];
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error('Unauthorized');
  }

  // 获取用户所属诊所
  const { data: memberData } = await supabase
    .from('clinic_members')
    .select('clinic_id, role')
    .eq('user_id', data.user.id)
    .single();

  if (!memberData) {
    throw new Error('User not associated with any clinic');
  }

  // 设置当前诊所上下文（RLS 策略依赖）
  await supabase.rpc('set_clinic_context', { clinic_id: memberData.clinic_id });

  return {
    userId: data.user.id,
    clinicId: memberData.clinic_id,
    role: memberData.role,
  };
}
```

### 1.3 API 限流

```typescript
// src/middleware.ts
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const userRole = await getUserRole(request);
  const limits = {
    admin: 1000,    // 管理员：1000 请求/小时
    user: 100,      // 普通用户：100 请求/小时
    auditor: 50,    // 审计员：50 请求/小时
  };
  await rateLimit(request, { limit: limits[userRole] || 100 });
}
```

### 1.4 CORS 配置

```typescript
// next.config.ts
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

## 二、数据安全

### 2.1 加密

- **传输加密**：强制 SSL/TLS 连接（Supabase 默认启用）
- **存储加密**：数据库静态数据加密（AES-256，Supabase 默认启用）
- **敏感字段**：身份证号、手机号等使用 AES-256-GCM 加密存储

### 2.2 行级安全（RLS）

执行 `scripts/security/rls-policies.sql` 启用多租户隔离：

```bash
# 在 Supabase SQL 编辑器中执行
\i scripts/security/rls-policies.sql
```

### 2.3 敏感数据处理

```typescript
// 脱敏处理 - 在返回数据前对敏感字段进行脱敏
function maskSensitiveData(patient: Patient): Patient {
  return {
    ...patient,
    phone: maskPhone(patient.phone),
    idNumber: maskIdNumber(patient.idNumber),
  };
}

function maskPhone(phone: string): string {
  if (!phone) return '';
  // 兼容 8-15 位号码（国际号码）
  const len = phone.length;
  if (len <= 8) return phone;
  const showFirst = Math.min(3, Math.floor(len / 4));
  const showLast = Math.min(4, Math.floor(len / 4));
  const maskedLen = len - showFirst - showLast;
  return phone.substring(0, showFirst) + '*'.repeat(maskedLen) + phone.substring(len - showLast);
}

function maskIdNumber(id: string): string {
  if (!id) return '';
  return id.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
}

// 解密处理（仅在授权后）
function decryptPatientData(encryptedData: string, userId: string, resourceId: string): Patient {
  // 先验证用户是否有权访问
  if (!hasAccess(userId, resourceId)) {
    throw new Error('Unauthorized');
  }
  return decrypt(encryptedData);
}
```

## 三、合规性

### 3.1 GDPR 合规

- 提供数据导出功能（`/api/patients/[id]/export`）
- 支持数据删除请求（`/api/patients/[id]/delete`）
- 用户同意管理（`user_consents` 表）
- 数据处理记录（`audit_logs` 表）

### 3.2 HIPAA 合规

- 访问控制和审计（RLS + pgAudit）
- 数据完整性保障（事务约束 + 唯一索引）
- 业务合作协议（BAA）需与 Supabase 签署
- 应急响应计划（见第八节）

## 四、审计日志

### 4.1 数据库级别

使用 Supabase 内置的 pgAudit 扩展：

```sql
-- 在 Supabase SQL 编辑器中启用
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- 配置审计（通过 Supabase Dashboard）
-- Settings → Database → Audit Trail
```

**审计配置建议：**
- 记录所有 DDL 操作（CREATE、ALTER、DROP）
- 记录所有 DML 操作（INSERT、UPDATE、DELETE）
- 记录敏感表的所有操作（patients、medical_records）
- 记录认证失败尝试

### 4.2 应用级别

```typescript
// 创建审计日志记录
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  ipAddress: string;
  details: Record<string, unknown>;
}

async function logAudit(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, unknown> = {}
) {
  const log: AuditLog = {
    id: `audit_${Date.now()}`,
    userId,
    action,
    resourceType,
    resourceId,
    timestamp: new Date(),
    ipAddress: getClientIp(),
    details,
  };
  await supabase.from('audit_logs').insert(log);
}
```

## 五、备份与恢复

### 5.1 自动备份

Supabase 提供的备份策略：
- **每日全量备份**：保留 30 天
- **PITR（Point-in-Time Recovery）**：支持恢复到过去 7 天内的任意时间点
- **跨区域备份**：可选功能，数据复制到其他区域

### 5.2 灾难恢复

- 多可用区部署（HA）
- 故障自动转移（RTO < 5 分钟）
- 数据恢复验证（每月演练）

## 六、安全监控

### 6.1 异常检测

- 连续失败登录检测（5 次失败后锁定账户）
- 异常查询模式识别（大量数据导出尝试）
- 数据泄露预警（敏感字段访问频率突增）

### 6.2 告警配置

- 数据访问量突增告警（超过阈值 3 倍）
- 非工作时间访问告警（22:00-06:00）
- 权限变更告警（user_roles 表变更）
- RLS 策略变更告警

## 七、环境变量管理

### 7.1 环境变量加密

```bash
# .env.example
DATABASE_URL=postgres://...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ENCRYPTION_KEY=...  # AES-256-GCM 密钥（32 字节）
ENCRYPTION_KEY_ROTATION=...  # 密钥轮换计划（如：90 天）
```

### 7.2 密钥轮换

```typescript
// src/lib/encryption.ts
export class EncryptionService {
  private static readonly KEY_ROTATION_DAYS = 90;

  static async rotateKey() {
    const lastRotation = await this.getLastRotationDate();
    const daysSinceRotation = (Date.now() - lastRotation.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceRotation >= this.KEY_ROTATION_DAYS) {
      await this.generateNewKey();
      await this.reEncryptSensitiveData();
      await this.updateLastRotationDate();
    }
  }
}
```

## 八、安全检查清单

- [ ] 所有表启用 RLS
- [ ] SSL/TLS 连接强制启用
- [ ] 敏感字段加密存储
- [ ] pgAudit 扩展启用
- [ ] API 限流配置
- [ ] CORS 白名单配置
- [ ] 环境变量加密管理
- [ ] 定期安全审计（每年至少 2 次）
- [ ] 定期备份验证（每月）
- [ ] 漏洞扫描（每月）
- [ ] 代码安全审计（每次发布前）
- [ ] 依赖项安全扫描（每周）
- [ ] 安全应急演练（每季度）

## 九、应急响应

### 9.1 数据泄露处理流程

1. **检测**：监控系统发现异常
2. **评估**：确定泄露范围和影响（15 分钟内）
3. **遏制**：暂停受影响服务（30 分钟内）
4. **通知**：按法规要求通知相关方（24 小时内）
5. **恢复**：修复漏洞，恢复服务
6. **调查**：分析原因，完善安全措施

### 9.2 安全事件分级

| 级别 | 定义 | 响应时间 | 通知对象 |
|------|------|----------|----------|
| P0 | 数据泄露/系统入侵 | 立即（15 分钟内） | CEO + CTO + 法务 |
| P1 | 服务中断/数据丢失 | 1 小时内 | CTO + 运维 |
| P2 | 安全漏洞发现 | 24 小时内 | 安全团队 |
| P3 | 安全配置问题 | 72 小时内 | 开发团队 |

## 附录

### A. 用户角色管理

使用 Supabase 的 `auth.users` 和自定义 `user_roles` 表：

```sql
-- 用户角色表
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'auditor', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 策略中使用角色
CREATE POLICY "Admin full access" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### B. 安全测试清单

- [ ] 渗透测试（每年至少 2 次）
- [ ] 漏洞扫描（每月）
- [ ] 代码安全审计（每次发布前）
- [ ] 依赖项安全扫描（每周）
- [ ] 社会工程学测试（每年）
- [ ] 安全应急演练（每季度）

### C. 常见安全事件处理

**场景 1：用户忘记密码**
- 使用 Supabase Auth 的密码重置功能
- 发送重置链接到注册邮箱
- 链接有效期 1 小时

**场景 2：检测到异常登录**
- 锁定账户（5 次失败后）
- 发送安全警告邮件
- 要求验证手机号或邮箱

**场景 3：数据泄露**
- 立即隔离受影响系统
- 通知所有受影响用户
- 配合监管机构调查
- 实施补救措施