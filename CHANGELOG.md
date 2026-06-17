# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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