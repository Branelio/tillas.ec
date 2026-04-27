import Link from 'next/link';
import { Search, Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="mb-6">
          <span className="font-heading text-[120px] md:text-[160px] font-bold leading-none gradient-text opacity-30">
            404
          </span>
        </div>

        <h1 className="font-heading text-3xl font-bold text-white mb-3 -mt-8 relative z-10">
          Página no encontrada
        </h1>
        <p className="text-gray-400 mb-8">
          La página que buscas no existe o fue movida. ¡Pero hay muchos sneakers esperándote!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-all hover:scale-105 active:scale-95 shadow-lg shadow-tillas-primary/20">
            <ShoppingBag size={16} />
            Ver Catálogo
          </Link>
          <Link href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-tillas-border text-gray-300 font-medium rounded-xl hover:bg-tillas-surface transition-colors">
            <Home size={16} />
            Ir al Inicio
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-tillas-border">
          <p className="text-gray-600 text-xs uppercase tracking-wider mb-4">Páginas populares</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Catálogo', href: '/shop' },
              { label: 'Drops', href: '/drops' },
              { label: 'Nuevos', href: '/shop?filter=new' },
              { label: 'Contacto', href: '/contact' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="text-sm text-gray-400 hover:text-tillas-primary px-3 py-1.5 bg-tillas-surface rounded-lg border border-tillas-border hover:border-tillas-primary/30 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
