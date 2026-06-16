'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import {
  Phone,
  Briefcase,
  Calendar,
  Stethoscope,
  Edit,
  Plus,
  ChevronRight,
  XCircle,
  AlertCircle,
  Printer,
  Download,
  FileText,
  RotateCw,
  Sparkles,
  Pill,
  Activity,
  Save,
  X,
  UserPlus,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
  occupation: string;
  constitution: string;
  allergies: string[];
  chronicDiseases: string[];
  visitCount: number;
  firstVisit: string;
  note?: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  type: '初诊' | '复诊';
  diagnosis: string;
  tongue: string;
  pulse: string;
  prescription: string;
  herbs: { name: string; dose: number }[];
  acupuncture?: string;
  treatments?: { name: string; duration: string }[];
  aiSuggested: boolean;
  createdAt?: string;
}

const PATIENTS: Record<string, Patient> = {
  p001: {
    id: 'p001',
    name: '陈秀英',
    gender: '女',
    age: 58,
    phone: '138-0011-2233',
    occupation: '退休教师',
    constitution: '气郁质',
    allergies: ['青霉素', '磺胺类'],
    chronicDiseases: ['高血压（服药中）', '轻度骨质疏松'],
    visitCount: 12,
    firstVisit: '2024-03-15',
    note: '情志易郁，睡眠偏浅，喜温饮。',
  },
  p002: {
    id: 'p002',
    name: '刘建国',
    gender: '男',
    age: 45,
    phone: '139-1234-5678',
    occupation: '工程师',
    constitution: '平和质',
    allergies: [],
    chronicDiseases: [],
    visitCount: 3,
    firstVisit: '2024-11-20',
    note: '',
  },
  p003: {
    id: 'p003',
    name: '张小敏',
    gender: '女',
    age: 32,
    phone: '136-8765-4321',
    occupation: '护士',
    constitution: '气虚质',
    allergies: ['海鲜'],
    chronicDiseases: [],
    visitCount: 8,
    firstVisit: '2024-06-10',
    note: '易疲劳，月经量少。',
  },
  p004: {
    id: 'p004',
    name: '李子轩',
    gender: '男',
    age: 8,
    phone: '137-2222-8888',
    occupation: '学生',
    constitution: '特禀质',
    allergies: ['花粉'],
    chronicDiseases: [],
    visitCount: 5,
    firstVisit: '2024-09-01',
    note: '过敏性鼻炎。',
  },
  p005: {
    id: 'p005',
    name: '黄美华',
    gender: '女',
    age: 67,
    phone: '135-0000-1111',
    occupation: '退休工人',
    constitution: '痰湿质',
    allergies: [],
    chronicDiseases: ['高血脂'],
    visitCount: 22,
    firstVisit: '2023-12-01',
    note: '体型偏胖，痰多。',
  },
  p006: {
    id: 'p006',
    name: '赵晓东',
    gender: '男',
    age: 52,
    phone: '188-9999-0000',
    occupation: '经理',
    constitution: '湿热质',
    allergies: [],
    chronicDiseases: ['脂肪肝'],
    visitCount: 4,
    firstVisit: '2024-10-15',
    note: '经常应酬，口苦口臭。',
  },
};

const RECORDS: Record<string, MedicalRecord[]> = {
  p001: [
    {
      id: 'r001',
      date: '2024-12-18',
      type: '复诊',
      diagnosis: '肝郁脾虚（缓解）',
      tongue: '舌淡红，苔薄白',
      pulse: '弦细',
      prescription: '逍遥散加减 · 7 剂',
      herbs: [
        { name: '柴胡', dose: 9 },
        { name: '白芍', dose: 12 },
        { name: '当归', dose: 9 },
        { name: '白术', dose: 12 },
        { name: '茯苓', dose: 15 },
        { name: '薄荷', dose: 3 },
        { name: '甘草', dose: 6 },
      ],
      acupuncture: '太冲 · 足三里 · 三阴交 · 期门',
      aiSuggested: true,
    },
    {
      id: 'r002',
      date: '2024-12-04',
      type: '复诊',
      diagnosis: '肝郁脾虚（好转）',
      tongue: '舌淡，苔白腻',
      pulse: '弦',
      prescription: '柴胡疏肝散加减 · 7 剂',
      herbs: [
        { name: '柴胡', dose: 9 },
        { name: '香附', dose: 9 },
        { name: '川芎', dose: 6 },
        { name: '枳壳', dose: 9 },
        { name: '白芍', dose: 12 },
        { name: '甘草', dose: 6 },
      ],
      acupuncture: '期门 · 太冲',
      aiSuggested: false,
    },
    {
      id: 'r003',
      date: '2024-11-20',
      type: '初诊',
      diagnosis: '肝郁脾虚',
      tongue: '舌淡红，苔薄白',
      pulse: '弦细',
      prescription: '逍遥散 · 7 剂',
      herbs: [
        { name: '柴胡', dose: 9 },
        { name: '白芍', dose: 12 },
        { name: '当归', dose: 9 },
        { name: '白术', dose: 12 },
        { name: '茯苓', dose: 15 },
        { name: '薄荷', dose: 3 },
        { name: '甘草', dose: 6 },
      ],
      acupuncture: '太冲 · 足三里 · 三阴交',
      aiSuggested: false,
    },
  ],
  p002: [],
  p003: [],
  p004: [],
  p005: [],
  p006: [],
};

