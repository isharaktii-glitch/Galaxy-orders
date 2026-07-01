import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  if ((session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
    redirect('/customer/dashboard');
  }
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
