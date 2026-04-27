'use client';
import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function BrandsShowcase() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    productsApi.getBrands()
      .then(({ data }) => setBrands(data || []))
      .catch(() => {});
  }, []);

  if (brands.length === 0) return null;

  // Duplicate brands for seamless marquee effect
  const allBrands = [...brands, ...brands];

  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <p className="text-center text-tillas-text-muted text-xs font-semibold uppercase tracking-[0.2em]">
          Las mejores marcas del mundo
        </p>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-tillas-bg to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-tillas-bg to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap">
          {allBrands.map((brand, i) => (
            <a
              key={`${brand.id}-${i}`}
              href={`/shop?brand=${brand.slug}`}
              className="inline-flex items-center justify-center mx-6 md:mx-10 px-8 py-4 bg-tillas-surface/50 border border-tillas-border/50 rounded-2xl hover:border-tillas-primary/30 hover:bg-tillas-surface transition-all duration-300 group shrink-0"
            >
              <span className="font-heading text-lg md:text-xl font-bold text-gray-400 group-hover:text-white transition-colors tracking-wide uppercase">
                {brand.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
