import Link from 'next/link';
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
} from 'lucide-react';

const RECORDS = [
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
];

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = {
    id,
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
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <nav className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Link href="/patients" className="hover:text-foreground transition-colors">
            患者
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">{patient.name}</span>
        </nav>

        <section className="bg-surface rounded-xl border border-outline-variant/30 p-6 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary-container text-primary flex items-center justify-center text-3xl font-bold shrink-0">
              {patient.name[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
                <span className="text-sm text-muted-foreground">
                  {patient.gender} · {patient.age} 岁
                </span>
                <span className="text-[11px] px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded font-medium">
                  {patient.constitution}
                </span>
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

          {(patient.allergies.length > 0 || patient.chronicDiseases.length > 0) && (
            <div className="mt-4 pt-4 border-t border-outline-variant/30 grid sm:grid-cols-2 gap-3">
              {patient.allergies.length > 0 && (
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-error mb-1">医疗禁忌</div>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.allergies.map((a) => (
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

        <section className="bg-surface rounded-xl border border-outline-variant/30 shadow-card">
          <div className="flex items-center justify-between p-5 border-b border-outline-variant/30">
            <div>
              <h2 className="text-base font-bold text-foreground">诊疗时间轴</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                从 {patient.firstVisit} 至今，共 {RECORDS.length} 次诊疗记录
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-container rounded-md flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                打印
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-container rounded-md flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                导出
              </button>
            </div>
          </div>

          <div className="p-6">
            <ol className="relative space-y-6">
              {RECORDS.map((record, idx) => (
                <li key={record.id} className="relative pl-10">
                  {idx !== RECORDS.length - 1 && (
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
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}
