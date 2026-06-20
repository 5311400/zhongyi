'use client';

import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { Plus, Search, Users, Phone, Calendar, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Patient {
  id: string; name: string; gender: string; birth_date: string; phone: string;
  constitution: string; allergies: string; chronic_diseases: string;
  next_visit_date: string; visit_count?: number; last_visit?: string;
}

function calcAge(birthDate: string | null): string {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  return `${age}岁`;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (q?: string) => {
    setLoading(true);
    try {
      const url = q ? `/api/patients?q=${encodeURIComponent(q)}` : '/api/patients';
      const res = await fetch(url);
      const data = await res.json();
      setPatients(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { fetchPatients(search); };

  const constitutionColors: Record<string, string> = {
    '气郁质': 'bg-purple-100 text-purple-700',
    '平和质': 'bg-emerald-100 text-emerald-700',
    '气虚质': 'bg-amber-100 text-amber-700',
    '特禀质': 'bg-red-100 text-red-700',
    '痰湿质': 'bg-blue-100 text-blue-700',
    '阳虚质': 'bg-orange-100 text-orange-700',
    '阴虚质': 'bg-pink-100 text-pink-700',
    '血瘀质': 'bg-rose-100 text-rose-700',
    '湿热质': 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> 患者管理</h1>
          <Link href="/patients/new">
            <Button><Plus className="w-4 h-4 mr-2" /> 新建患者</Button>
          </Link>
        </div>

        {/* 搜索 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="搜索患者姓名、电话、体质..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          <Button variant="outline" onClick={handleSearch}>搜索</Button>
        </div>

        {/* 统计 */}
        <p className="text-sm text-muted-foreground">共 {patients.length} 位患者</p>

        {/* 列表 */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{search ? '未找到匹配的患者' : '暂无患者，点击右上角添加'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {patients.map(p => {
              let allergies: string[] = [];
              try { allergies = JSON.parse(p.allergies || '[]'); } catch {}
              return (
                <Link key={p.id} href={`/patients/${p.id}`} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {p.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        {p.constitution && <span className={`text-xs px-2 py-0.5 rounded-full ${constitutionColors[p.constitution] || 'bg-gray-100 text-gray-600'}`}>{p.constitution}</span>}
                        {allergies.length > 0 && <Badge variant="outline" className="text-xs">过敏</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {p.gender && <span>{p.gender}</span>}
                        {p.birth_date && <span>{calcAge(p.birth_date)}</span>}
                        {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    {p.next_visit_date && (
                      <div className="text-xs">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        <span className={p.next_visit_date < new Date().toISOString().slice(0, 10) ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          {p.next_visit_date}
                        </span>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
