# 本草医案 - 数据库安全配置指南

## 概述

本指南描述了本草医案系统在生产环境中的数据库安全配置方案，旨在保护患者隐私和医疗数据安全。

## 一、架构安全

### 1.1 网络隔离

- 使用 VPC 私有网络，禁止公网直接访问数据库
- 通过 Next.js API Route 作为唯一入口
- 配置安全组/防火墙规则，只允许应用服务器访问

### 1.2 访问控制

```typescript
// src/lib/supabase.ts - 认证流程
const client = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// API Route 中验证用户身份
export async function authenticate(request: Request) {
  const token = request.headers.get('Authorization')?.split('Bearer ')[1];
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error('Unauthorized');
  }
  // 设置当前诊所上下文
  const userClinic = await getUserClinic(data.user.id);
  return { userId: data.user.id, clinicId: userClinic.id };
}
```

## 二、数据安全

### 2.1 加密

- **传输加密**：强制 SSL/TLS 连接
- **存储加密**：数据库静态数据加密（AES-256）
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
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskIdNumber(id: string): string {
  if (!id) return '';
  return id.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
}
```

## 三、合规性

### 3.1 GDPR 合规

- 提供数据导出功能
- 支持数据删除请求
- 用户同意管理
- 数据处理记录

### 3.2 HIPAA 合规

- 访问控制和审计
- 数据完整性保障
- 业务合作协议（BAA）
- 应急响应计划

## 四、审计日志

### 4.1 数据库级别

```sql
-- 已在 rls-policies.sql 中配置
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = '0';
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
```

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
  await auditLogTable.insert(log);
}
```

## 五、备份与恢复

### 5.1 自动备份

- 每日全量备份（保留 30 天）
- 每小时增量备份
- 跨区域备份存储

### 5.2 灾难恢复

- 多可用区部署（HA）
- 故障自动转移
- RPO < 1 分钟，RTO < 5 分钟

## 六、安全监控

### 6.1 异常检测

- 连续失败登录检测
- 异常查询模式识别
- 数据泄露预警

### 6.2 告警配置

- 数据访问量突增告警
- 非工作时间访问告警
- 权限变更告警

## 七、安全检查清单

- [ ] 所有表启用 RLS
- [ ] 强制 SSL 连接
- [ ] 敏感字段加密存储
- [ ] 审计日志启用
- [ ] 定期安全审计
- [ ] 定期备份验证
- [ ] 漏洞扫描
- [ ] 安全培训

## 八、应急响应

### 8.1 数据泄露处理流程

1. **检测**：监控系统发现异常
2. **评估**：确定泄露范围和影响
3. **遏制**：暂停受影响服务
4. **通知**：按法规要求通知相关方
5. **恢复**：修复漏洞，恢复服务
6. **调查**：分析原因，完善安全措施

## 附录

### A. 数据库角色定义

| 角色 | 权限 | 用途 |
|------|------|------|
| `app_user` | 只读 + 有限写入 | 应用服务器 |
| `admin` | 全部权限 | 管理操作 |
| `auditor` | 只读（审计） | 安全审计 |

### B. 安全事件分级

| 级别 | 定义 | 响应时间 |
|------|------|----------|
| P1 | 数据泄露/系统入侵 | 立即 |
| P2 | 服务中断/性能异常 | 1 小时 |
| P3 | 安全漏洞发现 | 24 小时 |
| P4 | 安全配置问题 | 72 小时 |