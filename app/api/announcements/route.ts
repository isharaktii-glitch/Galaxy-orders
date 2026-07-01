import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role!=='ADMIN') return NextResponse.json({ error:'Forbidden' }, { status:403 });
    const { title, message, targetRole, userIds } = await req.json();
    const announcement = await db.announcement.create({ data:{ title, message } });
    let recipients: string[] = [];
    if (userIds?.length) { recipients = userIds; }
    else if (targetRole) { const users = await db.user.findMany({ where:{ role:targetRole }, select:{ id:true } }); recipients = users.map(u=>u.id); }
    if (recipients.length>0) { await db.announcementRecipient.createMany({ data:recipients.map(userId=>({ announcementId:announcement.id, userId })) }); }
    return NextResponse.json(announcement);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const announcements = await db.announcementRecipient.findMany({
      where:{ userId:(session.user as any).id },
      include:{ announcement:true },
      orderBy:{ announcement:{ createdAt:'desc' } },
    });
    return NextResponse.json(announcements);
  } catch { return NextResponse.json({ error:'Failed' }, { status:500 }); }
}
