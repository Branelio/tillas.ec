'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminOrdersApi } from '@/lib/api';
import { RefreshCw, Eye } from 'lucide-react';

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
  user: { name: string; email: string };
  shippingAddress?: any;
  createdAt: string;
  factoryOrderDate?: string;
  estimatedDeliveryAt?: string;
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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await adminOrdersApi.getAll({ limit: 100, status: filter !== 'all' ? filter : undefined });
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      await adminOrdersApi.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
    setUpdatingStatus(null);
  };

  const getNextStatus = (current: string): string | null => {
    const index = statusFlow.indexOf(current);
    if (index >= 0 && index < statusFlow.length - 1) return statusFlow[index + 1];
    return null;
  };

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'PENDING', label: 'Pendientes' },
    { key: 'PAID', label: 'Pagados' },
    { key: 'PREPARING', label: 'Preparando' },
    { key: 'SHIPPED', label: 'Enviados' },
    { key: 'DELIVERED', label: 'Entregados' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} pedidos</p>
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-admin-card border border-admin-border rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-admin-primary text-black'
                : 'bg-admin-card text-gray-400 border border-admin-border hover:border-admin-primary/30'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-admin-card rounded-2xl border border-admin-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th># Pedido</th>
                <th>Cliente</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Pedido a Fábrica</th>
                <th>Entrega Estimada</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center text-gray-500 py-12">Cargando...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-500 py-12">No hay pedidos</td></tr>
              ) : (
                orders.map(order => {
                  const sc = statusConfig[order.status] || statusConfig.PENDING;
                  const next = getNextStatus(order.status);
                  const isUpdating = updatingStatus === order.id;
                  return (
                    <tr key={order.id} className="cursor-pointer hover:bg-admin-elevated/30" onClick={() => router.push(`/orders/${order.id}`)}>
                      <td className="text-white font-mono text-xs font-medium">#{order.orderNumber}</td>
                      <td>
                        <div>
                          <p className="text-white text-sm">{order.user?.name || '—'}</p>
                          <p className="text-gray-500 text-xs">{order.user?.email}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {order.items?.slice(0, 3).map((item) => (
                            <img
                              key={item.id}
                              src={item.productImage || '/placeholder.jpg'}
                              alt={item.productName}
                              title={`${item.productName} - Talla ${item.size}`}
                              className="w-8 h-8 rounded-md object-cover bg-admin-elevated border border-admin-border"
                            />
                          ))}
                          {(order.items?.length || 0) > 3 && (
                            <span className="w-8 h-8 rounded-md bg-admin-elevated border border-admin-border flex items-center justify-center text-[10px] text-gray-400 font-bold">
                              +{order.items.length - 3}
                            </span>
                          )}
                          {(!order.items || order.items.length === 0) && (
                            <span className="text-gray-500 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="text-white font-bold text-sm">${Number(order.total).toFixed(2)}</td>
                      <td>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="text-gray-400 text-xs text-center font-medium">
                        {order.factoryOrderDate ? new Date(order.factoryOrderDate).toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="text-admin-primary/80 font-bold text-xs text-center">
                        {order.estimatedDeliveryAt ? new Date(order.estimatedDeliveryAt).toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="text-xs font-medium bg-admin-elevated text-gray-300 px-2.5 py-1.5 rounded-lg hover:text-white transition-colors">
                            <Eye size={14} />
                          </button>
                          {next && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, next)}
                              disabled={isUpdating}
                              className="text-xs font-medium bg-admin-primary/10 text-admin-primary px-3 py-1.5 rounded-lg hover:bg-admin-primary/20 transition-colors disabled:opacity-50">
                              {isUpdating ? '...' : `→ ${statusConfig[next]?.label}`}
                            </button>
                          )}
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                              disabled={isUpdating}
                              className="text-xs font-medium bg-admin-error/10 text-admin-error px-3 py-1.5 rounded-lg hover:bg-admin-error/20 transition-colors disabled:opacity-50">
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
