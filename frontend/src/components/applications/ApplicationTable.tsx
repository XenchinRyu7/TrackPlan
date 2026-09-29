import React from 'react';
import { backend } from '../../../wailsjs/go/models';
import { StatusBadge, TypeBadge } from '../common/Badge';
import { formatDate, formatSalary } from '../../utils/formatters';
import {
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Building2,
  MapPin,
  Banknote,
  Plus,
  CalendarCheck
} from 'lucide-react';
import { ALL_STATUSES, STATUS_CONFIG, ApplicationStatus } from '../../constants/status';

interface ApplicationTableProps {
  applications: backend.Application[];
  onSelectApplication: (id: number) => void;
  onEditApplication: (app: backend.Application) => void;
  onDeleteApplication: (id: number, company: string) => void;
  onQuickStatusChange: (id: number, newStatus: string) => void;
  onNewApplication: () => void;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onSelectApplication,
  onEditApplication,
  onDeleteApplication,
  onQuickStatusChange,
  onNewApplication,
}) => {
  if (applications.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-center flex flex-col items-center justify-center">
        <Building2 className="w-10 h-10 text-zinc-600 mb-2.5" />
        <h3 className="text-sm font-bold text-white">No applications match your filter</h3>
        <p className="text-xs text-zinc-500 max-w-xs mt-1 mb-4">
          Try adjusting your search terms or filter selections, or create a new application record.
        </p>
        <button
          onClick={onNewApplication}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add New Application</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Position</th>
              <th className="py-3 px-2">Type</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Applied</th>
              <th className="py-3 px-3">Interview Date</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3">Compensation</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {applications.map((app) => {
              const salaryText = formatSalary(app.salary_min, app.salary_max, app.currency);
              return (
                <tr
                  key={app.id}
                  onClick={() => onSelectApplication(app.id)}
                  className="group hover:bg-zinc-900/60 transition-colors cursor-pointer"
                >
                  {/* Company */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-sm text-white group-hover:underline flex items-center gap-1.5">
                      <span>{app.company}</span>
                      {app.company_url && (
                        <ExternalLink className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </td>

                  {/* Position */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-zinc-200">{app.position}</div>
                    {app.employment_type && (
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
                        {app.employment_type.replace('_', ' ')}
                      </div>
                    )}
                  </td>

                  {/* Type */}
                  <td className="py-3 px-2">
                    <TypeBadge type={app.type} />
                  </td>

                  {/* Status with quick change dropdown */}
                  <td
                    className="py-3 px-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={app.status}
                      onChange={(e) => onQuickStatusChange(app.id, e.target.value)}
                      className="text-xs font-semibold px-2 py-0.5 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 cursor-pointer focus:outline-none focus:border-white transition-all"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st} className="bg-zinc-950 text-white">
                          {STATUS_CONFIG[st].label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Applied Date */}
                  <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                    {formatDate(app.applied_date)}
                  </td>

                  {/* Interview Date */}
                  <td className="py-3 px-3 font-mono text-[11px]">
                    {app.interview_date ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white text-zinc-950 font-bold text-[10px]">
                        <CalendarCheck className="w-3 h-3" />
                        <span>{formatDate(app.interview_date)}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-3 text-zinc-400">
                    {app.location ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        <span>{app.location}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>

                  {/* Compensation */}
                  <td className="py-3 px-3 text-zinc-300 font-mono text-[11px]">
                    {salaryText ? (
                      <div className="flex items-center gap-1 text-zinc-200 font-medium">
                        <Banknote className="w-3 h-3 text-zinc-500" />
                        <span>{salaryText}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>

                  {/* Action buttons */}
                  <td
                    className="py-3 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onSelectApplication(app.id)}
                        title="View Details & Timeline"
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditApplication(app)}
                        title="Edit Application"
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteApplication(app.id, app.company)}
                        title="Delete Application"
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
