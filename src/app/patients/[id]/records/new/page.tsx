'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  ImagePlus,
  Camera,
  FileText,
} from 'lucide-react';
import { PulseSelector, defaultFullPulseData, FullPulseData, formatPulseData } from '@/components/pulse-selector';
import { TongueSelector, defaultTongueData, TongueData, formatTongueData } from '@/components/tongue-selector';
import { FACE_COLORS, FACE_COLOR_DETAILS, EXPRESSIONS, UNIQUE_COMMON_HERBS as COMMON_HERBS, HERB_UNITS, HERB_PINYIN, getHerbSpecialHandling, getSpecialHandlingLabel } from '@/lib/tcm-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// 体质 chip（预置数据，与数据库 tcm_options 同源）
const CONSTITUTIONS = [
  '平和质', '气虚质', '阳虚质', '阴虚质', '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质',
];
const SYNDROME_LOCATIONS = ['肝', '心', '脾', '肺', '肾', '胆', '胃', '大肠', '小肠', '膀胱', '心包', '上焦', '中焦', '下焦'];
const SYNDROME_NATURES = ['气虚', '血虚', '阴虚', '阳虚', '气滞', '血瘀', '痰湿', '湿热', '寒凝', '热盛'];
const COMMON_ACUPOINTS = ['太冲', '足三里', '三阴交', '期门', '合谷', '内关', '太溪', '阴陵泉', '阳陵泉', '百会', '神门', '中脘'];
const TREATMENTS = ['普通针刺', '温针灸', '电针', '艾灸', '拔罐', '刺络放血', '推拿', '刮痧', '穴位埋线', '耳穴'];

type Herb = { name: string; dose: string; unit: string; specialHandling?: string };
type DiagnosisResult = { loading: boolean; result: string };

interface Patient {
  id: string;
  name: string;
  gender: string;
  age: number;
  constitution: string;
  allergies: string[];
  chronicDiseases?: string[];
  firstVisit?: string;
  note?: string;
}

const PATIENTS: Patient[] = [
  { id: 'p001', name: '陈秀英', gender: '女', age: 58, constitution: '气郁质', allergies: ['青霉素'] },
  { id: 'p002', name: '刘建国', gender: '男', age: 45, constitution: '平和质', allergies: [] },
  { id: 'p003', name: '张小敏', gender: '女', age: 32, constitution: '气虚质', allergies: ['海鲜'] },
  { id: 'p004', name: '李子轩', gender: '男', age: 8, constitution: '特禀质', allergies: ['花粉'] },
  { id: 'p005', name: '黄美华', gender: '女', age: 67, constitution: '痰湿质', allergies: [] },
  { id: 'p006', name: '赵晓东', gender: '男', age: 52, constitution: '湿热质', allergies: [] },
];

const fetchPatient = (id: string): Patient | null => {
  const found = PATIENTS.find(p => p.id === id);
  if (found) return found;
  
  try {
    const newPatients = JSON.parse(sessionStorage.getItem('newPatients') || '{}');
    return newPatients[id] || null;
  } catch {
    return null;
  }
};

