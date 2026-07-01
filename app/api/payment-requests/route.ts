import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const { bankName, accountNo, amount } = await req.json();
    const request = await db.paymentRequest.create({ data:{ sellerId:(session.user as any).id, bankName, accountNo, amount } });
    return NextResponse.json(request);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role!=='ADMIN') return NextResponse.json({ error:'Forbidden' }, { status:403 });
    const requests = await db.paymentRequest.findMany({
      include:{ seller:{ select:{ username:true,email:true,phone:true } } },
      orderBy:{ createdAt:'desc' },
    });
    return NextResponse.json(requests);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
