'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { ordersApi } from '@/lib/api';
import Link from 'next/link';
import { Package, ArrowLeft, CheckCircle, CreditCard, MapPin } from 'lucide-react';

const statusSteps = ['PENDING','PAYMENT_PROCESSING','PAID','PREPARING','SHIPPED','DELIVERED','COMPLETED'];
const statusLabels: Record<string,string> = {
  PENDING:'Pendiente', PAYMENT_PROCESSING:'Verificando Pago', PAID:'Pagado',
  PREPARING:'En Preparación', SHIPPED:'Enviado', DELIVERED:'Entregado',
  COMPLETED:'Completado', CANCELLED:'Cancelado', REFUNDED:'Reembolsado',
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => { loadUser(); }, []);
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    ordersApi.getById(id)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 shimmer-bg rounded w-48 mb-8" />
        <div className="bg-tillas-surface rounded-2xl p-8 border border-tillas-border space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-16 shimmer-bg rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="font-heading text-2xl text-white">Pedido no encontrado</h2>
        <Link href="/orders" className="inline-block mt-4 text-tillas-primary hover:underline">← Volver a mis pedidos</Link>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Mis Pedidos
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Pedido #{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date(order.createdAt).toLocaleDateString('es-EC', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${isCancelled ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-tillas-primary/10 text-tillas-primary border border-tillas-primary/20'}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      {/* Progress bar */}
      {!isCancelled && (
        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border mb-6">
          <div className="flex items-center justify-between mb-4">
            {statusSteps.slice(0, 6).map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? 'bg-tillas-primary text-black' : 'bg-tillas-surfaceElevated text-gray-500 border border-tillas-border'} ${active ? 'ring-2 ring-tillas-primary/30' : ''}`}>
                    {done ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-2 text-center hidden sm:block ${done ? 'text-tillas-primary' : 'text-gray-600'}`}>
                    {statusLabels[step]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="relative h-1 bg-tillas-surfaceElevated rounded-full">
            <div className="absolute h-full bg-tillas-primary rounded-full transition-all duration-700" style={{ width: `${Math.max(0, (currentStep / 5) * 100)}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
            <h3 className="font-heading font-semibold text-white mb-4">Productos</h3>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-3 py-3 border-b border-tillas-border last:border-0">
                  <img src={item.productImage || '/placeholder.jpg'} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-gray-500 text-xs">Talla: {item.size} • Cant: {item.quantity}</p>
                  </div>
                  <span className="text-white font-bold text-sm shrink-0">${Number(item.totalPrice).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
              <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-tillas-primary" /> Dirección de Envío
              </h3>
              <p className="text-gray-300 text-sm">{order.shippingAddress.recipientName}</p>
              <p className="text-gray-400 text-sm">{order.shippingAddress.mainStreet}, {order.shippingAddress.sector}</p>
              <p className="text-gray-500 text-xs">{order.shippingAddress.city}</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border sticky top-24">
            <h3 className="font-heading font-semibold text-white mb-4">Resumen</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span><span className="text-white">${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Envío</span>
                <span className={Number(order.shippingCost) === 0 ? 'text-tillas-primary font-medium' : 'text-white'}>
                  {Number(order.shippingCost) === 0 ? 'Gratis' : `$${Number(order.shippingCost).toFixed(2)}`}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Descuento</span><span className="text-tillas-success">-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-tillas-border pt-3 flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-xl text-white">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {order.trackingCode && (
              <div className="mt-4 p-3 bg-tillas-primary/10 border border-tillas-primary/20 rounded-xl">
                <p className="text-xs text-gray-400">Código de rastreo</p>
                <p className="text-tillas-primary font-mono font-bold text-sm">{order.trackingCode}</p>
              </div>
            )}

            {order.status === 'PENDING' && (
              <Link href={`/payment/${order.id}`}
                className="w-full flex items-center justify-center gap-2 mt-4 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
                <CreditCard size={16} /> Pagar Ahora
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
