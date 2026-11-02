import React, { useState, useMemo } from 'react';
import {
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Wrench,
  Calendar,
  AlertCircle,
  Clock,
  ShieldAlert,
  HardHat
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { MaintenanceRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField } from '../components/common/FormField';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';

import { canPerformAction } from '../utils/rbac';

export const MaintenancePage: React.FC = () => {
  const {
    maintenance,
    dataCenters,
    servers,
    currentUser,
    addMaintenance,
    startMaintenance,
    completeMaintenance,
    cancelMaintenance,
    isLoadingData,
    dataError,
    refetchData
  } = useDataCenter();

  const canAdd = canPerformAction(currentUser?.role, 'maintenance', 'add');
  const canUpdate = canPerformAction(currentUser?.role, 'maintenance', 'edit');
  const canCancel = canPerformAction(currentUser?.role, 'maintenance', 'delete');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<MaintenanceRecord | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    dataCenterName: dataCenters[0]?.name || '',
    serverId: '',
    type: 'Preventive' as MaintenanceRecord['type'],
    priority: 'Medium' as MaintenanceRecord['priority'],
    scheduledDate: '2026-09-25 10:00 IST',
    technician: 'Amit Pathak',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredMaintenance = useMemo(() => {
    const q = (search || '').toLowerCase();
    return maintenance.filter(item => {
      const matchesSearch =
        (item.title || '').toLowerCase().includes(q) ||
        (item.ticketNumber || '').toLowerCase().includes(q) ||
        (item.technician || '').toLowerCase().includes(q) ||
        (item.dataCenterName || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [maintenance, search, statusFilter, priorityFilter]);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      dataCenterName: dataCenters[0]?.name || '',
      serverId: '',
      type: 'Preventive',
      priority: 'Medium',
      scheduledDate: new Date().toISOString().slice(0, 10),
      technician: currentUser?.fullName || currentUser?.name || 'Technician',
      notes: ''
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Please enter a maintenance title.';
    if (!formData.technician.trim()) errors.technician = 'Please enter a technician name.';
    if (!formData.scheduledDate.trim()) errors.scheduledDate = 'Please enter a scheduled date and time.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedServer = servers.find(s => s.id === formData.serverId);

    addMaintenance({
      title: formData.title.trim(),
      dataCenterName: formData.dataCenterName,
      serverId: formData.serverId || undefined,
      serverHostname: selectedServer ? selectedServer.hostname : undefined,
      rackNumber: selectedServer ? selectedServer.rackNumber : undefined,
      type: formData.type,
      priority: formData.priority,
      scheduledDate: formData.scheduledDate.trim(),
      technician: formData.technician.trim(),
      notes: formData.notes.trim()
    });

    setIsAddOpen(false);
  };

  const handleConfirmCancel = () => {
    if (cancelTarget) {
      cancelMaintenance(cancelTarget.id);
      setCancelTarget(null);
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0A1424] text-slate-400 border border-[rgba(148,163,184,0.2)]">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Maintenance</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Routine servicing, hardware repairs, and technician work orders
          </p>
        </div>
        {canAdd && (
          <button
            id="schedule-maint-btn"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Maintenance</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ticket ID, work order title, or technician..."
        countText={`Showing ${filteredMaintenance.length} of ${maintenance.length} work orders`}
        showReset={search !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL'}
        onResetFilters={() => {
          setSearch('');
          setStatusFilter('ALL');
          setPriorityFilter('ALL');
        }}
        filters={
          <>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </>
        }
      />

      {/* Data Error Notice */}
      {dataError && (
        <ErrorBanner message={dataError} onRetry={refetchData} />
      )}

      {/* Maintenance Table (Req 18) */}
      {isLoadingData && maintenance.length === 0 ? (
        <LoadingSkeleton rows={6} type="table" />
      ) : filteredMaintenance.length === 0 ? (
        <EmptyState
          title="No maintenance records found"
          description="No work orders match the selected criteria."
          secondaryActionText="Reset Filters"
          onSecondaryAction={() => {
            setSearch('');
            setStatusFilter('ALL');
            setPriorityFilter('ALL');
          }}
          actionText="Schedule Maintenance"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Ticket & Task</th>
                  <th className="px-4 py-3.5">Target Location</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Scheduled Window</th>
                  <th className="px-4 py-3.5">Lead Technician</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                {filteredMaintenance.map(task => (
                  <tr key={task.id} className="hover:bg-[#15243B]/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-blue-400 font-mono text-xs">{task.ticketNumber}</div>
                      <div className="text-[#F8FAFC] font-medium text-xs mt-0.5">{task.title}</div>
                      {task.serverHostname && (
                        <div className="font-mono text-[11px] text-[#94A3B8] mt-0.5">
                          Host: {task.serverHostname} ({task.rackNumber})
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-200 font-medium">
                      {task.dataCenterName}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#0A1424] text-slate-300 border border-[rgba(148,163,184,0.18)]">
                        {task.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {renderPriorityBadge(task.priority)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {task.scheduledDate}
                    </td>
                    <td className="px-4 py-3.5 text-[#F8FAFC] font-medium">
                      {task.technician}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={task.status} />
                    </td>
                    {(canUpdate || canCancel) && (
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Status Progression: Scheduled -> In Progress -> Completed */}
                          {canUpdate && task.status === 'Scheduled' && (
                            <button
                              type="button"
                              onClick={() => startMaintenance(task.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Start Task</span>
                            </button>
                          )}

                          {canUpdate && task.status === 'In Progress' && (
                            <button
                              type="button"
                              onClick={() => completeMaintenance(task.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          )}

                          {canCancel && task.status !== 'Completed' && task.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => setCancelTarget(task)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Cancel Ticket"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Maintenance Work Order"
        description="Create an authorized operational work order for facility staff"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <FormField id="maint-title" label="Maintenance Title / Objective" required error={formErrors.title}>
            <input
              id="maint-title"
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Memory diagnostic and DIMM replacement"
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="maint-facility" label="Facility Location">
              <select
                id="maint-facility"
                value={formData.dataCenterName}
                onChange={e => setFormData({ ...formData, dataCenterName: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                {dataCenters.map(dc => (
                  <option key={dc.id} value={dc.name}>
                    {dc.name} ({dc.code})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="maint-server" label="Target Server (Optional)">
              <select
                id="maint-server"
                value={formData.serverId}
                onChange={e => setFormData({ ...formData, serverId: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              >
                <option value="">Whole Facility / Infrastructure</option>
                {servers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.assetTag} ({s.hostname} - {s.rackNumber})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="maint-type" label="Maintenance Classification">
              <select
                id="maint-type"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as MaintenanceRecord['type'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Preventive">Preventive</option>
                <option value="Corrective">Corrective</option>
                <option value="Firmware Upgrade">Firmware Upgrade</option>
                <option value="Emergency">Emergency</option>
              </select>
            </FormField>

            <FormField id="maint-priority" label="Priority Urgency">
              <select
                id="maint-priority"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as MaintenanceRecord['priority'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </FormField>

            <FormField id="maint-date" label="Scheduled Window" required error={formErrors.scheduledDate}>
              <input
                id="maint-date"
                type="text"
                value={formData.scheduledDate}
                onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                placeholder="2026-09-26 14:00 IST"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="maint-tech" label="Assigned Lead Technician" required error={formErrors.technician}>
              <input
                id="maint-tech"
                type="text"
                value={formData.technician}
                onChange={e => setFormData({ ...formData, technician: e.target.value })}
                placeholder="e.g. Rajesh Verma"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>
          </div>

          <FormField id="maint-notes" label="Work Order Briefing / SOP Instructions">
            <textarea
              id="maint-notes"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Isolate secondary PSU before opening chassis cover"
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg hover:bg-[#15243B] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              Issue Work Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        title="Cancel Maintenance Work Order?"
        message={`Are you sure you want to cancel ticket ${cancelTarget?.ticketNumber}? The status will be marked as Cancelled.`}
        confirmText="Cancel Work Order"
        cancelText="Keep Active"
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};
