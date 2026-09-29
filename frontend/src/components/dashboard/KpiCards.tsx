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
      subtext: 'All tracked entries',
      icon: Briefcase,
      statusFilter: 'ALL',
      isHighlight: false,
    },
    {
      id: 'active',
      title: 'Active Pipeline',
      count: active,
      subtext: 'In review or process',
      icon: Activity,
      statusFilter: 'ACTIVE',
      isHighlight: false,
    },
    {
      id: 'interviews',
      title: 'Interviews',
      count: interviews,
      subtext: 'Scheduled & ongoing',
      icon: CalendarCheck,
      statusFilter: 'INTERVIEW',
      isHighlight: true,
    },
    {
      id: 'offers',
      title: 'Offers',
      count: offers,
      subtext: 'Accepted or pending',
      icon: Award,
      statusFilter: 'OFFER',
      isHighlight: false,
    },
    {
      id: 'rejected',
      title: 'Rejected',
      count: rejected,
      subtext: 'Archived attempts',
      icon: XCircle,
      statusFilter: 'REJECTED',
      isHighlight: false,
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
            className={`group p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
              card.isHighlight
                ? 'bg-zinc-900 border-zinc-600 hover:border-white shadow-md shadow-black'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                  card.isHighlight
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                }`}
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
