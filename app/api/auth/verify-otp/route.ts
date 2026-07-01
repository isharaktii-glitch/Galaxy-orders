import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, code } = await req.json();
    const otp = await db.otpCode.findFirst({
      where:{ userId, code, used:false, expiresAt:{ gt:new Date() } },
    });
    if (!otp) return NextResponse.json({ error:'Invalid or expired OTP' }, { status:400 });
    await db.otpCode.update({ where:{ id:otp.id }, data:{ used:true } });
    await db.user.update({ where:{ id:userId }, data:{ phoneVerified:true } });
    return NextResponse.json({ success:true });
  } catch {
    return NextResponse.json({ error:'Verification failed' }, { status:500 });
  }
}
