'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    brand?: { name: string };
    variants?: { price: number; compareAt?: number | null }[];
    isFeatured?: boolean;
    createdAt?: string;
  };
  isNew?: boolean;
}

export default function ProductCard({ product, isNew }: ProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [liked, setLiked] = useState(false);

  const price = Number(product.variants?.[0]?.price) || 0;
  const compareAt = product.variants?.[0]?.compareAt ? Number(product.variants[0].compareAt) : null;
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;
  const image = product.images?.[0] || '/placeholder.jpg';

  // Check if product is new (created within last 7 days)
  const isRecentlyAdded = isNew || (product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000);

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative bg-tillas-surface rounded-2xl overflow-hidden border border-tillas-border hover:border-tillas-primary/30 transition-all duration-300 card-hover">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-tillas-surfaceElevated">
          {!imgLoaded && <div className="absolute inset-0 shimmer-bg" />}
          <img
            src={image}
            alt={product.name}
            className={`object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-tillas-accent text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                -{discount}%
              </span>
            )}
            {isRecentlyAdded && (
              <span className="bg-tillas-primary text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                NUEVO
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
            className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          >
            <Heart
              size={16}
              className={liked ? 'text-red-400 fill-red-400' : 'text-gray-300'}
            />
          </button>

          {/* Quick view overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-medium text-white flex items-center gap-1">
              Ver detalles →
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand && (
            <p className="text-tillas-primary text-[11px] font-semibold uppercase tracking-wider mb-1">
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
