import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error:'Forbidden' }, { status:403 });
    const [totalUsers,totalSellers,totalCustomers,totalProducts,totalOrders,pendingOrders,pendingPayments,revenue] = await Promise.all([
      db.user.count(),
      db.user.count({ where:{ role:'SELLER' } }),
      db.user.count({ where:{ role:'CUSTOMER' } }),
      db.product.count({ where:{ isActive:true } }),
      db.order.count(),
      db.order.count({ where:{ status:'PENDING' } }),
      db.payment.count({ where:{ status:'PENDING' } }),
      db.order.aggregate({ _sum:{ totalAmount:true } }),
    ]);
    return NextResponse.json({ totalUsers,totalSellers,totalCustomers,totalProducts,totalOrders,pendingOrders,pendingPayments, totalRevenue:revenue._sum.totalAmount||0 });
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
