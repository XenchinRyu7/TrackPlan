import React, { useState } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  HardDrive,
} from 'lucide-react';
import {
  BackupDatabaseFile,
  RestoreDatabaseFile,
  ExportApplicationsJSON,
  ExportApplicationsCSV,
  ImportApplicationsFile,
} from '../../../wailsjs/go/main/App';

interface SettingsPageProps {
  dbPath: string;
  totalApplications: number;
  onRefreshData: () => Promise<void>;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onRefreshData,
  onShowToast,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBackupDB = async () => {
    setIsProcessing(true);
    try {
      const savedPath = await BackupDatabaseFile();
      if (savedPath) {
        onShowToast('success', 'Backup Saved', savedPath);
      }
    } catch (err: any) {
      onShowToast('error', 'Backup Failed', err?.message || String(err));
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
        onShowToast('success', 'Data Restored', 'Your data was restored successfully.');
      }
    } catch (err: any) {
      onShowToast('error', 'Restore Failed', err?.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportJSON = async () => {
    setIsProcessing(true);
    try {
      const savedPath = await ExportApplicationsJSON();
      if (savedPath) {
        onShowToast('success', 'Exported JSON', savedPath);
      }
    } catch (err: any) {
      onShowToast('error', 'Export Failed', err?.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = async () => {
    setIsProcessing(true);
    try {
      const savedPath = await ExportApplicationsCSV();
      if (savedPath) {
        onShowToast('success', 'Exported CSV', savedPath);
      }
    } catch (err: any) {
      onShowToast('error', 'Export Failed', err?.message || String(err));
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
        onShowToast('success', 'Data Imported', `Imported ${count} application records.`);
      }
    } catch (err: any) {
      onShowToast('error', 'Import Failed', err?.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Backup & Restore Section */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white">Backup & Restore</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create backup archives of your application records or restore previous backups.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-xs text-white mb-1">Create Backup</div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Save an exact copy of all your applications, interview schedules, and notes.
              </p>
            </div>
            <button
              onClick={handleBackupDB}
              disabled={isProcessing}
              className="mt-4 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup to File...</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-xs text-white mb-1">Restore Backup</div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Recover your applications and timeline from a saved backup file.
              </p>
            </div>
            <button
              onClick={handleRestoreDB}
              disabled={isProcessing}
              className="mt-4 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restore from File...</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export & Import Section */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white">Import & Export</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Export data for spreadsheets or transfer data across devices.
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
                Export applications for Excel, Numbers, or Google Sheets.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={isProcessing}
              className="mt-3 w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
            >
              Export CSV
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                <span>Raw Data (JSON)</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Complete structured export including timeline history.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              disabled={isProcessing}
              className="mt-3 w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
            >
              Export JSON
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span>Import JSON</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Load and merge records from an exported JSON file.
              </p>
            </div>
            <button
              onClick={handleImportJSON}
              disabled={isProcessing}
              className="mt-3 w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
            >
              Import File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
