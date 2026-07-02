import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const stores = await db.store.findMany({
      include:{ user:{ select:{ username:true,email:true } } },
      orderBy:{ createdAt:'desc' },
    });
    return NextResponse.json(stores);
  } catch { return NextResponse.json([], { status:200 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const { name, description, logoUrl } = await req.json();
    const store = await db.store.upsert({
      where:{ userId:(session.user as any).id },
      update:{ name, description, logoUrl },
      create:{ userId:(session.user as any).id, name, description, logoUrl },
    });
    return NextResponse.json(store);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
