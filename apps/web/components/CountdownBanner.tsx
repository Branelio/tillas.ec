'use client';
import { useEffect, useState } from 'react';
import { dropsApi } from '@/lib/api';
import Link from 'next/link';
import { Flame, Clock } from 'lucide-react';

interface Drop {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  startsAt: string;
  status: string;
  type: string;
  isRaffle: boolean;
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculate());
    const interval = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
        <span className="font-heading text-xl md:text-2xl font-bold text-white">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function CountdownBanner() {
  const [nextDrop, setNextDrop] = useState<Drop | null>(null);

  useEffect(() => {
    dropsApi.getAll()
      .then(({ data }) => {
        const drops = Array.isArray(data) ? data : data?.data || [];
        const upcoming = drops.find((d: Drop) => d.status === 'SCHEDULED' && new Date(d.startsAt) > new Date());
        if (upcoming) setNextDrop(upcoming);
      })
      .catch(() => {});
  }, []);

  const timeLeft = useCountdown(nextDrop?.startsAt || new Date().toISOString());

  if (!nextDrop) return null;

  const isLive = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-tillas-primary/20 via-tillas-surface to-tillas-accent/10 border border-tillas-primary/20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-tillas-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-tillas-accent/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-tillas-primary/20 rounded-full mb-4">
                  <Flame size={14} className="text-tillas-primary" />
                  <span className="text-tillas-primary text-xs font-bold uppercase tracking-wider">
                    {nextDrop.isRaffle ? '🎲 Raffle Drop' : 'Próximo Drop'}
                  </span>
                </div>

                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                  {nextDrop.title}
                </h2>
                <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto lg:mx-0 mb-6">
                  {nextDrop.description.length > 150
                    ? nextDrop.description.substring(0, 150) + '...'
                    : nextDrop.description}
                </p>

                <Link href={`/drops/${nextDrop.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-all hover:scale-105 active:scale-95">
                  {isLive ? '¡Participar Ahora!' : 'Ver Detalles'}
                </Link>
              </div>

              {/* Right: Countdown */}
              <div className="shrink-0">
                {isLive ? (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-tillas-primary rounded-xl animate-pulse-ring">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-white font-bold text-lg">EN VIVO</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5 justify-center mb-4">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Empieza en</span>
                    </div>
                    <div className="flex gap-3">
                      <CountdownUnit value={timeLeft.days} label="Días" />
                      <CountdownUnit value={timeLeft.hours} label="Horas" />
                      <CountdownUnit value={timeLeft.minutes} label="Min" />
                      <CountdownUnit value={timeLeft.seconds} label="Seg" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
