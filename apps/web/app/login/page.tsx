'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/shop';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, callbackUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.push(callbackUrl);
    } catch (err: any) {
      console.error('Error de login:', err);
      
      if (err.response?.status === 401) {
        setError('Email o contraseña incorrectos. Inténtalo de nuevo.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error de conexión. Verifica que la API esté corriendo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-tillas-bg to-tillas-surface/20">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tillas-primary/10 border border-tillas-primary/20 mb-4">
            <ShoppingBag size={32} className="text-tillas-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">Bienvenido de vuelta</h1>
          <p className="text-tillas-text-secondary mt-2">Inicia sesión en tu cuenta TILLAS.EC</p>
        </div>

        {/* Form Card */}
        <div className="bg-tillas-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-tillas-border shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-tillas-text-secondary mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tillas-text-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="w-full bg-tillas-surface-elevated border border-tillas-border rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-tillas-text-muted focus:outline-none focus:border-tillas-primary focus:ring-2 focus:ring-tillas-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-tillas-text-secondary mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tillas-text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-tillas-surface-elevated border border-tillas-border rounded-xl pl-11 pr-12 py-3.5 text-white placeholder:text-tillas-text-muted focus:outline-none focus:border-tillas-primary focus:ring-2 focus:ring-tillas-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tillas-text-muted hover:text-white transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-tillas-primary text-black font-bold rounded-xl text-lg hover:bg-tillas-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-tillas-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-tillas-surface text-tillas-text-muted">o</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-tillas-text-secondary text-sm">
              ¿No tienes cuenta?{' '}
              <Link
                href="/register"
                className="text-tillas-primary font-semibold hover:underline transition-all"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-tillas-text-muted text-xs mt-8">
          © 2026 TILLAS.EC — Hecho con ❤️ en Quito, Ecuador
        </p>
      </div>
    </div>
  );
}
