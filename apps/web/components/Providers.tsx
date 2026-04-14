'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export default function Providers({ children }: { children: React.ReactNode }) {
  const { loadUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Cargar usuario solo una vez al montar
    loadUser();
    setMounted(true);
  }, [loadUser]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-tillas-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tillas-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
