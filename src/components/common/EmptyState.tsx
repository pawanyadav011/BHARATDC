import React from 'react';
import { Search, RotateCcw, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Search,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) => {
  return (
    <div
      id="empty-state-container"
      className="flex flex-col items-center justify-center p-12 text-center bg-[#101C30]/50 rounded-xl border border-dashed border-[rgba(148,163,184,0.18)] my-4"
    >
      <div className="p-3.5 bg-[#15243B] border border-[rgba(148,163,184,0.14)] rounded-xl text-blue-400 mb-3.5 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-[#F8FAFC]">{title}</h4>
      <p className="mt-1.5 text-xs text-[#94A3B8] max-w-sm leading-relaxed">{description}</p>
      
      <div className="mt-5 flex items-center gap-3">
        {secondaryActionText && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] hover:bg-[#15243B] hover:text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {secondaryActionText}
          </button>
        )}
        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};
