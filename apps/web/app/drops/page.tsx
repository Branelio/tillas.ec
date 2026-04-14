'use client';
import { useEffect, useState } from 'react';
import { dropsApi } from '@/lib/api';
import { Clock, Users, Flame } from 'lucide-react';
import Link from 'next/link';

interface Drop {
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
  _count?: { entries: number };
}

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dropsApi.getAll()
      .then(({ data }) => setDrops(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (drop: Drop) => {
    const now = new Date();
    const start = new Date(drop.startsAt);
    const end = drop.endsAt ? new Date(drop.endsAt) : null;

    if (now < start) {
      const diff = start.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return { label: `En ${days}d ${hours}h`, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    }
    if (end && now > end) return { label: 'Finalizado', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    return { label: '🔴 EN VIVO', color: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' };
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-8">Drops</h1>
        <div className="space-y-6">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-tillas-surface rounded-2xl h-48 animate-pulse border border-tillas-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Flame size={28} className="text-tillas-accent" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Drops</h1>
        </div>
        <p className="text-gray-500">Los lanzamientos más exclusivos de sneakers</p>
      </div>

      {drops.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🔥</p>
          <h3 className="font-heading text-xl text-white">No hay drops programados</h3>
          <p className="text-gray-500 mt-2">Vuelve pronto para ver los próximos lanzamientos</p>
        </div>
      ) : (
        <div className="space-y-6">
          {drops.map((drop) => {
            const status = getStatusBadge(drop);
            return (
              <Link key={drop.id} href={`/drops/${drop.slug}`}
                className="block bg-tillas-surface rounded-2xl overflow-hidden border border-tillas-border hover:border-tillas-primary/30 transition-all group">
                <div className="flex flex-col md:flex-row">
                  {drop.image && (
                    <div className="md:w-72 h-48 md:h-auto shrink-0 overflow-hidden">
                      <img src={drop.image} alt={drop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg border ${status.color}`}>
                          {status.label}
                        </span>
                        <h2 className="font-heading text-xl font-bold text-white mt-3 group-hover:text-tillas-primary transition-colors">
                          {drop.title}
                        </h2>
                      </div>
                      {drop.isRaffle && (
                        <span className="text-xs bg-tillas-primary/10 text-tillas-primary border border-tillas-primary/30 px-2 py-1 rounded-lg font-medium shrink-0">
                          🎲 Raffle
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{drop.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(drop.startsAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      {drop._count && <span className="flex items-center gap-1"><Users size={12} /> {drop._count.entries} participantes</span>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
