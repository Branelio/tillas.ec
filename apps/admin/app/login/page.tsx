'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuthApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminAuthApi.login({ email, password });
      
      // Store token in httpOnly cookie (more secure than localStorage)
      // Note: For httpOnly cookies, you need to set them via backend
      // For now, we'll use localStorage but recommend moving to httpOnly cookies
      localStorage.setItem('adminToken', response.data.accessToken);
      
      // Also store in cookie for middleware access
      document.cookie = `adminToken=${response.data.accessToken}; path=/; max-age=${60 * 60 * 24 * 30}`;

      const callbackUrl =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('callbackUrl') || '/dashboard'
          : '/dashboard';
      
      router.push(callbackUrl);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-white">TILLAS</h1>
          <p className="text-admin-text-secondary mt-2">Panel de Administración</p>
        </div>

        {/* Login Form */}
        <div className="bg-admin-surface rounded-2xl p-8 border border-admin-border">
          <h2 className="font-heading text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-400 text-sm mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-admin-elevated border border-admin-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-admin-primary/50 focus:outline-none"
                placeholder="admin@tillas.ec"
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-400 text-sm mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-admin-elevated border border-admin-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-admin-primary/50 focus:outline-none"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-admin-primary text-white font-bold rounded-xl hover:bg-admin-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-admin-text-muted text-sm mt-6">
          © 2026 TILLAS.EC — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
