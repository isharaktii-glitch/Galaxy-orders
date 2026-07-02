import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');
  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-gray-950 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
