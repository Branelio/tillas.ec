'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { dropsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import ProductCard from '@/components/ProductCard';
import { Clock, Users, Flame, Trophy, ArrowLeft, Check, AlertCircle, Package } from 'lucide-react';

interface DropDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  startsAt: string;
  endsAt?: string;
  status: string;
  type?: string;
  isRaffle?: boolean;
  maxEntries?: number;
  stock?: number;
  minTier?: string;
  products: { product: any }[];
  _count?: { entries: number };
}

function CountdownDisplay({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: 'Días', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.mins },
    { label: 'Seg', value: timeLeft.secs },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {units.map(u => (
        <div key={u.label} className="bg-tillas-surfaceElevated rounded-xl p-3 w-20 text-center border border-tillas-border">
          <span className="text-2xl font-bold text-white font-mono">{String(u.value).padStart(2, '0')}</span>
          <p className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wider">{u.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function DropDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuthStore();
  const [drop, setDrop] = useState<DropDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [entering, setEntering] = useState(false);
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState('');

  // Collect all sizes from the drop products
  const availableSizes = drop?.products
    ? Array.from(new Set(drop.products.flatMap(dp => dp.product.variants?.map((v: any) => v.size) || []))).sort()
    : [];

  useEffect(() => {
    if (!slug) return;
    dropsApi.getBySlug(slug)
      .then(({ data }) => setDrop(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnter = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    if (!selectedSize || !drop) return;
    setEntering(true);
    setError('');
    try {
      await dropsApi.enter(drop.id, selectedSize);
      setEntered(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al participar');
    }
    setEntering(false);
  };

  const now = new Date();
  const startsAt = drop ? new Date(drop.startsAt) : new Date();
  const endsAt = drop?.endsAt ? new Date(drop.endsAt) : null;
  const isUpcoming = now < startsAt;
  const isLive = !isUpcoming && (!endsAt || now < endsAt);
  const isEnded = endsAt ? now >= endsAt : false;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-64 bg-tillas-surface rounded-2xl animate-pulse border border-tillas-border mb-8" />
        <div className="h-6 bg-tillas-surface rounded w-64 animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-tillas-surface rounded-2xl animate-pulse border border-tillas-border" />)}
        </div>
      </div>
    );
  }

  if (!drop) {
    return (
      <div className="text-center py-32">
        <p className="text-6xl mb-4">🔥</p>
        <h2 className="font-heading text-2xl text-white">Drop no encontrado</h2>
        <Link href="/drops" className="mt-4 text-tillas-primary hover:underline inline-block">← Volver a Drops</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link href="/drops" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Todos los drops
      </Link>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-tillas-border mb-8">
        {drop.image && (
          <div className="relative h-64 md:h-80">
            <img src={drop.image} alt={drop.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-tillas-bg via-tillas-bg/40 to-transparent" />
          </div>
        )}
        <div className={`${drop.image ? 'absolute bottom-0 left-0 right-0' : ''} p-6 md:p-8`}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {isLive && (
              <span className="text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg animate-pulse">
                🔴 EN VIVO
              </span>
            )}
            {isUpcoming && (
              <span className="text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-lg">
                ⏳ Próximamente
              </span>
            )}
            {isEnded && (
              <span className="text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30 px-2.5 py-1 rounded-lg">
                Finalizado
              </span>
            )}
            {drop.isRaffle && (
              <span className="text-xs font-bold bg-tillas-primary/20 text-tillas-primary border border-tillas-primary/30 px-2.5 py-1 rounded-lg">
                🎲 Raffle
              </span>
            )}
            {drop.type === 'EARLY_ACCESS' && drop.minTier && (
              <span className="text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-lg">
                👑 Early Access — {drop.minTier}+
              </span>
            )}
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">{drop.title}</h1>
          <p className="text-gray-400 mt-2 max-w-2xl">{drop.description}</p>
        </div>
      </div>

      {/* Countdown / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Countdown */}
        {isUpcoming && (
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border text-center">
            <p className="text-gray-400 text-sm mb-4 flex items-center justify-center gap-2">
              <Clock size={14} /> Empieza en
            </p>
            <CountdownDisplay targetDate={drop.startsAt} />
            <p className="text-gray-500 text-xs mt-3">
              {startsAt.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className={`bg-tillas-surface rounded-2xl p-6 border border-tillas-border ${!isUpcoming ? 'md:col-span-2' : ''}`}>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Users size={20} className="mx-auto text-tillas-primary mb-2" />
              <p className="text-white font-bold text-lg">{drop._count?.entries || 0}</p>
              <p className="text-gray-500 text-xs">Participantes</p>
            </div>
            {drop.stock && (
              <div className="text-center">
                <Package size={20} className="mx-auto text-tillas-accent mb-2" />
                <p className="text-white font-bold text-lg">{drop.stock}</p>
                <p className="text-gray-500 text-xs">Unidades</p>
              </div>
            )}
            {drop.maxEntries && (
              <div className="text-center">
                <Trophy size={20} className="mx-auto text-yellow-400 mb-2" />
                <p className="text-white font-bold text-lg">{drop.maxEntries}</p>
                <p className="text-gray-500 text-xs">Cupos máx.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participate form */}
      {isLive && !entered && (
        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-primary/30 mb-8">
          <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
            <Flame size={18} className="text-tillas-accent" />
            {drop.isRaffle ? 'Participar en el Sorteo' : 'Participar en el Drop'}
          </h3>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-3">Selecciona tu talla</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    selectedSize === size
                      ? 'bg-tillas-primary text-black border-tillas-primary'
                      : 'bg-tillas-surfaceElevated text-white border-tillas-border hover:border-tillas-primary/50'
                  }`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleEnter} disabled={entering || !selectedSize}
            className="w-full py-4 bg-tillas-primary text-black font-bold rounded-xl text-lg hover:bg-tillas-primaryDark transition-colors disabled:opacity-50">
            {entering ? 'Registrando...' : drop.isRaffle ? '🎲 Participar en el Sorteo' : '🔥 Participar'}
          </button>
        </div>
      )}

      {/* Already entered */}
      {entered && (
        <div className="bg-tillas-primary/10 border border-tillas-primary/30 rounded-2xl p-6 mb-8 text-center">
          <Check size={40} className="mx-auto text-tillas-primary mb-3" />
          <h3 className="font-heading text-xl font-bold text-white">¡Estás participando!</h3>
          <p className="text-gray-400 text-sm mt-2">
            {drop.isRaffle
              ? 'Te notificaremos si resultas ganador del sorteo.'
              : 'Tu participación fue registrada exitosamente.'}
          </p>
        </div>
      )}

      {/* Drop products */}
      {drop.products.length > 0 && (
        <div>
          <h3 className="font-heading text-xl font-bold text-white mb-4">Productos del Drop</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {drop.products.map(dp => (
              <ProductCard key={dp.product.id} product={dp.product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
