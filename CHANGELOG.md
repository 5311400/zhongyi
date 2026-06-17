# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.x] - 2026-06-17

### 安全加固（数据库 RLS）

**初始安全策略（v0.6.0）：**
- 创建 RLS 策略脚本 `scripts/security/rls-policies.sql`
- 所有表启用行级安全，实现多租户数据隔离
- 强制 SSL 连接配置、数据库审计日志
- 创建安全视图和索引优化
- 编写数据库安全配置指南 `scripts/security/SECURITY_GUIDE.md`

**高危修复（v0.6.1-v0.6.2）：**
- 移除 RLS 策略中所有 COALESCE fallback，强制要求设置 `app.current_clinic_id` 上下文
- 修复诊所成员表插入策略：使用 AND 限制，禁止用户将自己添加到任意诊所
- 移除 `SECURITY DEFINER`，改用默认的 `SECURITY INVOKER`，防止权限提升
- 为 clinics 表添加 DELETE 策略（需同时满足诊所 ID 和所有者角色）
- 添加 user_roles 表的 RLS 策略（查看自己、管理员管理）
- 视图移除 COALESCE fallback，与 RLS 策略保持一致
- 所有 DROP POLICY 语句添加 IF EXISTS

**审计日志 INSERT 策略修复（v0.6.7）：**
- 修复 audit_logs 表缺少 INSERT 策略的致命错误
- 未修复前所有表写入操作会因审计触发器失败而回滚
- 添加 `Audit logs insert for authenticated` 策略

### 审计系统

**基础审计（v0.6.3）：**
- 添加 `audit_logs` 表和审计触发器（患者表、病历表）
- 添加 `get_clinic_context()` 辅助函数用于调试

**审计覆盖完善（v0.6.4-v0.6.6）：**
- 审计触发器改为只记录关键字段，减少性能开销
- 添加 `idx_audit_logs_created_at` 索引
- 添加处方药材表和治疗项目表的审计触发器
- 添加诊所成员表审计触发器（跟踪权限变更）
- 添加用户角色表审计触发器（跟踪角色变更）

**审计策略优化（v0.6.5-v0.6.8）：**
- 添加 audit_logs 表 RLS 策略（用户查看自己日志、管理员查看所有）
- audit_logs 表添加 clinic_id 字段和索引，支持按诊所查询
- audit_logs.user_id 外键添加 ON DELETE SET NULL

### 安全指南优化（v0.6.1-v0.6.3）

- CORS 配置改为在 middleware.ts 中处理，支持多域名
- 添加安全标头配置（X-Frame-Options、X-Content-Type-Options 等）
- 敏感数据解密函数添加 RLS 二次验证
- 审计日志使用枚举类型（AuditAction、ResourceType）
- 安全事件分级响应时间调整（符合 GDPR 72 小时要求）
- 添加数据库连接池配置建议、SQL 注入防护说明
- 添加数据脱敏规则表、数据最小化原则
- 细化环境变量示例（区分前后端配置）
- 补充角色说明（admin/auditor/user/owner）
- 安全测试清单改为表格格式，添加预算参考

### 功能新增

- 中医问诊表页面 `/inquiry/[id]`（基于十问歌辨证设计）
- 病历导入/导出功能（JSON 格式）
- 问诊表数据应用到病历编辑功能
- AI 智能辨证流式输出
- 患者详情页：Upload 图标导入、导出合并硬编码和 sessionStorage 记录

### 修复

- 病历编辑页：问诊表应用函数数据结构不匹配
- 病历编辑页：TongueData 和 FullPulseData 数据结构修正
- 病历编辑页：loadInquiryData 闭包问题
- 病历编辑页：变量命名优化（applyInquiry → hasAppliedInquiry）
- 病历编辑页：应用/跳过后清除 hasInquiry 避免重复提示
- 问诊表：bodySymptoms、stoolOther、chestAbdomenOther、headOther 缺少表单控件
- 问诊表：saving 状态未实际使用
- 患者详情页：导入时对 recordType 和 id 做兜底处理
- RLS 策略：移除可能导致查询失败的 `current_setting` 无 fallback 调用
- RLS 策略：修复诊所表无法创建第一条记录的问题
- RLS 策略：移除 Supabase 不支持的 `ALTER SYSTEM` 语句
- 安全指南：修正文件路径

### 优化

- 患者详情页：操作按钮分组优化（flex-wrap + 分隔线）
- 改进 `maskPhone` 函数，支持 8-15 位国际号码
- 添加 API 限流配置示例、CORS 白名单配置
- 添加环境变量管理和密钥轮换机制
- 细化安全事件分级（P0-P3）
- 添加安全测试清单
- 备份策略优化（PITR + 每日全量备份）

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
