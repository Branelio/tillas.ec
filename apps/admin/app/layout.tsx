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
    <html lang="es">
      <body className="bg-admin-bg text-white antialiased">
        <ToastProvider>
          <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 md:ml-64 p-6 lg:p-8">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
