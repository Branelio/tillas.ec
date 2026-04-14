'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    brand?: { name: string };
    variants?: { price: number; compareAt?: number | null }[];
    isFeatured?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = Number(product.variants?.[0]?.price) || 0;
  const compareAt = product.variants?.[0]?.compareAt ? Number(product.variants[0].compareAt) : null;
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;
  const image = product.images?.[0] || '/placeholder.jpg';

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative bg-tillas-surface rounded-2xl overflow-hidden border border-tillas-border hover:border-tillas-primary/30 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-tillas-surfaceElevated">
          <img
            src={image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-tillas-accent text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              -{discount}%
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Heart size={16} />
          </button>

          {/* Quick view overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-medium text-white">Ver detalles →</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand && (
            <p className="text-tillas-primary text-xs font-semibold uppercase tracking-wider mb-1">
              {product.brand.name}
            </p>
          )}
          <h3 className="font-heading text-sm font-semibold text-white truncate group-hover:text-tillas-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white font-bold">${price.toFixed(2)}</span>
            {compareAt && (
              <span className="text-gray-500 text-sm line-through">${compareAt.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
