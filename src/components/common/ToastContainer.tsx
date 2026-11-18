import React from 'react';
import { useToastStore } from '../../stores/toastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    error: 'border-rose-200 bg-rose-50/90 text-rose-900',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-900',
    info: 'border-sky-200 bg-sky-50/90 text-sky-900',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200',
            borders[t.type]
          )}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
          <div className="flex-1 text-sm font-medium leading-snug">{t.message}</div>
          <button
            onClick={() => removeToast(t.id)}
            className="flex-shrink-0 p-0.5 text-slate-400 hover:text-slate-600 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
