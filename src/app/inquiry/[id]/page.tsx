'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Printer,
  Download,
  Upload,
  Loader2,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  gender: string;
  age: number;
  constitution: string;
  allergies: string[];
  chronicDiseases?: string[];
}

const PATIENTS: Record<string, Patient> = {
  p001: { id: 'p001', name: '陈秀英', gender: '女', age: 58, constitution: '气郁质', allergies: ['青霉素'] },
  p002: { id: 'p002', name: '刘建国', gender: '男', age: 45, constitution: '平和质', allergies: [] },
  p003: { id: 'p003', name: '张小敏', gender: '女', age: 32, constitution: '气虚质', allergies: ['海鲜'] },
};

const fetchPatient = (id: string): Patient | null => {
  const found = PATIENTS[id];
  if (found) return found;
  try {
    const newPatients = JSON.parse(sessionStorage.getItem('newPatients') || '{}');
    return newPatients[id] || null;
  } catch {
    return null;
  }
};

// 十问数据接口
interface TenInquiries {
  // 基本信息
  date: string;
  height: string;
  weight: string;
  chiefComplaint: string;
  presentIllness: string;

  // 问寒热
  coldHeat: string[];
  coldHeatOther: string;
  handFeet: string[];

  // 问汗
  sweat: string[];
  sweatArea: string;

  // 问头身
  headSymptoms: string[];
  headOther: string;
  bodySymptoms: string[];
  bodyArea: string;

  // 问二便
  stool: string;
  stoolOther: string;
  urine: string[];
  urineOther: string;

  // 问饮食口味
  appetite: string[];
  thirst: string[];
  thirstPreference: string[];
  taste: string[];

  // 问胸腹
  chestAbdomen: string[];
  chestAbdomenOther: string;
  pressure: string[];
  bowelSound: string;

  // 问睡眠
  sleep: string[];
  sleepHours: string;

  // 问情志
  emotions: string[];

  // 问妇女
  menstruation: string;
  menstrualPeriod: string;
  lastPeriod: string;
  menstrualSymptoms: string[];
  vaginalDischarge: string[];

  // 问小儿
  childInfo: string;

  // 舌象（医师填写）
  tongueColor: string[];
  tongueCoating: string[];
  tongueBody: string[];

  // 脉象（医师填写）
  pulse: string[];
  pulseOther: string;
}

const defaultInquiry: TenInquiries = {
  date: new Date().toISOString().slice(0, 10),
  height: '',
  weight: '',
  chiefComplaint: '',
  presentIllness: '',
  coldHeat: [],
  coldHeatOther: '',
  handFeet: [],
  sweat: [],
  sweatArea: '',
  headSymptoms: [],
  headOther: '',
  bodySymptoms: [],
  bodyArea: '',
  stool: '',
  stoolOther: '',
  urine: [],
  urineOther: '',
  appetite: [],
  thirst: [],
  thirstPreference: [],
  taste: [],
  chestAbdomen: [],
  chestAbdomenOther: '',
  pressure: [],
  bowelSound: '',
  sleep: [],
  sleepHours: '',
  emotions: [],
  menstruation: '',
  menstrualPeriod: '',
  lastPeriod: '',
  menstrualSymptoms: [],
  vaginalDischarge: [],
  childInfo: '',
  tongueColor: [],
  tongueCoating: [],
  tongueBody: [],
  pulse: [],
  pulseOther: '',
};

