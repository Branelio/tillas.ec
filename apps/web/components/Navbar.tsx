'use client';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, Package, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(search.trim())}`;
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 bg-tillas-bg/80 backdrop-blur-xl border-b border-tillas-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 font-heading font-bold text-xl">
            <span className="text-tillas-primary">TILLAS</span>
            <span className="text-white">.EC</span>
          </Link>

          {/* Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Catálogo
            </Link>
            <Link href="/drops" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Drops
            </Link>
            <Link href="/shop?filter=new" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Nuevos
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>

            {/* User dropdown / Auth */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Mi cuenta"
                >
                  <div className="w-7 h-7 rounded-full bg-tillas-primary/20 flex items-center justify-center">
                    <span className="text-tillas-primary text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <ChevronDown size={14} className={`hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-tillas-surface rounded-xl border border-tillas-border shadow-xl shadow-black/30 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-tillas-border">
                      <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-tillas-surfaceElevated transition-colors">
                        <User size={16} /> Mi Perfil
                      </Link>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-tillas-surfaceElevated transition-colors">
                        <Package size={16} /> Mis Pedidos
                      </Link>
                    </div>
                    <div className="border-t border-tillas-border py-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={16} /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Iniciar sesión">
                <User size={20} />
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-tillas-primary text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
              aria-label="Menú"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar sneakers, marcas, modelos..."
              autoFocus
              className="w-full bg-tillas-surface border border-tillas-border rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-tillas-primary transition-colors"
            />
          </form>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-tillas-border pt-4 space-y-3">
            <Link href="/shop" onClick={() => setMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition-colors text-sm font-medium py-2">
              Catálogo
            </Link>
            <Link href="/drops" onClick={() => setMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition-colors text-sm font-medium py-2">
              Drops 🔥
            </Link>
            <Link href="/shop?filter=new" onClick={() => setMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition-colors text-sm font-medium py-2">
              Nuevos
            </Link>
            {isAuthenticated && (
              <>
                <div className="border-t border-tillas-border my-2" />
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="block text-gray-300 hover:text-white transition-colors text-sm font-medium py-2">
                  Mi Perfil
                </Link>
                <Link href="/orders" onClick={() => setMenuOpen(false)}
                  className="block text-gray-300 hover:text-white transition-colors text-sm font-medium py-2">
                  Mis Pedidos
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
