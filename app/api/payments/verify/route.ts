import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role!=='ADMIN') return NextResponse.json({ error:'Forbidden' }, { status:403 });
    const { id, status } = await req.json();
    const payment = await db.payment.update({ where:{ id }, data:{ status } });
    return NextResponse.json(payment);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
