import React from 'react';
import {
  Briefcase,
  Activity,
  CalendarCheck,
  Award,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';
import { backend } from '../../../wailsjs/go/models';

interface KpiCardsProps {
  stats: backend.Stats | null;
  onCardClick?: (filterStatus: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ stats, onCardClick }) => {
  const total = stats?.total_applications || 0;
  const active = stats?.active_applications || 0;
  const interviews = stats?.interviews || 0;
  const offers = stats?.offers || 0;
  const rejected = stats?.rejected || 0;

  const cards = [
    {
      id: 'total',
      title: 'Total Applications',
      count: total,
      subtext: 'Semua lamaran tersimpan',
      icon: Briefcase,
      statusFilter: 'ALL',
      accentColor: 'text-zinc-300 border-zinc-700 bg-zinc-900',
      badgeColor: 'hover:border-zinc-500',
    },
    {
      id: 'active',
      title: 'Active Pipeline',
      count: active,
      subtext: 'Sedang berjalan',
      icon: Activity,
      statusFilter: 'ACTIVE',
      accentColor: 'text-blue-400 border-blue-500/30 bg-blue-950/40',
      badgeColor: 'hover:border-blue-500/60',
    },
    {
      id: 'interviews',
      title: 'Interviews',
      count: interviews,
      subtext: 'Jadwal wawancara',
      icon: CalendarCheck,
      statusFilter: 'INTERVIEW',
      accentColor: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
      badgeColor: 'hover:border-amber-500/60',
    },
    {
      id: 'offers',
      title: 'Offers',
      count: offers,
      subtext: 'Tawaran kerja',
      icon: Award,
      statusFilter: 'OFFER',
      accentColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
      badgeColor: 'hover:border-emerald-500/60',
    },
    {
      id: 'rejected',
      title: 'Rejected',
      count: rejected,
      subtext: 'Belum berhasil',
      icon: XCircle,
      statusFilter: 'REJECTED',
      accentColor: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
      badgeColor: 'hover:border-rose-500/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onCardClick?.(card.statusFilter)}
            className={`group p-4 rounded-2xl border transition-all duration-150 cursor-pointer bg-zinc-950 border-zinc-800 ${card.badgeColor} hover:shadow-lg hover:shadow-black/40`}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${card.accentColor}`}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-white font-mono">
                {card.count}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <p className="mt-1 text-[11px] text-zinc-500">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
