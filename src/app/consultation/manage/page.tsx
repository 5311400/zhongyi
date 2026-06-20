'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Check, X, Copy, Clock, QrCode } from 'lucide-react';

interface Code { id: string; code: string; patient_name: string; phone: string; expires_at: string; used: number; created_at: string; }
interface Pending { id: string; patient_name: string; phone: string; form_data: string; created_at: string; }

export default function ConsultationManagePage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [showGen, setShowGen] = useState(false);
  const [genForm, setGenForm] = useState({ patientName: '', phone: '' });
  const [newCode, setNewCode] = useState('');
  const [viewDetail, setViewDetail] = useState<Pending | null>(null);

  useEffect(() => {
    fetch('/api/consultation/codes').then(r => r.json()).then(d => setCodes(d || []));
    fetch('/api/consultation/submit').then(r => r.json()).then(d => setPending(d || []));
  }, []);

  const handleGenerate = async () => {
    const res = await fetch('/api/consultation/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genForm),
    });
    const d = await res.json();
    if (d.code) {
      setNewCode(d.code);
      setCodes(prev => [{ ...d, patient_name: genForm.patientName, phone: genForm.phone, expires_at: new Date(Date.now() + 86400000).toISOString(), used: 0, created_at: new Date().toISOString() }, ...prev]);
      setGenForm({ patientName: '', phone: '' });
    }
  };

  const handleAction = async (id: string, action: 'import' | 'reject') => {
    const res = await fetch('/api/consultation/submit', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) {
      setPending(prev => prev.filter(p => p.id !== id));
      setViewDetail(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold">远程问诊管理</h1>

        {/* 生成验证码 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><QrCode className="w-4 h-4" /> 问诊验证码</CardTitle>
                <Button size="sm" onClick={() => setShowGen(!showGen)}><Plus className="w-4 h-4 mr-1" /> 生成</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showGen && (
                <div className="p-3 border rounded-lg space-y-3">
                  <Input placeholder="患者姓名（可选）" value={genForm.patientName} onChange={e => setGenForm(f => ({ ...f, patientName: e.target.value }))} />
                  <Input placeholder="联系电话（可选）" value={genForm.phone} onChange={e => setGenForm(f => ({ ...f, phone: e.target.value }))} />
                  <Button size="sm" onClick={handleGenerate}>生成验证码</Button>
                  {newCode && (
                    <div className="p-3 bg-emerald-50 rounded-lg flex items-center justify-between">
                      <span className="text-lg font-mono font-bold text-emerald-700">{newCode}</span>
                      <Button size="sm" variant="ghost" onClick={() => copyCode(newCode)}><Copy className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {codes.length === 0 ? <p className="text-sm text-muted-foreground">暂无验证码</p> : codes.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <div>
                      <span className="font-mono font-semibold">{c.code}</span>
                      {c.patient_name && <span className="text-sm text-muted-foreground ml-2">{c.patient_name}</span>}
                    </div>
                    <Badge variant={c.used ? 'secondary' : new Date(c.expires_at) < new Date() ? 'outline' : 'default'}>
                      {c.used ? '已使用' : new Date(c.expires_at) < new Date() ? '已过期' : '有效'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 待审核问诊 */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" /> 待审核问诊 <Badge>{pending.length}</Badge></CardTitle></CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">暂无待审核问诊</p>
              ) : (
                <div className="space-y-2">
                  {pending.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                      <div>
                        <p className="font-medium">{p.patient_name || '未填写姓名'}</p>
                        <p className="text-xs text-muted-foreground">{p.phone || '未留电话'} · {new Date(p.created_at).toLocaleString('zh-CN')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setViewDetail(p)}>查看</Button>
                        <Button size="sm" onClick={() => handleAction(p.id, 'import')}><Check className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAction(p.id, 'reject')}><X className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 问诊详情弹窗 */}
        {viewDetail && (
          <Dialog open={!!viewDetail} onOpenChange={() => setViewDetail(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>问诊详情 - {viewDetail.patient_name}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                {(() => {
                  try {
                    const fd = JSON.parse(viewDetail.form_data);
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">姓名：</span>{fd.patientName || '未填'}</div>
                          <div><span className="text-muted-foreground">电话：</span>{fd.phone || '未填'}</div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">主诉</h4>
                          <p className="text-sm p-2 bg-muted rounded">{fd.chiefComplaint || '未填'}</p>
                          <p className="text-xs text-muted-foreground">持续时间：{fd.duration || '未填'}</p>
                        </div>
                        {fd.tongue && <div><h4 className="font-semibold text-sm">舌象</h4><p className="text-sm p-2 bg-muted rounded">{fd.tongue}</p></div>}
                        {fd.faceColor && <div><h4 className="font-semibold text-sm">面色</h4><p className="text-sm p-2 bg-muted rounded">{fd.faceColor}</p></div>}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {fd.diet && <div><span className="text-muted-foreground">饮食：</span>{fd.diet}</div>}
                          {fd.appetite && <div><span className="text-muted-foreground">食欲：</span>{fd.appetite}</div>}
                          {fd.bowelMovement && <div><span className="text-muted-foreground">大便：</span>{fd.bowelMovement}</div>}
                          {fd.urination && <div><span className="text-muted-foreground">小便：</span>{fd.urination}</div>}
                          {fd.sleep && <div><span className="text-muted-foreground">睡眠：</span>{fd.sleep}</div>}
                          {fd.coldHeat && <div><span className="text-muted-foreground">寒热：</span>{fd.coldHeat}</div>}
                          {fd.sweating && <div><span className="text-muted-foreground">出汗：</span>{fd.sweating}</div>}
                          {fd.painLocation && <div><span className="text-muted-foreground">疼痛：</span>{fd.painLocation}</div>}
                        </div>
                        {fd.otherSymptoms && <div><h4 className="font-semibold text-sm">其他症状</h4><p className="text-sm p-2 bg-muted rounded">{fd.otherSymptoms}</p></div>}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {fd.medicalHistory && <div><span className="text-muted-foreground">既往史：</span>{fd.medicalHistory}</div>}
                          {fd.currentMedication && <div><span className="text-muted-foreground">用药：</span>{fd.currentMedication}</div>}
                          {fd.allergies && <div><span className="text-muted-foreground">过敏：</span>{fd.allergies}</div>}
                        </div>
                      </>
                    );
                  } catch { return <p className="text-sm text-destructive">数据解析失败</p>; }
                })()}
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleAction(viewDetail.id, 'import')}><Check className="w-4 h-4 mr-2" /> 导入为患者</Button>
                  <Button variant="destructive" onClick={() => handleAction(viewDetail.id, 'reject')}><X className="w-4 h-4 mr-2" /> 拒绝</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
