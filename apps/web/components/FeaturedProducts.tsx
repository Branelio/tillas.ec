'use client';
import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';
import ProductCard from './ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  brand?: { name: string };
  variants?: { price: number; compareAt?: number | null }[];
  isFeatured?: boolean;
  createdAt?: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.getFeatured()
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : data?.data || [];
        setProducts(items.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-tillas-accent" />
              <span className="text-tillas-accent text-xs font-bold uppercase tracking-widest">Selección Premium</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Productos Destacados
            </h2>
          </div>
          <Link href="/shop?filter=featured"
            className="hidden md:flex items-center gap-2 text-tillas-primary text-sm font-semibold hover:gap-3 transition-all group">
            Ver todos <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-tillas-surface rounded-2xl overflow-hidden border border-tillas-border">
                <div className="aspect-square shimmer-bg" />
                <div className="p-4 space-y-2">
                  <div className="h-3 shimmer-bg rounded w-16" />
                  <div className="h-4 shimmer-bg rounded w-full" />
                  <div className="h-4 shimmer-bg rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <Link href="/shop?filter=featured"
          className="md:hidden flex items-center justify-center gap-2 mt-8 py-3 border border-tillas-border rounded-xl text-tillas-primary text-sm font-semibold hover:bg-tillas-surface transition-colors">
          Ver todos los destacados <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
