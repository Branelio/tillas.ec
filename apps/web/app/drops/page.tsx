'use client';
import { useEffect, useState } from 'react';
import { dropsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { Flame, Clock, Users, Trophy, ArrowRight, Ticket } from 'lucide-react';

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
  stock?: number;
  _count?: { entries: number };
}

function DropCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-2">
      {[
        { val: timeLeft.days, label: 'D' },
        { val: timeLeft.hours, label: 'H' },
        { val: timeLeft.minutes, label: 'M' },
        { val: timeLeft.seconds, label: 'S' },
      ].map(t => (
        <div key={t.label} className="bg-black/30 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center min-w-[40px]">
          <span className="font-heading text-lg font-bold text-white">{String(t.val).padStart(2, '0')}</span>
          <span className="text-[9px] text-gray-400 block -mt-0.5">{t.label}</span>
        </div>
      ))}
    </div>
  );
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  SCHEDULED: { label: 'PRÓXIMO', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
  LIVE: { label: 'EN VIVO', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  ENDED: { label: 'FINALIZADO', color: 'text-gray-400', bg: 'bg-gray-500/20 border-gray-500/30' },
  CANCELLED: { label: 'CANCELADO', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
};

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    dropsApi.getAll()
      .then(({ data }) => setDrops(Array.isArray(data) ? data : data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = drops.filter(d => d.status === 'SCHEDULED');
  const live = drops.filter(d => d.status === 'LIVE');
  const ended = drops.filter(d => d.status === 'ENDED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-tillas-primary/10 rounded-full mb-4">
          <Flame size={16} className="text-tillas-primary" />
          <span className="text-tillas-primary text-xs font-bold uppercase tracking-wider">Lanzamientos Exclusivos</span>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">Drops</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Accede a los sneakers más buscados. Participa en raffles, gana acceso anticipado y nunca te pierdas un lanzamiento.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-tillas-surface rounded-2xl border border-tillas-border overflow-hidden">
              <div className="h-48 shimmer-bg" />
              <div className="p-6 space-y-3">
                <div className="h-4 shimmer-bg rounded w-24" />
                <div className="h-6 shimmer-bg rounded w-3/4" />
                <div className="h-4 shimmer-bg rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : drops.length === 0 ? (
        <div className="text-center py-20">
          <Flame size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No hay drops activos</h3>
          <p className="text-gray-500">¡Vuelve pronto para los próximos lanzamientos!</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Live Drops */}
          {live.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <h2 className="font-heading text-xl font-bold text-white">En Vivo Ahora</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {live.map(drop => (
                  <DropCard key={drop.id} drop={drop} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Drops */}
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Clock size={18} className="text-blue-400" />
                <h2 className="font-heading text-xl font-bold text-white">Próximos Drops</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcoming.map(drop => (
                  <DropCard key={drop.id} drop={drop} />
                ))}
              </div>
            </section>
          )}

          {/* Ended Drops */}
          {ended.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Trophy size={18} className="text-gray-500" />
                <h2 className="font-heading text-xl font-bold text-gray-400">Drops Anteriores</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                {ended.map(drop => (
                  <DropCard key={drop.id} drop={drop} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function DropCard({ drop }: { drop: Drop }) {
  const status = statusConfig[drop.status] || statusConfig.SCHEDULED;
  const isUpcoming = drop.status === 'SCHEDULED' && new Date(drop.startsAt) > new Date();

  return (
    <div className="bg-tillas-surface rounded-2xl border border-tillas-border overflow-hidden card-hover group">
      {/* Image area */}
      <div className="relative h-48 bg-gradient-to-br from-tillas-primary/20 via-tillas-surface to-tillas-accent/10 flex items-center justify-center overflow-hidden">
        {drop.image ? (
          <img src={drop.image} alt={drop.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Flame size={48} className="text-tillas-primary/30" />
        )}

        {/* Status badge */}
        <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${status.bg} ${status.color}`}>
          {drop.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
          {status.label}
        </div>

        {/* Raffle badge */}
        {drop.isRaffle && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs font-bold">
            <Ticket size={12} /> RAFFLE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover:text-tillas-primary transition-colors">
          {drop.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {drop.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {drop._count?.entries !== undefined && (
              <span className="flex items-center gap-1">
                <Users size={12} /> {drop._count.entries} participantes
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(drop.startsAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          {isUpcoming && <DropCountdown targetDate={drop.startsAt} />}
        </div>

        {/* CTA */}
        {drop.status !== 'ENDED' && drop.status !== 'CANCELLED' && (
          <Link href={`/drops/${drop.slug}`}
            className="flex items-center justify-center gap-2 w-full mt-5 py-3 bg-tillas-primary text-black font-bold rounded-xl text-sm hover:bg-tillas-primaryDark transition-all hover:scale-[1.02] active:scale-[0.98]">
            {drop.status === 'LIVE' ? 'Participar Ahora' : 'Ver Detalles'} <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
