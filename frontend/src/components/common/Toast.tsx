import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="pointer-events-auto flex items-start gap-2.5 p-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-2xl transition-all duration-200">
      <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold shrink-0 mt-0.5">
        {toast.type === 'error' ? (
          <AlertCircle className="w-3.5 h-3.5 text-black" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-xs text-white leading-tight">{toast.title}</div>
        {toast.message && (
          <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug break-words">
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-zinc-500 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
