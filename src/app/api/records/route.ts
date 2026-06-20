import { NextRequest, NextResponse } from 'next/server';
import { createRecord, getRecordsByPatient } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) return NextResponse.json({ error: '缺少patientId' }, { status: 400 });
    const records = getRecordsByPatient(patientId);
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: '获取病历失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.patient_id || !data.visit_date) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }
    const record = createRecord(data);
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: '创建病历失败' }, { status: 500 });
  }
}
