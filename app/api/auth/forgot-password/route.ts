import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const user = await db.user.findUnique({ where:{ email } });
    if (!user) return NextResponse.json({ success:true });
    const token = uuidv4();
    await db.passwordReset.create({
      data:{ userId:user.id, token, expiresAt:new Date(Date.now()+60*60*1000) },
    });
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    console.log(`[RESET] ${resetUrl}`);
    // Add email sending here later with nodemailer
    return NextResponse.json({ success:true });
  } catch {
    return NextResponse.json({ error:'Failed' }, { status:500 });
  }
}
