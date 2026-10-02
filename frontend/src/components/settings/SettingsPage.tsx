import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  HardDrive,
  Sun,
  Moon,
  Monitor,
  Bell,
  CheckCircle,
  AlertCircle,
  Loader2,
  Power,
} from 'lucide-react';
import {
  BackupDatabaseFile,
  RestoreDatabaseFile,
  ExportApplicationsJSON,
  ExportApplicationsCSV,
  ImportApplicationsFile,
  GetAutoStart,
  SetAutoStart,
} from '../../../wailsjs/go/main/App';

interface SettingsPageProps {
  dbPath: string;
  totalApplications: number;
  onRefreshData: () => Promise<void>;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  theme: 'dark' | 'light';
  onSetTheme: (theme: 'dark' | 'light') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  dbPath,
  totalApplications,
  onRefreshData,
  onShowToast,
  theme,
  onSetTheme,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [isLoadingAutoStart, setIsLoadingAutoStart] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check auto-start status
    GetAutoStart()
      .then((val) => setAutoStartEnabled(val))
      .catch((err) => console.error('Failed to get auto-start status:', err));

    // Check notification permission if available
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleToggleAutoStart = async (enabled: boolean) => {
    setIsLoadingAutoStart(true);
    try {
      await SetAutoStart(enabled);
      setAutoStartEnabled(enabled);
      if (enabled) {
        onShowToast('success', 'Auto-Start Aktif', 'TrackPlan akan berjalan otomatis saat Windows menyala.');
      } else {
        onShowToast('info', 'Auto-Start Dinonaktifkan', 'TrackPlan tidak akan berjalan otomatis saat boot.');
      }
    } catch (err: any) {
      onShowToast('error', 'Gagal Mengubah Pengaturan Startup', err?.message || String(err));
    } finally {
      setIsLoadingAutoStart(false);
    }
  };

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      onShowToast('error', 'Tidak Didukung', 'Browser/Webview ini tidak mendukung Notifikasi Desktop.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('TrackPlan Desktop', {
          body: 'Notifikasi Windows berhasil diaktifkan!',
        });
        onShowToast('success', 'Izin Diberikan', 'Notifikasi desktop aktif.');
      } else {
        onShowToast('info', 'Izin Belum Diberikan', 'Status izin: ' + perm);
      }
    } catch (err: any) {
      onShowToast('error', 'Gagal Meminta Izin', err?.message || String(err));
    }
  };

  const handleTestNotification = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      handleRequestNotification();
      return;
    }

    new Notification('TrackPlan - Undangan Interview', {
      body: 'PT Shopee International mengundang Anda ke tahap wawancara teknis besok pukul 14:00 WIB.',
    });
    onShowToast('info', 'Notifikasi Terkirim', 'Silakan periksa Action Center / pojok kanan bawah layar.');
  };

  const handleBackupDB = async () => {
    setIsProcessing(true);
    try {
      const savedPath = await BackupDatabaseFile();
      if (savedPath) {
        onShowToast('success', 'Backup Tersimpan', savedPath);
      }
    } catch (err: any) {
      onShowToast('error', 'Backup Gagal', err?.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreDB = async () => {
    setIsProcessing(true);
    try {
      const restored = await RestoreDatabaseFile();
      if (restored) {
        await onRefreshData();
        onShowToast('success', 'Data Dipulihkan', 'Database berhasil dikembalikan dari file cadangan.');
      }
    } catch (err: any) {
      onShowToast('error', 'Restore Gagal', err?.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportJSON = async () => {
    setIsProcessing(true);
    try {
      const savedPath = await ExportApplicationsJSON();
      if (savedPath) {
        onShowToast('success', 'Berhasil Ekspor JSON', savedPath);
      }
    } catch (err: any) {
      onShowToast('error', 'Ekspor Gagal', err?.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = async () => {
    setIsProcessing(true);
    try {
      const savedPath = await ExportApplicationsCSV();
      if (savedPath) {
        onShowToast('success', 'Berhasil Ekspor CSV', savedPath);
      }
    } catch (err: any) {
      onShowToast('error', 'Ekspor Gagal', err?.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportJSON = async () => {
    setIsProcessing(true);
    try {
      const count = await ImportApplicationsFile();
      if (count > 0) {
        await onRefreshData();
        onShowToast('success', 'Impor Selesai', `Berhasil mengimpor ${count} data lamaran.`);
      }
    } catch (err: any) {
      onShowToast('error', 'Impor Gagal', err?.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">
      {/* Theme & Appearance Section */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-zinc-400" />
            Tampilan & Mode Warna
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pilih tema tampilan sesuai kenyamanan mata kamu (Dark Mode atau Light Mode).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => onSetTheme('dark')}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-zinc-900 border-white text-white font-bold shadow-sm'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-black border border-zinc-800 flex items-center justify-center text-amber-400">
              <Moon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold">Dark Mode</div>
              <div className="text-[11px] text-zinc-400 font-normal">Sleek Pitch Black</div>
            </div>
          </button>

          <button
            onClick={() => onSetTheme('light')}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-zinc-200 border-zinc-900 text-zinc-900 font-bold shadow-sm'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-zinc-300 flex items-center justify-center text-amber-500">
              <Sun className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold">Light Mode</div>
              <div className="text-[11px] text-zinc-400 font-normal">Clean High-Contrast White</div>
            </div>
          </button>
        </div>
      </div>

      {/* Windows Integration & Startup */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Power className="w-4 h-4 text-zinc-400" />
            Integrasi Windows & Auto-Start
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pengaturan auto-start saat komputer menyala dan notifikasi desktop native Windows.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {/* Auto-Start Switch */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5 max-w-md">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                Jalankan Otomatis saat Windows Boot (Auto-Start)
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                TrackPlan akan otomatis berjalan di latar belakang saat kamu menyalakan laptop/PC, siap memantau email lamaran.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoStartEnabled}
                disabled={isLoadingAutoStart}
                onChange={(e) => handleToggleAutoStart(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Desktop Notification Card */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-semibold text-white">Notifikasi Desktop Windows (Toast)</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    notificationPermission === 'granted'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {notificationPermission === 'granted' ? 'Diizinkan' : 'Belum Diizinkan'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Tampilkan pop-up notifikasi Windows di pojok kanan bawah saat ada undangan interview baru.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {notificationPermission !== 'granted' ? (
                <button
                  onClick={handleRequestNotification}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors cursor-pointer"
                >
                  Minta Izin Notifikasi
                </button>
              ) : (
                <button
                  onClick={handleTestNotification}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-colors cursor-pointer"
                >
                  Tes Notifikasi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-zinc-400" />
            Backup & Pemulihan Database
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cadangkan salinan file SQLite lokal ke flashdisk/drive atau pulihkan backup sebelumnya.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-xs text-white mb-1">Buat Backup Database (.db)</div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Simpan salinan utuh seluruh data lamaran, timeline, dan akun email kamu.
              </p>
            </div>
            <button
              onClick={handleBackupDB}
              disabled={isProcessing}
              className="mt-4 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan Backup ke File...</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-xs text-white mb-1">Pulihkan dari Backup (.db)</div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Gantikan database aktif dengan file backup sebelumnya.
              </p>
            </div>
            <button
              onClick={handleRestoreDB}
              disabled={isProcessing}
              className="mt-4 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pulihkan dari File...</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export & Import Section */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
            Ekspor & Impor Data
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ekspor data untuk Excel/Spreadsheet atau pindahkan data antar komputer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
                <span>Spreadsheet (CSV)</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Format tabel untuk Excel, Google Sheets, atau Numbers.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={isProcessing}
              className="mt-3 w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
            >
              Ekspor CSV
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                <span>Raw Data (JSON)</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Ekspor terstruktur lengkap beserta riwayat timeline.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              disabled={isProcessing}
              className="mt-3 w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
            >
              Ekspor JSON
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span>Impor JSON</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Muat dan gabungkan data dari file JSON cadangan.
              </p>
            </div>
            <button
              onClick={handleImportJSON}
              disabled={isProcessing}
              className="mt-3 w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
            >
              Impor File...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