export default function RecordEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    params.then(async ({ id }) => {
      if (!isMounted) return;
      const data = fetchPatient(id);
      if (data) {
        setPatient(data);
        setConstitution(data.constitution || '');
        setAllergies(data.allergies || []);
      } else {
        router.replace('/patients');
      }
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!patient) return null;

  // 状态
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');

  // 脉象（使用新的详细数据结构）
  const [pulseData, setPulseData] = useState<FullPulseData>(defaultFullPulseData);
  
  // 舌象（使用新的详细数据结构）
  const [tongueData, setTongueData] = useState<TongueData>(defaultTongueData);
  
  // 面色和神情（保留原有简单选择）
  const [faceColor, setFaceColor] = useState<string[]>([]);
  const [expression, setExpression] = useState<string[]>([]);

  const [constitution, setConstitution] = useState<string>('');
  const [syndromeLocations, setSyndromeLocations] = useState<string[]>(['肝', '脾']);
  const [syndromeNatures, setSyndromeNatures] = useState<string[]>(['气滞', '血瘀']);
  const [syndrome, setSyndrome] = useState('肝郁脾虚');

  const [herbs, setHerbs] = useState<Herb[]>([
    { name: '柴胡', dose: '9', unit: 'g' },
    { name: '白芍', dose: '12', unit: 'g' },
    { name: '当归', dose: '9', unit: 'g' },
  ]);
  
  // 中药搜索下拉状态
  const [herbDropdownIdx, setHerbDropdownIdx] = useState<number | null>(null);
  const [herbSearch, setHerbSearch] = useState('');
  
  const [acupoints, setAcupoints] = useState<string[]>(['太冲', '足三里', '三阴交']);
  const [newAcupoint, setNewAcupoint] = useState('');

  const [treatments, setTreatments] = useState<{ name: string; duration: string }[]>([]);
  const [summary, setSummary] = useState('');

  // 照片上传
  const [photos, setPhotos] = useState<{ id: string; type: 'tongue' | 'face'; url: string; name: string }[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = (type: 'tongue' | 'face', file: File) => {
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhoto = {
        id: `photo-${Date.now()}`,
        type,
        url: e.target?.result as string,
        name: file.name,
      };
      setPhotos(prev => [...prev, newPhoto]);
      setUploadingPhoto(false);
    };
    reader.onerror = () => {
      console.error('读取文件失败');
      alert('读取文件失败，请重试');
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const getPhotoTypeLabel = (type: 'tongue' | 'face') => {
    return type === 'tongue' ? '舌象' : '面相';
  };

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
  const updateHerbField = (idx: number, field: keyof Herb, value: string) => {
    setHerbs(herbs.map((h, i) => (i === idx ? { ...h, [field]: value } : h)));
  };
  const toggleHerbSpecialHandling = (idx: number) => {
    const herb = herbs[idx];
    const defaultHandling = getHerbSpecialHandling(herb.name);
    if (herb.specialHandling) {
      updateHerbField(idx, 'specialHandling', '');
    } else if (defaultHandling) {
      updateHerbField(idx, 'specialHandling', defaultHandling);
    }
  };
  const addHerb = (h: typeof COMMON_HERBS[0]) => {
    if (!herbs.find((x) => x.name === h.name)) {
      setHerbs([...herbs, { 
        name: h.name, 
        dose: String(h.dose), 
        unit: h.unit,
        specialHandling: h.special 
      }]);
    }
  };
  const addCustomHerb = () => {
    const newHerb: Herb = { name: '', dose: '', unit: 'g' };
    setHerbs([...herbs, newHerb]);
  };
  const totalHerbDose = herbs.reduce((s, h) => s + (parseFloat(h.dose) || 0), 0);

  // 保存病历
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving'>('idle');
  const handleSave = async () => {
    // 表单验证
    if (!chiefComplaint.trim()) {
      alert('请填写主诉');
      return;
    }
    const validHerbs = herbs.filter(h => h.name.trim());
    if (validHerbs.length === 0) {
      alert('请至少添加一味中药');
      return;
    }
    setSaveStatus('saving');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push(`/patients/${patient.id}`);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
      setSaveStatus('idle');
    }
  };

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
          tongue: formatTongueData(tongueData),
          pulse: formatPulseData(pulseData),
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
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-1.5 shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className={`w-3.5 h-3.5 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
              {saveStatus === 'saving' ? '保存中...' : '保存病历'}
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
        <Section icon={Activity} title="望诊" subtitle="舌象与面色（支持详细选择与解释提示）">
          {/* 舌象（使用新的详细选择组件） */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
              <span>舌象</span>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs">点击选项可查看详细解释，支持程度修饰和自定义填写</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TongueSelector value={tongueData} onChange={setTongueData} />
          </div>

          {/* 照片上传 */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-foreground mb-2">影像记录（非必填）</div>
            <div className="grid grid-cols-2 gap-2">
              {/* 舌象照片上传 */}
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-outline-variant/30 rounded-lg cursor-pointer hover:bg-surface-container/30 transition-colors">
                  <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">上传舌象</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload('tongue', file);
                    }}
                    disabled={uploadingPhoto}
                  />
                </label>
                {photos.filter(p => p.type === 'tongue').length > 0 && (
                  <div className="absolute top-1 right-1 flex gap-1">
                    {photos.filter(p => p.type === 'tongue').map(photo => (
                      <div key={photo.id} className="relative">
                        <img src={photo.url} alt="舌象" className="w-8 h-8 rounded object-cover border border-outline-variant/30" />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full flex items-center justify-center"
                        >
                          <X className="w-2.5 h-2.5 text-error-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 面相照片上传 */}
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-outline-variant/30 rounded-lg cursor-pointer hover:bg-surface-container/30 transition-colors">
                  <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">上传面相</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload('face', file);
                    }}
                    disabled={uploadingPhoto}
                  />
                </label>
                {photos.filter(p => p.type === 'face').length > 0 && (
                  <div className="absolute top-1 right-1 flex gap-1">
                    {photos.filter(p => p.type === 'face').map(photo => (
                      <div key={photo.id} className="relative">
                        <img src={photo.url} alt="面相" className="w-8 h-8 rounded object-cover border border-outline-variant/30" />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full flex items-center justify-center"
                        >
                          <X className="w-2.5 h-2.5 text-error-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {photos.map(photo => (
                  <div key={photo.id} className="flex items-center gap-1.5 px-2 py-1 bg-surface-container rounded-md">
                    <span className="text-xs text-muted-foreground">{getPhotoTypeLabel(photo.type)}</span>
                    <span className="text-xs text-foreground truncate max-w-[120px]">{photo.name}</span>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="p-0.5 hover:bg-error/10 text-muted-foreground hover:text-error rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 面色 */}
          <div className="mb-2">
            <div className="text-xs font-medium text-foreground mb-1.5">面色</div>
            <TooltipProvider delayDuration={300}>
              <div className="flex flex-wrap gap-1.5">
                {FACE_COLORS.map((opt) => {
                  const isSelected = faceColor.includes(opt.name);
                  return (
                    <Tooltip key={opt.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => toggleArr(faceColor, opt.name, setFaceColor)}
                          className={
                            isSelected
                              ? 'h-8 px-3 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-card'
                              : 'h-8 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm text-foreground hover:bg-surface-container/70'
                          }
                        >
                          {opt.name}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[280px]">
                        <div className="text-xs whitespace-pre-line">
                          {opt.description}
                          {FACE_COLOR_DETAILS[opt.id] && (
                            <>
                              {'\n'}【对应脏腑】{FACE_COLOR_DETAILS[opt.id].organ}
                              {'\n'}【主病】{FACE_COLOR_DETAILS[opt.id].diseases}
                            </>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>
          
          {/* 神情 */}
          <ChipGroup label="神情" options={EXPRESSIONS.map(e => e.name)} selected={expression} onToggle={(v) => toggleArr(expression, v, setExpression)} />
        </Section>

        {/* Section C: 切诊 */}
        <Section icon={Activity} title="切诊 · 脉象" subtitle="左手/右手分开，寸关尺分开，支持程度修饰">
          <div className="mb-2">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                    <Info className="w-3 h-3" />
                    点击脉象选项可查看详细解释，支持力度/程度修饰符
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs">可分别记录左手和右手的寸、关、尺各部位脉象，支持组合描述如"微弦"、"有力浮"等</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <PulseSelector value={pulseData} onChange={setPulseData} />
        </Section>

        {/* Section D: 辨证三要素 */}
        <Section icon={Stethoscope} title="辨证三要素" subtitle="病位 + 病性 + 证型">
          <ChipGroup label="病位" options={SYNDROME_LOCATIONS} selected={syndromeLocations} onToggle={(v) => toggleArr(syndromeLocations, v, setSyndromeLocations)} />
          <ChipGroup label="病性" options={SYNDROME_NATURES} selected={syndromeNatures} onToggle={(v) => toggleArr(syndromeNatures, v, setSyndromeNatures)} />
          <Field label="证型">
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
                点击下方"添加药材"按钮开始填写处方
              </div>
            ) : (
              herbs.map((h, idx) => {
                const filteredHerbs = COMMON_HERBS.filter(herb => 
                  herb.name.includes(herbSearch) || 
                  (HERB_PINYIN[herb.name]?.includes(herbSearch.toLowerCase()))
                );
                return (
                  <div
                    key={`${h.name}-${idx}`}
                    className="flex items-center gap-2 bg-surface-container/40 rounded-md p-2 border border-outline-variant/30 relative"
                  >
                    <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={h.name}
                        onChange={(e) => {
                          updateHerbField(idx, 'name', e.target.value);
                          setHerbSearch(e.target.value);
                          setHerbDropdownIdx(idx);
                        }}
                        onFocus={() => setHerbDropdownIdx(idx)}
                        onBlur={() => setTimeout(() => setHerbDropdownIdx(null), 200)}
                        placeholder="药名"
                        className="w-full h-8 px-2 bg-surface border border-outline-variant/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      {herbDropdownIdx === idx && filteredHerbs.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant/30 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                          {filteredHerbs.slice(0, 20).map((herb) => (
                            <button
                              key={herb.name}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                updateHerbField(idx, 'name', herb.name);
                                updateHerbField(idx, 'dose', String(herb.dose));
                                updateHerbField(idx, 'unit', herb.unit);
                                if (herb.special) {
                                  setHerbs(herbs.map((x, i) => 
                                    i === idx ? { ...x, specialHandling: herb.special } : x
                                  ));
                                }
                                setHerbDropdownIdx(null);
                                setHerbSearch('');
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-primary/10 flex items-center justify-between"
                            >
                              <span>{herb.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {herb.dose}{herb.unit} {herb.category && `· ${herb.category}`}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="number"
                      value={h.dose}
                      onChange={(e) => updateHerbField(idx, 'dose', e.target.value)}
                      placeholder="剂量"
                      min={0}
                      step="0.5"
                      className="w-14 h-8 px-2 bg-surface border border-outline-variant/30 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <select
                      value={h.unit}
                      onChange={(e) => updateHerbField(idx, 'unit', e.target.value)}
                      className="w-14 h-8 px-2 bg-surface border border-outline-variant/30 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {HERB_UNITS.map((unit) => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => toggleHerbSpecialHandling(idx)}
                      className={`h-8 px-2 rounded text-xs font-medium transition-colors ${
                        h.specialHandling
                          ? h.specialHandling === 'decoct_first'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : h.specialHandling === 'decoct_last'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : h.specialHandling === 'wrap_decoct'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-surface border border-outline-variant/30 text-muted-foreground hover:bg-surface-container/70'
                      }`}
                    >
                      {h.specialHandling ? getSpecialHandlingLabel(h.specialHandling) : '特殊'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeHerb(idx)}
                      className="p-1.5 hover:bg-error/10 text-muted-foreground hover:text-error rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={addCustomHerb}
                className="flex-1 h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm text-foreground hover:bg-surface-container/70 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                添加药材
              </button>
            </div>
            <details className="mt-3 group">
              <summary className="text-xs text-primary font-medium cursor-pointer hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" />
                常用药材参考（点击快速填入）
              </summary>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {COMMON_HERBS.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => addHerb(h)}
                  disabled={herbs.some((x) => x.name === h.name)}
                  className={`text-xs px-2 py-1.5 border rounded flex items-center justify-between transition-colors ${
                    herbs.some((x) => x.name === h.name)
                      ? 'bg-surface border-outline-variant/20 text-muted-foreground cursor-not-allowed'
                      : 'bg-surface-container border-outline-variant/30 text-foreground hover:bg-surface-container/70'
                  }`}
                  title={h.special ? getSpecialHandlingLabel(h.special) : ''}
                >
                  <span className="flex items-center gap-1">
                    {h.name}
                    {h.special && (
                      <span className={`text-[10px] px-1 rounded ${
                        h.special === 'decoct_first' ? 'bg-amber-100 text-amber-700' :
                        h.special === 'decoct_last' ? 'bg-green-100 text-green-700' :
                        h.special === 'wrap_decoct' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {getSpecialHandlingLabel(h.special)}
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground font-mono">{h.dose}{h.unit}</span>
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
        <Section icon={FileText} title="病例摘要与医嘱" subtitle="本次诊疗总结">
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
          <Icon className="w-[18px] h-[18px]" />
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
