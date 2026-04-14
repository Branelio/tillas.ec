'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';

export default function CartPage() {
  const { items, subtotal, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="font-heading text-2xl text-white">Inicia sesión para ver tu carrito</h2>
        <Link href="/login" className="inline-block mt-6 px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-8">Tu Carrito</h1>
        {[1,2,3].map((i) => (
          <div key={i} className="bg-tillas-surface rounded-2xl p-4 mb-4 animate-pulse flex gap-4">
            <div className="w-24 h-24 bg-tillas-surfaceElevated rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-tillas-surfaceElevated rounded w-3/4" />
              <div className="h-3 bg-tillas-surfaceElevated rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="font-heading text-2xl text-white">Tu carrito está vacío</h2>
        <p className="text-gray-500 mt-2">¡Agrega algunos sneakers!</p>
        <Link href="/shop" className="inline-block mt-6 px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
          Ver Catálogo
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= 100 ? 0 : subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-white">Tu Carrito</h1>
        <button onClick={clearCart} className="text-gray-500 text-sm hover:text-red-400 transition-colors">
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-tillas-surface rounded-2xl p-4 border border-tillas-border flex gap-4">
              <Link href={`/shop/${item.variant.product.slug}`} className="shrink-0">
                <img
                  src={item.variant.product.images?.[0] || '/placeholder.jpg'}
                  alt={item.variant.product.name}
                  className="w-24 h-24 object-cover rounded-xl"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-tillas-primary text-xs font-semibold uppercase">{item.variant.product.brand.name}</p>
                <Link href={`/shop/${item.variant.product.slug}`}>
                  <h3 className="font-heading text-sm font-semibold text-white truncate hover:text-tillas-primary transition-colors">
                    {item.variant.product.name}
                  </h3>
                </Link>
                <p className="text-gray-500 text-xs mt-0.5">Talla: {item.variant.size}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center bg-tillas-surfaceElevated rounded-lg text-gray-400 hover:text-white border border-tillas-border"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-tillas-surfaceElevated rounded-lg text-gray-400 hover:text-white border border-tillas-border"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">${(item.variant.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border sticky top-24">
            <h3 className="font-heading font-semibold text-white mb-4">Resumen</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Envío</span>
                <span className={shipping === 0 ? 'text-tillas-primary font-medium' : 'text-white'}>
                  {shipping === 0 ? '¡Gratis!' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-500">
                  Envío gratis en compras sobre $100
                </p>
              )}
              <div className="border-t border-tillas-border pt-3 flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-xl text-white">${total.toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout"
              className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-tillas-primary text-black font-bold rounded-xl text-lg hover:bg-tillas-primaryDark transition-colors">
              Checkout <ArrowRight size={18} />
            </Link>

            <Link href="/shop" className="block text-center text-gray-500 text-sm mt-3 hover:text-white transition-colors">
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
