import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-dialog-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07111F]/80 backdrop-blur-md"
    >
      <div
        id="confirm-dialog-card"
        className="w-full max-w-md bg-[#101C30] rounded-xl border border-[rgba(148,163,184,0.18)] shadow-2xl p-6"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isDestructive ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-[#F8FAFC]">{title}</h4>
            <p className="mt-2 text-sm text-[#94A3B8] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[rgba(148,163,184,0.12)]">
          <button
            id="confirm-dialog-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg hover:bg-[#15243B] hover:text-white transition-colors"
          >
            {cancelText}
          </button>
          <button
            id="confirm-dialog-action-btn"
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 focus:ring-2 focus:ring-rose-500 shadow-sm'
                : 'bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 shadow-sm'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