const DEFAULT_PATIENT: Patient = {
  id: '',
  name: '',
  gender: '',
  age: 0,
  phone: '',
  occupation: '',
  constitution: '',
  allergies: [],
  chronicDiseases: [],
  visitCount: 0,
  firstVisit: new Date().toISOString().slice(0, 10),
  note: '',
};

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [editForm, setEditForm] = useState<Patient>(DEFAULT_PATIENT);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    params.then((resolvedParams) => {
      if (!isMounted) return;

      const id = resolvedParams.id;

      try {
        const newPatients = JSON.parse(sessionStorage.getItem('newPatients') || '{}');
        if (newPatients[id]) {
          const newPatientData: Patient = {
            ...DEFAULT_PATIENT,
            ...newPatients[id],
            id,
            allergies: newPatients[id].allergies || [],
            chronicDiseases: newPatients[id].chronicDiseases || [],
            visitCount: newPatients[id].visitCount || 0,
            firstVisit: newPatients[id].firstVisit || new Date().toISOString().slice(0, 10),
          };
          setPatient(newPatientData);
          setIsNewPatient(true);
          return;
        }
      } catch (e) {
        console.error('sessionStorage 读取失败:', e);
      }

      const existingPatient = PATIENTS[id];
      if (existingPatient) {
        setPatient(existingPatient);
      } else {
        setNotFound(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleEdit = () => {
    if (patient) {
      setEditForm({ ...patient });
      setFormError(null);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    setFormError(null);

    if (!editForm.name.trim()) {
      setFormError('姓名为必填项');
      return;
    }

    if (!editForm.phone.trim()) {
      setFormError('联系电话为必填项');
      return;
    }

    setPatient(editForm);

    if (isNewPatient) {
      try {
        const newPatients = JSON.parse(sessionStorage.getItem('newPatients') || '{}');
        newPatients[editForm.id] = editForm;
        sessionStorage.setItem('newPatients', JSON.stringify(newPatients));
      } catch (e) {
        console.error('sessionStorage 保存失败:', e);
        setToast({ type: 'error', message: '保存失败，请重试' });
        return;
      }
    }

    setIsEditing(false);
    setToast({ type: 'success', message: '资料已更新' });
  };

  // 加载 sessionStorage 中的病历记录（按 patientId 过滤）
  const loadSessionRecords = (patientId: string) => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('medical_records') || '[]');
      // 转换数据格式以匹配界面期望的结构
      return stored
        .filter((r: { id: string; patientId: string }) => r.id.startsWith('record_') && r.patientId === patientId)
        .map((r: {
          id: string;
          createdAt: string;
          chiefComplaint: string;
          tongue: string;
          pulse: string;
          herbs: { name: string; dose: string }[];
          acupoints: string[];
          treatments: { name: string; duration: string }[];
          recordType: string;
        }) => ({
          id: r.id,
          date: new Date(r.createdAt).toLocaleDateString('zh-CN'),
          type: r.recordType === 'new' && !r.chiefComplaint.includes('复诊') ? '初诊' as const : '复诊' as const,
          diagnosis: r.chiefComplaint?.split('。')[0] || '诊疗记录',
          tongue: r.tongue || '-',
          pulse: r.pulse || '-',
          prescription: `自定义处方 · ${r.herbs.length} 剂`,
          herbs: r.herbs.map((h: { name: string; dose: string }) => ({
            name: h.name,
            dose: parseFloat(h.dose) || 0,
          })),
          acupuncture: r.acupoints?.join(' · ') || '',
          treatments: r.treatments || [],
          aiSuggested: false,
        }));
    } catch {
      return [];
    }
  };

  const records = useMemo(() => {
    if (!patient) return [];
    const hardcoded = RECORDS[patient.id] || [];
    const sessionRecords = loadSessionRecords(patient.id);
    return [...hardcoded, ...sessionRecords].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b.id.localeCompare(a.id);
    });
  }, [patient]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-error mx-auto mb-3" />
              <h2 className="text-lg font-medium text-foreground mb-1">患者不存在</h2>
              <p className="text-sm text-muted-foreground mb-4">该患者档案可能已被删除或链接错误</p>
              <Link
                href="/patients"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                返回患者列表
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">加载中...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Toast 提示 */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top-2">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {isEditing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between sticky top-0 bg-surface">
              <h2 className="text-lg font-bold text-foreground">编辑患者资料</h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-surface-container rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* 表单错误提示 */}
              {formError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  姓名 <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm({ ...editForm, name: e.target.value });
                    if (formError && e.target.value.trim()) setFormError(null);
                  }}
                  className={`w-full h-10 px-3 bg-surface-container border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    formError && !editForm.name.trim() ? 'border-error' : 'border-outline-variant/30'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  联系电话 <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => {
                    setEditForm({ ...editForm, phone: e.target.value });
                    if (formError && e.target.value.trim()) setFormError(null);
                  }}
                  className={`w-full h-10 px-3 bg-surface-container border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    formError && !editForm.phone.trim() ? 'border-error' : 'border-outline-variant/30'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">职业</label>
                <input
                  type="text"
                  value={editForm.occupation}
                  onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">体质类型</label>
                <select
                  value={editForm.constitution || ''}
                  onChange={(e) => setEditForm({ ...editForm, constitution: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">请选择体质</option>
                  <option value="平和质">平和质</option>
                  <option value="气虚质">气虚质</option>
                  <option value="阳虚质">阳虚质</option>
                  <option value="阴虚质">阴虚质</option>
                  <option value="痰湿质">痰湿质</option>
                  <option value="湿热质">湿热质</option>
                  <option value="血瘀质">血瘀质</option>
                  <option value="气郁质">气郁质</option>
                  <option value="特禀质">特禀质</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">过敏史</label>
                <input
                  type="text"
                  value={editForm.allergies?.join('、') || ''}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    allergies: e.target.value.split('、').filter(Boolean),
                  })}
                  placeholder="多个过敏原用顿号分隔"
                  className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">既往病史</label>
                <input
                  type="text"
                  value={editForm.chronicDiseases?.join('、') || ''}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    chronicDiseases: e.target.value.split('、').filter(Boolean),
                  })}
                  placeholder="多个病史用顿号分隔"
                  className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 border border-outline-variant/40 text-foreground rounded-md text-sm font-medium hover:bg-surface-container transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <nav className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Link href="/patients" className="hover:text-foreground transition-colors">
            患者
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">{patient.name}</span>
          {isNewPatient && (
            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded">
              新建
            </span>
          )}
        </nav>

        <section className="bg-surface rounded-xl border border-outline-variant/30 p-6 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary-container text-primary flex items-center justify-center text-3xl font-bold shrink-0">
              {patient.name?.[0] || '?'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
                <span className="text-sm text-muted-foreground">
                  {patient.gender} · {patient.age} 岁
                </span>
                {patient.constitution && (
                  <span className="text-[11px] px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded font-medium">
                    {patient.constitution}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-foreground">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="text-foreground">{patient.occupation}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-foreground">初诊 {patient.firstVisit}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span className="text-foreground">累计 {patient.visitCount} 次</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                type="button"
                onClick={handleEdit}
                className="px-4 py-2 bg-surface-container border border-outline-variant/40 rounded-md text-sm font-medium text-foreground hover:bg-surface-container/70 flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                编辑资料
              </button>
              <Link
                href={`/patients/${patient.id}/records/new`}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2 shadow-card transition-colors"
              >
                <Plus className="w-4 h-4" />
                录入新病历
              </Link>
            </div>
          </div>

          {(patient.allergies?.length > 0 || patient.chronicDiseases?.length > 0) && (
            <div className="mt-4 pt-4 border-t border-outline-variant/30 grid sm:grid-cols-2 gap-3">
              {patient.allergies?.length > 0 && (
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-error mb-1">医疗禁忌</div>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.allergies.map((a: string) => (
                        <span
                          key={a}
                          className="text-[11px] px-1.5 py-0.5 bg-error/10 text-error border border-error/20 rounded font-medium"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {patient.chronicDiseases.length > 0 && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-amber-700 mb-1">既往病史</div>
                    <div className="text-xs text-foreground">
                      {patient.chronicDiseases.join(' · ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {isNewPatient ? (
          <section className="bg-surface rounded-xl border border-outline-variant/30 shadow-card p-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <h2 className="text-lg font-medium text-foreground mb-1">暂无诊疗记录</h2>
              <p className="text-sm text-muted-foreground mb-4">这是新建的患者档案，还没有诊疗记录</p>
              <Link
                href={`/patients/${patient.id}/records/new`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                录入首诊病历
              </Link>
            </div>
          </section>
        ) : records.length === 0 ? (
          <section className="bg-surface rounded-xl border border-outline-variant/30 shadow-card p-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <h2 className="text-lg font-medium text-foreground mb-1">暂无诊疗记录</h2>
              <p className="text-sm text-muted-foreground mb-4">该患者还没有诊疗记录</p>
              <Link
                href={`/patients/${patient.id}/records/new`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                录入首诊病历
              </Link>
            </div>
          </section>
        ) : (
          <section className="bg-surface rounded-xl border border-outline-variant/30 shadow-card">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/30">
              <div>
                <h2 className="text-base font-bold text-foreground">诊疗时间轴</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  从 {patient.firstVisit} 至今，共 {records.length} 次诊疗记录
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="打印功能开发中"
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground/50 hover:bg-surface-container rounded-md flex items-center gap-1.5 transition-colors cursor-not-allowed"
                >
                  <Printer className="w-3.5 h-3.5" />
                  打印
                </button>
                <button
                  type="button"
                  aria-label="导出功能开发中"
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground/50 hover:bg-surface-container rounded-md flex items-center gap-1.5 transition-colors cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" />
                  导出
                </button>
              </div>
            </div>

            <div className="p-6">
              <ol className="relative space-y-6">
                {records.map((record, idx) => (
                  <li key={record.id} className="relative pl-10">
                    {idx !== records.length - 1 && (
                      <span className="absolute left-[15px] top-8 bottom-[-1.5rem] w-px bg-outline-variant" />
                    )}

                    <div
                      className={
                        record.type === '初诊'
                          ? 'absolute left-0 top-1.5 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-card'
                          : 'absolute left-0 top-1.5 w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center'
                      }
                    >
                      {record.type === '初诊' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <RotateCw className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="bg-surface-container/40 rounded-lg border border-outline-variant/30 p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-foreground">{record.date}</span>
                        <span
                          className={
                            record.type === '初诊'
                              ? 'text-[10px] px-1.5 py-0.5 bg-primary/15 text-primary rounded font-medium'
                              : 'text-[10px] px-1.5 py-0.5 bg-surface-container text-muted-foreground rounded font-medium border border-outline-variant/40'
                          }
                        >
                          {record.type}
                        </span>
                        <span className="text-sm font-medium text-foreground">{record.diagnosis}</span>
                        {record.aiSuggested && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded font-medium flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI 参考
                          </span>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-3">
                        <div>
                          <span className="text-muted-foreground">舌象：</span>
                          <span className="text-foreground">{record.tongue}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">脉象：</span>
                          <span className="text-foreground">{record.pulse}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-outline-variant/30">
                        <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-primary" />
                          中药处方 · {record.prescription}
                          <span className="text-muted-foreground font-normal">· 共 {record.herbs.length} 味</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                          {record.herbs.map((h) => (
                            <div
                              key={h.name}
                              className="text-xs bg-surface px-2 py-1 rounded border border-outline-variant/30 flex items-center justify-between"
                            >
                              <span className="text-foreground">{h.name}</span>
                              <span className="text-muted-foreground font-mono">{h.dose}g</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {record.acupuncture && (
                        <div className="mt-3 pt-3 border-t border-outline-variant/30">
                          <div className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-primary" />
                            针灸处方
                          </div>
                          <div className="text-xs text-foreground">{record.acupuncture}</div>
                        </div>
                      )}

                      {record.treatments && record.treatments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-outline-variant/30">
                          <div className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            中医外治
                          </div>
                          <div className="text-xs text-foreground">
                            {record.treatments.map((t: { name: string; duration: string }) => `${t.name}（${t.duration}）`).join('、')}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
