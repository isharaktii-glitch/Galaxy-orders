import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await db.globalSetting.findMany();
    const obj: Record<string,string> = {};
    settings.forEach(s => obj[s.key]=s.value);
    return NextResponse.json(obj);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error:'Forbidden' }, { status:403 });
    const { key, value } = await req.json();
    const setting = await db.globalSetting.upsert({ where:{ key }, update:{ value }, create:{ key, value } });
    return NextResponse.json(setting);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
