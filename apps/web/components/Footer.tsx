import Link from 'next/link';
import { Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-tillas-surface border-t border-tillas-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-heading font-bold text-2xl">
              <span className="text-tillas-primary">TILLAS</span>
              <span className="text-white">.EC</span>
            </Link>
            <p className="text-gray-500 text-sm mt-3">
              La tienda de sneakers #1 de Ecuador 🇪🇨
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com/tillas.ec" target="_blank" rel="noopener"
                className="p-2 bg-tillas-surfaceElevated rounded-lg text-gray-400 hover:text-tillas-primary transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://wa.me/593991234567" target="_blank" rel="noopener"
                className="p-2 bg-tillas-surfaceElevated rounded-lg text-gray-400 hover:text-tillas-primary transition-colors">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4">TIENDA</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/shop" className="hover:text-white transition-colors">Catálogo</Link></li>
              <li><Link href="/shop?filter=new" className="hover:text-white transition-colors">Nuevos</Link></li>
              <li><Link href="/drops" className="hover:text-white transition-colors">Drops</Link></li>
              <li><Link href="/shop?filter=featured" className="hover:text-white transition-colors">Destacados</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4">INFORMACIÓN</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Envíos</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Devoluciones</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4">LEGAL</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-tillas-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © 2026 TILLAS.EC — Hecho con 💚 en Quito, Ecuador
          </p>
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <span>Pagos seguros por </span>
            <span className="text-tillas-primary font-bold">Transferencia Bancaria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
