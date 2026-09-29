import React, { useState, useEffect } from 'react';
import { backend } from '../../../wailsjs/go/models';
import { TestEmailConnection } from '../../../wailsjs/go/main/App';
import {
  X,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Server,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EmailAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (req: backend.EmailAccountRequest) => Promise<void>;
  editAccount?: backend.EmailAccount | null;
}

export const EmailAccountModal: React.FC<EmailAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editAccount,
}) => {
  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState<string>('GMAIL');
  const [email, setEmail] = useState('');
  const [imapHost, setImapHost] = useState('imap.gmail.com');
  const [imapPort, setImapPort] = useState(993);
  const [appPassword, setAppPassword] = useState('');
  const [useSSL, setUseSSL] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editAccount) {
      setLabel(editAccount.label || '');
      setProvider(editAccount.provider || 'GMAIL');
      setEmail(editAccount.email || '');
      setImapHost(editAccount.imap_host || 'imap.gmail.com');
      setImapPort(editAccount.imap_port || 993);
      setAppPassword(editAccount.app_password || '');
      setUseSSL(editAccount.use_ssl !== false);
      setIsActive(editAccount.is_active !== false);
    } else {
      setLabel('');
      setProvider('GMAIL');
      setEmail('');
      setImapHost('imap.gmail.com');
      setImapPort(993);
      setAppPassword('');
      setUseSSL(true);
      setIsActive(true);
    }
    setTestResult(null);
    setErrorMsg('');
  }, [editAccount, isOpen]);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    if (p === 'GMAIL') {
      setImapHost('imap.gmail.com');
      setImapPort(993);
      setUseSSL(true);
      if (!label || label.includes('Outlook') || label.includes('Yahoo')) {
        setLabel('Gmail Account');
      }
    } else if (p === 'OUTLOOK') {
      setImapHost('outlook.office365.com');
      setImapPort(993);
      setUseSSL(true);
      if (!label || label.includes('Gmail') || label.includes('Yahoo')) {
        setLabel('Outlook Account');
      }
    } else if (p === 'YAHOO') {
      setImapHost('imap.mail.yahoo.com');
      setImapPort(993);
      setUseSSL(true);
      if (!label || label.includes('Gmail') || label.includes('Outlook')) {
        setLabel('Yahoo Mail');
      }
    }
  };

  const handleTestConnection = async () => {
    if (!email.trim() || !appPassword.trim()) {
      setErrorMsg('Harap isi alamat email dan App Password terlebih dahulu');
      return;
    }
    setErrorMsg('');
    setIsTesting(true);
    setTestResult(null);

    try {
      const req = new backend.EmailAccountRequest({
        id: editAccount?.id || 0,
        label: label.trim() || email.trim(),
        provider,
        email: email.trim(),
        imap_host: imapHost.trim(),
        imap_port: Number(imapPort) || 993,
        app_password: appPassword.trim(),
        use_ssl: useSSL,
        is_active: isActive,
      });

      const res = await TestEmailConnection(req);
      setTestResult({ success: true, message: res || 'Koneksi ke mailbox berhasil diverifikasi!' });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || String(err) || 'Gagal terhubung ke server IMAP',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Alamat email wajib diisi');
      return;
    }
    if (!appPassword.trim()) {
      setErrorMsg('App Password wajib diisi');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      const req = new backend.EmailAccountRequest({
        id: editAccount?.id || 0,
        label: label.trim() || email.trim(),
        provider,
        email: email.trim(),
        imap_host: imapHost.trim(),
        imap_port: Number(imapPort) || 993,
        app_password: appPassword.trim(),
        use_ssl: useSSL,
        is_active: isActive,
      });

      await onSave(req);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || String(err) || 'Gagal menyimpan akun email');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editAccount ? 'Edit Akun Email' : 'Tambah Akun Email (Multi-Mailbox)'}
              </h2>
              <p className="text-xs text-zinc-400">
                Hubungkan mailbox via IMAP untuk membaca notifikasi Glassdoor & platform kerja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Provider Selection */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Penyedia Email (Provider)</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'GMAIL', label: 'Gmail' },
                { id: 'OUTLOOK', label: 'Outlook' },
                { id: 'YAHOO', label: 'Yahoo' },
                { id: 'CUSTOM', label: 'Custom IMAP' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderChange(p.id)}
                  className={`py-2 px-3 rounded-xl font-medium text-center border transition-all cursor-pointer ${
                    provider === p.id
                      ? 'bg-white text-black border-white font-bold shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account Label & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Label Akun</label>
              <input
                type="text"
                placeholder="misal: Email Utama, Yahoo Karir"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Alamat Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="nama@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white font-mono"
              />
            </div>
          </div>

          {/* App Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-300">
                App Password (Bukan Password Utama) <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 underline underline-offset-2"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Cara dapatkan App Password</span>
                {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="misal: abcd efgh ijkl mnop (16 karakter)"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-3 pr-10 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* App Password Guide Card */}
          {showGuide && (
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 space-y-2 text-[11px] text-zinc-300 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Kenapa harus App Password?</span>
              </div>
              <p className="text-zinc-400">
                TrackPlan berjalan 100% lokal. Google/Yahoo/Microsoft mewajibkan <em>App Password</em> (password khusus 16 huruf) untuk aplikasi pihak ketiga agar password utama akun Anda tetap aman & rahasia.
              </p>
              <div className="space-y-1 pt-1 border-t border-zinc-800/80">
                <p className="font-semibold text-white">Langkah untuk Gmail:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-zinc-400">
                  <li>Buka akun Google Anda di <code>myaccount.google.com/security</code></li>
                  <li>Pastikan <strong>2-Step Verification (2FA)</strong> sudah aktif</li>
                  <li>Cari menu <strong>App passwords</strong> (Sandi Aplikasi)</li>
                  <li>Beri nama aplikasi: <code>TrackPlan</code> lalu klik Buat</li>
                  <li>Salin 16 huruf sandi yang muncul ke kotak di atas. Selesai!</li>
                </ol>
              </div>
            </div>
          )}

          {/* IMAP Server Details (Configurable) */}
          <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-zinc-400" />
                Pengaturan IMAP Server
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={useSSL}
                  onChange={(e) => setUseSSL(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0"
                />
                <span>Gunakan SSL/TLS</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="imap.gmail.com"
                  value={imapHost}
                  onChange={(e) => setImapHost(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-white text-xs"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="993"
                  value={imapPort}
                  onChange={(e) => setImapPort(parseInt(e.target.value) || 993)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Test Connection Button & Result Feedback */}
          <div className="pt-1">
            <button
              type="button"
              disabled={isTesting || !email || !appPassword}
              onClick={handleTestConnection}
              className="w-full py-2 px-3 rounded-xl border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-zinc-200 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memverifikasi koneksi IMAP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tes Koneksi Mailbox</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`mt-2 flex items-start gap-2 p-3 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                    : 'bg-red-950/30 border-red-800 text-red-400'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0"
              />
              <span>Aktifkan Sinkronisasi Akun Ini</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editAccount ? 'Perbarui Akun' : 'Simpan Akun'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
