'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { adminReturnsApi } from '@/lib/api';
import { ArrowLeftRight, Check, X, Eye, RefreshCw } from 'lucide-react';

interface ReturnItem {
  id: string;
  productName: string;
  productImage?: string;
  size: string;
  quantity: number;
  price: number;
}

interface Return {
  id: string;
  orderNumber: string;
  reason: string;
  status: string;
  items: ReturnItem[];
  refundAmount: number;
  user: { name: string; email: string };
  adminNote?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  APPROVED: { label: 'Aprobado', color: 'text-admin-primary', bg: 'bg-admin-primary/20' },
  REJECTED: { label: 'Rechazado', color: 'text-admin-error', bg: 'bg-admin-error/20' },
  COMPLETED: { label: 'Completado', color: 'text-admin-success', bg: 'bg-admin-success/20' },
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [note, setNote] = useState('');

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminReturnsApi.getAll({ status: filter !== 'all' ? filter : undefined });
      setReturns(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleUpdateStatus = async (returnId: string, status: string) => {
    setUpdatingId(returnId);
    try {
      await adminReturnsApi.updateStatus(returnId, status, note || undefined);
      fetchReturns();
      setSelectedReturn(null);
      setNote('');
    } catch (err) {
      console.error(err);
    }
    setUpdatingId(null);
  };

  const filters = [
    { key: 'PENDING' as const, label: 'Pendientes' },
    { key: 'all' as const, label: 'Todos' },
    { key: 'APPROVED' as const, label: 'Aprobados' },
    { key: 'REJECTED' as const, label: 'Rechazados' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Devoluciones</h1>
          <p className="text-gray-500 text-sm mt-1">{returns.length} solicitudes</p>
        </div>
        <button onClick={fetchReturns}
          className="flex items-center gap-2 px-4 py-2 bg-admin-card border border-admin-border rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-admin-primary text-black'
                : 'bg-admin-card text-gray-400 border border-admin-border hover:border-admin-primary/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Pending returns alert */}
      {filter === 'PENDING' && returns.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-400 text-sm font-medium">
            ⚠️ {returns.length} devolucione{returns.length > 1 ? 's' : ''} pendiente{returns.length > 1 ? 's' : ''} de revisión
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-admin-card rounded-2xl border border-admin-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th># Pedido</th>
                <th>Cliente</th>
                <th>Motivo</th>
                <th>Items</th>
                <th>Reembolso</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center text-gray-500 py-12">Cargando...</td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-500 py-12">
                  <ArrowLeftRight size={32} className="mx-auto mb-2 text-gray-600" />
                  No hay devoluciones
                </td></tr>
              ) : (
                returns.map(ret => {
                  const sc = statusConfig[ret.status] || statusConfig.PENDING;
                  return (
                    <tr key={ret.id}>
                      <td className="text-white font-mono text-xs font-medium">#{ret.orderNumber}</td>
                      <td>
                        <div>
                          <p className="text-white text-sm">{ret.user?.name || '—'}</p>
                          <p className="text-gray-500 text-xs">{ret.user?.email}</p>
                        </div>
                      </td>
                      <td className="text-gray-300 text-sm max-w-[200px] truncate">{ret.reason}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          {ret.items?.slice(0, 3).map((item) => (
                            <Image
                              key={item.id}
                              src={item.productImage || '/placeholder.jpg'}
                              alt={item.productName}
                              title={`${item.productName} - Talla ${item.size}`}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-md object-cover bg-admin-elevated border border-admin-border"
                            />
                          ))}
                          {(ret.items?.length || 0) > 3 && (
                            <span className="w-8 h-8 rounded-md bg-admin-elevated border border-admin-border flex items-center justify-center text-[10px] text-gray-400 font-bold">
                              +{ret.items.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-admin-primary font-bold text-sm">${Number(ret.refundAmount).toFixed(2)}</td>
                      <td>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="text-gray-500 text-xs">
                        {new Date(ret.createdAt).toLocaleDateString('es-EC', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedReturn(ret)}
                            className="text-xs font-medium bg-admin-elevated text-gray-300 px-2.5 py-1.5 rounded-lg hover:text-white transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          {ret.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(ret.id, 'APPROVED')}
                                disabled={updatingId === ret.id}
                                className="text-xs font-medium bg-admin-success/10 text-admin-success px-3 py-1.5 rounded-lg hover:bg-admin-success/20 transition-colors disabled:opacity-50"
                              >
                                {updatingId === ret.id ? '...' : <Check size={14} />}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(ret.id, 'REJECTED')}
                                disabled={updatingId === ret.id}
                                className="text-xs font-medium bg-admin-error/10 text-admin-error px-3 py-1.5 rounded-lg hover:bg-admin-error/20 transition-colors disabled:opacity-50"
                              >
                                {updatingId === ret.id ? '...' : <X size={14} />}
                              </button>
                            </>
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

      {/* View Return Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-admin-surface rounded-2xl border border-admin-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">
                Devolución - Pedido #{selectedReturn.orderNumber}
              </h3>
              <button
                onClick={() => { setSelectedReturn(null); setNote(''); }}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Return details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs">Cliente</p>
                  <p className="text-white font-medium">{selectedReturn.user?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-white">{selectedReturn.user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Motivo</p>
                  <p className="text-white">{selectedReturn.reason}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Monto a reembolsar</p>
                  <p className="text-admin-primary font-bold text-xl">${Number(selectedReturn.refundAmount).toFixed(2)}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-gray-500 text-xs mb-2">Productos:</p>
                <div className="space-y-2">
                  {selectedReturn.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 bg-admin-surface rounded-lg border border-admin-border"
                    >
                      <Image
                        src={item.productImage || '/placeholder.jpg'}
                        alt={item.productName}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.productName}</p>
                        <p className="text-gray-500 text-xs">Talla: {item.size} × {item.quantity}</p>
                      </div>
                      <p className="text-white font-bold">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin note */}
              {selectedReturn.adminNote && (
                <div className="p-3 bg-admin-elevated rounded-lg border border-admin-border">
                  <p className="text-gray-500 text-xs mb-1">Nota del administrador:</p>
                  <p className="text-gray-300 text-sm">{selectedReturn.adminNote}</p>
                </div>
              )}

              {/* Actions */}
              {selectedReturn.status === 'PENDING' && (
                <div className="space-y-3 pt-4 border-t border-admin-border">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Agregar nota (opcional)..."
                    rows={2}
                    className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedReturn.id, 'APPROVED')}
                      disabled={updatingId === selectedReturn.id}
                      className="py-3 bg-admin-success/20 text-admin-success font-bold rounded-xl hover:bg-admin-success/30 transition-colors disabled:opacity-50"
                    >
                      {updatingId === selectedReturn.id ? 'Procesando...' : '✓ Aprobar'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReturn.id, 'REJECTED')}
                      disabled={updatingId === selectedReturn.id}
                      className="py-3 bg-admin-error/20 text-admin-error font-bold rounded-xl hover:bg-admin-error/30 transition-colors disabled:opacity-50"
                    >
                      {updatingId === selectedReturn.id ? 'Procesando...' : '✗ Rechazar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
