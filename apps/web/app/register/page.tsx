'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuthStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyOtp({ email: form.email, code: otp });
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código OTP incorrecto');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    try {
      await authApi.resendOtp(form.email);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reenviar OTP');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-white">
            {step === 'form' ? 'Crear Cuenta' : 'Verifica tu Email'}
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 'form' ? 'Únete a la comunidad TILLAS.EC' : `Enviamos un código a ${form.email}`}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleRegister} className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nombre</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  placeholder="Tu nombre" className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  placeholder="tu@email.com" className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Teléfono</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+593991234567" className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8}
                  placeholder="Mínimo 8 caracteres" className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-tillas-primary text-black font-bold rounded-xl text-lg hover:bg-tillas-primaryDark transition-colors disabled:opacity-50">
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Código OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="000000"
                className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-4 py-4 text-white text-center text-2xl tracking-[12px] font-bold placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary transition-colors"
              />
            </div>

            <button type="submit" disabled={loading || otp.length < 6}
              className="w-full py-3.5 bg-tillas-primary text-black font-bold rounded-xl text-lg hover:bg-tillas-primaryDark transition-colors disabled:opacity-50">
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>

            <button type="button" onClick={handleResendOtp}
              className="w-full text-center text-gray-500 text-sm hover:text-tillas-primary transition-colors">
              ¿No recibiste el código? Reenviar
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-tillas-primary font-medium hover:underline">Iniciar Sesión</Link>
        </p>
      </div>
    </div>
  );
}
