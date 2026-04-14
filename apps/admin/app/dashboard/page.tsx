'use client';
import { useEffect, useState } from 'react';
import { dashboardApi, adminOrdersApi } from '@/lib/api';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

interface Stats {
  totalProducts: number;
  pendingOrders: number;
  totalUsers: number;
  todaySales: number;
  salesTrend: number;
  totalRevenue: number;
  monthRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    pendingOrders: 0,
    totalUsers: 0,
    todaySales: 0,
    salesTrend: 0,
    totalRevenue: 0,
    monthRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [brandData, setBrandData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, salesRes, brandRes] = await Promise.all([
          dashboardApi.getStats(),
          adminOrdersApi.getAll({ limit: 5 }),
          dashboardApi.getSalesReport(7),
          dashboardApi.getBrandSales(),
        ]);

        const statsData = statsRes.data;
        if (statsData) {
          setStats({
            totalProducts: statsData.totalProducts || 0,
            pendingOrders: statsData.pendingOrders || 0,
            totalUsers: statsData.totalUsers || 0,
            todaySales: statsData.todaySales || 0,
            salesTrend: statsData.salesTrend || 0,
            totalRevenue: statsData.totalRevenue || 0,
            monthRevenue: statsData.monthRevenue || 0,
          });
        }

        const orders = ordersRes.data;
        setRecentOrders(Array.isArray(orders?.data) ? orders.data.slice(0, 5) : []);

        // Format sales data for chart
        const sales = salesRes.data || [];
        if (sales.length > 0) {
          const formatted = sales.map((s: any) => ({
            name: new Date(s.date).toLocaleDateString('es-EC', { weekday: 'short' }),
            ventas: s.sales,
          }));
          setSalesData(formatted);
        }

        // Format brand data for chart
        const brands = brandRes.data || [];
        if (brands.length > 0) {
          const formatted = brands.slice(0, 5).map((b: any) => ({
            name: b.brand,
            valor: Math.round(b.sales),
          }));
          setBrandData(formatted);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatTrend = (trend: number) => {
    const sign = trend >= 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  const statCards = [
    {
      label: 'Ventas del Día',
      value: `$${stats.todaySales.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-admin-primary',
      trend: formatTrend(stats.salesTrend),
      up: stats.salesTrend >= 0,
    },
    {
      label: 'Pedidos Pendientes',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: 'text-admin-warning',
      trend: `${stats.pendingOrders} activos`,
      up: true,
    },
    {
      label: 'Productos Activos',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-400',
      trend: `${stats.totalProducts} disponibles`,
      up: true,
    },
    {
      label: 'Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-400',
      trend: `${stats.totalUsers} registrados`,
      up: true,
    },
  ];

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    PAID: 'bg-admin-primary/20 text-admin-primary',
    PREPARING: 'bg-purple-500/20 text-purple-400',
    SHIPPED: 'bg-blue-500/20 text-blue-400',
    DELIVERED: 'bg-admin-primary/20 text-admin-primary',
    CANCELLED: 'bg-red-500/20 text-red-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen general de TILLAS.EC</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs">Ingresos del mes</p>
          <p className="text-admin-primary font-bold text-xl">${stats.monthRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="bg-admin-card rounded-2xl p-5 border border-admin-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{s.label}</span>
              <s.icon size={18} className={s.color} />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {s.up ? <ArrowUpRight size={12} className="text-admin-success" /> : <ArrowDownRight size={12} className="text-admin-error" />}
              <span className={`text-xs font-medium ${s.up ? 'text-admin-success' : 'text-admin-error'}`}>{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales chart */}
        <div className="bg-admin-card rounded-2xl p-6 border border-admin-border">
          <h3 className="font-heading font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-admin-primary" /> Ventas de la semana
          </h3>
          <div className="h-56">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF87" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00FF87" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, color: '#fff' }}
                    labelStyle={{ color: '#888' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ventas']}
                  />
                  <Area type="monotone" dataKey="ventas" stroke="#00FF87" fill="url(#salesGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sin datos de ventas
              </div>
            )}
          </div>
        </div>

        {/* Category chart */}
        <div className="bg-admin-card rounded-2xl p-6 border border-admin-border">
          <h3 className="font-heading font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Package size={16} className="text-blue-400" /> Ventas por marca
          </h3>
          <div className="h-56">
            {brandData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, color: '#fff' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ventas']}
                  />
                  <Bar dataKey="valor" fill="#00FF87" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sin datos de marcas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-admin-card rounded-2xl border border-admin-border overflow-hidden">
        <div className="px-6 py-4 border-b border-admin-border">
          <h3 className="font-heading font-semibold text-white text-sm">Últimos Pedidos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th># Pedido</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center text-gray-500 py-8">Cargando...</td></tr>
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-500 py-8">No hay pedidos recientes</td></tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="text-white font-mono text-xs">#{order.orderNumber}</td>
                    <td>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-white font-bold">${Number(order.total).toFixed(2)}</td>
                    <td className="text-gray-500">{new Date(order.createdAt).toLocaleDateString('es-EC')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
