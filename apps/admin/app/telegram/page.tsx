'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { adminTelegramApi } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import {
  MessageCircle, Check, X, Eye, RefreshCw, Wifi, WifiOff,
  ChevronLeft, ChevronRight, Tag, DollarSign, Ruler,
} from 'lucide-react';

interface TelegramImport {
  id: string;
  telegramMsgId: number;
  channelName: string;
  caption: string;
  images: string[];
  parsedPrice: number | null;
  parsedSizeMin: number | null;
  parsedSizeMax: number | null;
  parsedHorma: string | null;
  parsedType: string | null;
  isAvailable: boolean;
  status: string;
  sellPrice: number | null;
  productName: string | null;
  brandName: string | null;
  categoryName: string | null;
  productId: string | null;
  rejectedReason: string | null;
  createdAt: string;
}

interface ConnectionStatus {
  connected: boolean;
  channel: string;
  clientReady: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_REVIEW: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  APPROVED: { label: 'Aprobado', color: 'text-admin-primary', bg: 'bg-admin-primary/20' },
  REJECTED: { label: 'Rechazado', color: 'text-admin-error', bg: 'bg-admin-error/20' },
  PRODUCT_CREATED: { label: 'Producto Creado', color: 'text-admin-success', bg: 'bg-admin-success/20' },
};

