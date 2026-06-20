import { NextRequest, NextResponse } from 'next/server';
import { getAllPatients, searchPatients, createPatient } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const patients = q ? searchPatients(q) : getAllPatients();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Patients GET error:', error);
    return NextResponse.json({ error: '获取患者列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const patient = createPatient(data);
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Patients POST error:', error);
    return NextResponse.json({ error: '创建患者失败' }, { status: 500 });
  }
}
