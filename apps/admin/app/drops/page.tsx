'use client';
import { useEffect, useState } from 'react';
import { adminDropsApi, adminProductsApi } from '@/lib/api';
import { Plus, X, Flame, Clock, Check, Users } from 'lucide-react';

interface Drop {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  startsAt: string;
  endsAt?: string;
  status: string;
  type: string;
  isRaffle: boolean;
  maxEntries?: number;
  _count?: { entries: number };
  products?: any[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  SCHEDULED: { label: 'Programado', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  LIVE: { label: 'En Vivo', color: 'text-red-400', bg: 'bg-red-500/20' },
  ENDED: { label: 'Finalizado', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  CANCELLED: { label: 'Cancelado', color: 'text-admin-error', bg: 'bg-admin-error/20' },
};

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', description: '', type: 'NORMAL',
    isRaffle: false, maxEntries: 100,
    startsAt: '', endsAt: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchDrops = async () => {
    try {
      const { data } = await adminDropsApi.getAll();
      setDrops(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDrops(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await adminDropsApi.create({
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        maxEntries: form.maxEntries || undefined,
      });
      setShowModal(false);
      setForm({ title: '', slug: '', description: '', type: 'NORMAL', isRaffle: false, maxEntries: 100, startsAt: '', endsAt: '' });
      fetchDrops();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminDropsApi.updateStatus(id, status);
      fetchDrops();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Drops</h1>
          <p className="text-gray-500 text-sm mt-1">{drops.length} drops</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-admin-primary text-black font-bold rounded-xl hover:bg-admin-primaryDark transition-colors text-sm">
          <Plus size={16} /> Nuevo Drop
        </button>
      </div>

      {/* Drops grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-admin-card rounded-2xl h-48 animate-pulse border border-admin-border" />)}
        </div>
      ) : drops.length === 0 ? (
        <div className="bg-admin-card rounded-2xl border border-admin-border p-12 text-center">
          <Flame size={32} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No hay drops creados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drops.map(drop => {
            const sc = statusConfig[drop.status] || statusConfig.SCHEDULED;
            return (
              <div key={drop.id} className="bg-admin-card rounded-2xl border border-admin-border p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${sc.bg} ${sc.color}`}>
                    {sc.label}
                  </span>
                  {drop.isRaffle && (
                    <span className="text-xs bg-admin-primary/20 text-admin-primary px-2 py-0.5 rounded font-bold">🎲 Raffle</span>
                  )}
                </div>

                <h3 className="font-heading font-semibold text-white mb-1">{drop.title}</h3>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{drop.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {new Date(drop.startsAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {drop._count?.entries || 0}
                  </span>
                </div>

                <div className="mt-auto flex gap-2">
                  {drop.status === 'SCHEDULED' && (
                    <button onClick={() => handleUpdateStatus(drop.id, 'LIVE')}
                      className="flex-1 text-xs font-bold bg-red-500/20 text-red-400 py-2 rounded-lg hover:bg-red-500/30 transition-colors">
                      🔴 Iniciar
                    </button>
                  )}
                  {drop.status === 'LIVE' && (
                    <button onClick={() => handleUpdateStatus(drop.id, 'ENDED')}
                      className="flex-1 text-xs font-bold bg-gray-500/20 text-gray-400 py-2 rounded-lg hover:bg-gray-500/30 transition-colors">
                      Finalizar
                    </button>
                  )}
                  {(drop.status === 'SCHEDULED' || drop.status === 'LIVE') && (
                    <button onClick={() => handleUpdateStatus(drop.id, 'CANCELLED')}
                      className="text-xs font-bold bg-admin-error/10 text-admin-error px-3 py-2 rounded-lg hover:bg-admin-error/20 transition-colors">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-admin-surface rounded-2xl border border-admin-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">Nuevo Drop</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Título</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Nike Dunk Low Ecuador Edition"
                  className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary" />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                  placeholder="nike-dunk-low-ecuador"
                  className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary" />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Descripción del drop..."
                  className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-admin-primary">
                    <option value="NORMAL">Normal</option>
                    <option value="EARLY_ACCESS">Early Access</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Cupos máximos</label>
                  <input type="number" value={form.maxEntries} onChange={e => setForm({ ...form, maxEntries: +e.target.value })}
                    className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-admin-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Inicio</label>
                  <input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })}
                    className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-admin-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fin (opcional)</label>
                  <input type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })}
                    className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-admin-primary" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isRaffle} onChange={e => setForm({ ...form, isRaffle: e.target.checked })}
                  className="accent-admin-primary" id="raffle" />
                <label htmlFor="raffle" className="text-sm text-gray-300">Es sorteo (Raffle)</label>
              </div>
            </div>

            <button onClick={handleCreate} disabled={saving || !form.title || !form.startsAt}
              className="w-full mt-6 py-3 bg-admin-primary text-black font-bold rounded-xl hover:bg-admin-primaryDark transition-colors disabled:opacity-50">
              {saving ? 'Creando...' : 'Crear Drop'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
