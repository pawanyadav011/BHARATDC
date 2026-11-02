import React from 'react';
import { ServerStatus } from '../../types';

interface StatusBadgeProps {
  status: ServerStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyles = (st: string) => {
    switch (st) {
      // Success / Active
      case 'Available':
      case 'Active':
      case 'Completed':
      case 'Ready':
      case 'Online':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
        };

      // In Use / Primary
      case 'In Use':
      case 'In Progress':
        return {
          bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
        };

      // Warning / Maintenance / Pending
      case 'Under Maintenance':
      case 'Maintenance':
      case 'Scheduled':
      case 'Pending':
      case 'Pending Termination':
      case 'Generating':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
        };

      // Danger / Offline / Cancelled
      case 'Not Working':
      case 'Offline':
      case 'Suspended':
      case 'Inactive':
      case 'Cancelled':
      case 'Full':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
          dot: 'bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
        };

      case 'Planned':
      default:
        return {
          bg: 'bg-slate-700/30 text-slate-300 border-slate-700/50',
          dot: 'bg-slate-400'
        };
    }
  };

  const { bg, dot } = getStyles(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap tracking-wide ${bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
      {status}
    </span>
  );
};
