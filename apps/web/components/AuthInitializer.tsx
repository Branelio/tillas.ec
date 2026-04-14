'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Componente que se monta una sola vez al iniciar la app.
 * Carga los datos del usuario si hay un token guardado.
 */
export default function AuthInitializer() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
