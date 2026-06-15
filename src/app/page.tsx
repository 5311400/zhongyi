import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Leaf,
  AlertCircle,
  Clock,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';

// 临时 mock 数据（待 API 接入真实数据库）
const RECENT_PATIENTS = [
  { id: 'p001', name: '陈秀英', age: 58, gender: '女', lastVisit: '2 天前', diagnosis: '肝郁脾虚', constitution: '气郁质' },
  { id: 'p002', name: '刘建国', age: 45, gender: '男', lastVisit: '3 天前', diagnosis: '风寒感冒', constitution: '平和质' },
  { id: 'id003', name: '张小敏', age: 32, gender: '女', lastVisit: '5 天前', diagnosis: '月经不调', constitution: '气虚质' },
  { id: 'p004', name: '李子轩', age: 8, gender: '男', lastVisit: '1 周前', diagnosis: '脾胃虚弱', constitution: '特禀质' },
  { id: 'p005', name: '黄美华', age: 67, gender: '女', lastVisit: '1 周前', diagnosis: '高血压', constitution: '痰湿质' },
];

const REMINDERS = [
  { id: 'r001', patientName: '陈秀英', type: '复诊', due: '今日', priority: 'high' },
  { id: 'r002', patientName: '刘建国', type: '复诊', due: '明日', priority: 'medium' },
  { id: 'r003', patientName: '赵晓东', type: '复诊', due: '3 天后', priority: 'low' },
];

const STATS = [
  { label: '在管患者', value: '128', change: '本周 +6', icon: Users, color: 'text-primary' },
  { label: '本月病历', value: '47', change: '较上月 +12', icon: FileText, color: 'text-blue-600' },
  { label: '待复诊', value: '12', change: '今日 2', icon: Calendar, color: 'text-amber-600' },
  { label: 'AI 辨证调用', value: '36', change: '本月', icon: Sparkles, color: 'text-violet-600' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero / Greeting */}
        <section className="bg-surface rounded-xl border border-outline-variant/30 p-6 lg:p-8 shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                王医生，早上好 ☀️
              </h1>
              <p className="text-muted-foreground">
                您今日有 <span className="font-semibold text-primary">2 位患者</span> 需复诊提醒，5 位新患者待首诊。
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/patients/new"
                className="px-5 py-2.5 bg-surface-container border border-outline-variant/40 rounded-md text-sm font-medium text-foreground hover:bg-surface-container/70 flex items-center gap-2 transition-colors"
              >
                <Users className="w-4 h-4" />
                新建患者档案
              </Link>
              <Link
                href="/patients"
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2 shadow-card transition-colors"
              >
                <FileText className="w-4 h-4" />
                录入病历
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-surface rounded-xl border border-outline-variant/30 p-5 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</div>
                <div className="text-xs text-muted-foreground mb-2">{stat.label}</div>
                <div className="text-xs text-primary font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
            );
          })}
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent patients */}
          <section className="lg:col-span-2 bg-surface rounded-xl border border-outline-variant/30 shadow-card">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/30">
              <div>
                <h2 className="text-base font-bold text-foreground">最近接诊患者</h2>
                <p className="text-xs text-muted-foreground mt-0.5">点击查看完整时间轴与复诊记录</p>
              </div>
              <Link
                href="/patients"
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
              >
                查看全部
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <ul className="divide-y divide-outline-variant/30">
              {RECENT_PATIENTS.map((patient) => (
                <li key={patient.id}>
                  <Link
                    href={`/patients/${patient.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-surface-container/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {patient.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-foreground">{patient.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {patient.gender} · {patient.age} 岁
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>本次：{patient.diagnosis}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span>{patient.constitution}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground hidden sm:block">{patient.lastVisit}</div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Reminders */}
          <section className="bg-surface rounded-xl border border-outline-variant/30 shadow-card">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/30">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  待办提醒
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">近期复诊与治疗跟进</p>
              </div>
            </div>
            <ul className="divide-y divide-outline-variant/30">
              {REMINDERS.map((reminder) => {
                const isHigh = reminder.priority === 'high';
                return (
                  <li key={reminder.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={
                          isHigh
                            ? 'w-2 h-2 rounded-full bg-error mt-1.5 shrink-0'
                            : 'w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0'
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm mb-0.5">
                          {reminder.patientName} · {reminder.type}
                        </div>
                        <div className="text-xs text-muted-foreground">{reminder.due}</div>
                      </div>
                    </div>
                  </li>
                );
              })}
              <li className="p-4 bg-surface-container/30">
                <button
                  type="button"
                  className="w-full text-sm text-primary font-medium hover:underline flex items-center justify-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  查看所有提醒
                </button>
              </li>
            </ul>
          </section>
        </div>

        {/* AI Banner */}
        <section className="bg-gradient-to-br from-primary/5 via-primary/8 to-primary/12 border border-primary/20 rounded-xl p-6 lg:p-8 shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground mb-1.5 flex items-center gap-2">
                AI 智能辨证 · DeepSeek V3.2
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/15 text-primary rounded font-medium">
                  BETA
                </span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                完成病历录入后，一键调用 DeepSeek 大模型，基于四诊信息给出
                <span className="font-medium text-foreground"> 辨证建议 + 参考药方 + 针灸穴位方</span>，
                辅助医师临床决策。所有 AI 输出均明确标注「仅供参考」。
              </p>
            </div>
            <Link
              href="/patients/p001/records/new"
              className="px-5 py-2.5 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 flex items-center gap-2 shadow-card transition-colors shrink-0"
            >
              <Stethoscope className="w-4 h-4" />
              体验 AI 辨证
            </Link>
          </div>
        </section>

        {/* Footer note */}
        <footer className="text-center text-xs text-muted-foreground pt-4 pb-2">
          <div className="flex items-center justify-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-primary" />
            <span>本草医案 · 中医诊所档案管理系统 v0.1.0</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