export default function InquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inquiry, setInquiry] = useState<TenInquiries>(defaultInquiry);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    params.then(async ({ id }) => {
      const data = fetchPatient(id);
      if (data) {
        setPatient(data);
      }
      setLoading(false);
    });
  }, []);

  // 切换复选框
  const toggleArray = (field: keyof TenInquiries, value: string) => {
    const arr = inquiry[field] as string[];
    if (arr.includes(value)) {
      setInquiry({ ...inquiry, [field]: arr.filter((v) => v !== value) });
    } else {
      setInquiry({ ...inquiry, [field]: [...arr, value] });
    }
  };

  // 更新字段
  const updateField = <K extends keyof TenInquiries>(field: K, value: TenInquiries[K]) => {
    setInquiry({ ...inquiry, [field]: value });
  };

  // 保存问诊表到 sessionStorage
  const handleSave = () => {
    if (!patient) return;
    try {
      const inquiries = JSON.parse(sessionStorage.getItem('inquiries') || '{}');
      inquiries[patient.id] = {
        ...inquiry,
        patientId: patient.id,
        savedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('inquiries', JSON.stringify(inquiries));
      toast.success('问诊表已保存');
    } catch (e) {
      toast.error('保存失败');
    }
  };

  // 导出为可打印格式
  const handleExport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('无法打开打印窗口，请检查浏览器设置');
      return;
    }

    const content = generatePrintHTML();
    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // 生成打印HTML
  const generatePrintHTML = () => {
    const p = patient;
    const i = inquiry;

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>中医问诊病情表 - ${p?.name || ''}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Noto Sans SC', 'PingFang SC', sans-serif; font-size: 14px; margin: 0; padding: 20px; }
    h1 { text-align: center; font-size: 24px; margin-bottom: 5px; }
    .sub { text-align: center; color: #666; margin-bottom: 20px; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-table td { border: 1px solid #ccc; padding: 8px 12px; }
    .section { margin-bottom: 20px; }
    .section-title { background: #e8f5e9; padding: 8px 16px; font-weight: bold; margin-bottom: 10px; border-radius: 4px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .field { margin-bottom: 10px; }
    .field label { font-weight: bold; display: block; margin-bottom: 4px; }
    .checkboxes { display: flex; flex-wrap: wrap; gap: 8px; }
    .checkboxes label { background: #f5f5f5; padding: 4px 10px; border-radius: 15px; border: 1px solid #ddd; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <h1>中医问诊病情表</h1>
  <p class="sub">（基于十问歌辨证设计）</p>

  <table class="header-table">
    <tr>
      <td>日期：${i.date}</td>
      <td>姓名：${p?.name || ''}</td>
      <td>性别：${p?.gender || ''}</td>
      <td>年龄：${p?.age || ''}岁</td>
    </tr>
    <tr>
      <td>身高：${i.height}cm</td>
      <td>体重：${i.weight}kg</td>
      <td>既往病史：${p?.chronicDiseases?.join('、') || ''}</td>
      <td>过敏史：${p?.allergies?.join('、') || ''}</td>
    </tr>
  </table>

  <div class="section">
    <div class="section-title">一、主诉（最想解决的问题）</div>
    <p>${i.chiefComplaint || '________________'}</p>
  </div>

  <div class="section">
    <div class="section-title">二、现病史</div>
    <p>${i.presentIllness || '________________'}</p>
  </div>

  <div class="section">
    <div class="section-title">三、全身症状（十问）</div>
    <div class="grid">
      <div class="field">
        <label>问寒热</label>
        <div class="checkboxes">
          ${i.coldHeat.map(v => `<span>☐ ${v}</span>`).join('')}
          ${i.coldHeatOther ? `<span>其他：${i.coldHeatOther}</span>` : ''}
        </div>
        <div style="margin-top:8px">手足：${i.handFeet.join('、') || '___'}</div>
      </div>
      <div class="field">
        <label>问汗</label>
        <div class="checkboxes">
          ${i.sweat.map(v => `<span>☐ ${v}</span>`).join('')}
        </div>
        <div style="margin-top:8px">部位：${i.sweatArea || '___'}</div>
      </div>
      <div class="field">
        <label>问头身</label>
        <div class="checkboxes">
          ${i.headSymptoms.map(v => `<span>☐ ${v}</span>`).join('')}
        </div>
        <div style="margin-top:8px">身体：${i.bodySymptoms.join('、') || '___'} ${i.bodyArea ? `部位：${i.bodyArea}` : ''}</div>
      </div>
      <div class="field">
        <label>问二便</label>
        <div>大便：${i.stool || '___'} ${i.stoolOther ? i.stoolOther : ''}</div>
        <div>小便：${i.urine.join('、') || '___'} ${i.urineOther ? i.urineOther : ''}</div>
      </div>
      <div class="field">
        <label>问饮食口味</label>
        <div>食欲：${i.appetite.join('、') || '___'}</div>
        <div>口渴：${i.thirst.join('、') || '___'} 喜：${i.thirstPreference.join('、') || '___'}</div>
        <div>口味：${i.taste.join('、') || '___'}</div>
      </div>
      <div class="field">
        <label>问胸腹</label>
        <div>症状：${i.chestAbdomen.join('、') || '___'}</div>
        <div>按压：${i.pressure.join('、') || '___'} 肠鸣：${i.bowelSound || '___'}</div>
      </div>
      <div class="field">
        <label>问睡眠</label>
        <div>${i.sleep.join('、') || '___'}</div>
        <div>每晚约 ${i.sleepHours || '___'} 小时</div>
      </div>
      <div class="field">
        <label>问情志</label>
        <div>${i.emotions.join('、') || '___'}</div>
      </div>
    </div>
  </div>

  ${p?.gender === '女' ? `
  <div class="section">
    <div class="section-title">四、妇女特有症状</div>
    <div>月经周期：${i.menstruation}天 / 经期：${i.menstrualPeriod}天 / 末次：${i.lastPeriod}</div>
    <div>症状：${i.menstrualSymptoms.join('、') || '___'}</div>
    <div>带下：${i.vaginalDischarge.join('、') || '___'}</div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">五、舌象与脉象（医师填写）</div>
    <table>
      <tr>
        <th style="width:30%">舌象</th>
        <td>
          舌色：${i.tongueColor.join('、') || '___'} |
          舌苔：${i.tongueCoating.join('、') || '___'} |
          舌体：${i.tongueBody.join('、') || '___'}
        </td>
      </tr>
      <tr>
        <th>脉象</th>
        <td>${i.pulse.join('、') || '___'} ${i.pulseOther ? `其他：${i.pulseOther}` : ''}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    中医问诊参考表 | 结合十问歌及临床辨证思路 | 生成时间：${new Date().toLocaleString('zh-CN')}
  </div>
</body>
</html>
    `;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="bg-surface border-b border-outline-variant/30 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href={patient ? `/patients/${patient.id}` : '/patients'} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-foreground text-sm font-medium">中医问诊表</span>
          {patient && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground text-sm">{patient.name}</span>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              保存
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              打印/导出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {patient && (
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
              {patient.name?.[0] || '?'}
            </div>
            <div>
              <div className="font-semibold">{patient.name}</div>
              <div className="text-sm text-muted-foreground">
                {patient.gender} · {patient.age}岁 · {patient.constitution}
              </div>
            </div>
            <div className="ml-auto text-sm text-error">
              过敏：{patient.allergies.join('、') || '无'}
            </div>
          </div>
        )}

        {/* 基本信息 */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">基本信息</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">日期</label>
              <input
                type="date"
                value={inquiry.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">身高(cm)</label>
              <input
                type="text"
                value={inquiry.height}
                onChange={(e) => updateField('height', e.target.value)}
                placeholder="170"
                className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">体重(kg)</label>
              <input
                type="text"
                value={inquiry.weight}
                onChange={(e) => updateField('weight', e.target.value)}
                placeholder="65"
                className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">体质</label>
              <div className="h-9 px-3 flex items-center text-sm mt-1">{patient?.constitution || '-'}</div>
            </div>
          </div>
        </div>

        {/* 一、主诉 */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-emerald-700">一、主诉（最想解决的问题）</h2>
          <textarea
            value={inquiry.chiefComplaint}
            onChange={(e) => updateField('chiefComplaint', e.target.value)}
            rows={2}
            placeholder="例：头痛3天，加重1天"
            className="w-full px-3 py-2 bg-surface-container border border-outline-variant/30 rounded-md text-sm resize-y"
          />
        </div>

        {/* 二、现病史 */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-emerald-700">二、现病史</h2>
          <textarea
            value={inquiry.presentIllness}
            onChange={(e) => updateField('presentIllness', e.target.value)}
            rows={3}
            placeholder="何时开始？有何诱因（着凉、生气、熬夜、饮食等）？变化过程？是否用药？"
            className="w-full px-3 py-2 bg-surface-container border border-outline-variant/30 rounded-md text-sm resize-y"
          />
        </div>

        {/* 三、全身症状（十问） */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-emerald-700">三、全身症状（十问）</h2>

          {/* 问寒热 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">问寒热</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {['怕冷', '怕热', '怕风', '寒热都有', '手脚心热', '手脚冰凉'].map((v) => (
                <label key={v} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-sm cursor-pointer hover:bg-primary/10">
                  <input
                    type="checkbox"
                    checked={inquiry.coldHeat.includes(v)}
                    onChange={() => toggleArray('coldHeat', v)}
                    className="rounded"
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>

          {/* 问汗 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">问汗</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {['正常', '白天易汗', '夜间盗汗', '不出汗', '头颈汗', '手心汗', '后背汗'].map((v) => (
                <label key={v} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-sm cursor-pointer hover:bg-primary/10">
                  <input
                    type="checkbox"
                    checked={inquiry.sweat.includes(v)}
                    onChange={() => toggleArray('sweat', v)}
                    className="rounded"
                  />
                  {v}
                </label>
              ))}
            </div>
            <input
              type="text"
              value={inquiry.sweatArea}
              onChange={(e) => updateField('sweatArea', e.target.value)}
              placeholder="出汗部位：头颈/手心/后背等"
              className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm"
            />
          </div>

          {/* 问头身 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">问头身</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {['头痛', '头晕', '头重', '身体沉重', '关节痛', '肌肉酸', '四肢麻木'].map((v) => (
                <label key={v} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-sm cursor-pointer hover:bg-primary/10">
                  <input
                    type="checkbox"
                    checked={inquiry.headSymptoms.includes(v)}
                    onChange={() => toggleArray('headSymptoms', v)}
                    className="rounded"
                  />
                  {v}
                </label>
              ))}
            </div>
            <input
              type="text"
              value={inquiry.bodyArea}
              onChange={(e) => updateField('bodyArea', e.target.value)}
              placeholder="具体部位：膝/腰/肩等"
              className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm mt-2"
            />
          </div>

          {/* 问二便 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">问二便</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">大便</label>
                <select
                  value={inquiry.stool}
                  onChange={(e) => updateField('stool', e.target.value)}
                  className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm"
                >
                  <option value="">正常</option>
                  <option value="便秘">便秘</option>
                  <option value="腹泻">腹泻</option>
                  <option value="不成形">不成形</option>
                  <option value="黏马桶">黏马桶</option>
                  <option value="干结">干结</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">小便</label>
                <div className="flex flex-wrap gap-2">
                  {['色黄', '色清', '尿频', '夜尿多', '不畅'].map((v) => (
                    <label key={v} className="flex items-center gap-1 px-2 py-1 bg-surface-container rounded text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inquiry.urine.includes(v)}
                        onChange={() => toggleArray('urine', v)}
                        className="rounded"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 问饮食口味 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">问饮食口味</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">食欲</label>
                <div className="flex flex-wrap gap-2">
                  {['好', '一般', '差', '易饿', '厌油腻'].map((v) => (
                    <label key={v} className="flex items-center gap-1 px-2 py-1 bg-surface-container rounded text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inquiry.appetite.includes(v)}
                        onChange={() => toggleArray('appetite', v)}
                        className="rounded"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">口味</label>
                <div className="flex flex-wrap gap-2">
                  {['口苦', '口黏', '口淡', '口甜', '口酸', '口臭'].map((v) => (
                    <label key={v} className="flex items-center gap-1 px-2 py-1 bg-surface-container rounded text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inquiry.taste.includes(v)}
                        onChange={() => toggleArray('taste', v)}
                        className="rounded"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 问胸腹 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">问胸腹</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {['胸闷', '心悸', '胁肋胀', '腹胀', '腹痛', '反酸'].map((v) => (
                <label key={v} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-sm cursor-pointer hover:bg-primary/10">
                  <input
                    type="checkbox"
                    checked={inquiry.chestAbdomen.includes(v)}
                    onChange={() => toggleArray('chestAbdomen', v)}
                    className="rounded"
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>

          {/* 问睡眠 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">问睡眠</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {['入睡困难', '多梦', '易醒', '早醒', '嗜睡', '失眠'].map((v) => (
                <label key={v} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-sm cursor-pointer hover:bg-primary/10">
                  <input
                    type="checkbox"
                    checked={inquiry.sleep.includes(v)}
                    onChange={() => toggleArray('sleep', v)}
                    className="rounded"
                  />
                  {v}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">每晚约</span>
              <input
                type="text"
                value={inquiry.sleepHours}
                onChange={(e) => updateField('sleepHours', e.target.value)}
                placeholder="7"
                className="w-16 h-8 px-2 bg-surface-container border border-outline-variant/30 rounded-md text-sm text-center"
              />
              <span className="text-sm text-muted-foreground">小时</span>
            </div>
          </div>

          {/* 问情志 */}
          <div>
            <h3 className="font-semibold mb-2">问情志</h3>
            <div className="flex flex-wrap gap-2">
              {['急躁易怒', '焦虑', '忧郁', '思虑多', '易惊', '情绪稳定'].map((v) => (
                <label key={v} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-sm cursor-pointer hover:bg-primary/10">
                  <input
                    type="checkbox"
                    checked={inquiry.emotions.includes(v)}
                    onChange={() => toggleArray('emotions', v)}
                    className="rounded"
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 四、妇女特有症状 */}
        {patient?.gender === '女' && (
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 text-emerald-700">四、妇女特有症状</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">月经周期(天)</label>
                <input
                  type="text"
                  value={inquiry.menstruation}
                  onChange={(e) => updateField('menstruation', e.target.value)}
                  placeholder="28"
                  className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">经期(天)</label>
                <input
                  type="text"
                  value={inquiry.menstrualPeriod}
                  onChange={(e) => updateField('menstrualPeriod', e.target.value)}
                  placeholder="5"
                  className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">末次月经</label>
                <input
                  type="text"
                  value={inquiry.lastPeriod}
                  onChange={(e) => updateField('lastPeriod', e.target.value)}
                  placeholder="2024-12-01"
                  className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {['痛经', '血块', '量多', '量少', '色淡', '色暗', '闭经'].map((v) => (
                <label key={v} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-sm cursor-pointer hover:bg-primary/10">
                  <input
                    type="checkbox"
                    checked={inquiry.menstrualSymptoms.includes(v)}
                    onChange={() => toggleArray('menstrualSymptoms', v)}
                    className="rounded"
                  />
                  {v}
                </label>
              ))}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">带下</label>
              <div className="flex flex-wrap gap-2">
                {['量多', '色黄', '色白', '清稀', '异味', '正常'].map((v) => (
                  <label key={v} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-sm cursor-pointer hover:bg-primary/10">
                    <input
                      type="checkbox"
                      checked={inquiry.vaginalDischarge.includes(v)}
                      onChange={() => toggleArray('vaginalDischarge', v)}
                      className="rounded"
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 五、舌象与脉象（医师填写） */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-emerald-700">五、舌象与脉象（医师填写）</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">舌象</h3>
              <div className="mb-3">
                <label className="text-xs text-muted-foreground mb-1 block">舌色</label>
                <div className="flex flex-wrap gap-2">
                  {['淡红', '淡白', '红', '绛', '紫暗/瘀点'].map((v) => (
                    <label key={v} className="flex items-center gap-1 px-2 py-1 bg-surface-container rounded text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inquiry.tongueColor.includes(v)}
                        onChange={() => toggleArray('tongueColor', v)}
                        className="rounded"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs text-muted-foreground mb-1 block">舌苔</label>
                <div className="flex flex-wrap gap-2">
                  {['薄白', '薄黄', '厚腻', '黄腻', '少苔', '剥苔'].map((v) => (
                    <label key={v} className="flex items-center gap-1 px-2 py-1 bg-surface-container rounded text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inquiry.tongueCoating.includes(v)}
                        onChange={() => toggleArray('tongueCoating', v)}
                        className="rounded"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">舌体</label>
                <div className="flex flex-wrap gap-2">
                  {['胖大', '齿痕', '裂纹', '歪斜', '正常'].map((v) => (
                    <label key={v} className="flex items-center gap-1 px-2 py-1 bg-surface-container rounded text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inquiry.tongueBody.includes(v)}
                        onChange={() => toggleArray('tongueBody', v)}
                        className="rounded"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">脉象</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {['浮', '沉', '迟', '数', '滑', '涩', '弦', '细', '弱', '洪', '缓'].map((v) => (
                  <label key={v} className="flex items-center gap-1 px-2 py-1 bg-surface-container rounded text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inquiry.pulse.includes(v)}
                      onChange={() => toggleArray('pulse', v)}
                      className="rounded"
                    />
                    {v}
                  </label>
                ))}
              </div>
              <input
                type="text"
                value={inquiry.pulseOther}
                onChange={(e) => updateField('pulseOther', e.target.value)}
                placeholder="其他描述"
                className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存问诊表'}
          </button>
          <button
            onClick={handleExport}
            className="px-6 py-2.5 border border-outline-variant/40 text-foreground rounded-lg font-medium hover:bg-surface-container flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            打印 / 导出
          </button>
        </div>
      </main>
    </div>
  );
}
