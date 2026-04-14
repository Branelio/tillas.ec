'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Flame, Users, Menu, X, LogOut, DollarSign, ArrowLeftRight, Settings,
} from 'lucide-react';
import { useState } from 'react';
import { adminAuthApi } from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Productos', icon: Package },
  { href: '/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/payments', label: 'Pagos', icon: DollarSign },
  { href: '/drops', label: 'Drops', icon: Flame },
  { href: '/users', label: 'Usuarios', icon: Users },
  { href: '/returns', label: 'Devoluciones', icon: ArrowLeftRight },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    adminAuthApi.logout();
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-admin-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-heading font-bold text-lg text-admin-primary">TILLAS</span>
          <span className="text-xs bg-admin-primary/20 text-admin-primary px-2 py-0.5 rounded font-bold">ADMIN</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-admin-primary/10 text-admin-primary'
                  : 'text-gray-400 hover:text-white hover:bg-admin-card'
              }`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-admin-border">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all w-full">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-admin-surface border-r border-admin-border hidden md:flex flex-col shrink-0 fixed inset-y-0 left-0 z-40">
        <NavContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-admin-card rounded-lg border border-admin-border text-gray-400"
      >
        <Menu size={20} />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-admin-surface flex flex-col md:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
}
