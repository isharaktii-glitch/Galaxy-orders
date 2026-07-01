import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, firstName, lastName, email, phone, whatsapp, address, password, role } = await req.json();
    if (!username||!email||!password||!firstName||!lastName||!phone) {
      return NextResponse.json({ error:'Missing required fields' }, { status:400 });
    }
    const existing = await db.user.findFirst({ where:{ OR:[{email},{username}] } });
    if (existing) return NextResponse.json({ error:'Email or username already exists' }, { status:409 });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { username, firstName, lastName, email, phone, whatsapp, address, password:hashedPassword, role:role||'CUSTOMER', isActive:true, phoneVerified:false },
    });

    const otp = Math.floor(100000 + Math.random()*900000).toString();
    const expiresAt = new Date(Date.now() + 10*60*1000);
    await db.otpCode.create({ data:{ userId:user.id, code:otp, expiresAt } });

    // Log OTP in dev (add Twilio later)
    console.log(`[OTP] User: ${user.id} | Code: ${otp}`);

    return NextResponse.json({ userId:user.id, message:'OTP sent' });
  } catch(error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error:error.message||'Registration failed' }, { status:500 });
  }
}
