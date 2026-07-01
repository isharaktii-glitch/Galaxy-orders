import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const auctions = await db.auction.findMany({
      include:{ items:{ include:{ product:{ select:{ title:true,imageUrl:true } } } }, bids:{ include:{ user:{ select:{ username:true } } }, orderBy:{ amount:'desc' }, take:5 }, _count:{ select:{ bids:true } } },
      orderBy:{ createdAt:'desc' },
    });
    return NextResponse.json(auctions);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json();
    const auction = await db.auction.create({
      data:{ title:body.title, description:body.description, startPrice:body.startPrice, currentBid:body.startPrice, minBidStep:body.minBidStep||10, adminProfit:body.adminProfit||5, startTime:new Date(body.startTime), endTime:new Date(body.endTime), createdBy:(session.user as any).id, status:'ACTIVE' },
    });
    return NextResponse.json(auction);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
