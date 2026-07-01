import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as any;

  if (pathname.startsWith('/admin')) {
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  if (pathname.startsWith('/seller')) {
    if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  if (pathname.startsWith('/customer')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/customer/:path*'],
};
