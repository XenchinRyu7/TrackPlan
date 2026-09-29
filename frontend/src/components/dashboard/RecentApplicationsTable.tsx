import React from 'react';
import { backend } from '../../../wailsjs/go/models';
import { StatusBadge, TypeBadge } from '../common/Badge';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { Clock, ChevronRight, PlusCircle, ArrowUpRight } from 'lucide-react';

interface RecentApplicationsTableProps {
  applications: backend.Application[];
  onSelectApplication: (id: number) => void;
  onViewAll: () => void;
  onNewApplication: () => void;
}

export const RecentApplicationsTable: React.FC<RecentApplicationsTableProps> = ({
  applications,
  onSelectApplication,
  onViewAll,
  onNewApplication,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Recent Applications
          </h3>
        </div>
        {applications.length > 0 && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-bold text-white hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white mb-2.5">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white">No applications tracked yet</h4>
          <p className="text-[11px] text-zinc-500 max-w-xs mt-1 mb-3">
            Start tracking your career journey by logging your first job or internship.
          </p>
          <button
            onClick={onNewApplication}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors cursor-pointer"
          >
            + Create First Application
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-2.5 pr-4 pl-1">Company</th>
                <th className="pb-2.5 px-3">Position</th>
                <th className="pb-2.5 px-2">Type</th>
                <th className="pb-2.5 px-2">Status</th>
                <th className="pb-2.5 px-3 text-right">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => onSelectApplication(app.id)}
                  className="group hover:bg-zinc-900/60 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 pr-4 pl-1 font-bold text-white group-hover:underline">
                    {app.company}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300 font-medium">
                    {app.position}
                    {app.location && (
                      <span className="text-[10px] text-zinc-500 ml-1">
                        • {app.location}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2">
                    <TypeBadge type={app.type} />
                  </td>
                  <td className="py-2.5 px-2">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-500 font-mono text-[11px]">
                    {formatDate(app.applied_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
