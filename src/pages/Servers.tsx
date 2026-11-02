import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Cpu,
  Wrench,
  Server as ServerIcon,
  CheckSquare,
  Square,
  Download,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { Server, ServerStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField } from '../components/common/FormField';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';

import { canPerformAction } from '../utils/rbac';

export const Servers: React.FC = () => {
  const {
    servers,
    dataCenters,
    racks,
    currentUser,
    addServer,
    updateServer,
    deleteServer,
    isLoadingData,
    dataError,
    refetchData
  } = useDataCenter();

  const canAdd = canPerformAction(currentUser?.role, 'servers', 'add');
  const canEdit = canPerformAction(currentUser?.role, 'servers', 'edit');
  const canDelete = canPerformAction(currentUser?.role, 'servers', 'delete');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search & filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL');

  // Bulk selection state (Req 16)
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);

  // Synchronize search query from global header search
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearch(q);
    }
  }, [searchParams]);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Server | null>(null);
  const [viewingServer, setViewingServer] = useState<Server | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    assetTag: '',
    hostname: '',
    serialNumber: '',
    dataCenterId: '',
    rackId: '',
    unitPosition: 'U01 - U02',
    model: 'Dell PowerEdge R750',
    cpu: '2x Intel Xeon Gold 6348 (56 Cores)',
    ramGb: 256,
    storageTb: 16,
    primaryIp: '10.14.20.50',
    status: 'Available' as ServerStatus,
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredServers = useMemo(() => {
    const q = (search || '').toLowerCase();
    return servers.filter(server => {
      const matchesSearch =
        (server.assetTag || '').toLowerCase().includes(q) ||
        (server.hostname || '').toLowerCase().includes(q) ||
        (server.primaryIp || '').toLowerCase().includes(q) ||
        (server.model || '').toLowerCase().includes(q) ||
        (server.clientName || '').toLowerCase().includes(q) ||
        (server.rackNumber || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || server.status === statusFilter;
      const matchesFacility = facilityFilter === 'ALL' || server.dataCenterId === facilityFilter;

      return matchesSearch && matchesStatus && matchesFacility;
    });
  }, [servers, search, statusFilter, facilityFilter]);

  // Bulk selection toggle
  const handleToggleSelectAll = () => {
    if (selectedServerIds.length === filteredServers.length) {
      setSelectedServerIds([]);
    } else {
      setSelectedServerIds(filteredServers.map(s => s.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedServerIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenAdd = () => {
    const defaultDc = dataCenters[0]?.id || '';
    const defaultRack = racks.find(r => r.dataCenterId === defaultDc)?.id || racks[0]?.id || '';
    setFormData({
      assetTag: `BDC-SRV-${113 + servers.length}`,
      hostname: `node-${113 + servers.length}.bharatdc.net`,
      serialNumber: `SN-HW-${Math.floor(10000 + Math.random() * 90000)}`,
      dataCenterId: defaultDc,
      rackId: defaultRack,
      unitPosition: 'U07 - U08',
      model: 'Dell PowerEdge R750',
      cpu: '2x Intel Xeon Gold 6348 (56 Cores)',
      ramGb: 256,
      storageTb: 16,
      primaryIp: `10.14.20.${50 + servers.length}`,
      status: 'Available',
      notes: 'New physical host verified for production deployment'
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (server: Server) => {
    setEditingServer(server);
    setFormData({
      assetTag: server.assetTag,
      hostname: server.hostname,
      serialNumber: server.serialNumber,
      dataCenterId: server.dataCenterId,
      rackId: server.rackId,
      unitPosition: server.unitPosition,
      model: server.model,
      cpu: server.cpu,
      ramGb: server.ramGb,
      storageTb: server.storageTb,
      primaryIp: server.primaryIp,
      status: server.status,
      notes: server.notes || ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.assetTag.trim()) errors.assetTag = 'Please enter an asset tag.';
    if (!formData.hostname.trim()) errors.hostname = 'Please enter a hostname.';
    if (!formData.primaryIp.trim()) errors.primaryIp = 'Please enter a primary IP address.';
    if (!formData.dataCenterId) errors.dataCenterId = 'Please select a data center.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dc = dataCenters.find(d => d.id === formData.dataCenterId);
    const rack = racks.find(r => r.id === formData.rackId);

    addServer({
      assetTag: formData.assetTag.trim().toUpperCase(),
      hostname: formData.hostname.trim().toLowerCase(),
      serialNumber: formData.serialNumber.trim(),
      dataCenterId: formData.dataCenterId,
      dataCenterName: dc ? dc.name : 'Unknown DC',
      rackId: formData.rackId,
      rackNumber: rack ? rack.rackNumber : 'RACK-01',
      unitPosition: formData.unitPosition,
      model: formData.model.trim(),
      cpu: formData.cpu.trim(),
      ramGb: Number(formData.ramGb),
      storageTb: Number(formData.storageTb),
      primaryIp: formData.primaryIp.trim(),
      status: formData.status,
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyExpiry: '2028-12-31',
      notes: formData.notes.trim()
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServer || !validateForm()) return;

    const dc = dataCenters.find(d => d.id === formData.dataCenterId);
    const rack = racks.find(r => r.id === formData.rackId);

    updateServer(editingServer.id, {
      assetTag: formData.assetTag.trim().toUpperCase(),
      hostname: formData.hostname.trim().toLowerCase(),
      serialNumber: formData.serialNumber.trim(),
      dataCenterId: formData.dataCenterId,
      dataCenterName: dc ? dc.name : editingServer.dataCenterName,
      rackId: formData.rackId,
      rackNumber: rack ? rack.rackNumber : editingServer.rackNumber,
      unitPosition: formData.unitPosition,
      model: formData.model.trim(),
      cpu: formData.cpu.trim(),
      ramGb: Number(formData.ramGb),
      storageTb: Number(formData.storageTb),
      primaryIp: formData.primaryIp.trim(),
      status: formData.status,
      notes: formData.notes.trim()
    });

    setEditingServer(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteServer(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const selectedRacks = racks.filter(
    r => !formData.dataCenterId || r.dataCenterId === formData.dataCenterId
  );

  return (
    <div className="space-y-4">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Servers</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            View and manage physical servers, hardware health, and client allocations
          </p>
        </div>
        {canAdd && (
          <button
            id="add-server-btn"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Server</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by asset tag, hostname, IP address, or model..."
        countText={`Showing ${filteredServers.length} of ${servers.length} servers`}
        showReset={search !== '' || statusFilter !== 'ALL' || facilityFilter !== 'ALL'}
        onResetFilters={() => {
          setSearch('');
          setStatusFilter('ALL');
          setFacilityFilter('ALL');
        }}
        filters={
          <>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Not Working">Not Working</option>
            </select>

            <select
              value={facilityFilter}
              onChange={e => setFacilityFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Facilities</option>
              {dataCenters.map(dc => (
                <option key={dc.id} value={dc.id}>
                  {dc.code} ({dc.city})
                </option>
              ))}
            </select>
          </>
        }
      />

      {/* Bulk Actions Bar (Req 16) */}
      {selectedServerIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#122038] border border-blue-500/30 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs text-[#F8FAFC]">
            <span className="font-semibold text-blue-400 font-mono">{selectedServerIds.length}</span>
            <span>servers selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const csvData = servers
                  .filter(s => selectedServerIds.includes(s.id))
                  .map(s => `${s.assetTag},${s.hostname},${s.primaryIp},${s.status}`)
                  .join('\n');
                const blob = new Blob([`AssetTag,Hostname,IP,Status\n${csvData}`], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bharatdc-servers-selected.csv`;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0A1424] hover:bg-[#15243B] border border-[rgba(148,163,184,0.2)] rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedServerIds([])}
              className="px-3 py-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Data Error Notice */}
      {dataError && (
        <ErrorBanner message={dataError} onRetry={refetchData} />
      )}

      {/* Main Content Table */}
      {isLoadingData && servers.length === 0 ? (
        <LoadingSkeleton rows={6} type="table" />
      ) : filteredServers.length === 0 ? (
        <EmptyState
          title="No servers found"
          description={
            search || statusFilter !== 'ALL' || facilityFilter !== 'ALL'
              ? 'No servers match your current filter criteria. Try resetting filters.'
              : 'There are currently no servers in inventory. Add your first server.'
          }
          secondaryActionText="Reset Filters"
          onSecondaryAction={() => {
            setSearch('');
            setStatusFilter('ALL');
            setFacilityFilter('ALL');
          }}
          actionText="Add Server"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-white"
                      title="Select all"
                    >
                      {selectedServerIds.length === filteredServers.length && filteredServers.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Server / Hostname</th>
                  <th className="px-4 py-3.5">Facility & Position</th>
                  <th className="px-4 py-3.5">Hardware Profile</th>
                  <th className="px-4 py-3.5">IP Address</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Client / Tenant</th>
                  <th className="px-4 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                {filteredServers.map(server => {
                  const isSelected = selectedServerIds.includes(server.id);
                  return (
                    <tr
                      key={server.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-blue-600/10' : 'hover:bg-[#15243B]/40'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(server.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                          <span>{server.assetTag}</span>
                        </div>
                        <div className="font-mono text-[11px] text-blue-400 mt-0.5">{server.hostname}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-[#F8FAFC] font-medium">{server.dataCenterName}</div>
                        <div className="text-[#64748B] text-[11px] font-mono mt-0.5">
                          {server.rackNumber} • <span className="text-slate-400">{server.unitPosition}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-200 font-medium">{server.model}</div>
                        <div className="text-[#94A3B8] text-[11px] font-mono mt-0.5">
                          {server.ramGb} GB RAM • {server.storageTb} TB NVMe
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] text-blue-400 bg-[#0A1424] px-2 py-1 rounded border border-[rgba(148,163,184,0.14)]">
                          {server.primaryIp}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={server.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        {server.clientName ? (
                          <span className="text-[#F8FAFC] font-medium flex items-center gap-1">
                            <span>{server.clientName}</span>
                          </span>
                        ) : (
                          <span className="text-[#64748B] italic text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Quick Allocate Action if Available */}
                          {server.status === 'Available' && (
                            <Link
                              to={`/server-allocation`}
                              className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded-lg transition-colors"
                              title="Allocate to Client"
                            >
                              <Cpu className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => setViewingServer(server)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#15243B] rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(server)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#15243B] rounded-lg transition-colors"
                              title="Edit Server"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(server)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Server"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Server Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Server Node"
        description="Register a new bare-metal physical host in inventory"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField id="asset-tag" label="Asset Tag" required error={formErrors.assetTag}>
              <input
                id="asset-tag"
                type="text"
                value={formData.assetTag}
                onChange={e => setFormData({ ...formData, assetTag: e.target.value })}
                placeholder="e.g. BDC-SRV-200"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 uppercase font-mono"
              />
            </FormField>

            <FormField id="hostname" label="Hostname / FQDN" required error={formErrors.hostname}>
              <input
                id="hostname"
                type="text"
                value={formData.hostname}
                onChange={e => setFormData({ ...formData, hostname: e.target.value })}
                placeholder="e.g. node-200.bharatdc.net"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="serial-number" label="Hardware Serial">
              <input
                id="serial-number"
                type="text"
                value={formData.serialNumber}
                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="e.g. SN-HW-98421"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="primary-ip" label="Primary IP" required error={formErrors.primaryIp}>
              <input
                id="primary-ip"
                type="text"
                value={formData.primaryIp}
                onChange={e => setFormData({ ...formData, primaryIp: e.target.value })}
                placeholder="e.g. 10.14.20.50"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField id="dc-select" label="Data Center" required error={formErrors.dataCenterId}>
              <select
                id="dc-select"
                value={formData.dataCenterId}
                onChange={e => setFormData({ ...formData, dataCenterId: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="">Select Facility</option>
                {dataCenters.map(dc => (
                  <option key={dc.id} value={dc.id}>
                    {dc.name} ({dc.code})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="rack-select" label="Rack Cabinet">
              <select
                id="rack-select"
                value={formData.rackId}
                onChange={e => setFormData({ ...formData, rackId: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="">Select Rack</option>
                {selectedRacks.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.rackNumber} ({r.room} - Row {r.row})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="unit-position" label="Rack Slot (U Position)">
              <input
                id="unit-position"
                type="text"
                value={formData.unitPosition}
                onChange={e => setFormData({ ...formData, unitPosition: e.target.value })}
                placeholder="e.g. U01 - U02"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField id="model" label="Chassis Model">
              <input
                id="model"
                type="text"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="ram" label="RAM (GB)">
              <input
                id="ram"
                type="number"
                value={formData.ramGb}
                onChange={e => setFormData({ ...formData, ramGb: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="storage" label="Storage (TB)">
              <input
                id="storage"
                type="number"
                value={formData.storageTb}
                onChange={e => setFormData({ ...formData, storageTb: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>
          </div>

          <FormField id="cpu" label="CPU Specifications">
            <input
              id="cpu"
              type="text"
              value={formData.cpu}
              onChange={e => setFormData({ ...formData, cpu: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <FormField id="server-status" label="Initial Status">
            <select
              id="server-status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as ServerStatus })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            >
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Not Working">Not Working</option>
            </select>
          </FormField>

          <FormField id="notes" label="Operator Notes">
            <textarea
              id="notes"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
              Create Server
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Server Modal */}
      <Modal
        isOpen={!!editingServer}
        onClose={() => setEditingServer(null)}
        title="Edit Server"
        description={`Update parameters for ${editingServer?.assetTag}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField id="edit-asset-tag" label="Asset Tag" required error={formErrors.assetTag}>
              <input
                id="edit-asset-tag"
                type="text"
                value={formData.assetTag}
                onChange={e => setFormData({ ...formData, assetTag: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 uppercase font-mono"
              />
            </FormField>

            <FormField id="edit-hostname" label="Hostname / FQDN" required error={formErrors.hostname}>
              <input
                id="edit-hostname"
                type="text"
                value={formData.hostname}
                onChange={e => setFormData({ ...formData, hostname: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="edit-serial-number" label="Hardware Serial">
              <input
                id="edit-serial-number"
                type="text"
                value={formData.serialNumber}
                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="edit-primary-ip" label="Primary IP" required error={formErrors.primaryIp}>
              <input
                id="edit-primary-ip"
                type="text"
                value={formData.primaryIp}
                onChange={e => setFormData({ ...formData, primaryIp: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField id="edit-dc-select" label="Data Center" required error={formErrors.dataCenterId}>
              <select
                id="edit-dc-select"
                value={formData.dataCenterId}
                onChange={e => setFormData({ ...formData, dataCenterId: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="">Select Facility</option>
                {dataCenters.map(dc => (
                  <option key={dc.id} value={dc.id}>
                    {dc.name} ({dc.code})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="edit-rack-select" label="Rack Cabinet">
              <select
                id="edit-rack-select"
                value={formData.rackId}
                onChange={e => setFormData({ ...formData, rackId: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="">Select Rack</option>
                {selectedRacks.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.rackNumber} ({r.room} - Row {r.row})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="edit-unit-position" label="Rack Slot (U Position)">
              <input
                id="edit-unit-position"
                type="text"
                value={formData.unitPosition}
                onChange={e => setFormData({ ...formData, unitPosition: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField id="edit-model" label="Chassis Model">
              <input
                id="edit-model"
                type="text"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-ram" label="RAM (GB)">
              <input
                id="edit-ram"
                type="number"
                value={formData.ramGb}
                onChange={e => setFormData({ ...formData, ramGb: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="edit-storage" label="Storage (TB)">
              <input
                id="edit-storage"
                type="number"
                value={formData.storageTb}
                onChange={e => setFormData({ ...formData, storageTb: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>
          </div>

          <FormField id="edit-cpu" label="CPU Specifications">
            <input
              id="edit-cpu"
              type="text"
              value={formData.cpu}
              onChange={e => setFormData({ ...formData, cpu: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <FormField id="edit-server-status" label="Operational Status">
            <select
              id="edit-server-status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as ServerStatus })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            >
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Not Working">Not Working</option>
            </select>
          </FormField>

          <FormField id="edit-notes" label="Operator Notes">
            <textarea
              id="edit-notes"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingServer(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg hover:bg-[#15243B] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* View Server Details Modal */}
      <Modal
        isOpen={!!viewingServer}
        onClose={() => setViewingServer(null)}
        title="Server Hardware Details"
        description="Physical server specifications, rack location, and assigned client"
        maxWidth="lg"
      >
        {viewingServer && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-[#0D1728] rounded-xl border border-[rgba(148,163,184,0.14)]">
              <div>
                <div className="font-bold text-sm text-[#F8FAFC] font-mono">{viewingServer.assetTag}</div>
                <div className="font-mono text-blue-400 text-xs mt-0.5">{viewingServer.hostname}</div>
              </div>
              <StatusBadge status={viewingServer.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#0D1728]/60 border border-[rgba(148,163,184,0.12)] rounded-xl">
                <span className="text-[#94A3B8] block text-[11px]">Location & Cabinet</span>
                <span className="font-semibold text-[#F8FAFC] block mt-0.5">{viewingServer.dataCenterName}</span>
                <span className="text-[#64748B] block text-[11px] font-mono mt-1">
                  {viewingServer.rackNumber} • Slot {viewingServer.unitPosition}
                </span>
              </div>

              <div className="p-3 bg-[#0D1728]/60 border border-[rgba(148,163,184,0.12)] rounded-xl">
                <span className="text-[#94A3B8] block text-[11px]">Network & Identification</span>
                <span className="font-mono font-semibold text-blue-400 block mt-0.5">{viewingServer.primaryIp}</span>
                <span className="text-[#64748B] block text-[11px] font-mono mt-1">Serial: {viewingServer.serialNumber}</span>
              </div>

              <div className="p-3 bg-[#0D1728]/60 border border-[rgba(148,163,184,0.12)] rounded-xl">
                <span className="text-[#94A3B8] block text-[11px]">Chassis Model & Compute</span>
                <span className="font-semibold text-[#F8FAFC] block mt-0.5">{viewingServer.model}</span>
                <span className="text-[#64748B] block text-[11px] font-mono mt-1">{viewingServer.cpu}</span>
              </div>

              <div className="p-3 bg-[#0D1728]/60 border border-[rgba(148,163,184,0.12)] rounded-xl">
                <span className="text-[#94A3B8] block text-[11px]">Memory & Storage Pool</span>
                <span className="font-semibold text-[#F8FAFC] block mt-0.5 font-mono">
                  {viewingServer.ramGb} GB ECC • {viewingServer.storageTb} TB NVMe
                </span>
                <span className="text-[#64748B] block text-[11px] font-mono mt-1">
                  Warranty until {viewingServer.warrantyExpiry}
                </span>
              </div>
            </div>

            <div className="p-3.5 border border-[rgba(148,163,184,0.12)] rounded-xl bg-[#0D1728]/80">
              <span className="text-[#94A3B8] block text-[11px]">Assigned Client / Tenant</span>
              <span className="font-semibold text-[#F8FAFC] text-sm block mt-0.5">
                {viewingServer.clientName || 'Currently unallocated (Available for assignment)'}
              </span>
            </div>

            {viewingServer.notes && (
              <div className="p-3.5 border border-[rgba(148,163,184,0.12)] rounded-xl bg-[#0D1728]/40">
                <span className="text-[#94A3B8] block text-[11px]">Operator Notes</span>
                <p className="text-slate-300 mt-1 leading-relaxed">{viewingServer.notes}</p>
              </div>
            )}

            <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setViewingServer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg hover:bg-[#15243B] hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Server Node?"
        message={`This will permanently remove ${deleteTarget?.assetTag} (${deleteTarget?.hostname}) from BHARATDC platform.`}
        confirmText="Delete Server"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
