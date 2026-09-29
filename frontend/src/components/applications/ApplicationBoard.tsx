import React from 'react';
import { backend } from '../../../wailsjs/go/models';
import { ALL_STATUSES, STATUS_CONFIG, ApplicationStatus } from '../../constants/status';
import { TypeBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import { ArrowRight, ArrowLeft, CalendarCheck } from 'lucide-react';

interface ApplicationBoardProps {
  applications: backend.Application[];
  onSelectApplication: (id: number) => void;
  onQuickStatusChange: (id: number, newStatus: string) => void;
  onNewApplication: () => void;
}

export const ApplicationBoard: React.FC<ApplicationBoardProps> = ({
  applications,
  onSelectApplication,
  onQuickStatusChange,
  onNewApplication,
}) => {
  const columns: ApplicationStatus[] = [
    'SAVED',
    'APPLIED',
    'SCREENING',
    'INTERVIEW',
    'OFFER',
    'REJECTED',
  ];

  return (
    <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 items-start min-h-[500px]">
      {columns.map((statusKey, colIdx) => {
        const config = STATUS_CONFIG[statusKey];
        const colApps = applications.filter((a) => a.status === statusKey);
        const isInterview = statusKey === 'INTERVIEW';

        return (
          <div
            key={statusKey}
            className={`w-72 shrink-0 flex flex-col rounded-2xl border backdrop-blur-sm max-h-[calc(100vh-230px)] ${
              isInterview
                ? 'bg-zinc-950 border-zinc-600 shadow-md'
                : 'bg-zinc-950 border-zinc-800'
            }`}
          >
            {/* Header */}
            <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isInterview ? 'bg-white' : 'bg-zinc-500'
                  }`}
                />
                <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                  {config.label}
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 font-bold border border-zinc-800">
                {colApps.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="p-2.5 flex-1 overflow-y-auto space-y-2">
              {colApps.length === 0 ? (
                <div className="py-8 text-center text-[11px] text-zinc-600 italic">
                  No applications
                </div>
              ) : (
                colApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onSelectApplication(app.id)}
                    className="group p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <h5 className="font-bold text-xs text-white group-hover:underline line-clamp-1">
                        {app.company}
                      </h5>
                      <TypeBadge type={app.type} />
                    </div>

                    <p className="text-xs text-zinc-300 font-medium mt-1 line-clamp-1">
                      {app.position}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{formatDate(app.applied_date)}</span>
                      {app.interview_date && (
                        <span className="flex items-center gap-1 font-bold text-white bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                          <CalendarCheck className="w-3 h-3" />
                          <span>{formatDate(app.interview_date)}</span>
                        </span>
                      )}
                    </div>

                    {/* Quick Move Buttons */}
                    <div
                      className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {colIdx > 0 ? (
                        <button
                          onClick={() => onQuickStatusChange(app.id, columns[colIdx - 1])}
                          title={`Move to ${STATUS_CONFIG[columns[colIdx - 1]].label}`}
                          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>Prev</span>
                        </button>
                      ) : (
                        <span />
                      )}

                      {colIdx < columns.length - 1 && (
                        <button
                          onClick={() => onQuickStatusChange(app.id, columns[colIdx + 1])}
                          title={`Advance to ${STATUS_CONFIG[columns[colIdx + 1]].label}`}
                          className="flex items-center gap-1 text-[10px] text-white hover:underline px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
