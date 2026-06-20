import { NextRequest, NextResponse } from 'next/server';
import { validateConsultationCode, markCodeUsed, createPendingConsultation, getPendingConsultations, importConsultation, rejectConsultation } from '@/lib/db/queries';

// POST: 患者提交问诊表单
export async function POST(request: NextRequest) {
  try {
    const { code, patientName, phone, formData } = await request.json();

    // 验证码校验
    const validation = validateConsultationCode(code);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 创建待导入问诊
    const id = createPendingConsultation(
      validation.codeId!,
      patientName || '未填写',
      phone || '',
      JSON.stringify(formData)
    );

    // 标记验证码已使用
    markCodeUsed(validation.codeId!);

    return NextResponse.json({ success: true, message: '问诊已提交，等待医生审核' });
  } catch (error) {
    console.error('Consultation submit error:', error);
    return NextResponse.json({ error: '提交失败' }, { status: 500 });
  }
}

// PUT: 医生导入/拒绝问诊
export async function PUT(request: NextRequest) {
  try {
    const { id, action } = await request.json();

    if (action === 'import') {
      const patientId = importConsultation(id);
      return NextResponse.json({ success: true, patientId });
    } else if (action === 'reject') {
      rejectConsultation(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (error) {
    console.error('Consultation action error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

// GET: 获取待审核问诊列表
export async function GET() {
  try {
    const pending = getPendingConsultations();
    return NextResponse.json(pending);
  } catch (error) {
    return NextResponse.json({ error: '获取待审核问诊失败' }, { status: 500 });
  }
}
