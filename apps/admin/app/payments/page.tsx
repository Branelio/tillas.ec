'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { adminPaymentsApi } from '@/lib/api';
import { DollarSign, Check, X, Eye, Clock, RefreshCw } from 'lucide-react';

interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: string;
  status: string;
  proofUrl?: string;
  user: { name: string; email: string };
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PROCESSING: { label: 'Procesando', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  APPROVED: { label: 'Aprobado', color: 'text-admin-primary', bg: 'bg-admin-primary/20' },
  REJECTED: { label: 'Rechazado', color: 'text-admin-error', bg: 'bg-admin-error/20' },
  REFUNDED: { label: 'Reembolsado', color: 'text-gray-400', bg: 'bg-gray-500/20' },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PROCESSING' | 'APPROVED' | 'REJECTED'>('PROCESSING');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [note, setNote] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = filter === 'PROCESSING'
        ? await adminPaymentsApi.getPending()
        : await adminPaymentsApi.getAll({ status: filter !== 'all' ? filter : undefined });
      setPayments(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleVerify = async (paymentId: string, approved: boolean) => {
    setVerifyingId(paymentId);
    try {
      const payment = payments.find(p => p.id === paymentId);
      await adminPaymentsApi.verify(payment!.orderId, approved, note || undefined);
      fetchPayments();
      setSelectedPayment(null);
      setNote('');
    } catch (err) {
      console.error(err);
    }
    setVerifyingId(null);
  };

  const filters = [
    { key: 'PROCESSING' as const, label: 'Pendientes', icon: Clock },
    { key: 'all' as const, label: 'Todos', icon: DollarSign },
    { key: 'APPROVED' as const, label: 'Aprobados', icon: Check },
    { key: 'REJECTED' as const, label: 'Rechazados', icon: X },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Pagos</h1>
          <p className="text-gray-500 text-sm mt-1">Verificación de transferencias bancarias</p>
        </div>
        <button onClick={fetchPayments}
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-admin-primary text-black'
                : 'bg-admin-card text-gray-400 border border-admin-border hover:border-admin-primary/30'
            }`}
          >
            <f.icon size={14} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Pending payments alert */}
      {filter === 'PROCESSING' && payments.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-400 text-sm font-medium">
            ⚠️ {payments.length} pago{payments.length > 1 ? 's' : ''} pendiente{payments.length > 1 ? 's' : ''} de verificación
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
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-12">Cargando...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-12">
                  <DollarSign size={32} className="mx-auto mb-2 text-gray-600" />
                  No hay pagos
                </td></tr>
              ) : (
                payments.map(payment => {
                  const sc = statusConfig[payment.status] || statusConfig.PROCESSING;
                  return (
                    <tr key={payment.id}>
                      <td className="text-white font-mono text-xs font-medium">#{payment.orderNumber}</td>
                      <td>
                        <div>
                          <p className="text-white text-sm">{payment.user?.name || '—'}</p>
                          <p className="text-gray-500 text-xs">{payment.user?.email}</p>
                        </div>
                      </td>
                      <td className="text-white font-bold text-sm">${Number(payment.amount).toFixed(2)}</td>
                      <td className="text-gray-300 text-sm">{payment.method}</td>
                      <td>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="text-gray-500 text-xs">
                        {new Date(payment.createdAt).toLocaleDateString('es-EC', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="text-xs font-medium bg-admin-elevated text-gray-300 px-2.5 py-1.5 rounded-lg hover:text-white transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          {payment.status === 'PROCESSING' && (
                            <>
                              <button
                                onClick={() => handleVerify(payment.id, true)}
                                disabled={verifyingId === payment.id}
                                className="text-xs font-medium bg-admin-success/10 text-admin-success px-3 py-1.5 rounded-lg hover:bg-admin-success/20 transition-colors disabled:opacity-50"
                              >
                                {verifyingId === payment.id ? '...' : <Check size={14} />}
                              </button>
                              <button
                                onClick={() => handleVerify(payment.id, false)}
                                disabled={verifyingId === payment.id}
                                className="text-xs font-medium bg-admin-error/10 text-admin-error px-3 py-1.5 rounded-lg hover:bg-admin-error/20 transition-colors disabled:opacity-50"
                              >
                                {verifyingId === payment.id ? '...' : <X size={14} />}
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

      {/* View Payment Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-admin-surface rounded-2xl border border-admin-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">
                Pago #{selectedPayment.orderNumber}
              </h3>
              <button
                onClick={() => { setSelectedPayment(null); setNote(''); }}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Payment details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs">Cliente</p>
                  <p className="text-white font-medium">{selectedPayment.user?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-white">{selectedPayment.user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Monto</p>
                  <p className="text-admin-primary font-bold text-xl">${Number(selectedPayment.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Método</p>
                  <p className="text-white">{selectedPayment.method}</p>
                </div>
              </div>

              {/* Payment proof */}
              {selectedPayment.proofUrl && (
                <div>
                  <p className="text-gray-500 text-xs mb-2">Comprobante de pago:</p>
                  <Image
                    src={selectedPayment.proofUrl}
                    alt="Payment proof"
                    width={500}
                    height={400}
                    className="w-full rounded-lg border border-admin-border"
                  />
                </div>
              )}

              {/* Verify actions */}
              {selectedPayment.status === 'PROCESSING' && (
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
                      onClick={() => handleVerify(selectedPayment.id, true)}
                      disabled={verifyingId === selectedPayment.id}
                      className="py-3 bg-admin-success/20 text-admin-success font-bold rounded-xl hover:bg-admin-success/30 transition-colors disabled:opacity-50"
                    >
                      {verifyingId === selectedPayment.id ? 'Procesando...' : '✓ Aprobar'}
                    </button>
                    <button
                      onClick={() => handleVerify(selectedPayment.id, false)}
                      disabled={verifyingId === selectedPayment.id}
                      className="py-3 bg-admin-error/20 text-admin-error font-bold rounded-xl hover:bg-admin-error/30 transition-colors disabled:opacity-50"
                    >
                      {verifyingId === selectedPayment.id ? 'Procesando...' : '✗ Rechazar'}
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
