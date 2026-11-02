import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useDataCenter } from '../../context/DataContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useDataCenter();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
          info: <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        };

        const bg = {
          success: 'bg-[#101C30] border-emerald-500/30 text-[#F8FAFC]',
          info: 'bg-[#101C30] border-blue-500/30 text-[#F8FAFC]',
          error: 'bg-[#101C30] border-rose-500/30 text-[#F8FAFC]'
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl border shadow-xl ${bg} backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200`}
          >
            {icons[toast.type]}
            <p className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
