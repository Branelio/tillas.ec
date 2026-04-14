'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { ordersApi } from '@/lib/api';
import { Package, Clock, Truck, Check, XCircle, ChevronRight, ArrowLeft } from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  trackingCode?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  PAYMENT_PROCESSING: { label: 'Procesando pago', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  PAID: { label: 'Pagado', color: 'bg-tillas-primary/20 text-tillas-primary border-tillas-primary/30', icon: Check },
  PREPARING: { label: 'Preparando', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Package },
  SHIPPED: { label: 'En camino', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Truck },
  DELIVERED: { label: 'Entregado', color: 'bg-tillas-primary/20 text-tillas-primary border-tillas-primary/30', icon: Check },
  COMPLETED: { label: 'Completado', color: 'bg-tillas-primary/20 text-tillas-primary border-tillas-primary/30', icon: Check },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  REFUNDED: { label: 'Reembolsado', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadUser(); }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    ordersApi.getAll()
      .then(({ data }) => setOrders(Array.isArray(data) ? data : data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="font-heading text-2xl text-white">Inicia sesión para ver tus pedidos</h2>
        <Link href="/login" className="inline-block mt-6 px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const filteredOrders = filter === 'all'
    ? orders
    : filter === 'pending' ? orders.filter(o => ['PENDING', 'PAYMENT_PROCESSING'].includes(o.status))
    : filter === 'active' ? orders.filter(o => ['PAID', 'PREPARING', 'SHIPPED'].includes(o.status))
    : orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status));

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'active', label: 'En proceso' },
    { key: 'completed', label: 'Completados' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-3xl font-bold text-white">Mis Pedidos</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-tillas-primary text-black'
                : 'bg-tillas-surface text-gray-400 border border-tillas-border hover:border-tillas-primary/30'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-tillas-surface rounded-2xl p-6 animate-pulse border border-tillas-border">
              <div className="flex justify-between mb-4">
                <div className="h-4 bg-tillas-surfaceElevated rounded w-32" />
                <div className="h-4 bg-tillas-surfaceElevated rounded w-24" />
              </div>
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-tillas-surfaceElevated rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-tillas-surfaceElevated rounded w-3/4" />
                  <div className="h-3 bg-tillas-surfaceElevated rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="font-heading text-xl text-white">
            {filter === 'all' ? 'Aún no tienes pedidos' : 'No hay pedidos en esta categoría'}
          </h3>
          <p className="text-gray-500 mt-2">¡Explora nuestro catálogo!</p>
          <Link href="/shop" className="inline-block mt-6 px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
            Ver Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;
            return (
              <Link key={order.id} href={`/orders/${order.id}`}
                className="block bg-tillas-surface rounded-2xl p-5 border border-tillas-border hover:border-tillas-primary/30 transition-all group">
                {/* Order header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-gray-500 text-xs">Pedido</span>
                    <p className="text-white font-mono text-sm font-medium">#{order.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${status.color}`}>
                      <StatusIcon size={12} /> {status.label}
                    </span>
                    <ChevronRight size={16} className="text-gray-500 group-hover:text-tillas-primary transition-colors" />
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {order.items.slice(0, 4).map(item => (
                    <div key={item.id} className="shrink-0 flex gap-3">
                      <img src={item.productImage || '/placeholder.jpg'} alt=""
                        className="w-14 h-14 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate max-w-[120px]">{item.productName}</p>
                        <p className="text-gray-500 text-[10px]">Talla {item.size} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="shrink-0 w-14 h-14 rounded-lg bg-tillas-surfaceElevated flex items-center justify-center">
                      <span className="text-gray-500 text-xs">+{order.items.length - 4}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-tillas-border/50">
                  <span className="text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-white font-bold">${Number(order.total).toFixed(2)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
