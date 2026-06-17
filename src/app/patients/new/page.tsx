'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Calendar,
  Briefcase,
  AlertTriangle,
  Heart,
} from 'lucide-react';

const CONSTITUTIONS = [
  { id: 'ping-he', name: '平和质' },
  { id: 'qi-xu', name: '气虚质' },
  { id: 'yang-xu', name: '阳虚质' },
  { id: 'yin-xu', name: '阴虚质' },
  { id: 'tan-shi', name: '痰湿质' },
  { id: 'shi-re', name: '湿热质' },
  { id: 'xue-yu', name: '血瘀质' },
  { id: 'qi-yu', name: '气郁质' },
  { id: 'te-bing', name: '特禀质' },
];

export default function NewPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    gender: '女',
    age: '',
    phone: '',
    occupation: '',
    constitution: '',
    allergies: '',
    chronicDiseases: '',
    note: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填项（姓名和年龄必填，体质类型选填）
    if (!formData.name.trim()) {
      toast.error('请输入患者姓名');
      return;
    }
    const ageNum = parseInt(formData.age);
    if (!formData.age.trim() || isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      toast.error('请输入有效的年龄（0-120）');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 演示模式：生成临时ID，将患者数据存储到 sessionStorage
      const tempId = 'p' + Date.now();
      const allergyList = formData.allergies ? formData.allergies.split(/[,，、]/).filter(Boolean) : [];
      const chronicList = formData.chronicDiseases ? formData.chronicDiseases.split(/[,，、]/).filter(Boolean) : [];
      const newPatient = {
        id: tempId,
        name: formData.name,
        gender: formData.gender,
        age: ageNum,
        phone: formData.phone,
        occupation: formData.occupation,
        constitution: formData.constitution,
        lastDiagnosis: '暂无',
        lastVisit: new Date().toISOString().split('T')[0],
        visitCount: 0,
        hasAllergy: allergyList.length > 0,
        allergy: allergyList.join('、'),
        allergies: allergyList,
        chronicDiseases: chronicList,
        firstVisit: new Date().toISOString().split('T')[0],
        note: formData.note,
      };
      
      // 存储到 sessionStorage
      try {
        const patients = JSON.parse(sessionStorage.getItem('newPatients') || '{}');
        patients[tempId] = newPatient;
        sessionStorage.setItem('newPatients', JSON.stringify(patients));
      } catch (e) {
        console.error('sessionStorage 不可用:', e);
      }
      
      toast.success('患者档案创建成功');
      router.push(`/patients/${tempId}`);
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-3xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground flex items-center gap-1.5 mb-6">
          <Link href="/patients" className="hover:text-foreground transition-colors">
            患者
          </Link>
          <span>/</span>
          <span className="text-foreground">新建患者</span>
        </nav>

        <div className="bg-surface rounded-xl border border-outline-variant/30 shadow-card overflow-hidden">
          <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/patients"
                className="p-1.5 hover:bg-surface-container rounded-md transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-foreground">新建患者档案</h1>
                <p className="text-xs text-muted-foreground">填写患者基本信息</p>
              </div>
            </div>
            <button
              type="submit"
              form="patient-form"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2 shadow-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>

          <form id="patient-form" onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* 基本信息 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  姓名 <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入姓名"
                    required
                    className="w-full h-10 pl-10 pr-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  性别 <span className="text-error">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="女">女</option>
                  <option value="男">男</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  年龄 <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="请输入年龄"
                    required
                    className="w-full h-10 pl-10 pr-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  联系电话
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="请输入电话"
                    className="w-full h-10 pl-10 pr-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  职业
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="请输入职业"
                    className="w-full h-10 pl-10 pr-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  体质类型
                </label>
                <select
                  value={formData.constitution}
                  onChange={(e) => setFormData({ ...formData, constitution: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">请选择体质（选填）</option>
                  {CONSTITUTIONS.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 医疗禁忌 */}
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-warning">医疗禁忌提醒</div>
                  <div className="text-xs text-muted-foreground">请准确填写患者的过敏史和既往病史</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    过敏史
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="如：青霉素、海鲜等，多个用逗号分隔"
                    className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    既往病史
                  </label>
                  <input
                    type="text"
                    value={formData.chronicDiseases}
                    onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                    placeholder="如：高血压、糖尿病等，多个用逗号分隔"
                    className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* 备注 */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-primary" />
                备注信息
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="患者特殊情况、生活习惯等..."
                rows={3}
                className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant/30 rounded-md text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-3 pt-2">
              <Link
                href="/patients"
                className="flex-1 py-2.5 bg-surface-container border border-outline-variant/40 rounded-md text-sm font-medium text-foreground hover:bg-surface-container/70 transition-colors"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 shadow-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '保存中...' : '保存患者档案'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}