export default function TelegramPage() {
  const [imports, setImports] = useState<TelegramImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING_REVIEW' | 'PRODUCT_CREATED' | 'REJECTED' | 'all'>('PENDING_REVIEW');
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImport, setSelectedImport] = useState<TelegramImport | null>(null);
  const [approving, setApproving] = useState(false);

  // Form para aprobación
  const [form, setForm] = useState({
    productName: '',
    sellPrice: 0,
    brandName: '',
    categoryName: 'Zapatillas',
  });

  const [syncing, setSyncing] = useState(false);
  const [syncLimit, setSyncLimit] = useState(50);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const toast = useToast();

  const fetchImports = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (filter !== 'all') params.status = filter;
      const { data } = await adminTelegramApi.getImports(params);
      setImports(data?.data || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [filter, page]);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await adminTelegramApi.getStatus();
      setStatus(data);
    } catch {
      setStatus(null);
    }
  }, []);

  useEffect(() => { fetchImports(); }, [fetchImports]);
  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const openApproval = (imp: TelegramImport) => {
    setSelectedImport(imp);
    setForm({
      productName: imp.productName || '',
      sellPrice: imp.parsedPrice ? Math.round(imp.parsedPrice * 2.5) : '' as any,
      brandName: imp.brandName || '',
      categoryName: imp.categoryName || 'Zapatillas',
    });
  };

  const handleApprove = async () => {
    if (!selectedImport || !form.productName || !form.sellPrice) return;
    setApproving(true);
    try {
      await adminTelegramApi.approveImport(selectedImport.id, {
        productName: form.productName,
        sellPrice: form.sellPrice,
        brandName: form.brandName || undefined,
        categoryName: form.categoryName || undefined,
      });
      toast.success('Producto creado', `${form.productName} fue agregado al catálogo`);
      setSelectedImport(null);
      fetchImports();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'No se pudo crear el producto');
    }
    setApproving(false);
  };

  const handleReject = async (id: string) => {
    try {
      await adminTelegramApi.rejectImport(id, 'No es relevante para el catálogo');
      toast.success('Importación rechazada');
      fetchImports();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'No se pudo rechazar');
    }
  };

  const handleSyncHistory = async () => {
    if (syncLimit <= 0) return;
    setSyncing(true);
    toast.success('Sincronizando', `Buscando los últimos ${syncLimit} posts... esto puede tomar un poco.`);
    try {
      const res = await adminTelegramApi.syncHistory(syncLimit);
      toast.success('Sincronización Completa', `Nuevos posts importados: ${res.data?.imported || 0}`);
      setShowSyncModal(false);
      fetchImports();
      fetchStatus();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Fallo al sincronizar historial.');
    }
    setSyncing(false);
  };

  const filters = [
    { key: 'PENDING_REVIEW' as const, label: 'Pendientes' },
    { key: 'all' as const, label: 'Todos' },
    { key: 'PRODUCT_CREATED' as const, label: 'Creados' },
    { key: 'REJECTED' as const, label: 'Rechazados' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <MessageCircle size={28} className="text-blue-400" />
            Importaciones Telegram
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Productos recibidos del canal del proveedor
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status */}
          {status && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
              status.connected
                ? 'bg-admin-success/10 text-admin-success border border-admin-success/20'
                : 'bg-admin-error/10 text-admin-error border border-admin-error/20'
            }`}>
              {status.connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {status.connected ? 'Conectado' : 'Desconectado'}
            </div>
          )}
          
          <div className="relative">
            <button onClick={() => setShowSyncModal(!showSyncModal)} disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors disabled:opacity-50">
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> 
              {syncing ? 'Sincronizando...' : 'Sincronizar Historial'}
            </button>
            
            {showSyncModal && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-admin-surface border border-admin-border rounded-xl p-4 shadow-xl z-10">
                <h4 className="text-white text-sm font-bold mb-2">Sincronizar posts antiguos</h4>
                <p className="text-gray-400 text-xs mb-3">
                  Revisa el canal para importar posts que no estén en la base de datos.
                </p>
                <div className="flex gap-2">
                  <input type="number" min="1" max="500" value={syncLimit} onChange={e => setSyncLimit(Number(e.target.value))}
                    className="w-full bg-admin-elevated border border-admin-border rounded-lg px-3 py-2 text-sm text-white" />
                  <button onClick={handleSyncHistory} disabled={syncing}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">
                    Ir
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => { fetchImports(); fetchStatus(); }}
            className="flex items-center gap-2 px-4 py-2 bg-admin-card border border-admin-border rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-blue-500 text-white'
                : 'bg-admin-card text-gray-400 border border-admin-border hover:border-blue-500/30'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-admin-card rounded-2xl border border-admin-border h-80 animate-pulse" />
          ))}
        </div>
      ) : imports.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle size={48} className="mx-auto mb-3 text-gray-600" />
          <h3 className="font-heading text-xl text-gray-400">No hay importaciones</h3>
          <p className="text-gray-600 text-sm mt-1">
            Las nuevas publicaciones del canal aparecerán aquí automáticamente
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {imports.map(imp => {
            const sc = statusConfig[imp.status] || statusConfig.PENDING_REVIEW;
            return (
              <div key={imp.id}
                className="bg-admin-card rounded-2xl border border-admin-border overflow-hidden group hover:border-blue-500/30 transition-colors">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-admin-elevated">
                  {imp.images?.[0] ? (
                    <Image
                      src={imp.images[0]}
                      alt="Producto importado"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <MessageCircle size={40} />
                    </div>
                  )}

                  {/* Status badge */}
                  <div className={`absolute top-3 right-3 ${sc.bg} ${sc.color} text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm`}>
                    {sc.label}
                  </div>

                  {/* Image count */}
                  {imp.images?.length > 1 && (
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                      📸 {imp.images.length} fotos
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  {/* Parsed data pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {imp.parsedPrice && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-500/10 text-green-400 px-2 py-0.5 rounded">
                        <DollarSign size={10} /> ${imp.parsedPrice}
                      </span>
                    )}
                    {imp.parsedSizeMin && imp.parsedSizeMax && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                        <Ruler size={10} /> {imp.parsedSizeMin}-{imp.parsedSizeMax}
                      </span>
                    )}
                    {imp.parsedType && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">
                        <Tag size={10} /> {imp.parsedType}
                      </span>
                    )}
                    {imp.parsedHorma && (
                      <span className="text-[10px] font-bold bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded">
                        Horma {imp.parsedHorma}
                      </span>
                    )}
                  </div>

                  {/* Product name if approved */}
                  {imp.productName && (
                    <p className="text-white text-sm font-medium truncate mb-1">{imp.productName}</p>
                  )}

                  <p className="text-gray-600 text-[10px]">
                    {new Date(imp.createdAt).toLocaleDateString('es-EC', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>

                  {/* Actions */}
                  {imp.status === 'PENDING_REVIEW' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openApproval(imp)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-admin-success/10 text-admin-success font-bold text-xs rounded-xl hover:bg-admin-success/20 transition-colors">
                        <Check size={14} /> Aprobar
                      </button>
                      <button onClick={() => handleReject(imp.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-admin-error/10 text-admin-error font-bold text-xs rounded-xl hover:bg-admin-error/20 transition-colors">
                        <X size={14} />
                      </button>
                      <button onClick={() => openApproval(imp)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-admin-elevated text-gray-400 text-xs rounded-xl hover:text-white transition-colors">
                        <Eye size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 bg-admin-card border border-admin-border rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-gray-400 text-sm">
            Página {page} de {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 bg-admin-card border border-admin-border rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Approval Modal */}
      {selectedImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-admin-surface rounded-2xl border border-admin-border p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">
                Aprobar y Crear Producto
              </h3>
              <button onClick={() => setSelectedImport(null)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Images */}
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                  Imágenes del proveedor ({selectedImport.images?.length || 0})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedImport.images?.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-admin-border">
                      <Image src={url} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>

                {/* Parsed data */}
                <div className="mt-4 p-3 bg-admin-elevated rounded-xl border border-admin-border">
                  <p className="text-xs text-gray-500 mb-2">Datos del proveedor (parseados):</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Precio mayorista:</span>
                      <p className="text-green-400 font-bold">${selectedImport.parsedPrice || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Tallas:</span>
                      <p className="text-blue-400 font-bold">
                        {selectedImport.parsedSizeMin && selectedImport.parsedSizeMax
                          ? `${selectedImport.parsedSizeMin} - ${selectedImport.parsedSizeMax}`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Horma:</span>
                      <p className="text-white">{selectedImport.parsedHorma || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Tipo:</span>
                      <p className="text-purple-400">{selectedImport.parsedType || '—'}</p>
                    </div>
                    <div className="col-span-2 mt-1">
                      <span className="text-gray-500 text-xs">Disponibilidad en canal:</span>
                      {selectedImport.isAvailable ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-admin-success/20 text-admin-success border border-admin-success/30">
                          Siempre Disponible
                        </span>
                      ) : (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-admin-error/20 text-admin-error border border-admin-error/30">
                          No Disponible / Agotado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nombre del Producto *</label>
                  <input type="text" value={form.productName}
                    onChange={e => setForm({ ...form, productName: e.target.value })}
                    placeholder="Ej: Adidas Superstar Negro"
                    className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500" />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Precio de Venta (USD) *
                    {selectedImport.parsedPrice && (
                      <span className="text-green-400 ml-2">Mayorista: ${selectedImport.parsedPrice}</span>
                    )}
                  </label>
                  <input type="text" value={form.sellPrice}
                    onChange={e => setForm({ ...form, sellPrice: e.target.value as any })}
                    placeholder="35.00"
                    className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500" />
                  {selectedImport.parsedPrice && Number(form.sellPrice) > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Margen: {((Number(form.sellPrice) / selectedImport.parsedPrice - 1) * 100).toFixed(0)}%
                      ({((Number(form.sellPrice) - selectedImport.parsedPrice)).toFixed(2)} USD ganancia)
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Marca</label>
                    <input type="text" value={form.brandName}
                      onChange={e => setForm({ ...form, brandName: e.target.value })}
                      placeholder="Adidas, Nike..."
                      className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
                    <input type="text" value={form.categoryName}
                      onChange={e => setForm({ ...form, categoryName: e.target.value })}
                      placeholder="Zapatillas"
                      className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                {/* Size range preview */}
                {selectedImport.parsedSizeMin && selectedImport.parsedSizeMax && (
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">
                      Tallas que se crearán ({selectedImport.parsedSizeMax - selectedImport.parsedSizeMin + 1} variantes)
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: selectedImport.parsedSizeMax - selectedImport.parsedSizeMin + 1 }, (_, i) => (
                        <span key={i} className="bg-admin-elevated border border-admin-border text-white text-xs px-2 py-1 rounded-lg">
                          {selectedImport.parsedSizeMin! + i}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={handleApprove}
                  disabled={approving || !form.productName || !form.sellPrice}
                  className="w-full mt-4 py-3 bg-admin-success/20 text-admin-success font-bold rounded-xl hover:bg-admin-success/30 transition-colors disabled:opacity-50">
                  {approving ? 'Creando producto...' : '✓ Crear Producto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
