'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';

interface BillingRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  type: string;
  amount: number;
  date: string;
  notes: string;
}

interface Stats {
  type: string;
  count: number;
  total: number;
}

export default function BillingPage() {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm] = useState({ patient_id: '', type: '中药', amount: '', date: new Date().toISOString().slice(0, 10), notes: '' });

  useEffect(() => {
    fetch('/api/billing').then(r => r.json()).then(d => { setRecords(d.records || []); setStats(d.stats || []); });
    fetch('/api/patients').then(r => r.json()).then(d => setPatients(d || []));
  }, []);

  const handleSubmit = async () => {
    if (!form.patient_id || !form.amount) return;
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    if (res.ok) {
      const d = await res.json();
      setRecords(prev => [d, ...prev]);
      setShowForm(false);
      setForm({ patient_id: '', type: '中药', amount: '', date: new Date().toISOString().slice(0, 10), notes: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return;
    await fetch(`/api/billing?id=${id}`, { method: 'DELETE' });
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const totalMonth = stats.reduce((s, i) => s + (i.total || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">收费记录</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" /> 新增收费
          </Button>
        </div>

        {/* 本月统计 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-bold">¥{totalMonth.toFixed(0)}</p><p className="text-xs text-muted-foreground">本月总计</p></div>
          </CardContent></Card>
          {stats.map(s => (
            <Card key={s.type}><CardContent className="p-4">
              <p className="text-lg font-bold">¥{(s.total || 0).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">{s.type}（{s.count}笔）</p>
            </CardContent></Card>
          ))}
        </div>

        {/* 新增表单 */}
        {showForm && (
          <Card>
            <CardHeader><CardTitle className="text-base">新增收费</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">患者</label>
                  <Select value={form.patient_id} onValueChange={v => setForm(f => ({ ...f, patient_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="选择患者" /></SelectTrigger>
                    <SelectContent>{patients.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">类型</label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="中药">中药</SelectItem>
                      <SelectItem value="针灸">针灸</SelectItem>
                      <SelectItem value="成药">成药</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">金额（元）</label>
                  <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium">日期</label>
                  <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">备注</label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="可选" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit}>保存</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>取消</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 记录列表 */}
        <Card>
          <CardHeader><CardTitle className="text-base">全部记录</CardTitle></CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">暂无收费记录</p>
            ) : (
              <div className="space-y-2">
                {records.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant={r.type === '中药' ? 'default' : r.type === '针灸' ? 'secondary' : 'outline'}>{r.type}</Badge>
                      <div>
                        <p className="font-medium text-sm">{r.patient_name || '未知患者'}</p>
                        <p className="text-xs text-muted-foreground">{r.date}{r.notes ? ` · ${r.notes}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-emerald-600">¥{r.amount.toFixed(2)}</span>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
