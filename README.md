# 📜 本草医案

> **本草医案** — 面向个人中医诊所的本地化诊疗档案管理系统
> 版本：v1.0.0

---

## 核心功能

- **患者管理** — 患者档案、体质辨识、过敏/慢病记录、搜索筛选
- **病历编辑** — 主诉、舌象、脉象、面象、辨证、处方、医嘱
- **AI 辨证** — DeepSeek API 辅助辨证分析（流式输出）
- **远程问诊** — 验证码机制：医生生成码→患者填表→医生审核导入
- **收费记录** — 中药/针灸/成药分类记账，月度统计
- **回访提醒** — 基于复诊日期自动计算，过期标红置顶
- **PWA 支持** — 可添加到手机桌面像 APP 一样使用

---

## 技术栈

- **前端**：Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **数据库**：SQLite（better-sqlite3）— 全本地存储，零依赖云服务
- **AI**：DeepSeek API（流式 SSE）
- **部署**：Node.js 本地服务器 + Tailscale 内网穿透

---

## 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 9

### 安装

```bash
git clone https://github.com/5311400/zhongyi.git
cd zhongyi
pnpm install
```

### 配置

创建 `.env.local`：
```bash
DEEPSEEK_API_KEY=your_api_key_here
```

### 初始化数据库

```bash
npx tsx scripts/seed.ts
```

### 运行

```bash
# 开发模式
pnpm dev

# 生产构建
pnpm build
pnpm start
```

访问 `http://localhost:3000`

---

## 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 仪表盘（统计+回访提醒+最近接诊） |
| `/patients` | 患者列表 |
| `/patients/new` | 新建患者 |
| `/patients/[id]` | 患者详情 |
| `/patients/[id]/records/new` | 新建病历 |
| `/billing` | 收费记录 |
| `/consultation` | 远程问诊（患者端） |
| `/consultation/manage` | 问诊管理（医生端） |
| `/account` | 账号设置 |

---

## API 路由

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/patients` | GET/POST | 患者列表/新建 |
| `/api/patients/[id]` | GET/PUT/DELETE | 患者详情/更新/删除 |
| `/api/records` | GET/POST | 病历列表/新建 |
| `/api/billing` | GET/POST/DELETE | 收费记录 |
| `/api/ai/diagnosis` | POST | AI 辨证（SSE） |
| `/api/consultation/codes` | GET/POST | 问诊验证码 |
| `/api/consultation/submit` | GET/POST/PUT | 问诊提交/审核 |

---

## 数据库

SQLite，数据文件：`data/clinic.db`

**表结构**：
- `patients` — 患者信息
- `medical_records` — 病历记录
- `consultation_codes` — 问诊验证码
- `pending_consultations` — 待审核问诊
- `billing_records` — 收费记录

---

## 远程问诊流程

1. 医生在 `/consultation/manage` 生成验证码（ZH-XXXX，24小时有效）
2. 将验证码发给患者
3. 患者在 `/consultation` 输入验证码，填写问诊表单
4. 医生审核问诊，点击"导入"自动创建患者档案

---

## 部署到手机（Termux）

```bash
# 安装 Termux 后
pkg install nodejs-lts git
git clone https://github.com/5311400/zhongyi.git
cd zhongyi
pnpm install
echo "DEEPSEEK_API_KEY=your_key" > .env.local
npx tsx scripts/seed.ts
pnpm build
pnpm start
```

通过 Tailscale 分配的 IP 访问：`http://100.x.x.x:3000`

---

## 更新日志

### v1.0.0 (2026-06-21)
- 🔥 **架构重构**：从 Supabase 迁移到本地 SQLite
- 🤖 **AI 升级**：从 Coze SDK 改为 DeepSeek API 直调
- 📋 **远程问诊**：新增验证码机制 + 医生审核流程
- 💰 **收费记录**：中药/针灸/成药分类记账
- ⏰ **回访提醒**：基于真实数据动态计算
- 📱 **PWA**：支持添加到手机桌面
- 🏠 **全本地化**：数据全部存在本地，零云服务依赖

### v0.6.8 (之前)
- 扣子编程 Vibe Coding 初始版本
- Supabase 云端数据库
- Coze SDK AI 辨证

---

## 许可证

MIT
