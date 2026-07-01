import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const { auctionId, amount } = await req.json();
    const userId = (session.user as any).id as string;
    const auction = await db.auction.findUnique({ where:{ id:auctionId } });
    if (!auction||auction.status!=='ACTIVE') return NextResponse.json({ error:'Auction not available' }, { status:400 });
    if (new Date()>auction.endTime) return NextResponse.json({ error:'Auction has ended' }, { status:400 });
    const minBid = (auction.currentBid||auction.startPrice)+auction.minBidStep;
    if (amount<minBid) return NextResponse.json({ error:`Minimum bid is ${minBid}` }, { status:400 });
    const bid = await db.auctionBid.create({ data:{ auctionId, userId, amount } });
    await db.auction.update({ where:{ id:auctionId }, data:{ currentBid:amount, winnerId:userId } });
    return NextResponse.json(bid);
  } catch { return NextResponse.json({ error:'Bid failed' }, { status:500 }); }
}
