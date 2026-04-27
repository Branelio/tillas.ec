import FeaturedProducts from '@/components/FeaturedProducts';
import NewArrivals from '@/components/NewArrivals';
import BrandsShowcase from '@/components/BrandsShowcase';
import CountdownBanner from '@/components/CountdownBanner';
import Link from 'next/link';
import { ArrowRight, Shield, CreditCard, Truck, Star, Zap, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tillas-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-tillas-accent/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-tillas-primary/3 to-transparent rounded-full blur-[150px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-tillas-surface/80 backdrop-blur-sm border border-tillas-border rounded-full mb-8 animate-fade-in-down">
            <span className="w-2 h-2 rounded-full bg-tillas-primary animate-pulse" />
            <span className="text-gray-400 text-xs font-medium">Envío gratis en compras sobre $100</span>
          </div>

          {/* Main heading */}
          <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none animate-fade-in-up">
            <span className="gradient-text">TILLAS</span>
            <span className="text-white">.EC</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            La tienda de sneakers <strong className="text-white">#1 de Ecuador</strong> 🇪🇨
          </p>

          {/* Brand logos text */}
          <p className="mt-3 text-sm text-gray-600 tracking-widest uppercase animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            Nike • Jordan • Adidas • New Balance • Puma • Converse
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <Link href="/shop"
              className="group px-10 py-4 bg-tillas-primary text-black font-bold rounded-xl text-lg hover:bg-tillas-primaryDark transition-all hover:scale-105 active:scale-95 shadow-lg shadow-tillas-primary/20 flex items-center justify-center gap-2">
              Ver Catálogo
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/drops"
              className="px-10 py-4 border border-tillas-primary/50 text-tillas-primary font-bold rounded-xl text-lg hover:bg-tillas-primary/10 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm">
              Próximos Drops 🔥
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-2 text-gray-500">
              <Shield size={16} className="text-tillas-primary" />
              <span className="text-xs font-medium">100% Original</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Truck size={16} className="text-tillas-primary" />
              <span className="text-xs font-medium">Envío a todo Ecuador</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <CreditCard size={16} className="text-tillas-primary" />
              <span className="text-xs font-medium">Pago seguro</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-2.5 bg-gray-500 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ═══════════════ BRANDS MARQUEE ═══════════════ */}
      <div className="section-divider" />
      <BrandsShowcase />
      <div className="section-divider" />

      {/* ═══════════════ FEATURED PRODUCTS ═══════════════ */}
      <FeaturedProducts />

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-tillas-surface border border-tillas-border p-10 md:p-16 text-center">
            {/* Decorative */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-tillas-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
                ¿Por qué <span className="gradient-text">TILLAS.EC</span>?
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-12">
                No somos solo una tienda. Somos la experiencia sneaker que Ecuador necesita.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-tillas-bg/50 rounded-2xl p-6 border border-tillas-border card-hover">
                  <div className="w-12 h-12 rounded-xl bg-tillas-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield size={24} className="text-tillas-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">Autenticidad</h3>
                  <p className="text-gray-400 text-sm">Cada par verificado y autenticado. Solo vendemos originales, sin excepciones.</p>
                </div>

                <div className="bg-tillas-bg/50 rounded-2xl p-6 border border-tillas-border card-hover">
                  <div className="w-12 h-12 rounded-xl bg-tillas-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Zap size={24} className="text-tillas-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">Drops Exclusivos</h3>
                  <p className="text-gray-400 text-sm">Accede a los lanzamientos más buscados con nuestro sistema de drops y raffles.</p>
                </div>

                <div className="bg-tillas-bg/50 rounded-2xl p-6 border border-tillas-border card-hover">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <Award size={24} className="text-purple-400" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">Lealtad Premiada</h3>
                  <p className="text-gray-400 text-sm">Gana puntos en cada compra, sube de nivel y desbloquea acceso anticipado.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ NEW ARRIVALS ═══════════════ */}
      <NewArrivals />

      {/* ═══════════════ DROP COUNTDOWN ═══════════════ */}
      <CountdownBanner />

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '500+', label: 'Sneakers disponibles', icon: '👟' },
              { value: '24-48h', label: 'Envío en Quito', icon: '🚀' },
              { value: '100%', label: 'Originales', icon: '✅' },
              { value: '4.9', label: 'Calificación', icon: '⭐' },
            ].map((stat) => (
              <div key={stat.label} className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border text-center card-hover">
                <span className="text-2xl mb-2 block">{stat.icon}</span>
                <p className="font-heading text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SOCIAL PROOF / CTA FINAL ═══════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={20} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-gray-400 text-lg italic mb-2">
            &ldquo;Los mejores sneakers que he comprado en Ecuador. Envío rapidísimo y 100% originales.&rdquo;
          </p>
          <p className="text-gray-600 text-sm">— Cliente verificado, Quito</p>

          <Link href="/shop"
            className="inline-flex items-center gap-2 mt-10 px-10 py-4 bg-tillas-primary text-black font-bold rounded-xl text-lg hover:bg-tillas-primaryDark transition-all hover:scale-105 active:scale-95 shadow-lg shadow-tillas-primary/20">
            Explorar Catálogo <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
