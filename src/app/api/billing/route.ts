import { NextRequest, NextResponse } from 'next/server';
import { getAllBilling, createBilling, deleteBilling, getMonthlyBillingStats } from '@/lib/db/queries';

export async function GET() {
  try {
    const records = getAllBilling();
    const stats = getMonthlyBillingStats();
    return NextResponse.json({ records, stats });
  } catch (error) {
    console.error('Billing GET error:', error);
    return NextResponse.json({ error: '获取收费记录失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const record = createBilling(data);
    return NextResponse.json(record);
  } catch (error) {
    console.error('Billing POST error:', error);
    return NextResponse.json({ error: '创建收费记录失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });
    deleteBilling(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Billing DELETE error:', error);
    return NextResponse.json({ error: '删除收费记录失败' }, { status: 500 });
  }
}
