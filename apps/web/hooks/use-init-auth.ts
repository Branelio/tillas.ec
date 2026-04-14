'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Hook que carga el usuario autenticado al montar la app.
 * Se usa una sola vez en el layout principal.
 */
export function useInitAuth() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);
}
