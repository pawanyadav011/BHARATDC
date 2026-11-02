import React, { useState, useMemo } from 'react';
import {
  Plus,
  XCircle,
  Cpu,
  HardDrive,
  Building,
  Users,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { ServerAllocation } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField } from '../components/common/FormField';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';

import { canPerformAction } from '../utils/rbac';

export const ServerAllocationPage: React.FC = () => {
  const {
    allocations,
    servers,
    clients,
    currentUser,
    allocateServer,
    removeAssignment,
    isLoadingData,
    dataError,
    refetchData
  } = useDataCenter();

  const canAllocate = canPerformAction(currentUser?.role, 'server-allocation', 'allocate');
  const canDelete = canPerformAction(currentUser?.role, 'server-allocation', 'delete');

  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ServerAllocation | null>(null);

  // Workflow step state (Req 17)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  const availableServers = servers.filter(s => s.status === 'Available');

  const [formData, setFormData] = useState({
    serverId: availableServers[0]?.id || '',
    clientId: clients[0]?.id || '',
    purpose: 'Production Web Application Workload',
    bandwidthQuotaTb: 50,
    billingCycle: 'Monthly'
  });

  const [formError, setFormError] = useState('');

  const filteredAllocations = useMemo(() => {
    const q = (search || '').toLowerCase();
    return allocations.filter(alloc => {
      const matchesSearch =
        (alloc.clientName || '').toLowerCase().includes(q) ||
        (alloc.assetTag || '').toLowerCase().includes(q) ||
        (alloc.serverHostname || '').toLowerCase().includes(q) ||
        (alloc.purpose || '').toLowerCase().includes(q);

      const matchesClient = clientFilter === 'ALL' || alloc.clientId === clientFilter;

      return matchesSearch && matchesClient;
    });
  }, [allocations, search, clientFilter]);

  const selectedServer = useMemo(() => {
    return servers.find(s => s.id === formData.serverId) || availableServers[0];
  }, [servers, formData.serverId, availableServers]);

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === formData.clientId) || clients[0];
  }, [clients, formData.clientId]);

  const handleOpenAdd = () => {
    if (availableServers.length === 0) {
      setFormError('No available servers in inventory. Please add or free a server first.');
    } else {
      setFormError('');
    }
    setFormData({
      serverId: availableServers[0]?.id || '',
      clientId: clients[0]?.id || '',
      purpose: 'Core Enterprise API Service',
      bandwidthQuotaTb: 50,
      billingCycle: 'Monthly'
    });
    setWizardStep(1);
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serverId) {
      setFormError('Please select an available server.');
      return;
    }
    if (!formData.clientId) {
      setFormError('Please select a client.');
      return;
    }
    if (!formData.purpose.trim()) {
      setFormError('Please enter a workload purpose.');
      return;
    }

    const success = allocateServer({
      serverId: formData.serverId,
      clientId: formData.clientId,
      purpose: formData.purpose.trim(),
      bandwidthQuotaTb: Number(formData.bandwidthQuotaTb),
      billingCycle: formData.billingCycle
    });

    if (success) {
      setIsAddOpen(false);
    }
  };

  const handleConfirmRemove = () => {
    if (removeTarget) {
      removeAssignment(removeTarget.id);
      setRemoveTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Server Allocation</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Allocate bare-metal servers to clients with bandwidth and billing terms
          </p>
        </div>
        {canAllocate && (
          <button
            id="allocate-server-btn"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate Server</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by client, asset tag, hostname, or purpose..."
        countText={`Showing ${filteredAllocations.length} of ${allocations.length} active allocations`}
        showReset={search !== '' || clientFilter !== 'ALL'}
        onResetFilters={() => {
          setSearch('');
          setClientFilter('ALL');
        }}
        filters={
          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.organization})
              </option>
            ))}
          </select>
        }
      />

      {/* Data Error Notice */}
      {dataError && (
        <ErrorBanner message={dataError} onRetry={refetchData} />
      )}

      {/* Main Allocations Table */}
      {isLoadingData && allocations.length === 0 ? (
        <LoadingSkeleton rows={6} type="table" />
      ) : filteredAllocations.length === 0 ? (
        <EmptyState
          title="No allocations found"
          description="There are no active server assignments matching your criteria."
          secondaryActionText="Reset Filters"
          onSecondaryAction={() => {
            setSearch('');
            setClientFilter('ALL');
          }}
          actionText="Allocate Server"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Client & Organization</th>
                  <th className="px-4 py-3.5">Server Node</th>
                  <th className="px-4 py-3.5">Data Center</th>
                  <th className="px-4 py-3.5">Workload Purpose</th>
                  <th className="px-4 py-3.5">Bandwidth & SLA</th>
                  <th className="px-4 py-3.5">Assigned Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                {filteredAllocations.map(alloc => (
                  <tr key={alloc.id} className="hover:bg-[#15243B]/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#F8FAFC]">{alloc.clientName}</div>
                      <div className="text-[11px] text-[#94A3B8]">
                        {clients.find(c => c.id === alloc.clientId)?.organization || 'Institutional Tenant'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-blue-400 font-mono">{alloc.assetTag}</div>
                      <div className="text-[11px] text-[#64748B] font-mono">{alloc.serverHostname}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-[#F8FAFC]">
                      {alloc.dataCenterName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 max-w-xs truncate">
                      {alloc.purpose}
                    </td>
                    <td className="px-4 py-3.5 text-slate-200 font-mono font-medium">
                      {alloc.bandwidthQuotaTb} TB / month
                    </td>
                    <td className="px-4 py-3.5 text-[#64748B] font-mono">
                      {alloc.assignedDate}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={alloc.status} />
                    </td>
                    {canDelete && (
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(alloc)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
                          title="Remove Assignment"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Remove Assignment</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Allocation Modal with Multi-Step Wizard (Req 17) */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Server Allocation"
        description="Assign server to client and configure workload details"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
              {formError}
            </div>
          )}

          {/* Wizard Steps Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)] text-xs">
            <div
              onClick={() => setWizardStep(1)}
              className={`flex items-center gap-2 cursor-pointer ${
                wizardStep === 1 ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                wizardStep === 1 ? 'bg-blue-600 text-white' : 'bg-[#0A1424] border border-[rgba(148,163,184,0.2)]'
              }`}>1</span>
              <span>Select Client & Server</span>
            </div>

            <div className="w-8 h-[1px] bg-slate-700" />

            <div
              onClick={() => setWizardStep(2)}
              className={`flex items-center gap-2 cursor-pointer ${
                wizardStep === 2 ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                wizardStep === 2 ? 'bg-blue-600 text-white' : 'bg-[#0A1424] border border-[rgba(148,163,184,0.2)]'
              }`}>2</span>
              <span>Workload Details</span>
            </div>

            <div className="w-8 h-[1px] bg-slate-700" />

            <div
              onClick={() => setWizardStep(3)}
              className={`flex items-center gap-2 cursor-pointer ${
                wizardStep === 3 ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                wizardStep === 3 ? 'bg-blue-600 text-white' : 'bg-[#0A1424] border border-[rgba(148,163,184,0.2)]'
              }`}>3</span>
              <span>Review & Assign</span>
            </div>
          </div>

          {/* STEP 1: Select Client & Host Server */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <FormField id="alloc-client" label="Client Organization" required>
                <select
                  id="alloc-client"
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.organization} ({c.slaTier} Tier)
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                id="alloc-server"
                label="Select Available Bare-Metal Host"
                required
                helpText={
                  availableServers.length > 0
                    ? `${availableServers.length} available servers verified for deployment`
                    : 'No servers currently marked Available'
                }
              >
                <select
                  id="alloc-server"
                  value={formData.serverId}
                  onChange={e => setFormData({ ...formData, serverId: e.target.value })}
                  disabled={availableServers.length === 0}
                  className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
                >
                  {availableServers.length === 0 ? (
                    <option value="">No Available Servers in Inventory</option>
                  ) : (
                    availableServers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.assetTag} • {s.hostname} — {s.dataCenterName} ({s.model}, {s.ramGb}GB RAM)
                      </option>
                    ))
                  )}
                </select>
              </FormField>

              {/* Server Preview Card */}
              {selectedServer && (
                <div className="p-3.5 bg-[#0D1728] border border-[rgba(148,163,184,0.12)] rounded-xl font-mono text-xs">
                  <div className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-2 font-sans font-semibold">
                    Hardware Specifications Preview
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Chassis: </span>
                      <span className="text-slate-200">{selectedServer.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">IP: </span>
                      <span className="text-blue-400">{selectedServer.primaryIp}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Facility: </span>
                      <span className="text-slate-200">{selectedServer.dataCenterName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Specs: </span>
                      <span className="text-slate-200">{selectedServer.ramGb}GB / {selectedServer.storageTb}TB</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  disabled={availableServers.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
                >
                  <span>Continue to Workload Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Workload Purpose & SLA */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <FormField id="alloc-purpose" label="Workload Purpose / Service Function" required>
                <input
                  id="alloc-purpose"
                  type="text"
                  value={formData.purpose}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g. Core Database Primary Instance"
                  className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField id="alloc-bandwidth" label="Bandwidth Quota (TB / Mo)">
                  <input
                    id="alloc-bandwidth"
                    type="number"
                    value={formData.bandwidthQuotaTb}
                    onChange={e => setFormData({ ...formData, bandwidthQuotaTb: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
                  />
                </FormField>

                <FormField id="alloc-billing" label="Billing Cycle">
                  <select
                    id="alloc-billing"
                    value={formData.billingCycle}
                    onChange={e => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </FormField>
              </div>

              <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-between">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg hover:bg-[#15243B] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
                >
                  <span>Review Summary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Confirmation Summary */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0D1728] border border-blue-500/30 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(148,163,184,0.1)] font-sans">
                  <span className="font-semibold text-[#F8FAFC] text-sm">Allocation Verification</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    READY FOR BINDING
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Client:</span>
                    <span className="font-semibold text-white">{selectedClient?.name} ({selectedClient?.organization})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Server Asset:</span>
                    <span className="text-blue-400 font-bold">{selectedServer?.assetTag}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Data Center:</span>
                    <span>{selectedServer?.dataCenterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Purpose:</span>
                    <span className="text-slate-200">{formData.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Bandwidth Quota:</span>
                    <span>{formData.bandwidthQuotaTb} TB / Month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Billing Cadence:</span>
                    <span>{formData.billingCycle}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-between">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg hover:bg-[#15243B] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg hover:bg-[#15243B] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Allocate</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Confirmation Dialog for Remove Assignment */}
      <ConfirmDialog
        isOpen={!!removeTarget}
        title="Remove Assignment?"
        message={`This will unassign server ${removeTarget?.assetTag} from client "${removeTarget?.clientName}". The server status will be returned to Available.`}
        confirmText="Remove Assignment"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
};
