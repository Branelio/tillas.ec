'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminOrdersApi } from '@/lib/api';
import { ArrowLeft, Package, User, MapPin, Calendar, Clock, Truck } from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface StatusHistory {
  id: string;
  status: string;
  note?: string;
  createdAt: string;
  updatedBy?: { name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  items: OrderItem[];
  user: { name: string; email: string; phone?: string };
  shippingAddress?: ShippingAddress;
  createdAt: string;
  factoryOrderDate?: string;
  estimatedDeliveryAt?: string;
  statusHistory: StatusHistory[];
  paymentMethod: string;
  paymentProof?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  PAYMENT_PROCESSING: { label: 'Procesando pago', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  PAID: { label: 'Pagado', color: 'text-admin-primary', bg: 'bg-admin-primary/20' },
  PREPARING: { label: 'Preparando', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  SHIPPED: { label: 'Enviado', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  DELIVERED: { label: 'Entregado', color: 'text-admin-success', bg: 'bg-admin-success/20' },
  COMPLETED: { label: 'Completado', color: 'text-admin-success', bg: 'bg-admin-success/20' },
  CANCELLED: { label: 'Cancelado', color: 'text-admin-error', bg: 'bg-admin-error/20' },
  REFUNDED: { label: 'Reembolsado', color: 'text-gray-400', bg: 'bg-gray-500/20' },
};

const statusFlow = ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [note, setNote] = useState('');

  const fetchOrder = async () => {
    try {
      const { data } = await adminOrdersApi.getById(orderId);
      setOrder(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await adminOrdersApi.updateStatus(orderId, newStatus, note || undefined);
      fetchOrder();
      setNote('');
    } catch (err) {
      console.error(err);
    }
    setUpdatingStatus(false);
  };

  const getNextStatus = (current: string): string | null => {
    const index = statusFlow.indexOf(current);
    if (index >= 0 && index < statusFlow.length - 1) return statusFlow[index + 1];
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Cargando pedido...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Pedido no encontrado</div>
      </div>
    );
  }

  const sc = statusConfig[order.status] || statusConfig.PENDING;
  const next = getNextStatus(order.status);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/orders')}
          className="p-2 bg-admin-card border border-admin-border rounded-xl hover:bg-admin-elevated transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Pedido #{order.orderNumber}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date(order.createdAt).toLocaleDateString('es-EC', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className="bg-admin-card rounded-2xl border border-admin-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-white">Estado del Pedido</h2>
              <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${sc.bg} ${sc.color}`}>
                {sc.label}
              </span>
            </div>

            {/* Status progression */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {statusFlow.map((status, index) => {
                const currentIndex = statusFlow.indexOf(order.status);
                const isCompleted = index <= currentIndex;
                const isCurrent = status === order.status;
                return (
                  <div key={status} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? 'bg-admin-primary text-black'
                          : 'bg-admin-elevated text-gray-500'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span
                      className={`ml-2 text-xs font-medium whitespace-nowrap ${
                        isCurrent ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {statusConfig[status]?.label}
                    </span>
                    {index < statusFlow.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${index < currentIndex ? 'bg-admin-primary' : 'bg-admin-border'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Update status */}
            {next && (
              <div className="space-y-3 pt-4 border-t border-admin-border">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Agregar nota (opcional)..."
                  rows={2}
                  className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary resize-none"
                />
                <button
                  onClick={() => handleUpdateStatus(next)}
                  disabled={updatingStatus}
                  className="w-full py-3 bg-admin-primary text-black font-bold rounded-xl hover:bg-admin-primaryDark transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? 'Actualizando...' : `Marcar como ${statusConfig[next]?.label}`}
                </button>
              </div>
            )}

            {order.status === 'PENDING' && (
              <button
                onClick={() => handleUpdateStatus('CANCELLED')}
                disabled={updatingStatus}
                className="w-full py-3 bg-admin-error/10 text-admin-error font-bold rounded-xl hover:bg-admin-error/20 transition-colors disabled:opacity-50 mt-3"
              >
                Cancelar Pedido
              </button>
            )}
          </div>

          {/* Items */}
          <div className="bg-admin-card rounded-2xl border border-admin-border p-6">
            <h2 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Package size={18} /> Productos
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-admin-surface rounded-xl border border-admin-border"
                >
                  <img
                    src={item.productImage || '/placeholder.jpg'}
                    alt={item.productName}
                    className="w-16 h-16 rounded-lg object-cover bg-admin-elevated"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.productName}</p>
                    <p className="text-gray-500 text-sm">Talla: {item.size}</p>
                    <p className="text-gray-500 text-sm">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${item.unitPrice.toFixed(2)}</p>
                    <p className="text-gray-500 text-sm">Total: ${item.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-admin-card rounded-2xl border border-admin-border p-6">
              <h2 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={18} /> Historial de Estados
              </h2>
              <div className="space-y-3">
                {order.statusHistory.map((history) => {
                  const hsc = statusConfig[history.status] || statusConfig.PENDING;
                  return (
                    <div
                      key={history.id}
                      className="flex items-start gap-3 p-3 bg-admin-surface rounded-xl border border-admin-border"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${hsc.bg.replace('/20', '')}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${hsc.color}`}>
                            {hsc.label}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(history.createdAt).toLocaleString('es-EC')}
                          </span>
                        </div>
                        {history.note && (
                          <p className="text-gray-400 text-sm mt-1">{history.note}</p>
                        )}
                        {history.updatedBy && (
                          <p className="text-gray-600 text-xs mt-1">
                            Por: {history.updatedBy.name}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column - Customer & Shipping info */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-admin-card rounded-2xl border border-admin-border p-6">
            <h2 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <User size={18} /> Cliente
            </h2>
            <div>
              <p className="text-white font-medium">{order.user.name}</p>
              <p className="text-gray-500 text-sm">{order.user.email}</p>
              {order.user.phone && (
                <p className="text-gray-500 text-sm">{order.user.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-admin-card rounded-2xl border border-admin-border p-6">
              <h2 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={18} /> Dirección de Envío
              </h2>
              <div className="text-gray-300 text-sm space-y-1">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p>{order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2">Tel: {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-admin-card rounded-2xl border border-admin-border p-6">
            <h2 className="font-heading font-semibold text-white mb-4">Pago</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Método</span>
                <span className="text-white">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-white">${order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Envío</span>
                <span className="text-white">${order.shippingCost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-admin-border">
                <span className="text-white font-bold">Total</span>
                <span className="text-admin-primary font-bold text-lg">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {order.paymentProof && (
              <div className="mt-4">
                <p className="text-gray-500 text-xs mb-2">Comprobante de pago:</p>
                <img
                  src={order.paymentProof}
                  alt="Payment proof"
                  className="w-full rounded-lg border border-admin-border"
                />
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-admin-card rounded-2xl border border-admin-border p-6">
            <h2 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={18} /> Fechas Importantes
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-gray-500 mt-1 shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Creado</p>
                  <p className="text-white">
                    {new Date(order.createdAt).toLocaleDateString('es-EC', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {order.factoryOrderDate && (
                <div className="flex items-start gap-2">
                  <Package size={14} className="text-gray-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Pedido a fábrica</p>
                    <p className="text-white">
                      {new Date(order.factoryOrderDate).toLocaleDateString('es-EC', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {order.estimatedDeliveryAt && (
                <div className="flex items-start gap-2">
                  <Truck size={14} className="text-admin-primary mt-1 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Entrega estimada</p>
                    <p className="text-admin-primary font-bold">
                      {new Date(order.estimatedDeliveryAt).toLocaleDateString('es-EC', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
