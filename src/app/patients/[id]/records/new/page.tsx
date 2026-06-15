'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ChevronRight,
  Plus,
  X,
  Sparkles,
  Save,
  Stethoscope,
  Pill,
  Activity,
  User,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';

// 体质 chip（预置数据，与数据库 tcm_options 同源）
const CONSTITUTIONS = [
  '平和质', '气虚质', '阳虚质', '阴虚质', '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质',
];
const PULSES = ['浮', '沉', '迟', '数', '虚', '实', '滑', '涩', '弦', '紧', '缓', '细', '弱', '洪', '细数'];
const TONGUE_COLORS = ['淡红', '淡白', '红', '绛', '紫', '暗'];
const TONGUE_SHAPES = ['胖大', '瘦薄', '齿痕', '裂纹', '芒刺', '瘀斑'];
const COAT_COLORS = ['白', '黄', '灰', '黑'];
const COAT_TEXTURES = ['薄', '厚', '腻', '腐', '燥', '润', '剥'];
const FACE_COLORS = ['常色', '潮红', '苍白', '萎黄', '晦暗', '青紫'];
const EXPRESSIONS = ['得神', '少神', '失神', '神疲', '神昏'];
const SYNDROME_LOCATIONS = ['肝', '心', '脾', '肺', '肾', '胆', '胃', '大肠', '小肠', '膀胱', '心包', '上焦', '中焦', '下焦'];
const SYNDROME_NATURES = ['气虚', '血虚', '阴虚', '阳虚', '气滞', '血瘀', '痰湿', '湿热', '寒凝', '热盛'];
const COMMON_HERBS = [
  { name: '柴胡', dose: 9 },
  { name: '白芍', dose: 12 },
  { name: '当归', dose: 9 },
  { name: '白术', dose: 12 },
  { name: '茯苓', dose: 15 },
  { name: '薄荷', dose: 3 },
  { name: '甘草', dose: 6 },
  { name: '香附', dose: 9 },
  { name: '川芎', dose: 6 },
  { name: '枳壳', dose: 9 },
  { name: '陈皮', dose: 9 },
  { name: '半夏', dose: 9 },
];
const COMMON_ACUPOINTS = ['太冲', '足三里', '三阴交', '期门', '合谷', '内关', '太溪', '阴陵泉', '阳陵泉', '百会', '神门', '中脘'];
const TREATMENTS = ['普通针刺', '温针灸', '电针', '艾灸', '拔罐', '刺络放血', '推拿', '刮痧', '穴位埋线', '耳穴'];

type Herb = { name: string; dose: number };
type DiagnosisResult = { loading: boolean; result: string };

