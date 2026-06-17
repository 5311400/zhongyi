# 📜 本草医案 · 项目书

> **本草医案** — 面向个人中医诊所和中医爱好者的诊疗档案管理系统
> 版本：v0.1.0 · 平台：扣子编程 Vibe Coding

---

## 目录

1. [项目愿景](#1-项目愿景)
2. [核心功能矩阵](#2-核心功能矩阵)
3. [技术架构](#3-技术架构)
4. [项目结构与代码位置](#4-项目结构与代码位置)
5. [数据库设计](#5-数据库设计)
6. [页面清单](#6-页面清单)
7. [AI 辨证 API](#7-ai-辨证-api)
8. [设计系统](#8-设计系统)
9. [快速开始](#9-快速开始)
10. [核心命令](#10-核心命令)
11. [编码规范](#11-编码规范)
12. [安全与隐私](#12-安全与隐私)
13. [后续路线图](#13-后续路线图)

---

## 1. 项目愿景

### 1.1 业务定位
本草医案专注于服务**个人中医诊所医师**和**中医爱好者**，解决诊疗档案管理的痛点：
- 传统手写病历难检索、难复诊对比
- 中医特色诊断（脉象、舌象、面相）缺乏结构化记录
- 中药/针灸/外治方案难以规范化整理
- 缺少 AI 辅助参考

### 1.2 目标用户
| 角色 | 场景 | 核心需求 |
|---|---|---|
| 诊所医师 | 日常接诊 | 快速录入四诊信息 + AI 辨证参考 |
| 助理 | 整理档案 | 批量搜索、导出打印 |
| 中医爱好者 | 自我学习 | 标准化的问诊模板 |
| 患者 | 复诊跟进 | 查看自己的诊疗历史 |

### 1.3 差异化亮点
- ✅ **中医特色字段**：脉象、舌象、面色、神情
- ✅ **结构化中药处方**：自动计算药味数 / 总剂量
- ✅ **针灸 + 中医外治** 一体化记录
- ✅ **AI 流式辨证**：基于 DeepSeek V3.2
- ✅ **复诊时间轴**：直观对比病情演变
- ✅ **多端可扩展**：后续可零成本接入微信小程序 / APP（共用 Next.js API）

---

## 2. 核心功能矩阵

### 2.1 患者档案
| 功能 | 说明 |
|---|---|
| 基本信息 | 姓名 / 性别 / 年龄 / 电话 / 职业 / 备注 |
| 医疗禁忌 | 药物过敏 / 食物过敏（红色高亮） |
| 既往病史 | 慢性病 / 长期用药 |
| 体质分类 | 王琦九种体质（自动染色） |
| 搜索 | 按姓名 / 电话 / 病历号 / 诊断搜索 |

### 2.2 病历记录（11 个 section）
| Section | 字段 |
|---|---|
| A. 主诉与医疗禁忌 | 主诉、过敏（chip 化） |
| B. 望诊 | 舌色 / 舌形 / 苔色 / 苔质 / 面色 / 神情 |
| C. 切诊 | 脉象（浮沉迟数虚实滑涩弦紧缓细弱洪） |
| D. 辨证三要素 | 病位 / 病性 / 证型 |
| E. 体质分类 | 王琦九种（单选） |
| F. 中药处方 | 动态增减 / 剂量编辑 / 自动算药味数和总剂量 |
| G. 针灸处方 | 主穴 + 配穴（chip 化） |
| H. 中医外治 | 针刺 / 温针灸 / 电针 / 艾灸 / 拔罐 / 推拿 / 刮痧 / 放血 / 耳穴 |
| I. 病例摘要 | 自由文本 |
| J. **AI 智能辨证** | DeepSeek V3.2 流式输出 |
| K. 复诊标记 | 初诊 / 复诊区分 |

### 2.3 复诊跟进
- 时间轴视图，初诊/复诊标记
- 每次诊疗独立卡片
- 处方横向对比
- 站内提醒（仪表盘置顶）

### 2.4 AI 智能辨证
- 模型：DeepSeek V3.2（`deepseek-v3-2-251201`）
- 平台托管，无需用户提供 API Key
- SSE 流式输出，打字机式渲染
- 强制末尾免责声明（双层保证）
- 输出：辨证分析 + 参考药方 + 针灸穴位方 + 医嘱

### 2.5 打印 / 导出
- 患者详情：打印 / 导出按钮（病历 PDF）
- 诊所抬头：可配置（账号设置）

---

## 3. 技术架构

### 3.1 技术栈
```
┌─────────────────────────────────────────┐
│  Frontend                                │
│  ├── Next.js 16 (App Router)            │
│  ├── React 19                            │
│  ├── TypeScript 5 (strict)              │
│  ├── Tailwind CSS 4 + shadcn/ui         │
│  └── Lucide Icons                        │
├─────────────────────────────────────────┤
│  Backend (Next.js API Routes)           │
│  ├── LLMClient.stream() ← DeepSeek V3.2 │
│  ├── SSE 流式响应                         │
│  └── 平台托管 API Key（不暴露）           │
├─────────────────────────────────────────┤
│  Database                                │
│  ├── Supabase (PostgreSQL)              │
│  ├── Drizzle ORM                        │
│  ├── 7 张表 + 525 条 TCM 预置数据        │
│  └── RLS 多租户隔离                      │
├─────────────────────────────────────────┤
│  Design                                  │
│  ├── 翠绿主色 #059669 (emerald)         │
│  ├── 米白底 #FAF9F6                      │
│  ├── Noto Sans SC                        │
│  └── 圆角 12px / 16px                    │
└─────────────────────────────────────────┘
```

### 3.2 关键设计决策
| 决策 | 理由 |
|---|---|
| Next.js 16 App Router | 未来可零成本接微信小程序 / APP（共用 API Routes） |
| Drizzle ORM | 类型安全 + 配合 coze-coding-ai 工作流 |
| 平台托管 LLM | 不暴露用户 API Key，更安全 |
| SSE 流式 | 大模型输出有真实感，前端打字机渲染 |
| Tailwind CSS 4 | 与原型一致，开发效率高 |
| shadcn/ui 风格 | 与 Design Token 兼容，组件可定制 |

---

## 4. 项目结构与代码位置

### 4.1 完整目录树

```
/workspace/projects/
│
├── 📄 AGENTS.md                           # 项目规范文件（必读）
├── 📄 README.md                           # 项目书（本文件）
├── 📄 package.json                        # 依赖清单
├── 📄 pnpm-lock.yaml                      # 锁文件
├── 📄 next.config.ts                      # Next.js 配置
├── 📄 tsconfig.json                       # TS 配置
├── 📄 eslint.config.mjs                   # ESLint 配置
├── 📄 postcss.config.mjs                  # PostCSS 配置
├── 📄 components.json                     # shadcn/ui 配置
├── 📄 .coze                               # Coze 平台配置（build + run）
├── 📄 .babelrc                            # Babel 配置
├── 📄 .gitignore
│
├── 📁 assets/
│   └── 问诊表.html                        # 用户提供的问诊表（参考）
│
├── 📁 scripts/                            # 构建/启动脚本
│   ├── prepare.sh                         # 准备环境
│   ├── dev.sh                             # 开发脚本
│   ├── build.sh                           # 生产构建
│   ├── start.sh                           # 启动生产服务
│   └── validate.sh                        # 验证脚本
│
├── 📁 src/                                # 源代码
│   │
│   ├── 📁 app/                            # Next.js App Router
│   │   ├── globals.css                    # ★ Design Token 定义（115 行）
│   │   ├── layout.tsx                     # ★ Root layout（中文 + 本草医案品牌）
│   │   ├── page.tsx                       # ★ 仪表盘（统计 + 最近患者 + 待办 + AI Banner）
│   │   ├── favicon.ico
│   │   ├── robots.ts                      # SEO 爬虫配置
│   │   │
│   │   ├── 📁 patients/                   # 患者模块
│   │   │   ├── page.tsx                   # ★ 患者列表（搜索 + 卡片）
│   │   │   └── 📁 [id]/                   # 动态路由：患者 ID
│   │   │       ├── page.tsx               # ★ 患者详情（时间轴 + 处方）
│   │   │       └── 📁 records/
│   │   │           └── 📁 new/            # 新建病历
│   │   │               └── page.tsx       # ★ 病历编辑（11 section + AI）
│   │   │
│   │   ├── 📁 account/                    # 账号设置
│   │   │   └── page.tsx                   # ★ 个人 / 诊所 / 通知 / 安全
│   │   │
│   │   └── 📁 api/                        # API 路由
│   │       └── 📁 ai/
│   │           └── 📁 diagnosis/
│   │               └── route.ts           # ★ DeepSeek 流式辨证 API
│   │
│   ├── 📁 components/                     # 共享组件
│   │   ├── app-header.tsx                 # ★ 顶部导航（仪表盘/患者/账号）
│   │   └── 📁 ui/                         # shadcn/ui 组件库
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── dialog.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       └── ... (50+ 组件)
│   │
│   ├── 📁 hooks/
│   │   └── use-mobile.ts                  # 移动端判断 hook
│   │
│   ├── 📁 lib/
│   │   └── utils.ts                       # cn 工具（className 合并）
│   │
│   ├── 📁 storage/                        # 数据库
│   │   └── 📁 database/
│   │       ├── supabase-client.ts         # Supabase 客户端
│   │       └── 📁 shared/
│   │           ├── schema.ts              # ★ Drizzle Schema（7 张表）
│   │           └── relations.ts           # 表关系定义
│   │
│   └── server.ts                          # 自定义服务端入口
│
└── 📁 .cozeproj/prototype/web/            # 原型 HTML（设计稿）
    ├── _skeleton.html                     # 设计骨架（带 @theme）
    ├── .canvas.json                       # 画板配置
    ├── home.html                          # 仪表盘原型
    ├── patient-list.html                  # 患者列表原型
    ├── patient-detail.html                # 患者详情原型
    ├── record-edit.html                   # 病历编辑原型（v2 整合版）
    └── account.html                       # 账号设置原型
```

> **★ 标记** = 项目核心业务代码

### 4.2 关键文件清单（代码位置速查）

| 编号 | 文件路径 | 行数级别 | 作用 |
|---|---|---|---|
| 1 | `src/app/globals.css` | 115+ | Design Token（颜色、字体、阴影、圆角） |
| 2 | `src/app/layout.tsx` | 50 | Root layout，HTML lang="zh-CN"，本草医案品牌 |
| 3 | `src/app/page.tsx` | 200+ | 仪表盘 |
| 4 | `src/app/patients/page.tsx` | 250+ | 患者列表 |
| 5 | `src/app/patients/[id]/page.tsx` | 350+ | 患者详情（时间轴） |
| 6 | `src/app/patients/[id]/records/new/page.tsx` | 500+ | 病历编辑（11 section + AI） |
| 7 | `src/app/account/page.tsx` | 250+ | 账号设置 |
| 8 | `src/app/api/ai/diagnosis/route.ts` | 130+ | DeepSeek 流式 API |
| 9 | `src/components/app-header.tsx` | 100 | 共享顶部导航 |
| 10 | `src/storage/database/shared/schema.ts` | 250+ | 7 张表 Drizzle Schema |
| 11 | `AGENTS.md` | 200+ | 项目规范文件 |

---

## 5. 数据库设计

### 5.1 表结构

| 表名 | 用途 | 关键字段 |
|---|---|---|
| `clinics` | 诊所 | id, name, address, phone |
| `clinic_members` | 诊所成员 | id, clinic_id, user_id, role (admin/医师/助理/前台) |
| `patients` | 患者 | id, clinic_id, name, gender, age, phone, occupation, constitution, allergies, chronic_diseases, note |
| `medical_records` | 病历 | id, patient_id, doctor_id, type (初诊/复诊), chief_complaint, tongue, pulse, face, syndrome_location[], syndrome_nature[], syndrome_name, constitution, summary, advice, ai_suggested |
| `prescription_items` | 中药处方项 | id, record_id, herb_name, dose, sort_order |
| `treatment_items` | 治疗项 | id, record_id, type (针灸/外治), acupoints[], duration |
| `tcm_options` | TCM 选项库 | id, category, name, pinyin, description |

### 5.2 TCM 预置数据（共 525+ 条）
| 类别 | 数量 | 说明 |
|---|---|---|
| 中药 | 258 | 补气/补血/补阴/补阳/解表/清热/化痰止咳/活血化瘀/利水渗湿/祛风湿/化湿/温里/理气/止血/安神/收涩/消食/平肝/开窍/泻下/外用 |
| 穴位 | 88 | 任脉/督脉/足三阳/足三阴/手三阳/手三阴/经外奇穴 |
| 体质 | 9 | 平和/气虚/阳虚/阴虚/痰湿/湿热/血瘀/气郁/特禀 |
| 病位 | 14 | 肝/心/脾/肺/肾 + 三焦等 |
| 病性 | 10 | 气虚/血虚/阴虚/阳虚/气滞/血瘀/痰湿/湿热/寒凝/热盛 |
| 证型 | 30+ | 肝郁脾虚、气血两虚、心肾不交等 |
| 治法 | 16 | 疏肝理气、健脾和胃、滋阴降火等 |
| 中医十问 | 67 | 寒热/汗/头身/胸腹/饮食/口味/寐/情志/二便等选项 |

### 5.3 ER 关系

```
clinics (1) ─── (N) clinic_members
clinics (1) ─── (N) patients
patients (1) ─── (N) medical_records
medical_records (1) ─── (N) prescription_items
medical_records (1) ─── (N) treatment_items
```

---

## 6. 页面清单

### 6.1 仪表盘 `/`
- 欢迎语 + 今日概览
- 4 个统计卡片（在管患者 / 本月病历 / 待复诊 / AI 辨证）
- 最近接诊患者列表
- 待办提醒（复诊）
- AI Banner（引导体验）

### 6.2 患者列表 `/patients`
- 搜索栏（按姓名/电话/诊断/体质）
- 筛选按钮
- 新建患者按钮
- 患者卡片列表
  - 头像（首字 + 翠绿容器色）
  - 姓名 + 性别/年龄
  - 体质色卡（9 种颜色）
  - 过敏标签（红色高亮）
  - 末次诊断 + 联系方式
  - 复诊次数
  - 快捷录病历按钮

### 6.3 患者详情 `/patients/[id]`
- 面包屑导航
- 患者基础信息卡
  - 头像（20 大圆）
  - 姓名/性别/年龄/体质
  - 4 列元信息（电话/职业/初诊日期/累计次数）
  - 操作按钮（编辑资料 / 录入新病历）
  - 红色医疗禁忌区 + 黄色既往病史区
- 诊疗时间轴
  - 时间线 + 节点（初诊实心 / 复诊空心）
  - 每条记录独立卡片
  - 显示日期/类型/证型/AI 标记
  - 四诊信息（舌象/脉象）
  - 中药处方网格
  - 针灸处方
  - 打印 / 导出 按钮

### 6.4 病历编辑 `/patients/[id]/records/new`
- 顶部操作栏（取消 / 保存）
- 患者卡片（基本信息 + 过敏警告）
- 11 个 section（每个用 Section 组件渲染）
  - A. 主诉与医疗禁忌
  - B. 望诊（舌色/舌形/苔色/苔质/面色/神情 6 组 chip）
  - C. 切诊（脉象 chip）
  - D. 辨证三要素（病位/病性/证型）
  - E. 体质分类（9 种 grid）
  - F. 中药处方（动态增减 + 剂量编辑 + 自动算总剂量）
  - G. 针灸处方（chip + 添加 + 常用穴位候选）
  - H. 中医外治（10 种 grid）
  - I. 病例摘要（textarea）
  - J. **AI 智能辨证**（高亮卡片 + 一键调用 + 流式渲染）
- 病历保存后返回患者详情时间轴

### 6.5 账号设置 `/account`
- 4 个 section
  - 个人资料（头像 / 姓名 / 执业证 / 联系方式 / 简介）
  - 诊所信息（名称 / 地址 / 电话 / 营业时间）
  - 通知偏好（站内 / 邮件 / 微信开关）
  - 账号安全（修改密码 / 退出登录）

---

## 7. AI 辨证 API

### 7.1 端点
```
POST /api/ai/diagnosis
```

### 7.2 请求格式
```json
{
  "patient": { "name": "陈秀英", "age": 58, "gender": "女" },
  "chiefComplaint": "胁肋胀痛伴纳差1月余",
  "tongue": "淡红、苔薄白",
  "pulse": "弦细",
  "face": "常色、得神",
  "constitution": "气郁质",
  "syndrome": {
    "location": ["肝", "脾"],
    "nature": ["气滞", "血瘀"],
    "name": "肝郁脾虚"
  }
}
```

### 7.3 响应格式（SSE）
```
data: {"text": "###"}
data: {"text": " 辨证分析"}
data: {"text": "\n"}
data: {"text": "- **病位**：肝、脾..."}
...
data: {"text": "\n\n---\n【提示】本内容由 AI 生成..."}
data: [DONE]
```

### 7.4 安全保证
- ✅ API Key 由平台托管，不在前端暴露
- ✅ 强制末尾提示（prompt 模板 + 后端代码双层保证）
- ✅ SSE 流式输出，无长阻塞
- ✅ 错误处理：失败时返回 error 字段，前端降级提示

### 7.5 模型信息
- 模型 ID：`deepseek-v3-2-251201`
- 平台托管，无需用户提供 API Key
- 温度：0.4（专业稳定）

---

## 8. 设计系统

### 8.1 色彩
| Token | 用途 | 值 |
|---|---|---|
| `--color-background` | 页面底色（米白） | `#FAF9F6` |
| `--color-foreground` | 主文字 | `#1C1917` |
| `--color-primary` | 主色（翠绿） | `#059669` |
| `--color-primary-foreground` | 主色上的文字 | `#FFFFFF` |
| `--color-surface` | 卡片底 | `#FFFFFF` |
| `--color-surface-container` | 输入框/容器 | `#F1EFEC` |
| `--color-muted-foreground` | 次要文字 | `#71717A` |
| `--color-outline-variant` | 轻量边框 | `#D6D3D1` |
| `--color-error` | 错误/过敏 | `#EF4444` |
| `--color-primary-container` | 主色容器（头像） | `#D1FAE5` |

### 8.2 字体
- 字体族：`Noto Sans SC`（思源黑体，中文优先）
- 回退栈：`PingFang SC, Hiragino Sans GB, Microsoft YaHei, system-ui`
- 字体源：Google Fonts CN（`fonts.googleapis.cn`）

### 8.3 几何
- 圆角：`0.75rem` (12px)，大卡片用 `1rem` (16px)
- 阴影：3 级（`shadow-card` / `shadow-float` / `shadow-dialog`）
- 间距：基于 4px 倍数

### 8.4 风格意象
> **本草医案 = 中医古籍的现代演绎**
> 米白羊皮纸底 + 翠绿主色 + 墨黑文字，温和、专注、可信赖。

---

## 9. 快速开始

### 9.1 环境要求
- Node.js 24+
- pnpm 9+
- Supabase 账号（已配置）
- Coze 平台 API 凭证（已配置）

### 9.2 启动开发
```bash
cd /workspace/projects
pnpm install
pnpm dev
```
访问 `http://localhost:5000`

### 9.3 项目初始化（已完成）
```bash
# 1. 初始化 Next.js 项目
coze init . --template nextjs

# 2. 同步数据库 Schema
coze-coding-ai db generate-models
coze-coding-ai db upgrade

# 3. 预置 TCM 数据（已通过 exec_sql 完成 525+ 条）
```

---

## 10. 核心命令

```bash
# 开发
pnpm dev                     # 启动 Next.js 开发服务器（HMR）

# 生产
pnpm build                   # 构建生产版本
pnpm start                   # 启动生产服务

# 质量检查
pnpm ts-check                # TypeScript 类型检查
pnpm lint                    # ESLint 检查
```

---

## 11. 编码规范

### 11.1 TypeScript
- ✅ `strict` 模式开启
- ❌ 禁止使用 `any`
- ✅ 所有函数参数标注类型
- ✅ 使用前必须 import

### 11.2 React 组件
- ✅ 服务端组件优先
- ✅ 交互式组件用 `'use client'`
- ❌ 禁止在 JSX 渲染中使用 `typeof window` / `Math.random` / `Date.now`（会触发 Hydration 错误）
- ✅ 动态内容必须在 `useEffect` + `useState` 内访问

### 11.3 命名
- 文件：`kebab-case.tsx` 或 `PascalCase.tsx`
- 组件：`PascalCase`
- 变量/函数：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 数据库字段：`snake_case`

### 11.4 样式
- 使用 Tailwind utility class
- 优先使用 Design Token（`bg-primary` / `text-muted-foreground` 等）
- 避免内联 style
- 圆角统一用 `rounded-md` (12px) / `rounded-xl` (16px)

---

## 12. 安全与隐私

### 12.1 数据隔离
- ✅ 所有业务表带 `clinic_id`（多租户隔离）
- ✅ Supabase RLS 策略强制按 clinic 过滤
- ✅ 前端不直接查询，需通过 API Routes

### 12.2 AI 输出
- ✅ 强制末尾免责声明（双层保证）
- ✅ 提示词模板 + 后端代码段拼接
- ✅ 用户可一键复制 / 编辑后再用

### 12.3 医疗合规
- ⚠️ 医疗免责声明：所有 AI 输出末尾必须包含
  > 【提示】本内容由 AI 生成，仅作为文书整理参考，具体诊断和治疗请遵从执业医师的指导。
- ⚠️ 过敏禁忌：病历详情页和编辑页均红色高亮
- ⚠️ 临床决策权始终在执业医师手中

### 12.4 API Key 管理
- ✅ LLM API Key 由平台托管（不暴露）
- ✅ 用户的 DeepSeek Key 留作他用

---

## 13. 后续路线图

### v0.2.0 — 真实数据接入
- [ ] 真实数据库查询替代 mock 数据
- [ ] 患者列表接 `useEffect + fetch`
- [ ] 病历保存接入 `INSERT INTO medical_records`
- [ ] 时间轴接 `SELECT * FROM medical_records WHERE patient_id = ?`

### v0.3.0 — 用户系统
- [ ] Supabase Auth 多账号登录
- [ ] admin/医师/助理/前台四级权限
- [ ] 邀请码注册
- [ ] 角色权限矩阵

### v0.4.0 — 富媒体
- [ ] 病历照片上传（舌象/面相）到对象存储
- [ ] 图片裁剪 / 标注
- [ ] PDF 导出病历
- [ ] 打印模板

### v0.5.0 — 智能化
- [ ] 复诊提醒定时任务
- [ ] 微信小程序接入（共用 Next.js API Routes）
- [ ] 智能搜索（基于 embedding 的相似病历）
- [ ] 中成药推荐

### v1.0.0 — 商用化
- [ ] 多诊所 SaaS
- [ ] 计费系统
- [ ] 公开 API
- [ ] 数据分析看板

---

## 附录 A · 验证记录

### A.1 静态检查
| 项目 | 结果 |
|---|---|
| `pnpm lint --quiet` | ✅ PASSED |
| `pnpm ts-check` | ✅ PASSED |

### A.2 页面测试（HTTP 状态码）
| 路径 | 状态码 |
|---|---|
| `/` (仪表盘) | 200 |
| `/patients` (列表) | 200 |
| `/patients/p001` (详情) | 200 |
| `/patients/p001/records/new` (病历编辑) | 200 |
| `/account` (账号) | 200 |

### A.3 API 测试
| 端点 | 状态 |
|---|---|
| `GET /api/ai/diagnosis` | ✅ 200（返回模型信息） |
| `POST /api/ai/diagnosis` | ✅ 200（SSE 流式输出真实辨证内容） |

### A.4 日志健康
- ✅ 无任何 error / warn / exception

---

## 附录 B · 致谢

- 🏥 **本草医案** 项目发起人：小龍（用户 95f584）
- 🧠 **AI 辨证**：DeepSeek V3.2（`deepseek-v3-2-251201`）
- ⚙️ **平台**：扣子编程 Vibe Coding
- 🎨 **设计**：本草医案设计团队
- 💊 **数据**：基于《中药学》《针灸学》《中医体质分类与判定》等专业资料

---

> **本草医案** v0.1.0 · 最后更新：2024-12 · Made with ❤️ for 中医传承
