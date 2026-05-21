import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import AdminLayoutClient from '@/components/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'TILLAS.EC — Panel de Administración',
  description: 'Panel de administración de TILLAS.EC',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-admin-bg text-white antialiased flex h-screen overflow-hidden" suppressHydrationWarning>
        <ToastProvider>
          <AdminLayoutClient>
            {children}
          </AdminLayoutClient>
        </ToastProvider>
      </body>
    </html>
  );
}
