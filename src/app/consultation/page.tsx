'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Leaf, CheckCircle, AlertCircle } from 'lucide-react';

export default function ConsultationPage() {
  const [step, setStep] = useState<'code' | 'form' | 'done'>('code');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patientName: '', phone: '',
    chiefComplaint: '', duration: '',
    tongue: '', pulse: '', faceColor: '',
    diet: '', appetite: '', bowelMovement: '', urination: '',
    sleep: '', dream: '', coldHeat: '', sweating: '',
    painLocation: '', painNature: '',
    medicalHistory: '', currentMedication: '', allergies: '',
    otherSymptoms: '',
  });

  const handleVerifyCode = async () => {
    if (!code.trim()) { setError('请输入验证码'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/consultation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), action: 'verify' }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setStep('form'); }
    } catch { setError('网络错误，请重试'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.chiefComplaint.trim()) { setError('请填写主要症状'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/consultation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          patientName: form.patientName,
          phone: form.phone,
          formData: form,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setStep('done'); }
    } catch { setError('提交失败，请重试'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-800">中医远程问诊</h1>
          </div>
          <p className="text-sm text-muted-foreground">请填写以下信息，医生将根据您的描述进行辨证分析</p>
        </div>

        {/* 验证码输入 */}
        {step === 'code' && (
          <Card>
            <CardHeader><CardTitle className="text-base">输入问诊码</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">请输入医生提供的问诊验证码（格式：ZH-XXXX）</p>
              <Input value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }} placeholder="ZH-XXXX" className="text-center text-lg tracking-wider" maxLength={7} />
              {error && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
              <Button className="w-full" onClick={handleVerifyCode} disabled={loading}>{loading ? '验证中...' : '进入问诊'}</Button>
            </CardContent>
          </Card>
        )}

        {/* 问诊表单 */}
        {step === 'form' && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">姓名</label><Input value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} placeholder="您的姓名" /></div>
                <div><label className="text-sm font-medium">联系电话</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="手机号码" /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">主诉与症状</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium">主要症状 <span className="text-destructive">*</span></label><Textarea value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} placeholder="请详细描述您的不适症状" rows={3} /></div>
                <div><label className="text-sm font-medium">症状持续时间</label><Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="如：3天、1周、半年" /></div>
                <div><label className="text-sm font-medium">其他症状</label><Textarea value={form.otherSymptoms} onChange={e => setForm(f => ({ ...f, otherSymptoms: e.target.value }))} placeholder="如有其他不适请补充" rows={2} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">望诊信息（如有条件）</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <div><label className="text-sm font-medium">舌象</label><Input value={form.tongue} onChange={e => setForm(f => ({ ...f, tongue: e.target.value }))} placeholder="舌色、舌苔（如：舌红苔黄腻）" /></div>
                <div><label className="text-sm font-medium">面色</label><Input value={form.faceColor} onChange={e => setForm(f => ({ ...f, faceColor: e.target.value }))} placeholder="如：面色萎黄、面色红润" /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">问诊十问</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium">饮食</label><Input value={form.diet} onChange={e => setForm(f => ({ ...f, diet: e.target.value }))} placeholder="饮食习惯" /></div>
                  <div><label className="text-sm font-medium">食欲</label><Input value={form.appetite} onChange={e => setForm(f => ({ ...f, appetite: e.target.value }))} placeholder="好/一般/差" /></div>
                  <div><label className="text-sm font-medium">大便</label><Input value={form.bowelMovement} onChange={e => setForm(f => ({ ...f, bowelMovement: e.target.value }))} placeholder="频率、性状" /></div>
                  <div><label className="text-sm font-medium">小便</label><Input value={form.urination} onChange={e => setForm(f => ({ ...f, urination: e.target.value }))} placeholder="颜色、频率" /></div>
                  <div><label className="text-sm font-medium">睡眠</label><Input value={form.sleep} onChange={e => setForm(f => ({ ...f, sleep: e.target.value }))} placeholder="好/多梦/失眠" /></div>
                  <div><label className="text-sm font-medium">寒热</label><Input value={form.coldHeat} onChange={e => setForm(f => ({ ...f, coldHeat: e.target.value }))} placeholder="怕冷/怕热/正常" /></div>
                  <div><label className="text-sm font-medium">出汗</label><Input value={form.sweating} onChange={e => setForm(f => ({ ...f, sweating: e.target.value }))} placeholder="正常/多汗/盗汗" /></div>
                  <div><label className="text-sm font-medium">疼痛部位</label><Input value={form.painLocation} onChange={e => setForm(f => ({ ...f, painLocation: e.target.value }))} placeholder="如有疼痛" /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">既往史</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium">既往病史</label><Input value={form.medicalHistory} onChange={e => setForm(f => ({ ...f, medicalHistory: e.target.value }))} placeholder="如：高血压、糖尿病" /></div>
                <div><label className="text-sm font-medium">正在服用的药物</label><Input value={form.currentMedication} onChange={e => setForm(f => ({ ...f, currentMedication: e.target.value }))} placeholder="如有请填写" /></div>
                <div><label className="text-sm font-medium">过敏史</label><Input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="药物/食物过敏" /></div>
              </CardContent>
            </Card>

            {error && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}

            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
              {loading ? '提交中...' : '提交问诊'}
            </Button>
          </div>
        )}

        {/* 提交成功 */}
        {step === 'done' && (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-bold">问诊已提交</h2>
              <p className="text-muted-foreground">医生会尽快审核您的问诊信息，请耐心等待。</p>
              <p className="text-sm text-muted-foreground">如有紧急情况，请直接拨打诊所电话。</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
