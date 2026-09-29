import React, { useState } from 'react';
import { backend } from '../../../wailsjs/go/models';
import { StatusBadge, TypeBadge } from '../common/Badge';
import { formatDate, formatDateTime, formatSalary } from '../../utils/formatters';
import {
  ALL_STATUSES,
  STATUS_CONFIG,
  ApplicationStatus,
  EMPLOYMENT_TYPE_LABELS,
  EmploymentType,
} from '../../constants/status';
import {
  X,
  Building2,
  Briefcase,
  MapPin,
  Banknote,
  Globe,
  Mail,
  User,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  ExternalLink,
  Send,
  CalendarCheck,
  FileText,
} from 'lucide-react';
import { OpenURL } from '../../../wailsjs/go/main/App';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: backend.ApplicationDetail | null;
  onEdit: (app: backend.Application) => void;
  onDelete: (id: number, company: string) => void;
  onStatusChange: (id: number, status: string, note: string) => Promise<void>;
  onAddNote: (id: number, note: string) => Promise<void>;
  onSetInterviewDate?: (id: number, date: string, note: string) => Promise<void>;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  detail,
  onEdit,
  onDelete,
  onStatusChange,
  onAddNote,
  onSetInterviewDate,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false);
  const [newInterviewDate, setNewInterviewDate] = useState('');

  if (!isOpen || !detail) return null;

  const app = detail;
  const timeline = detail.timeline || [];

  const handleOpenExternal = (url: string) => {
    if (!url) return;
    try {
      OpenURL(url);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      await onAddNote(app.id, newNote.trim());
      setNewNote('');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!targetStatus) return;
    try {
      await onStatusChange(app.id, targetStatus, statusChangeNote.trim());
      setTargetStatus(null);
      setStatusChangeNote('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveInterviewDate = async () => {
    if (!newInterviewDate || !onSetInterviewDate) return;
    try {
      await onSetInterviewDate(
        app.id,
        newInterviewDate,
        `Scheduled interview for ${formatDate(newInterviewDate)}`
      );
      setIsSchedulingInterview(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex items-start justify-between shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight truncate">
                {app.company}
              </h2>
              <TypeBadge type={app.type} />
              <StatusBadge status={app.status} />
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-0.5">{app.position}</div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(app)}
              title="Edit Application"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors cursor-pointer border border-zinc-700"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onDelete(app.id, app.company)}
              title="Delete Application"
              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-5">
            {/* Status Switcher */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Update Status</span>
                <span className="text-[10px] text-zinc-500 font-normal">
                  Current: {STATUS_CONFIG[app.status as ApplicationStatus]?.label}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ALL_STATUSES.map((st) => {
                  const isCurrent = app.status === st;
                  const isSelected = targetStatus === st;
                  const cfg = STATUS_CONFIG[st];

                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={isCurrent}
                      onClick={() => {
                        setTargetStatus(st);
                        setStatusChangeNote('');
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-default'
                          : isSelected
                          ? 'bg-white text-zinc-950 font-bold ring-2 ring-white shadow-sm'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              {targetStatus && (
                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <div className="text-[11px] text-zinc-300">
                    Change status to <strong className="text-white">{STATUS_CONFIG[targetStatus as ApplicationStatus]?.label}</strong>:
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Note (e.g. Completed HR Round)..."
                      value={statusChangeNote}
                      onChange={(e) => setStatusChangeNote(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                    />
                    <button
                      onClick={handleConfirmStatusChange}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs cursor-pointer transition-colors shrink-0"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setTargetStatus(null)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs cursor-pointer hover:bg-zinc-700 shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Scheduled Interview Card */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-4 h-4 text-white" />
                <div>
                  <div className="font-bold text-white text-xs">Interview Schedule</div>
                  <div className="text-zinc-400 text-[11px] font-mono mt-0.5">
                    {app.interview_date ? formatDate(app.interview_date) : 'No interview scheduled'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setNewInterviewDate(app.interview_date || '');
                  setIsSchedulingInterview(!isSchedulingInterview);
                }}
                className="text-[11px] font-semibold text-white hover:underline cursor-pointer"
              >
                {app.interview_date ? 'Reschedule' : '+ Schedule'}
              </button>
            </div>

            {isSchedulingInterview && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-700 space-y-2 animate-in fade-in">
                <label className="block text-[11px] font-semibold text-zinc-300">
                  Select Date & Time for Interview:
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={newInterviewDate}
                    onChange={(e) => setNewInterviewDate(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono"
                  />
                  <button
                    onClick={handleSaveInterviewDate}
                    className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsSchedulingInterview(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500 text-[10px] uppercase font-semibold mb-1">
                  Applied Date
                </div>
                <div className="font-semibold text-white font-mono">
                  {formatDate(app.applied_date)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500 text-[10px] uppercase font-semibold mb-1">
                  Location
                </div>
                <div className="font-semibold text-white">{app.location || 'Not specified'}</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500 text-[10px] uppercase font-semibold mb-1">
                  Employment
                </div>
                <div className="font-semibold text-white">
                  {app.employment_type
                    ? EMPLOYMENT_TYPE_LABELS[app.employment_type as EmploymentType] ||
                      app.employment_type
                    : 'Not specified'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500 text-[10px] uppercase font-semibold mb-1">
                  Compensation
                </div>
                <div className="font-semibold text-white font-mono">
                  {formatSalary(app.salary_min, app.salary_max, app.currency) || 'Not specified'}
                </div>
              </div>
            </div>

            {/* Contact & Links */}
            {(app.job_url || app.company_url || app.contact_name || app.contact_email) && (
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Contact & Links
                </div>
                {app.job_url && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-300 truncate pr-2 font-mono text-[11px]">
                      {app.job_url}
                    </span>
                    <button
                      onClick={() => handleOpenExternal(app.job_url)}
                      className="flex items-center gap-1 text-[11px] text-white font-bold hover:underline shrink-0"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {(app.contact_name || app.contact_email) && (
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">{app.contact_name}</span>
                      {app.contact_email && (
                        <span className="text-zinc-500">({app.contact_email})</span>
                      )}
                    </div>
                    {app.contact_email && (
                      <button
                        onClick={() => handleOpenExternal(`mailto:${app.contact_email}`)}
                        className="text-[11px] font-bold text-white hover:underline"
                      >
                        Email HR
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {app.notes && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Notes
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {app.notes}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Timeline (5 cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col bg-zinc-950">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Timeline History
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {timeline.length} {timeline.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {/* Add note input form */}
            <form onSubmit={handleAddNoteSubmit} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add note to timeline..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNote.trim()}
                  className="p-2 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-40 text-black font-bold transition-colors cursor-pointer"
                  title="Add Note"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </form>

            {/* Timeline Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {timeline.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-600">
                  No timeline entries recorded yet.
                </div>
              ) : (
                timeline.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative flex gap-3 text-xs">
                    {idx < timeline.length - 1 && (
                      <div className="absolute left-2 top-5 bottom-0 w-0.5 bg-zinc-800" />
                    )}

                    <div className="w-4 h-4 rounded-full bg-white text-black shrink-0 mt-0.5 ring-4 ring-zinc-950 z-10" />

                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={evt.status} size="sm" showDot={false} />
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {formatDateTime(evt.created_at)}
                        </span>
                      </div>
                      {evt.note && (
                        <p className="mt-1 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 leading-relaxed">
                          {evt.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
