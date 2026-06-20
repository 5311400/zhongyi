import { NextRequest, NextResponse } from 'next/server';
import { generateConsultationCode, validateConsultationCode, markCodeUsed, createPendingConsultation, getAllCodes } from '@/lib/db/queries';

// GET: 获取所有验证码
export async function GET() {
  try {
    const codes = getAllCodes();
    return NextResponse.json(codes);
  } catch (error) {
    return NextResponse.json({ error: '获取验证码失败' }, { status: 500 });
  }
}

// POST: 生成验证码
export async function POST(request: NextRequest) {
  try {
    const { patientName, phone } = await request.json();
    const result = generateConsultationCode(patientName, phone);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: '生成验证码失败' }, { status: 500 });
  }
}
