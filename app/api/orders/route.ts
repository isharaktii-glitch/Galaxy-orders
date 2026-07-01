import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const role = (session.user as any).role;
    const userId = (session.user as any).id;
    let orders;
    if (role==='ADMIN') {
      orders = await db.order.findMany({ include:{ customer:{ select:{ username:true,firstName:true,lastName:true,phone:true } }, seller:{ select:{ username:true,firstName:true,lastName:true } }, items:{ include:{ product:{ select:{ title:true,imageUrl:true } } } }, payment:true }, orderBy:{ createdAt:'desc' } });
    } else if (role==='SELLER') {
      orders = await db.order.findMany({ where:{ sellerId:userId }, include:{ customer:{ select:{ username:true,firstName:true,lastName:true } }, items:{ include:{ product:{ select:{ title:true } } } }, payment:true }, orderBy:{ createdAt:'desc' } });
    } else {
      orders = await db.order.findMany({ where:{ customerId:userId }, include:{ seller:{ select:{ username:true,firstName:true,lastName:true } }, items:{ include:{ product:{ select:{ title:true,imageUrl:true } } } }, payment:true }, orderBy:{ createdAt:'desc' } });
    }
    return NextResponse.json(orders);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const { items, sellerId, note } = await req.json();
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await db.product.findUnique({ where:{ id:item.productId } });
      if (product) {
        totalAmount += product.finalPrice*item.quantity;
        orderItems.push({ productId:item.productId, quantity:item.quantity, price:product.finalPrice });
      }
    }
    const order = await db.order.create({
      data:{ customerId:(session.user as any).id, sellerId, totalAmount, note, status:'PENDING', items:{ create:orderItems } },
    });
    return NextResponse.json(order);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const { id, status, rejectReason } = await req.json();
    const order = await db.order.update({ where:{ id }, data:{ status, ...(rejectReason&&{ rejectReason }) } });
    return NextResponse.json(order);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
