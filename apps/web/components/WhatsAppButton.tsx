'use client';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/593983199406?text=Hola%20TILLAS.EC!%20Me%20interesa%20saber%20más"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 group"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-green-500/30 animate-pulse-ring" />

      {/* Button */}
      <div className="relative flex items-center gap-2 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-110 transition-all duration-300 px-4 py-3 md:px-5 md:py-3.5">
        <MessageCircle size={22} className="shrink-0" />
        <span className="hidden md:inline text-sm font-semibold whitespace-nowrap">¿Necesitas ayuda?</span>
      </div>

      {/* Tooltip - mobile */}
      <div className="md:hidden absolute -top-10 right-0 bg-tillas-surface text-white text-xs px-3 py-1.5 rounded-lg border border-tillas-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
        WhatsApp
      </div>
    </a>
  );
}
