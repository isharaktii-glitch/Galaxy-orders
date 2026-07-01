import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const isAdmin = (session?.user as any)?.role==='ADMIN';
    const categories = await db.category.findMany({
      where: isAdmin?{}:{ isVisible:true },
      include:{ _count:{ select:{ products:true } } },
      orderBy:{ name:'asc' },
    });
    return NextResponse.json(categories);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role!=='ADMIN') return NextResponse.json({ error:'Forbidden' }, { status:403 });
    const body = await req.json();
    const slug = body.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    const category = await db.category.create({ data:{ ...body, slug } });
    return NextResponse.json(category);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role!=='ADMIN') return NextResponse.json({ error:'Forbidden' }, { status:403 });
    const { id, ...data } = await req.json();
    const category = await db.category.update({ where:{ id }, data });
    return NextResponse.json(category);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
