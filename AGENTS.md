# AGENTS.md

## 项目概览

**本草医案** — 面向个人中医诊所和中医爱好者的诊疗档案管理系统。

- **业务定位**：记录脉象、舌象、面相等中医特色诊断信息，支持结构化中药处方、针灸推拿等外治方案，AI 智能辨证参考
- **目标用户**：个人诊所医师、中医爱好者、医师助理
- **核心场景**：日常接诊、复诊跟进、AI 辨证参考
- **关联品牌**：本草医案 / Bencao Clinic

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5 (strict)
- **UI 组件**: Tailwind CSS 4 + shadcn/ui 风格（已迁移到 `globals.css` 的 `@theme`）
- **数据库**: Supabase (PostgreSQL) + Drizzle ORM
- **LLM 集成**: coze-coding-dev-sdk 的 `LLMClient.stream()`，模型 `deepseek-v3-2-251201`
- **设计风格**: 翠绿主色（`#059669`）+ 米白底（`#FAF9F6`）+ Noto Sans SC

## 项目结构

```
.
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh
│   ├── dev.sh
│   ├── prepare.sh
│   └── start.sh
├── src/
│   ├── app/
│   │   ├── globals.css             # Design Token（emerald + 米白 + 圆角 12px）
│   │   ├── layout.tsx              # Root layout（中文 lang + 本草医案品牌）
│   │   ├── page.tsx                # 仪表盘（统计 + 最近患者 + 待办 + AI Banner）
│   │   ├── patients/
│   │   │   ├── page.tsx            # 患者列表（搜索 + 卡片）
│   │   │   ├── [id]/page.tsx       # 患者详情（基本信息 + 时间轴 + 处方）
│   │   │   └── [id]/records/new/page.tsx  # 病历编辑（11 个 section + AI 入口）
│   │   ├── account/page.tsx        # 账号设置（个人/诊所/通知/安全）
│   │   └── api/ai/diagnosis/route.ts  # DeepSeek 流式 API（SSE）
│   ├── components/
│   │   ├── app-header.tsx          # 共享顶部导航
│   │   └── ui/                     # shadcn/ui 组件
│   ├── hooks/
│   ├── lib/
│   │   ├── utils.ts                # cn 工具
│   │   └── supabase.ts             # Supabase 客户端
│   └── server.ts                   # 自定义服务端入口
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 核心命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm ts-check

# Lint
pnpm lint
```

## 数据库 Schema（Supabase）

7 张表，通过 `coze-coding-ai db generate-models` 同步到 `src/storage/database/shared/schema.ts`：

1. `clinics` - 诊所
2. `clinic_members` - 成员（关联 auth.users）
3. `patients` - 患者
4. `medical_records` - 病历
5. `prescription_items` - 处方药材
6. `treatment_items` - 治疗（针灸+外治）
7. `tcm_options` - TCM 选项库（已预置 525+ 条：中药 258 / 穴位 88 / 体质 9 / 证型 30+ / 问诊 67）

## AI 辨证 API

**端点**: `POST /api/ai/diagnosis`
**模型**: `deepseek-v3-2-251201`（平台托管，无需用户提供 API Key）
**协议**: SSE 流式输出
**强制末尾提示**: 双层保证 — prompt 模板中显式声明 + 后端代码末尾再次拼接

**前端调用**: `record-edit` 页面底部"AI 智能辨证"section，使用 `fetch().body.getReader()` 增量渲染。

## 页面清单

| 路径 | 组件 | 功能 |
|---|---|---|
| `/` | `app/page.tsx` | 仪表盘：4 个统计卡片 + 最近患者 + 待办提醒 + AI Banner |
| `/patients` | `app/patients/page.tsx` | 患者列表：搜索 + 体质色卡 + 过敏标签 + 快捷录病历 |
| `/patients/[id]` | `app/patients/[id]/page.tsx` | 患者详情：基本信息 + 病历时间轴（初诊/复诊区分） |
| `/patients/[id]/records/new` | `app/patients/[id]/records/new/page.tsx` | 病历编辑：11 个 section + AI 流式辨证 |
| `/account` | `app/account/page.tsx` | 账号设置：4 个卡片（个人/诊所/通知/安全） |

## 编码规范

- TypeScript `strict` 模式开启，禁止 `any`
- 所有 React 组件使用 'use client' 仅在需要交互时（病历编辑页、AI 入口）
- 服务端组件优先，能用 RSC 的不要用 Client Component
- Hydration 安全：动态数据（Date.now / Math.random）必须在 useEffect 内访问

## 常见任务

### 添加新页面

1. 在 `src/app/` 下创建文件夹
2. 创建 `page.tsx`（如需交互则加 `'use client'`）
3. 引入 `<AppHeader />` 共享导航
4. 复用 Design Token（`bg-surface` / `text-foreground` / `border-outline-variant/30` 等）

### 添加新 API 路由

1. 在 `src/app/api/[name]/route.ts` 创建
2. 导出 `POST` / `GET` 等方法
3. 鉴权：从 `headers['x-session']` 取 token，调 Supabase 校验
4. 流式响应：构造 `ReadableStream` + `Content-Type: text/event-stream`

### 接入新的 TCM 选项

1. 在 Supabase 的 `tcm_options` 表 `INSERT`（参考 `tmp/seed_full.sql`）
2. 前端用 `SELECT * FROM tcm_options WHERE category = 'xxx'` 动态拉取
3. 当前页面用静态数组作为 mock，后续可替换为 API

## 安全与隐私

- **AI API Key 不在前端暴露**：DeepSeek 调用走 Next.js API Route，使用平台托管
- **多租户隔离**：所有表带 `clinic_id`，RLS 策略强制按 clinic 过滤
- **医疗免责声明**：AI 输出末尾必须包含 `【提示】本内容由 AI 生成，仅作为文书整理参考，具体诊断和治疗请遵从执业医师的指导。`（双层保证）
- **过敏禁忌**：病历详情页和编辑页均高亮显示

## 部署

- 平台：扣子编程 Vibe Coding（云端沙箱）
- 预览端口：5000（主仓）
- 部署命令：`coze dev` 启动预览，`coze build` 构建生产版本
- 域名：沙箱自动分配 `https://*.coze.site`

## 后续优化

- [ ] 真实数据库查询替代 mock 数据
- [ ] Supabase Auth 多账号登录（admin/医师/助理/前台）
- [ ] 病历照片上传（舌象/面相）到对象存储
- [ ] 病历打印/导出 PDF
- [ ] 复诊提醒定时任务
- [ ] 微信小程序接入（共用 Next.js API Routes）
