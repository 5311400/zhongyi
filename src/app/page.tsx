import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import {
  Users, FileText, Calendar, TrendingUp, ArrowRight, Sparkles,
  Leaf, AlertCircle, Clock, ChevronRight, Stethoscope,
} from 'lucide-react';
import { getStats, getRecentPatients, getTodayReminders } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const stats = getStats();
  const recentPatients = getRecentPatients(5);
  const reminders = getTodayReminders();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero */}
        <section className="bg-surface rounded-xl border border-outline-variant/30 p-6 lg:p-8 shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                医生，您好 ☀️
              </h1>
              <p className="text-muted-foreground">
                您今日有 <span className="font-semibold text-primary">{stats.pendingVisits} 位患者</span>需复诊提醒，
                {stats.pendingConsultations > 0 && <span className="font-semibold text-amber-600"> {stats.pendingConsultations} 条待审核问诊</span>}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/patients/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                <Stethoscope className="w-4 h-4" /> 新建患者
              </Link>
              <Link href="/patients" className="inline-flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 统计卡片 */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPatients}</p>
                  <p className="text-xs text-muted-foreground">在管患者</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.monthlyRecords}</p>
                  <p className="text-xs text-muted-foreground">本月病历</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg"><Calendar className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingVisits}</p>
                  <p className="text-xs text-muted-foreground">待复诊</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                <div>
                  <p className="text-2xl font-bold">¥{stats.monthlyBilling.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">本月收入</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 回访提醒 */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> 回访提醒
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无回访提醒</p>
              ) : reminders.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.next_visit_date}</p>
                  </div>
                  <Badge variant={r.priority === 'overdue' ? 'destructive' : r.priority === 'today' ? 'default' : 'secondary'}>
                    {r.priority === 'overdue' ? '已过期' : r.priority === 'today' ? '今日' : '即将'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 最近接诊 */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">最近接诊</CardTitle>
                <Link href="/patients" className="text-sm text-primary hover:underline">查看全部</Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPatients.map((p: any) => (
                  <Link key={p.id} href={`/patients/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.gender} · {p.constitution || '未辨体质'} · 就诊{p.visit_count || 0}次
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{p.last_visit || '无记录'}</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                    </div>
                  </Link>
                ))}
                {recentPatients.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">暂无患者数据</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
