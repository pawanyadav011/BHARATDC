import React, { useState, useMemo } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  AlertCircle,
  Trash2,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataCenter } from '../context/DataContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationRead,
    isLoadingData,
    dataError,
    refetchData
  } = useDataCenter();
  const [readFilter, setReadFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'critical' | 'warning' | 'info'>('ALL');

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (readFilter === 'UNREAD' && n.read) return false;
      if (severityFilter !== 'ALL') {
        if (severityFilter === 'critical') return n.priority === 'critical';
        if (severityFilter === 'warning') return n.priority === 'warning';
        if (severityFilter === 'info') return n.priority === 'info';
      }
      return true;
    });
  }, [notifications, readFilter, severityFilter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const getIcon = (priority: string) => {
    switch (priority) {
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
        );
      case 'critical':
      case 'error':
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
        );
      case 'success':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Notifications</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            System alerts, maintenance notices, and server status updates
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] hover:bg-[#15243B] hover:text-white rounded-lg transition-colors shadow-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Dual Filter Controls (Req 19) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101C30] p-2.5 rounded-xl border border-[rgba(148,163,184,0.14)] text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setReadFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              readFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-[#15243B]'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setReadFilter('UNREAD')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              readFilter === 'UNREAD'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-[#15243B]'
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#94A3B8] mr-1 hidden sm:inline">Severity:</span>
          {(['ALL', 'critical', 'warning', 'info'] as const).map(sev => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-[#15243B] text-white border border-blue-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Data Error Notice */}
      {dataError && (
        <ErrorBanner message={dataError} onRetry={refetchData} />
      )}

      {/* List */}
      {isLoadingData && notifications.length === 0 ? (
        <LoadingSkeleton rows={6} type="table" />
      ) : filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg">
          <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">No Notifications Found</h3>
          <p className="text-xs text-[#94A3B8] mt-1">All system alerts and notifications are current.</p>
        </div>
      ) : (
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg divide-y divide-[rgba(148,163,184,0.08)] overflow-hidden">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                notification.read ? 'bg-[#101C30]' : 'bg-[#15243B]/60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {getIcon(notification.priority)}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-[#F8FAFC] text-xs sm:text-sm">{notification.title}</h4>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="font-mono text-[11px] text-[#64748B]">
                      {notification.timestamp}
                    </span>
                    {/* Resource link */}
                    <button
                      type="button"
                      onClick={() => {
                        if (notification.title.toLowerCase().includes('server')) {
                          navigate('/servers');
                        } else if (notification.title.toLowerCase().includes('rack')) {
                          navigate('/racks');
                        } else {
                          navigate('/datacenters');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>View Resource</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>

              {!notification.read && (
                <button
                  type="button"
                  onClick={() => markNotificationRead(notification.id)}
                  className="px-2.5 py-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20 shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
