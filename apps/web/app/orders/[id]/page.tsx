'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { ordersApi } from '@/lib/api';
import {
  ArrowLeft, Clock, Check, Package, Truck, MapPin,
  CreditCard, Copy, CheckCircle2, Calendar,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  loyaltyDiscount: number;
  total: number;
  items: OrderItem[];
  shippingAddress: any;
  trackingCode?: string;
  notes?: string;
  factoryOrderDate?: string;
  estimatedDeliveryAt?: string;
  payment?: {
    id: string;
    status: string;
    receiptImage?: string;
  };
  statusHistory?: { status: string; createdAt: string; note?: string }[];
  createdAt: string;
  updatedAt: string;
}

const steps = ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'];
const stepLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PREPARING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
};
const stepIcons: Record<string, any> = {
  PENDING: Clock,
  PAID: CreditCard,
  PREPARING: Package,
  SHIPPED: Truck,
  DELIVERED: Check,
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { isAuthenticated, loadUser } = useAuthStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadUser(); }, []);

  useEffect(() => {
    if (!isAuthenticated || !orderId) return;
    ordersApi.getById(orderId)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, orderId]);

  const copyTracking = () => {
    if (order?.trackingCode) {
      navigator.clipboard.writeText(order.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-heading text-2xl text-white">Debes iniciar sesión</h2>
        <Link href="/login" className="inline-block mt-4 px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-6 bg-tillas-surface rounded w-48 animate-pulse mb-6" />
        <div className="bg-tillas-surface rounded-2xl h-48 animate-pulse border border-tillas-border mb-6" />
        <div className="bg-tillas-surface rounded-2xl h-64 animate-pulse border border-tillas-border" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-32">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="font-heading text-2xl text-white">Pedido no encontrado</h2>
        <Link href="/orders" className="mt-4 text-tillas-primary hover:underline inline-block">← Volver a mis pedidos</Link>
      </div>
    );
  }

  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = ['CANCELLED', 'REFUNDED'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Pedido #{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm">
            {new Date(order.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Stepper */}
      {!isCancelled && (
        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border mb-6">
          <h3 className="font-heading font-semibold text-white text-sm mb-5">Estado del Pedido</h3>
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-tillas-border" />
            <div className="absolute top-5 left-0 h-0.5 bg-tillas-primary transition-all duration-500"
              style={{ width: `${Math.max(0, currentStepIndex / (steps.length - 1)) * 100}%` }} />

            {steps.map((step, i) => {
              const StepIcon = stepIcons[step];
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step} className="relative flex flex-col items-center z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-tillas-primary text-black' : 'bg-tillas-surfaceElevated text-gray-500 border border-tillas-border'
                  } ${isCurrent ? 'ring-4 ring-tillas-primary/20' : ''}`}>
                    {isCompleted && i < currentStepIndex ? <CheckCircle2 size={18} /> : <StepIcon size={18} />}
                  </div>
                  <span className={`text-[10px] mt-2 font-medium ${isCompleted ? 'text-tillas-primary' : 'text-gray-500'}`}>
                    {stepLabels[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-6 text-center">
          <p className="text-red-400 font-bold text-lg">
            {order.status === 'CANCELLED' ? '❌ Pedido Cancelado' : '💰 Pedido Reembolsado'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
            <h3 className="font-heading font-semibold text-white mb-4">Productos ({order.items.length})</h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.productImage || '/placeholder.jpg'} alt={item.productName}
                    className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">{item.productName}</h4>
                    <p className="text-gray-500 text-xs mt-0.5">Talla: {item.size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-400 text-xs">Cantidad: {item.quantity}</span>
                      <span className="text-white font-bold text-sm">${Number(item.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking */}
          {order.trackingCode && (
            <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
              <h3 className="font-heading font-semibold text-white flex items-center gap-2 mb-3">
                <Truck size={18} className="text-tillas-primary" /> Tracking
              </h3>
              <div className="flex items-center gap-3">
                <code className="bg-tillas-surfaceElevated px-4 py-2 rounded-lg text-white text-sm font-mono flex-1">
                  {order.trackingCode}
                </code>
                <button onClick={copyTracking}
                  className={`p-2 rounded-lg border transition-colors ${copied ? 'bg-tillas-primary/20 border-tillas-primary/30 text-tillas-primary' : 'bg-tillas-surfaceElevated border-tillas-border text-gray-400 hover:text-white'}`}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
              <h3 className="font-heading font-semibold text-white flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-tillas-primary" /> Dirección de Envío
              </h3>
              <p className="text-white text-sm">{order.shippingAddress.recipientName}</p>
              <p className="text-gray-400 text-sm mt-1">
                {order.shippingAddress.mainStreet}
                {order.shippingAddress.secondaryStreet && ` y ${order.shippingAddress.secondaryStreet}`}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {order.shippingAddress.sector}, {order.shippingAddress.city}
              </p>
              <p className="text-gray-600 text-xs mt-0.5">Ref: {order.shippingAddress.reference}</p>
              <p className="text-gray-500 text-xs mt-1">{order.shippingAddress.phone}</p>
            </div>
          )}
        </div>

        {/* Right: Summary + Payment */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border sticky top-24">
            <h3 className="font-heading font-semibold text-white mb-4">Resumen</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Envío</span>
                <span className={Number(order.shippingCost) === 0 ? 'text-tillas-primary' : 'text-white'}>
                  {Number(order.shippingCost) === 0 ? 'Gratis' : `$${Number(order.shippingCost).toFixed(2)}`}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Descuento</span>
                  <span className="text-tillas-accent">-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              {Number(order.loyaltyDiscount) > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Puntos canjeados</span>
                  <span className="text-tillas-accent">-${Number(order.loyaltyDiscount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-tillas-border pt-2.5 flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-xl text-white">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment CTA */}
            {order.status === 'PENDING' && (
              <Link href={`/payment/${order.id}`}
                className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-tillas-primary text-black font-bold rounded-xl text-lg hover:bg-tillas-primaryDark transition-colors">
                <CreditCard size={20} /> Pagar — Transferencia
              </Link>
            )}
            {order.status === 'PAYMENT_PROCESSING' && (
              <div className="mt-6 flex items-center justify-center gap-2 py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-medium rounded-xl text-sm">
                <Clock size={16} /> Verificando comprobante...
              </div>
            )}
          </div>

          {/* Delivery info */}
          {(order.factoryOrderDate || order.estimatedDeliveryAt) && (
            <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
              <h3 className="font-heading font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-tillas-primary" /> Entrega
              </h3>
              {order.factoryOrderDate && (
                <div className="text-sm mb-2">
                  <p className="text-gray-500 text-xs">Pedido a fábrica</p>
                  <p className="text-white font-medium capitalize">
                    {new Date(order.factoryOrderDate).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              )}
              {order.estimatedDeliveryAt && (
                <div className="bg-tillas-primary/10 border border-tillas-primary/20 rounded-xl p-3 mt-2">
                  <p className="text-gray-400 text-xs">Entrega estimada</p>
                  <p className="text-tillas-primary font-bold capitalize">
                    {new Date(order.estimatedDeliveryAt).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status history */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
              <h3 className="font-heading font-semibold text-white text-sm mb-4">Historial</h3>
              <div className="space-y-3">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-tillas-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="text-white text-xs font-medium">{stepLabels[h.status] || h.status}</p>
                      {h.note && <p className="text-gray-500 text-xs">{h.note}</p>}
                      <p className="text-gray-600 text-[10px] mt-0.5">
                        {new Date(h.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