export default function RecordEditPage({ params }: { params: Promise<{ id: string }> }) {
  // 简化：直接用静态患者信息
  const patient = { id: 'p001', name: '陈秀英', age: 58, gender: '女' };

  // 状态
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [allergies, setAllergies] = useState<string[]>(['青霉素']);
  const [newAllergy, setNewAllergy] = useState('');

  const [pulses, setPulses] = useState<string[]>([]);
  const [tongueColor, setTongueColor] = useState<string[]>([]);
  const [tongueShape, setTongueShape] = useState<string[]>([]);
  const [coatColor, setCoatColor] = useState<string[]>([]);
  const [coatTexture, setCoatTexture] = useState<string[]>([]);
  const [faceColor, setFaceColor] = useState<string[]>([]);
  const [expression, setExpression] = useState<string[]>([]);

  const [constitution, setConstitution] = useState<string>('气郁质');
  const [syndromeLocations, setSyndromeLocations] = useState<string[]>(['肝', '脾']);
  const [syndromeNatures, setSyndromeNatures] = useState<string[]>(['气滞', '血瘀']);
  const [syndrome, setSyndrome] = useState('肝郁脾虚');

  const [herbs, setHerbs] = useState<Herb[]>([
    { name: '柴胡', dose: 9 },
    { name: '白芍', dose: 12 },
    { name: '当归', dose: 9 },
  ]);
  const [acupoints, setAcupoints] = useState<string[]>(['太冲', '足三里', '三阴交']);
  const [newAcupoint, setNewAcupoint] = useState('');

  const [treatments, setTreatments] = useState<{ name: string; duration: string }[]>([]);
  const [summary, setSummary] = useState('');

  const [aiResult, setAiResult] = useState<DiagnosisResult>({ loading: false, result: '' });

  // Helpers
  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };
  const addAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };
  const addAcupoint = () => {
    if (newAcupoint.trim() && !acupoints.includes(newAcupoint.trim())) {
      setAcupoints([...acupoints, newAcupoint.trim()]);
      setNewAcupoint('');
    }
  };
  const removeHerb = (idx: number) => setHerbs(herbs.filter((_, i) => i !== idx));
  const updateHerbDose = (idx: number, dose: number) => {
    setHerbs(herbs.map((h, i) => (i === idx ? { ...h, dose } : h)));
  };
  const addHerb = (h: Herb) => {
    if (!herbs.find((x) => x.name === h.name)) {
      setHerbs([...herbs, h]);
    }
  };
  const totalHerbDose = herbs.reduce((s, h) => s + h.dose, 0);

  // AI 辨证调用
  const callAIDiagnosis = async () => {
    setAiResult({ loading: true, result: '' });
    try {
      const res = await fetch('/api/ai/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: { name: patient.name, age: patient.age, gender: patient.gender },
          chiefComplaint,
          tongue: [...tongueColor, ...tongueShape, ...coatColor, ...coatTexture].join('、'),
          pulse: pulses.join('、'),
          face: [...faceColor, ...expression].join('、'),
          constitution,
          syndrome: { location: syndromeLocations, nature: syndromeNatures, name: syndrome },
        }),
      });
      if (!res.ok || !res.body) throw new Error('AI 辨证请求失败');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // 解析 SSE data:
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;
            try {
              const json = JSON.parse(payload);
              if (json.text) {
                text += json.text;
                setAiResult({ loading: true, result: text });
              }
            } catch {
              text += payload;
              setAiResult({ loading: true, result: text });
            }
          }
        }
      }
      setAiResult({ loading: false, result: text });
    } catch (e) {
      setAiResult({
        loading: false,
        result: `⚠️ AI 辨证调用失败：${(e as Error).message}\n\n请检查后端 API 配置后重试。`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-surface border-b border-outline-variant/30 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/patients" className="text-muted-foreground hover:text-foreground text-sm">
            患者
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          <Link href={`/patients/${patient.id}`} className="text-muted-foreground hover:text-foreground text-sm">
            {patient.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-foreground text-sm font-medium">录入病历</span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href={`/patients/${patient.id}`}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              取消
            </Link>
            <button
              type="button"
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-1.5 shadow-card"
            >
              <Save className="w-3.5 h-3.5" />
              保存病历
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        {/* Patient card */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 p-4 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center text-lg font-bold">
            {patient.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-foreground">{patient.name}</span>
              <span className="text-xs text-muted-foreground">
                {patient.gender} · {patient.age} 岁
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded font-medium">
                {constitution}
              </span>
            </div>
            <div className="text-xs text-error flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              医疗禁忌：{allergies.join('、')}
            </div>
          </div>
        </div>

        {/* Section A: 主诉 + 医疗禁忌 */}
        <Section icon={User} title="主诉与医疗禁忌" subtitle="本次就诊的主要不适及药物/食物过敏史">
          <div className="space-y-3">
            <Field label="主诉" required>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={3}
                placeholder="例：胁肋胀痛伴纳差 1 月余，加重 3 天"
                className="w-full bg-surface-container border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              />
            </Field>
            <Field label="医疗禁忌">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {allergies.map((a) => (
                  <span
                    key={a}
                    className="text-xs px-2 py-1 bg-error/10 text-error border border-error/20 rounded font-medium flex items-center gap-1"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => setAllergies(allergies.filter((x) => x !== a))}
                      className="hover:bg-error/20 rounded-full p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  placeholder="添加禁忌（如：青霉素、海鲜…）"
                  className="flex-1 h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="px-3 h-9 bg-surface-container border border-outline-variant/30 rounded-md text-sm text-foreground hover:bg-surface-container/70"
                >
                  添加
                </button>
              </div>
            </Field>
          </div>
        </Section>

        {/* Section B: 望诊 */}
        <Section icon={Activity} title="望诊" subtitle="舌象与面色（可多选）">
          <ChipGroup label="舌色" options={TONGUE_COLORS} selected={tongueColor} onToggle={(v) => toggleArr(tongueColor, v, setTongueColor)} />
          <ChipGroup label="舌形" options={TONGUE_SHAPES} selected={tongueShape} onToggle={(v) => toggleArr(tongueShape, v, setTongueShape)} />
          <ChipGroup label="苔色" options={COAT_COLORS} selected={coatColor} onToggle={(v) => toggleArr(coatColor, v, setCoatColor)} />
          <ChipGroup label="苔质" options={COAT_TEXTURES} selected={coatTexture} onToggle={(v) => toggleArr(coatTexture, v, setCoatTexture)} />
          <ChipGroup label="面色" options={FACE_COLORS} selected={faceColor} onToggle={(v) => toggleArr(faceColor, v, setFaceColor)} />
          <ChipGroup label="神情" options={EXPRESSIONS} selected={expression} onToggle={(v) => toggleArr(expression, v, setExpression)} />
        </Section>

        {/* Section C: 切诊 */}
        <Section icon={Activity} title="切诊 · 脉象" subtitle="可多选（浮沉迟数虚实滑涩弦紧缓细弱洪）">
          <ChipGroup label="脉象" options={PULSES} selected={pulses} onToggle={(v) => toggleArr(pulses, v, setPulses)} />
        </Section>

        {/* Section D: 辨证三要素 */}
        <Section icon={Stethoscope} title="辨证三要素" subtitle="病位 + 病性 + 证型">
          <ChipGroup label="病位" options={SYNDROME_LOCATIONS} selected={syndromeLocations} onToggle={(v) => toggleArr(syndromeLocations, v, setSyndromeLocations)} />
          <ChipGroup label="病性" options={SYNDROME_NATURES} selected={syndromeNatures} onToggle={(v) => toggleArr(syndromeNatures, v, setSyndromeNatures)} />
          <Field label="证型" required>
            <input
              type="text"
              value={syndrome}
              onChange={(e) => setSyndrome(e.target.value)}
              placeholder="例：肝郁脾虚"
              className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </Field>
        </Section>

        {/* Section E: 体质 */}
        <Section icon={User} title="体质分类" subtitle="王琦九种体质">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {CONSTITUTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setConstitution(c)}
                className={
                  constitution === c
                    ? 'h-9 px-3 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-card'
                    : 'h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm text-foreground hover:bg-surface-container/70'
                }
              >
                {c}
              </button>
            ))}
          </div>
        </Section>

        {/* Section F: 中药处方 */}
        <Section
          icon={Pill}
          title="中药处方"
          subtitle={`共 ${herbs.length} 味 · 总剂量 ${totalHerbDose} g`}
        >
          <div className="space-y-2">
            {herbs.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center bg-surface-container/30 rounded-md">
                尚未添加药材，点击下方候选药材或搜索添加
              </div>
            ) : (
              herbs.map((h, idx) => (
                <div
                  key={`${h.name}-${idx}`}
                  className="flex items-center gap-2 bg-surface-container/40 rounded-md p-2 border border-outline-variant/30"
                >
                  <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0 font-medium text-sm text-foreground">{h.name}</div>
                  <input
                    type="number"
                    value={h.dose}
                    onChange={(e) => updateHerbDose(idx, parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-16 h-8 px-2 bg-surface border border-outline-variant/30 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-xs text-muted-foreground">g</span>
                  <button
                    type="button"
                    onClick={() => removeHerb(idx)}
                    className="p-1.5 hover:bg-error/10 text-muted-foreground hover:text-error rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <details className="mt-3 group">
            <summary className="text-xs text-primary font-medium cursor-pointer hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" />
              从常用方剂候选（点击添加）
            </summary>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {COMMON_HERBS.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => addHerb(h)}
                  className="text-xs px-2 py-1.5 bg-surface-container border border-outline-variant/30 rounded text-foreground hover:bg-surface-container/70 flex items-center justify-between"
                >
                  <span>{h.name}</span>
                  <span className="text-muted-foreground font-mono">{h.dose}g</span>
                </button>
              ))}
            </div>
          </details>
        </Section>

        {/* Section G: 针灸处方 */}
        <Section icon={Activity} title="针灸处方" subtitle="主穴 + 配穴（可添加自定义穴位）">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {acupoints.map((a) => (
              <span
                key={a}
                className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded font-medium flex items-center gap-1"
              >
                {a}
                <button
                  type="button"
                  onClick={() => setAcupoints(acupoints.filter((x) => x !== a))}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newAcupoint}
              onChange={(e) => setNewAcupoint(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAcupoint())}
              placeholder="添加穴位（如：合谷）"
              className="flex-1 h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={addAcupoint}
              className="px-3 h-9 bg-surface-container border border-outline-variant/30 rounded-md text-sm text-foreground hover:bg-surface-container/70"
            >
              添加
            </button>
          </div>
          <div className="text-xs text-muted-foreground mb-1.5">常用穴位：</div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_ACUPOINTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => !acupoints.includes(a) && setAcupoints([...acupoints, a])}
                disabled={acupoints.includes(a)}
                className="text-xs px-2 py-1 bg-surface border border-outline-variant/30 rounded hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + {a}
              </button>
            ))}
          </div>
        </Section>

        {/* Section H: 中医外治 */}
        <Section icon={Stethoscope} title="中医外治" subtitle="针灸/推拿/拔罐/艾灸等">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {TREATMENTS.map((t) => {
              const isSelected = treatments.some((x) => x.name === t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setTreatments(treatments.filter((x) => x.name !== t));
                    } else {
                      setTreatments([...treatments, { name: t, duration: '20 分钟' }]);
                    }
                  }}
                  className={
                    isSelected
                      ? 'h-9 px-3 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-card'
                      : 'h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm text-foreground hover:bg-surface-container/70'
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Section I: 病例摘要 */}
        <Section icon={FileTextIcon} title="病例摘要与医嘱" subtitle="本次诊疗总结">
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder="本次诊疗辨证、治法、医嘱…"
            className="w-full bg-surface-container border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
          />
        </Section>

        {/* Section J: AI 辨证 */}
        <Section
          icon={Sparkles}
          title="AI 智能辨证"
          subtitle="基于 DeepSeek V3.2 · 仅供临床参考"
          highlight
        >
          <div className="space-y-3">
            <button
              type="button"
              onClick={callAIDiagnosis}
              disabled={aiResult.loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 flex items-center gap-2 shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiResult.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在生成辨证参考…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  一键 AI 辨证参考
                </>
              )}
            </button>

            {aiResult.result && (
              <div className="bg-gradient-to-br from-violet-50/50 to-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">AI 辨证参考</span>
                </div>
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {aiResult.result}
                </div>
                <div className="mt-3 pt-3 border-t border-primary/10 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>
                    【提示】本内容由 AI 生成，仅作为文书整理参考，具体诊断和治疗请遵从执业医师的指导。
                  </span>
                </div>
              </div>
            )}
          </div>
        </Section>
      </main>
    </div>
  );
}

// === Components ===

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <section
      className={
        highlight
          ? 'bg-surface rounded-xl border-2 border-primary/30 p-5 shadow-card'
          : 'bg-surface rounded-xl border border-outline-variant/30 p-5 shadow-card'
      }
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-foreground mb-1.5 block">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-foreground mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={
                isSelected
                  ? 'h-8 px-3 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-card'
                  : 'h-8 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm text-foreground hover:bg-surface-container/70'
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
