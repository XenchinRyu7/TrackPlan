import React from 'react';
import { backend } from '../../../wailsjs/go/models';
import { ALL_STATUSES, STATUS_CONFIG } from '../../constants/status';
import { BarChart2 } from 'lucide-react';

interface StatusDistributionChartProps {
  stats: backend.Stats | null;
  onSelectStatus?: (status: string) => void;
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  stats,
  onSelectStatus,
}) => {
  const distribution = stats?.status_distribution || {};
  const total = stats?.total_applications || 0;
  const maxCount = Math.max(1, ...ALL_STATUSES.map((s) => distribution[s] || 0));

  return (
    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-white" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Status Breakdown
          </h3>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono">
          {total} {total === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {total === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-500">
          No application records yet.
        </div>
      ) : (
        <div className="space-y-2">
          {ALL_STATUSES.map((statusKey) => {
            const count = distribution[statusKey] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            const barWidthPercent = (count / maxCount) * 100;
            const config = STATUS_CONFIG[statusKey];
            const isInterviewOrOffer = statusKey === 'INTERVIEW' || statusKey === 'OFFER';

            return (
              <div
                key={statusKey}
                onClick={() => onSelectStatus?.(statusKey)}
                className="group flex items-center gap-3 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                {/* Status Label */}
                <div className="w-24 shrink-0 flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isInterviewOrOffer ? 'bg-white' : 'bg-zinc-500'
                    }`}
                  />
                  <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors truncate">
                    {config.label}
                  </span>
                </div>

                {/* Monochrome progress track & fill */}
                <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isInterviewOrOffer ? 'bg-white' : 'bg-zinc-500 group-hover:bg-zinc-300'
                    }`}
                    style={{
                      width: count > 0 ? `${Math.max(barWidthPercent, 5)}%` : '0%',
                    }}
                  />
                </div>

                {/* Count & Percentage */}
                <div className="w-14 shrink-0 text-right flex items-center justify-end gap-1 font-mono text-[11px]">
                  <span className="font-bold text-white">{count}</span>
                  <span className="text-zinc-500">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
