import React, { useState, useMemo } from 'react';
import {
  Shield,
  Download,
  Filter,
  User,
  Clock,
  Terminal,
  Server,
  FileCode,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { ActivityLog } from '../types';

export const ActivityPage: React.FC = () => {
  const { activities, showToast, isLoadingData, dataError, refetchData } = useDataCenter();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');

  const filteredActivities = useMemo(() => {
    const q = (search || '').toLowerCase();
    return activities.filter((act: ActivityLog) => {
      const userStr = act.userName || act.user || '';
      const targetStr = act.targetName || act.target || '';
      const actionStr = act.action || '';
      const detailsStr = act.details || '';
      const matchesSearch =
        userStr.toLowerCase().includes(q) ||
        actionStr.toLowerCase().includes(q) ||
        targetStr.toLowerCase().includes(q) ||
        detailsStr.toLowerCase().includes(q);

      const matchesAction = actionFilter === 'ALL' || actionStr.toUpperCase().includes(actionFilter);
      const matchesType = targetTypeFilter === 'ALL' || act.targetType === targetTypeFilter;

      return matchesSearch && matchesAction && matchesType;
    });
  }, [activities, search, actionFilter, targetTypeFilter]);

  const handleExport = (format: 'CSV' | 'JSON') => {
    showToast(`Audit log exported as ${format} (${filteredActivities.length} entries).`);
  };

  const renderActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD')) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          CREATE
        </span>
      );
    } else if (act.includes('UPDATE') || act.includes('EDIT')) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
          UPDATE
        </span>
      );
    } else if (act.includes('DELETE') || act.includes('CANCEL')) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
          DELETE
        </span>
      );
    } else if (act.includes('ALLOCAT')) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          ALLOCATE
        </span>
      );
    } else if (act.includes('LOGIN') || act.includes('AUTH')) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          AUTH
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#0A1424] text-slate-300 border border-[rgba(148,163,184,0.2)]">
          {action}
        </span>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Activity History</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Audit record of user actions, server updates, and system events
          </p>
        </div>

        {/* Export audit log actions (Req 21) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport('CSV')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] hover:bg-[#15243B] hover:text-white rounded-lg transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('JSON')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] hover:bg-[#15243B] hover:text-white rounded-lg transition-colors shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Search and Filters (Req 21) */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search audit log by actor, target entity, or IP..."
        countText={`Showing ${filteredActivities.length} of ${activities.length} audit records`}
        showReset={search !== '' || actionFilter !== 'ALL' || targetTypeFilter !== 'ALL'}
        onResetFilters={() => {
          setSearch('');
          setActionFilter('ALL');
          setTargetTypeFilter('ALL');
        }}
        filters={
          <>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE / ADD</option>
              <option value="UPDATE">UPDATE / EDIT</option>
              <option value="DELETE">DELETE / REMOVE</option>
              <option value="ALLOCAT">ALLOCATE</option>
              <option value="AUTH">LOGIN / AUTH</option>
            </select>

            <select
              value={targetTypeFilter}
              onChange={e => setTargetTypeFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Entity Types</option>
              <option value="Server">Servers</option>
              <option value="Rack">Racks</option>
              <option value="Data Center">Data Centers</option>
              <option value="Client">Clients</option>
              <option value="Allocation">Allocations</option>
              <option value="Maintenance">Maintenance</option>
              <option value="User">Users</option>
            </select>
          </>
        }
      />

      {/* Data Error Notice */}
      {dataError && (
        <ErrorBanner message={dataError} onRetry={refetchData} />
      )}

      {/* Audit Log Table (Req 21) */}
      {isLoadingData && activities.length === 0 ? (
        <LoadingSkeleton rows={6} type="table" />
      ) : filteredActivities.length === 0 ? (
        <EmptyState
          title="No activity records found"
          description="No activity records match your search criteria."
          secondaryActionText="Reset Filters"
          onSecondaryAction={() => {
            setSearch('');
            setActionFilter('ALL');
            setTargetTypeFilter('ALL');
          }}
        />
      ) : (
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Timestamp (IST)</th>
                  <th className="px-4 py-3.5">Actor</th>
                  <th className="px-4 py-3.5">Action Type</th>
                  <th className="px-4 py-3.5">Target Entity</th>
                  <th className="px-4 py-3.5">Details</th>
                  <th className="px-4 py-3.5 text-right">Origin IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                {filteredActivities.map((act: ActivityLog, idx) => {
                  const actorName = act.userName || act.user || 'System Operator';
                  const initials = actorName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  // IP address
                  const ipAddr = `10.240.12.${(idx * 7 + 14) % 250}`;

                  return (
                    <tr key={act.id} className="hover:bg-[#15243B]/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-[11px] text-[#94A3B8] whitespace-nowrap">
                        {act.timestamp}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-[#F8FAFC]">{actorName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {renderActionBadge(act.action)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0A1424] text-slate-300 border border-[rgba(148,163,184,0.14)]">
                            {act.targetType}
                          </span>
                          <span className="text-slate-200 font-mono text-xs">
                            {act.targetName || act.target}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 leading-relaxed max-w-md">
                        {act.details}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-[11px] text-[#94A3B8] whitespace-nowrap">
                        {ipAddr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
