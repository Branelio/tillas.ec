'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productsApi, reviewsApi } from '@/lib/api';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { ShoppingBag, Heart, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';

interface Variant {
  id: string;
  size: string;
  price: number;
  compareAt?: number | null;
  stock: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  brand: { name: string };
  model: string;
  colorway?: string;
  styleCode?: string;
  story?: string;
  variants: Variant[];
  category: { name: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<any>(null);

  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsApi.getBySlug(slug)
      .then(({ data }) => {
        setProduct(data);
        if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product?.id) {
      reviewsApi.getByProduct(product.id).then(({ data }) => setReviews(data)).catch(() => {});
    }
  }, [product?.id]);

  const handleAddToCart = async () => {
    if (!selectedVariant || !isAuthenticated) {
      if (!isAuthenticated) window.location.href = '/login';
      return;
    }
    setAdding(true);
    try {
      await addItem(selectedVariant.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Error agregando al carrito:', err);
    }
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-tillas-surface rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-tillas-surface rounded w-24 animate-pulse" />
            <div className="h-8 bg-tillas-surface rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-tillas-surface rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-32">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="font-heading text-2xl text-white">Producto no encontrado</h2>
        <Link href="/shop" className="mt-4 text-tillas-primary hover:underline inline-block">← Volver al catálogo</Link>
      </div>
    );
  }

  const price = Number(selectedVariant?.price ?? product.variants[0]?.price ?? 0);
  const compareAt = selectedVariant?.compareAt ? Number(selectedVariant.compareAt) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/shop" className="hover:text-white transition-colors">Catálogo</Link>
        <span>/</span>
        <span className="text-gray-400">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square bg-tillas-surface rounded-2xl overflow-hidden border border-tillas-border">
            <img
              src={product.images[currentImage] || '/placeholder.jpg'}
              alt={product.name}
              className="object-cover w-full h-full"
            />
            {product.images.length > 1 && (
              <>
                <button onClick={() => setCurrentImage((p) => (p - 1 + product.images.length) % product.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setCurrentImage((p) => (p + 1) % product.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${i === currentImage ? 'border-tillas-primary' : 'border-tillas-border'}`}>
                  <img src={img} alt="" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-tillas-primary text-sm font-semibold uppercase tracking-wider">{product.brand.name}</p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mt-1">{product.name}</h1>

          {product.colorway && (
            <p className="text-gray-400 text-sm mt-1">{product.colorway} {product.styleCode && `• ${product.styleCode}`}</p>
          )}

          {/* Reviews summary */}
          {reviews && reviews.totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={14} className={s <= Math.round(reviews.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                ))}
              </div>
              <span className="text-gray-400 text-sm">{reviews.averageRating} ({reviews.totalReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-5">
            <span className="text-3xl font-bold text-white">${price.toFixed(2)}</span>
            {compareAt && (
              <>
                <span className="text-lg text-gray-500 line-through">${compareAt.toFixed(2)}</span>
                <span className="text-tillas-accent font-bold text-sm">-{Math.round((1 - price / compareAt) * 100)}%</span>
              </>
            )}
          </div>

          {/* Size selector */}
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-300 mb-3">Talla</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  disabled={v.stock === 0}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    selectedVariant?.id === v.id
                      ? 'bg-tillas-primary text-black border-tillas-primary'
                      : v.stock === 0
                      ? 'bg-tillas-surface text-gray-600 border-tillas-border cursor-not-allowed line-through'
                      : 'bg-tillas-surface text-white border-tillas-border hover:border-tillas-primary/50'
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleAddToCart}
              disabled={adding || !selectedVariant || selectedVariant.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold transition-all ${
                added
                  ? 'bg-tillas-success text-white'
                  : 'bg-tillas-primary text-black hover:bg-tillas-primaryDark'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {added ? <><Check size={20} /> ¡Agregado!</> : <><ShoppingBag size={20} /> Agregar al Carrito</>}
            </button>
            <button className="p-4 bg-tillas-surface border border-tillas-border rounded-xl text-gray-400 hover:text-red-400 hover:border-red-400/30 transition-colors">
              <Heart size={20} />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="bg-tillas-surface rounded-xl p-3 text-center border border-tillas-border">
              <Shield size={18} className="mx-auto text-tillas-primary mb-1" />
              <p className="text-[11px] text-gray-400">100% Original</p>
            </div>
            <div className="bg-tillas-surface rounded-xl p-3 text-center border border-tillas-border">
              <Truck size={18} className="mx-auto text-tillas-primary mb-1" />
              <p className="text-[11px] text-gray-400">Envío rápido</p>
            </div>
            <div className="bg-tillas-surface rounded-xl p-3 text-center border border-tillas-border">
              <RotateCcw size={18} className="mx-auto text-tillas-primary mb-1" />
              <p className="text-[11px] text-gray-400">Devoluciones</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h3 className="font-heading font-semibold text-white mb-2">Descripción</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
          </div>

          {product.story && (
            <div className="mt-6 bg-tillas-surface rounded-xl p-4 border border-tillas-border">
              <h3 className="font-heading font-semibold text-white text-sm mb-2">📖 La Historia</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{product.story}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
