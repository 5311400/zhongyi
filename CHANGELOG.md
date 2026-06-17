# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.4] - 2026-06-17

### 优化

**RLS 策略优化：**
- 审计触发器改为只记录关键字段（name、phone、clinic_id），减少性能开销
- 添加 `idx_audit_logs_created_at` 索引，优化审计日志查询

## [0.6.3] - 2026-06-17

### 优化

**RLS 策略优化：**
- 添加 `get_clinic_context()` 辅助函数，用于调试检查当前上下文
- 添加 `audit_logs` 表和审计触发器（患者表、病历表）
- 触发器记录 INSERT/UPDATE/DELETE 操作的详细变更信息

**安全指南优化：**
- 细化环境变量示例（区分前后端配置）
- 补充角色说明（admin/auditor/user/owner）
- 安全测试清单改为表格格式，添加预算参考
- 添加 `audit_logs` 表结构定义

## [0.6.2] - 2026-06-17

### 安全修复（高危）

**RLS 策略修复：**
- 移除所有 COALESCE fallback，强制要求设置 `app.current_clinic_id` 上下文，防止数据泄露
- 修复诊所成员表插入策略：使用 AND 限制，禁止用户将自己添加到任意诊所
- 移除 `SECURITY DEFINER`，改用默认的 `SECURITY INVOKER`，防止权限提升
- 为 clinics 表添加 DELETE 策略（需同时满足诊所 ID 和所有者角色）
- 添加 user_roles 表的 RLS 策略（查看自己、管理员管理）
- 视图移除 COALESCE fallback，与 RLS 策略保持一致

**安全指南优化：**
- CORS 配置改为在 middleware.ts 中处理，支持多域名
- 添加安全标头配置（X-Frame-Options、X-Content-Type-Options 等）
- 敏感数据解密函数添加 RLS 二次验证
- 审计日志使用枚举类型（AuditAction、ResourceType）
- 安全事件分级响应时间调整为更现实的值（符合 GDPR 72 小时要求）
- 添加数据库连接池配置建议
- 添加 SQL 注入防护说明
- 添加数据脱敏规则表
- 添加数据最小化原则
- 安全测试清单添加渗透测试预算说明

### 优化

- 所有 DROP POLICY 语句添加 IF EXISTS，避免重复执行报错

## [0.6.1] - 2026-06-17

### Security

- 修复 RLS 策略中的严重问题
  - 使用 `COALESCE(current_setting('app.current_clinic_id', true)::uuid, ...)` 避免 NULL 值
  - 诊所表添加专门的 INSERT 策略，允许认证用户创建诊所
  - 移除不兼容的 `ALTER DATABASE` 和 `ALTER SYSTEM` 语句
  - 视图添加 fallback 处理，避免未设置上下文时报错
  - 添加 `set_clinic_context` 辅助函数
  - 添加 `idx_clinic_members_user_id` 索引

- 优化安全配置指南
  - 移除不兼容的审计日志配置，改用 Supabase pgAudit 扩展
  - 添加 `app.current_clinic_id` 设置说明和示例代码
  - 修正数据库角色管理方案，使用 `user_roles` 表
  - 添加敏感字段解密权限控制说明
  - 添加 GDPR/HIPAA 合规免责声明
  - 优化备份策略描述（PITR + 每日全量备份）
  - 改进 `maskPhone` 函数，支持 8-15 位国际号码
  - 添加 API 限流配置示例
  - 添加 CORS 白名单配置
  - 添加环境变量管理和密钥轮换机制
  - 细化安全事件分级（P0-P3）
  - 添加安全测试清单

### Fixed

- RLS 策略：移除可能导致查询失败的 `current_setting` 无 fallback 调用
- RLS 策略：修复诊所表无法创建第一条记录的问题
- RLS 策略：移除 Supabase 不支持的 `ALTER SYSTEM` 语句
- 安全指南：修正文件路径（`src/lib/supabase.ts` → `src/storage/database/supabase-client.ts`）

## [0.6.0] - 2026-06-17

### Security

- 创建 RLS（行级安全）策略脚本 `scripts/security/rls-policies.sql`
- 所有表启用行级安全，实现多租户数据隔离
- 强制 SSL 连接配置
- 启用数据库审计日志
- 创建安全视图和索引优化
- 编写数据库安全配置指南 `scripts/security/SECURITY_GUIDE.md`

### Added

- 患者详情页：Upload 图标导入
- 问诊表：bodySymptoms、headOther、stoolOther、urineOther、chestAbdomenOther 输入控件
- 问诊表：打印模板补充缺失字段展示

### Fixed

- 患者详情页：导出合并硬编码和 sessionStorage 记录
- 患者详情页：导入时对 recordType 和 id 做兜底处理
- 问诊表：saving 状态使用（保存时显示加载状态）
- 病历编辑页：变量命名优化（applyInquiry → hasAppliedInquiry）
- 病历编辑页：应用/跳过后清除 hasInquiry 避免重复提示

### Changed

- 患者详情页：操作按钮分组优化（flex-wrap + 分隔线）

## [0.5.1] - 2026-06-17

### Fixed

- 患者详情页：Upload 图标导入（编译错误）
- 患者详情页：导出范围不完整（合并硬编码和 sessionStorage 记录）
- 患者详情页：导入记录类型判断兜底
- 问诊表：bodySymptoms 缺少表单控件
- 问诊表：stoolOther、chestAbdomenOther、headOther 缺少输入框
- 问诊表：saving 状态未实际使用

### Changed

- 患者详情页：操作按钮分组优化

## [0.5.0] - 2026-06-17

### Added

- 中医问诊表页面 `/inquiry/[id]`（基于十问歌辨证设计）
- 病历导入/导出功能（JSON 格式）
- 问诊表数据应用到病历编辑功能
- AI 智能辨证流式输出

### Fixed

- 病历编辑页：问诊表应用函数数据结构不匹配
- 病历编辑页：TongueData 和 FullPulseData 数据结构修正
- 病历编辑页：loadInquiryData 闭包问题

## [0.4.0] - 2026-06-16

### Added

- 患者管理功能（列表、详情、编辑）
- 病历管理功能（新建、查看、时间轴）
- AI 辨证 API 路由
- 共享导航组件
- 设计 Token（emerald 主色 + 米白底）

### Changed

- 项目架构重构（App Router）
- 数据库 Schema 设计（7 张表）

## [0.3.0] - 2026-06-15

### Added

- 仪表盘页面（统计卡片、最近患者、待办提醒）
- 账号设置页面（个人/诊所/通知/安全）
- 舌象选择器组件
- 脉象选择器组件

### Changed

- UI 风格统一（shadcn/ui）
- 响应式布局优化

## [0.2.0] - 2026-06-14

### Added

- 基础页面框架
- 数据库连接配置
- 类型定义

### Changed

- 技术栈升级（Next.js 16 + React 19）

## [0.1.0] - 2026-06-13

### Added

- 项目初始化
- 基础设施配置
- 核心依赖安装