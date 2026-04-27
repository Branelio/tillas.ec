import type { Metadata } from 'next';
import './globals.css';
import AdminSidebar from '@/components/AdminSidebar';
import { ToastProvider } from '@/components/ToastProvider';

export const metadata: Metadata = {
  title: 'TILLAS.EC — Panel de Administración',
  description: 'Panel de administración de TILLAS.EC',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-admin-bg text-white antialiased flex h-screen overflow-hidden" suppressHydrationWarning>
        <ToastProvider>
          <div className="flex min-h-screen w-full">
            <AdminSidebar />
            <main className="flex-1 md:ml-64 p-6 lg:p-10 w-full overflow-y-auto h-screen bg-admin-bg">
              <div className="w-full max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
