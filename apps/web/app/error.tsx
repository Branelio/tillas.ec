'use client';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-tillas-error/10 border border-tillas-error/20 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <AlertTriangle size={36} className="text-tillas-error" />
        </div>

        <h1 className="font-heading text-3xl font-bold text-white mb-3 animate-fade-in-up">
          ¡Algo salió mal!
        </h1>
        <p className="text-gray-400 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Ocurrió un error inesperado. Por favor intenta de nuevo.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
          <Link href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-tillas-border text-gray-300 font-medium rounded-xl hover:bg-tillas-surface transition-colors">
            <Home size={16} />
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
