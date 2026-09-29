import React, { useState } from 'react';
import { backend } from '../../../wailsjs/go/models';
import {
  Mail,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Briefcase,
  Building2,
  Sparkles,
  Search,
  Filter,
  Inbox,
  ExternalLink,
  ChevronRight,
  Shield,
  AlertTriangle,
} from 'lucide-react';

interface EmailSyncPageProps {
  accounts: backend.EmailAccount[];
  notifications: backend.EmailNotification[];
  onAddAccount: () => void;
  onEditAccount: (account: backend.EmailAccount) => void;
  onDeleteAccount: (id: number) => Promise<void>;
  onSyncAccount: (id: number) => Promise<void>;
  onSyncAll: () => Promise<void>;
  onToggleRead: (id: number, isRead: boolean) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onDeleteNotification: (id: number) => Promise<void>;
  onConvertToApplication: (notif: backend.EmailNotification) => void;
  isSyncing: boolean;
}

export const EmailSyncPage: React.FC<EmailSyncPageProps> = ({
  accounts,
  notifications,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onSyncAccount,
  onSyncAll,
  onToggleRead,
  onMarkAllRead,
  onDeleteNotification,
  onConvertToApplication,
  isSyncing,
}) => {
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (unreadOnly && n.is_read) return false;
    if (platformFilter !== 'ALL' && n.platform !== platformFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = (n.detected_company || '').toLowerCase().includes(q);
      const matchRole = (n.detected_role || '').toLowerCase().includes(q);
      const matchSubj = (n.subject || '').toLowerCase().includes(q);
      const matchSnip = (n.snippet || '').toLowerCase().includes(q);
      if (!matchComp && !matchRole && !matchSubj && !matchSnip) return false;
    }
    return true;
  });

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'GLASSDOOR':
        return {
          label: 'Glassdoor',
          bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
        };
      case 'LINKEDIN':
        return {
          label: 'LinkedIn',
          bg: 'bg-blue-950/40 text-blue-300 border-blue-800/60',
        };
      case 'JOBSTREET':
        return {
          label: 'JobStreet',
          bg: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
        };
      case 'INDEED':
        return {
          label: 'Indeed',
          bg: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60',
        };
      case 'CAREERS':
        return {
          label: 'Direct Career Portal',
          bg: 'bg-purple-950/40 text-purple-300 border-purple-800/60',
        };
      default:
        return {
          label: 'Job Alert',
          bg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INTERVIEW':
        return {
          label: 'Undangan Interview',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
      case 'OFFER':
        return {
          label: 'Offer Diterima',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'APPLIED':
        return {
          label: 'Lamaran Terkirim',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        };
      case 'VIEWED':
        return {
          label: 'Lamaran Dilihat',
          color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        };
      case 'ALERT':
        return {
          label: 'Info Lowongan',
          color: 'bg-zinc-700 text-zinc-300 border-zinc-600',
        };
      default:
        return {
          label: 'Update Status',
          color: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-white" />
              Notifikasi & Sinkronisasi Email
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
              100% Local-First
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Pantau dan ekstrak otomatis pesan lamaran dari <strong>Glassdoor</strong>, <strong>LinkedIn</strong>, <strong>JobStreet</strong>, dan platform karir secara multi-email.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {accounts.length > 0 && (
            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Semua'}</span>
            </button>
          )}

          <button
            onClick={onAddAccount}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Akun Email</span>
          </button>
        </div>
      </div>

      {/* Connected Email Accounts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Akun Email Terhubung ({accounts.length})
          </h2>
          <span className="text-[11px] text-zinc-400">
            Mendukung beberapa akun email sekaligus (Multi-Account)
          </span>
        </div>

        {accounts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Belum Ada Akun Email yang Terhubung</p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                Tambahkan akun Gmail, Yahoo, atau Outlook kamu dengan App Password. TrackPlan akan membaca inbox secara aman (read-only) untuk menemukan update lamaran Glassdoor kamu.
              </p>
            </div>
            <button
              onClick={onAddAccount}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Hubungkan Akun Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 flex flex-col justify-between transition-all space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">
                          {acc.label || 'Akun Email'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {acc.provider}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">{acc.email}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditAccount(acc)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit Akun"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAccount(acc.id)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-400 space-y-1 mt-2.5 pt-2.5 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <span>Server IMAP:</span>
                      <span className="font-mono text-zinc-400">
                        {acc.imap_host}:{acc.imap_port}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Terakhir Sinkron:</span>
                      <span className="text-zinc-300">
                        {acc.last_sync_at ? acc.last_sync_at : 'Belum pernah'}
                      </span>
                    </div>
                    {acc.last_sync_status && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span>Status:</span>
                        <span
                          className={`font-semibold ${
                            acc.last_sync_status.startsWith('FAILED')
                              ? 'text-red-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {acc.last_sync_status.startsWith('FAILED') ? 'Gagal' : 'Berhasil'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onSyncAccount(acc.id)}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sinkronkan Akun Ini</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications Inbox Section */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5" />
              Notifikasi Lowongan Terdeteksi ({filteredNotifications.length})
            </h2>
            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2 cursor-pointer ml-2"
              >
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'GLASSDOOR', 'LINKEDIN', 'JOBSTREET', 'CAREERS', 'OTHER'].map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  platformFilter === plat
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {plat === 'ALL' ? 'Semua Platform' : plat}
              </button>
            ))}

            <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 text-[11px] cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0"
              />
              <span>Belum Dibaca</span>
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari berdasarkan perusahaan, posisi jabatan, atau kata kunci email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-sans"
          />
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-center space-y-2">
            <p className="text-sm font-semibold text-zinc-300">Tidak ada notifikasi yang ditemukan</p>
            <p className="text-xs text-zinc-400">
              {accounts.length === 0
                ? 'Tambahkan akun email terlebih dahulu untuk mulai mengambil email.'
                : 'Belum ada email terbaru dari Glassdoor/LinkedIn atau tidak sesuai filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((notif) => {
              const platformBadge = getPlatformBadge(notif.platform);
              const statusBadge = getStatusBadge(notif.detected_status);
              const isExpanded = expandedId === notif.id;

              return (
                <div
                  key={notif.id}
                  className={`border rounded-2xl p-4 transition-all duration-150 ${
                    !notif.is_read
                      ? 'bg-zinc-950/90 border-zinc-700/80 shadow-sm'
                      : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 opacity-90'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${platformBadge.bg}`}
                        >
                          {platformBadge.label}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {notif.account_email}
                        </span>
                        <span className="text-[11px] text-zinc-400">• {notif.received_at}</span>
                      </div>

                      {/* Detected Info Card */}
                      {(notif.detected_company || notif.detected_role) && (
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          {notif.detected_company && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
                              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{notif.detected_company}</span>
                            </div>
                          )}
                          {notif.detected_role && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-1 rounded-lg">
                              <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{notif.detected_role}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Subject */}
                      <p
                        onClick={() => setExpandedId(isExpanded ? null : notif.id)}
                        className="text-xs font-semibold text-zinc-200 hover:text-white cursor-pointer transition-colors"
                      >
                        {notif.subject}
                      </p>

                      {/* Snippet Preview */}
                      {notif.snippet && (
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {notif.snippet}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center md:flex-col gap-1.5 shrink-0 self-end md:self-start">
                      <button
                        onClick={() => onConvertToApplication(notif)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                        title="Tambahkan langsung ke Pipeline Lamaran Kerja"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+ Tambah ke Lamaran</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleRead(notif.id, !notif.is_read)}
                          className="px-2.5 py-1 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-[11px] transition-colors cursor-pointer"
                        >
                          {notif.is_read ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'}
                        </button>
                        <button
                          onClick={() => onDeleteNotification(notif.id)}
                          className="p-1.5 rounded-lg border border-zinc-800 hover:border-red-900/60 bg-zinc-900 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Hapus Notifikasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
