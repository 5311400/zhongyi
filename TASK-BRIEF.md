# 中医诊所网站开发任务书

## 目标
将现有 zhongyi 项目从 Supabase 云端架构改造为纯本地 SQLite 架构，添加新功能。

## 现有项目
路径：`~/zhongyi/`
技术栈：Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
已有功能：首页仪表盘、患者管理、病历编辑、AI辨证（Coze SDK）、远程问诊表单、账号设置

## 改造清单

### Phase 1: 数据库迁移（Supabase → SQLite）
1. 安装依赖：`better-sqlite3` + `@types/better-sqlite3` + `drizzle-orm` + `drizzle-kit`
2. 创建 `src/lib/db/schema.ts` — 定义所有表结构（patients, medical_records, consultation_codes, pending_consultations, billing_records）
3. 创建 `src/lib/db/index.ts` — SQLite 连接初始化 + 自动建表
4. 创建 `src/lib/db/queries.ts` — 所有 CRUD 操作封装
5. 删除所有 Supabase 相关代码（supabase.ts, @supabase/* 导入）
6. 所有页面和 API 路由改用新的 SQLite 查询函数

### Phase 2: AI 接口替换
7. 修改 `src/app/api/ai/diagnosis/route.ts`
8. 从 Coze SDK 改为 fetch 直调 DeepSeek API
9. API 地址：`https://api.deepseek.com/v1/chat/completions`
10. API Key 从环境变量 `DEEPSEEK_API_KEY` 读取
11. 保留流式 SSE 输出（前端不变）
12. 保留免责声明

### Phase 3: 远程问诊验证码系统
13. 新增 API：`/api/consultation/generate-code` — 医生生成验证码
14. 验证码格式：`ZH-` + 4位随机大写字母数字
15. 24小时过期
16. 修改公开问诊页 `/consultation` — 增加验证码校验
17. 提交后存入 pending_consultations 表
18. 新增医生端页面：待审核问诊列表 + 导入/拒绝操作

### Phase 4: 收费记录模块
19. 新增页面 `/billing` — 收费记录列表
20. 新增 API：CRUD 收费记录
21. 分类：中药/针灸/成药
22. 首页仪表盘显示本月收入统计

### Phase 5: 回访提醒动态化
23. 首页仪表盘的 REMINDERS 改为从数据库查询
24. 基于 patients.next_visit_date 计算
25. 过期的标红置顶

### Phase 6: 收尾
26. 确保 `npm run build` 无错误
27. 确保所有功能正常
28. Git commit 所有改动

## 约束
- 不要改 UI 样式（翠绿主题保留）
- 不要加用户登录系统（个人用，简单密码锁即可，暂不实现）
- 所有数据存本地 SQLite 文件
- 环境变量 DEEPSEEK_API_KEY 需要配置
- 先在电脑上开发测试，后续迁移到手机 Termux

## 数据库 Schema

```sql
-- 患者表
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT,
  birth_date TEXT,
  phone TEXT,
  constitution TEXT,
  allergies TEXT,
  chronic_diseases TEXT,
  next_visit_date TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 病历表
CREATE TABLE medical_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  visit_date TEXT NOT NULL,
  visit_type TEXT,
  chief_complaint TEXT,
  tongue TEXT,
  pulse TEXT,
  face TEXT,
  spirit TEXT,
  syndrome_location TEXT,
  syndrome_nature TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescription_items TEXT,
  treatment_items TEXT,
  doctor_advice TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 远程问诊验证码
CREATE TABLE consultation_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  patient_name TEXT,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 待导入问诊
CREATE TABLE pending_consultations (
  id TEXT PRIMARY KEY,
  code_id TEXT REFERENCES consultation_codes(id),
  patient_name TEXT,
  form_data TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 收费记录
CREATE TABLE billing_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```
