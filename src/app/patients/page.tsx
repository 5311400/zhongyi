'use client';

import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import {
  Plus,
  Search,
  Filter,
  Users,
  Phone,
  Calendar,
  ChevronRight,
  Stethoscope,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Patient {
  id: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
  constitution: string;
  lastDiagnosis: string;
  lastVisit: string;
  visitCount: number;
  hasAllergy: boolean;
  allergy: string;
  isNew?: boolean;
  // 扩展字段（新建患者时使用）
  allergies?: string[];
  chronicDiseases?: string[];
  firstVisit?: string;
  note?: string;
}

const PATIENTS: Patient[] = [
  {
    id: 'p001',
    name: '陈秀英',
    gender: '女',
    age: 58,
    phone: '138-0011-2233',
    constitution: '气郁质',
    lastDiagnosis: '肝郁脾虚',
    lastVisit: '2024-12-18',
    visitCount: 12,
    hasAllergy: true,
    allergy: '青霉素',
  },
  {
    id: 'p002',
    name: '刘建国',
    gender: '男',
    age: 45,
    phone: '139-1234-5678',
    constitution: '平和质',
    lastDiagnosis: '风寒感冒',
    lastVisit: '2024-12-17',
    visitCount: 3,
    hasAllergy: false,
    allergy: '',
  },
  {
    id: 'p003',
    name: '张小敏',
    gender: '女',
    age: 32,
    phone: '136-8765-4321',
    constitution: '气虚质',
    lastDiagnosis: '月经不调 · 气血两虚',
    lastVisit: '2024-12-15',
    visitCount: 8,
    hasAllergy: true,
    allergy: '海鲜',
  },
  {
    id: 'p004',
    name: '李子轩',
    gender: '男',
    age: 8,
    phone: '137-2222-8888',
    constitution: '特禀质',
    lastDiagnosis: '小儿疳积 · 脾胃虚弱',
    lastVisit: '2024-12-14',
    visitCount: 5,
    hasAllergy: true,
    allergy: '花粉',
  },
  {
    id: 'p005',
    name: '黄美华',
    gender: '女',
    age: 67,
    phone: '135-0000-1111',
    constitution: '痰湿质',
    lastDiagnosis: '眩晕 · 痰浊中阻',
    lastVisit: '2024-12-13',
    visitCount: 22,
    hasAllergy: false,
    allergy: '',
  },
  {
    id: 'p006',
    name: '赵晓东',
    gender: '男',
    age: 52,
    phone: '188-9999-0000',
    constitution: '湿热质',
    lastDiagnosis: '口苦 · 肝胆湿热',
    lastVisit: '2024-12-10',
    visitCount: 4,
    hasAllergy: false,
    allergy: '',
  },
];

const CONSTITUTION_COLORS: Record<string, string> = {
  平和质: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  气虚质: 'bg-amber-50 text-amber-700 border-amber-200',
  阳虚质: 'bg-orange-50 text-orange-700 border-orange-200',
  阴虚质: 'bg-rose-50 text-rose-700 border-rose-200',
  痰湿质: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  湿热质: 'bg-lime-50 text-lime-700 border-lime-200',
  血瘀质: 'bg-red-50 text-red-700 border-red-200',
  气郁质: 'bg-violet-50 text-violet-700 border-violet-200',
  特禀质: 'bg-sky-50 text-sky-700 border-sky-200',
};

export default function PatientsPage() {
  const [allPatients, setAllPatients] = useState<Patient[]>(PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try {
      const newPatients = JSON.parse(sessionStorage.getItem('newPatients') || '{}');
      const newPatientList: Patient[] = Object.values(newPatients);
      if (newPatientList.length > 0) {
        const merged = [...newPatientList.map(p => ({ ...p, isNew: true })), ...PATIENTS];
        const unique = merged.filter((p, idx, self) => self.findIndex(p2 => p2.id === p.id) === idx);
        setAllPatients(unique);
      }
    } catch (e) {
      console.error('读取新建患者失败:', e);
    }
  }, []);

  const filteredPatients = allPatients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.lastDiagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.constitution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">患者档案</h1>
            <p className="text-sm text-muted-foreground mt-1">
              共 <span className="font-semibold text-foreground">{allPatients.length}</span> 位在管患者
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-surface border border-outline-variant/40 rounded-md text-sm font-medium text-foreground hover:bg-surface-container flex items-center gap-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              筛选
            </button>
            <Link
              href="/patients/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2 shadow-card transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建患者
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 p-4 shadow-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="按姓名、电话、诊断或体质搜索…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-3 bg-surface-container border-none rounded-md text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Patient list */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 shadow-card overflow-hidden">
          <ul className="divide-y divide-outline-variant/30">
            {filteredPatients.map((patient) => (
              <li key={patient.id} className="hover:bg-surface-container/40 transition-colors">
                <div className="flex items-center gap-4 p-4">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center text-base font-bold shrink-0">
                      {patient.name[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-foreground">{patient.name}</h3>
                        {patient.isNew && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded font-medium">
                            新
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {patient.gender} · {patient.age} 岁
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 border rounded font-medium ${
                            CONSTITUTION_COLORS[patient.constitution] ||
                            'bg-surface-container text-muted-foreground border-outline-variant/40'
                          }`}
                        >
                          {patient.constitution}
                        </span>
                        {patient.hasAllergy && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-error/10 text-error border border-error/20 rounded font-medium flex items-center gap-1">
                            <X className="w-2.5 h-2.5" />
                            {patient.allergy}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          {patient.lastDiagnosis}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {patient.phone}
                        </span>
                        <span className="hidden md:flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {patient.lastVisit} · 第 {patient.visitCount} 次
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/patients/${patient.id}/records/new`}
                      className="hidden sm:flex px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-md hover:bg-primary/15 items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      录病历
                    </Link>
                    <Link
                      href={`/patients/${patient.id}`}
                      className="p-1.5 hover:bg-surface-container rounded-md transition-colors"
                      aria-label="查看患者详情"
                    >
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Empty state hint */}
        {filteredPatients.length === 0 && (
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-12 text-center shadow-card">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {allPatients.length === 0 ? '暂无患者档案' : '未找到匹配患者'}
            </h3>
            {allPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-4">创建第一位患者，开启您的中医诊疗档案管理</p>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">请尝试调整搜索条件</p>
            )}
            {allPatients.length === 0 && (
              <Link
                href="/patients/new"
                className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新建患者
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
