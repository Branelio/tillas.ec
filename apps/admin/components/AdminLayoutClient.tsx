'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <main className={`flex-1 w-full overflow-y-auto h-screen bg-admin-bg ${isLoginPage ? '' : 'md:ml-64 p-6 lg:p-10'}`}>
        <div className={`w-full ${isLoginPage ? '' : 'max-w-[1600px] mx-auto'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
