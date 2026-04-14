'use client';
import { create } from 'zustand';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<{ email: string }>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

// Helper para verificar si hay token
const hasToken = () => typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: hasToken(),

  login: async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  register: async (formData) => {
    const { data } = await authApi.register(formData);
    return { email: data.email };
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, isLoading: false });
    // Redirigir al login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  loadUser: async () => {
    // Si ya está cargado, no volver a cargar
    if (get().user && !get().isLoading) return;

    set({ isLoading: true });
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const { data } = await authApi.getProfile();
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      // Token inválido o expirado, limpiar
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
