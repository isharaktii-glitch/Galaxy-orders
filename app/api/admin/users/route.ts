import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error:'Forbidden' }, { status:403 });
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const users = await db.user.findMany({
      where: {
        ...(role && { role:role as any }),
        ...(search && { OR:[{ username:{ contains:search, mode:'insensitive' } },{ email:{ contains:search, mode:'insensitive' } },{ firstName:{ contains:search, mode:'insensitive' } }] }),
      },
      select:{ id:true,username:true,firstName:true,lastName:true,email:true,phone:true,role:true,isActive:true,kycVerified:true,phoneVerified:true,createdAt:true,
        _count:{ select:{ products:true,ordersAsSeller:true,ordersAsCustomer:true } } },
      orderBy:{ createdAt:'desc' },
    });
    return NextResponse.json(users);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error:'Forbidden' }, { status:403 });
    const { id, isActive, kycVerified } = await req.json();
    const user = await db.user.update({ where:{ id }, data:{ ...(isActive!==undefined&&{ isActive }), ...(kycVerified!==undefined&&{ kycVerified }) } });
    return NextResponse.json(user);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
