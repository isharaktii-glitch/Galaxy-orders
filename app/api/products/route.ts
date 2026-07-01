import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const sellerId = searchParams.get('sellerId');
    const search = searchParams.get('search');
    const products = await db.product.findMany({
      where: { isActive:true, ...(category&&{ categoryId:category }), ...(sellerId&&{ sellerId }), ...(search&&{ OR:[{ title:{ contains:search,mode:'insensitive' } },{ description:{ contains:search,mode:'insensitive' } }] }) },
      include:{ seller:{ select:{ username:true,firstName:true,lastName:true } }, category:true },
      orderBy:{ createdAt:'desc' },
    });
    return NextResponse.json(products);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const { title,description,basePrice,categoryId,stock,imageUrl } = await req.json();
    const setting = await db.globalSetting.findUnique({ where:{ key:'globalProfitPercent' } });
    const profitPercent = setting ? parseFloat(setting.value) : 10;
    const finalPrice = basePrice*(1+profitPercent/100);
    const product = await db.product.create({
      data:{ title,description,basePrice,finalPrice,profitPercent,categoryId,stock:stock||0,imageUrl,sellerId:(session.user as any).id },
    });
    return NextResponse.json(product);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const { id, profitPercent, ...rest } = await req.json();
    const product = await db.product.findUnique({ where:{ id } });
    if (!product) return NextResponse.json({ error:'Not found' }, { status:404 });
    const newProfit = profitPercent??product.profitPercent;
    const finalPrice = product.basePrice*(1+newProfit/100);
    const updated = await db.product.update({ where:{ id }, data:{ ...rest, profitPercent:newProfit, finalPrice } });
    return NextResponse.json(updated);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
