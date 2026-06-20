import { NextRequest, NextResponse } from 'next/server';
import { getPatientById, updatePatient, deletePatient, getRecordsByPatient, getBillingByPatient } from '@/lib/db/queries';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const patient = getPatientById(id);
    if (!patient) return NextResponse.json({ error: '患者不存在' }, { status: 404 });
    const records = getRecordsByPatient(id);
    const billing = getBillingByPatient(id);
    return NextResponse.json({ patient, records, billing });
  } catch (error) {
    return NextResponse.json({ error: '获取患者信息失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    updatePatient(id, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '更新患者失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    deletePatient(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '删除患者失败' }, { status: 500 });
  }
}
