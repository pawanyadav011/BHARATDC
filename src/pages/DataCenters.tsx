import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  MapPin,
  Zap,
  Server,
  Phone,
  User,
  LayoutGrid,
  List,
  Thermometer,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { DataCenter } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField } from '../components/common/FormField';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';

import { canPerformAction } from '../utils/rbac';

export const DataCentersPage: React.FC = () => {
  const {
    dataCenters,
    currentUser,
    addDataCenter,
    updateDataCenter,
    deleteDataCenter,
    isLoadingData,
    dataError,
    refetchData
  } = useDataCenter();

  const canAdd = canPerformAction(currentUser?.role, 'data-centers', 'add');
  const canEdit = canPerformAction(currentUser?.role, 'data-centers', 'edit');
  const canDelete = canPerformAction(currentUser?.role, 'data-centers', 'delete');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDc, setEditingDc] = useState<DataCenter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DataCenter | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    state: '',
    country: 'India',
    address: '',
    totalRacks: 30,
    totalServers: 240,
    activeServers: 150,
    powerCapacityKw: 1500,
    status: 'Active' as DataCenter['status'],
    manager: 'Facility Director',
    contactPhone: '+91 22 4000 1100'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredDataCenters = useMemo(() => {
    const q = (search || '').toLowerCase();
    return dataCenters.filter(dc => {
      const matchesSearch =
        (dc.name || '').toLowerCase().includes(q) ||
        (dc.code || '').toLowerCase().includes(q) ||
        (dc.city || '').toLowerCase().includes(q) ||
        (dc.state || '').toLowerCase().includes(q) ||
        (dc.manager || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || dc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dataCenters, search, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      city: '',
      state: '',
      country: 'India',
      address: '',
      totalRacks: 30,
      totalServers: 240,
      activeServers: 0,
      powerCapacityKw: 1500,
      status: 'Active',
      manager: '',
      contactPhone: ''
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (dc: DataCenter) => {
    setEditingDc(dc);
    setFormData({
      name: dc.name,
      code: dc.code,
      city: dc.city,
      state: dc.state,
      country: dc.country,
      address: dc.address,
      totalRacks: dc.totalRacks,
      totalServers: dc.totalServers,
      activeServers: dc.activeServers,
      powerCapacityKw: dc.powerCapacityKw,
      status: dc.status,
      manager: dc.manager,
      contactPhone: dc.contactPhone
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Please enter a data center name.';
    if (!formData.code.trim()) errors.code = 'Please enter a unique code.';
    if (!formData.city.trim()) errors.city = 'Please enter city.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    addDataCenter({
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      address: formData.address.trim(),
      totalRacks: Number(formData.totalRacks),
      totalServers: Number(formData.totalServers),
      activeServers: Number(formData.activeServers),
      powerCapacityKw: Number(formData.powerCapacityKw),
      status: formData.status,
      manager: formData.manager.trim(),
      contactPhone: formData.contactPhone.trim()
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDc || !validateForm()) return;

    updateDataCenter(editingDc.id, {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      address: formData.address.trim(),
      totalRacks: Number(formData.totalRacks),
      totalServers: Number(formData.totalServers),
      activeServers: Number(formData.activeServers),
      powerCapacityKw: Number(formData.powerCapacityKw),
      status: formData.status,
      manager: formData.manager.trim(),
      contactPhone: formData.contactPhone.trim()
    });

    setEditingDc(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteDataCenter(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Data Centers</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Supervise enterprise campus facilities, rack density, grid power, and on-site facility managers
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Card / List View Switcher (Req 14) */}
          <div className="flex items-center p-1 bg-[#101C30] border border-[rgba(148,163,184,0.18)] rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {canAdd && (
            <button
              id="add-datacenter-btn"
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Data Center</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by facility name, code, city, or manager..."
        countText={`Showing ${filteredDataCenters.length} of ${dataCenters.length} facilities`}
        showReset={search !== '' || statusFilter !== 'ALL'}
        onResetFilters={() => {
          setSearch('');
          setStatusFilter('ALL');
        }}
        filters={
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planned">Planned</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        }
      />

      {/* Data Error Notice */}
      {dataError && (
        <ErrorBanner message={dataError} onRetry={refetchData} />
      )}

      {/* Content Rendering: Card View vs Table View */}
      {isLoadingData && dataCenters.length === 0 ? (
        <LoadingSkeleton rows={6} type={viewMode} />
      ) : filteredDataCenters.length === 0 ? (
        <EmptyState
          title="No data centers found"
          description="No facilities match the specified search or filter settings."
          secondaryActionText="Reset Filters"
          onSecondaryAction={() => {
            setSearch('');
            setStatusFilter('ALL');
          }}
          actionText="Add Data Center"
          onAction={handleOpenAdd}
        />
      ) : viewMode === 'cards' ? (
        /* Req 14: Card view with rich data center telemetry */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDataCenters.map(dc => {
            const activeServers = Number(dc.activeServers ?? 0);
            const totalServers = Math.max(1, Number(dc.totalServers ?? 1));
            const serverUtilPercent = Math.round((activeServers / totalServers) * 100);
            const managerName = dc.manager || 'Facility Lead';
            const contactPhone = dc.contactPhone || '+91 22 4000 1100';
            return (
              <div
                key={dc.id}
                className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-md p-5 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all"
              >
                <div>
                  {/* Top Bar: Title, Code, Status */}
                  <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[rgba(148,163,184,0.1)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#F8FAFC]">{dc.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          {dc.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{dc.city}, {dc.state}, {dc.country}</span>
                      </div>
                    </div>
                    <StatusBadge status={dc.status} />
                  </div>

                  {/* Facility Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="p-3 bg-[#0D1728]/70 rounded-lg border border-[rgba(148,163,184,0.1)]">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Power Capacity</span>
                      </div>
                      <div className="text-base font-bold text-[#F8FAFC] font-mono mt-1">
                        {dc.powerCapacityKw} <span className="text-xs font-normal text-[#64748B]">kW</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Total Grid Feed</div>
                    </div>

                    <div className="p-3 bg-[#0D1728]/70 rounded-lg border border-[rgba(148,163,184,0.1)]">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
                        <Server className="w-3 h-3 text-blue-400" />
                        <span>Total Racks</span>
                      </div>
                      <div className="text-base font-bold text-[#F8FAFC] font-mono mt-1">
                        {dc.totalRacks} <span className="text-xs font-normal text-[#64748B]">Racks</span>
                      </div>
                      <div className="text-[10px] text-blue-400 font-mono mt-0.5">{dc.totalServers} Servers Provisioned</div>
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                      <span>Server Capacity ({dc.totalRacks} Racks)</span>
                      <span className="font-mono text-[#F8FAFC] font-medium">
                        {dc.activeServers} / {dc.totalServers} ({serverUtilPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#07111F] overflow-hidden border border-[rgba(148,163,184,0.1)]">
                      <div
                        style={{ width: `${serverUtilPercent}%` }}
                        className="h-full bg-blue-500 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                      />
                    </div>
                  </div>

                  {/* Manager info */}
                  <div className="pt-3 border-t border-[rgba(148,163,184,0.1)] flex items-center justify-between text-xs text-[#94A3B8]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#15243B] text-blue-400 flex items-center justify-center text-[10px] font-bold">
                        {managerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[#F8FAFC] font-medium block">{managerName}</span>
                        <span className="text-[10px] text-[#64748B] font-mono">{contactPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                {(canEdit || canDelete) && (
                  <div className="mt-4 pt-3 border-t border-[rgba(148,163,184,0.1)] flex items-center justify-end gap-2">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(dc)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#15243B] rounded-lg transition-colors"
                        title="Edit Data Center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(dc)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Data Center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Req 14: List view with dense high-contrast layout */
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Data Center</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Racks & Compute</th>
                  <th className="px-4 py-3.5">Power</th>
                  <th className="px-4 py-3.5">Facility Lead</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                {filteredDataCenters.map(dc => (
                  <tr key={dc.id} className="hover:bg-[#15243B]/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#F8FAFC]">{dc.name}</div>
                      <div className="font-mono text-[11px] text-blue-400 mt-0.5">{dc.code}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-[#F8FAFC] font-medium">{dc.city}, {dc.state}</div>
                      <div className="text-[#64748B] text-[11px] truncate max-w-xs">{dc.address}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <div className="text-[#F8FAFC] font-medium">{dc.totalRacks ?? 0} Racks</div>
                      <div className="text-[#94A3B8] text-[11px]">{dc.activeServers ?? 0} / {dc.totalServers ?? 0} Active</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-medium text-[#F8FAFC]">{dc.powerCapacityKw ?? 0} kW</span>
                      <span className="text-[#64748B] text-[11px] block">Dedicated Grid</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-[#F8FAFC] font-medium">{dc.manager || 'Facility Lead'}</div>
                      <div className="text-[#64748B] text-[11px] font-mono">{dc.contactPhone || '+91 22 4000 1100'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={dc.status} />
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(dc)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#15243B] rounded-lg transition-colors"
                              title="Edit Data Center"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(dc)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Data Center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add Data Center Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Data Center"
        description="Provision a new physical facility site in BHARATDC platform"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField id="dc-name" label="Facility Full Name" required error={formErrors.name}>
              <input
                id="dc-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. BHARATDC Pune Central (PUN-1)"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="dc-code" label="Facility Code" required error={formErrors.code}>
              <input
                id="dc-code"
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. PUN-1"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 uppercase font-mono"
              />
            </FormField>

            <FormField id="dc-city" label="City" required error={formErrors.city}>
              <input
                id="dc-city"
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Pune"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="dc-state" label="State">
              <input
                id="dc-state"
                type="text"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>
          </div>

          <FormField id="dc-address" label="Street Address">
            <input
              id="dc-address"
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot 10, MIDC IT Zone, Hinjawadi"
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormField id="dc-racks" label="Total Racks">
              <input
                id="dc-racks"
                type="number"
                value={formData.totalRacks}
                onChange={e => setFormData({ ...formData, totalRacks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="dc-servers" label="Total Servers">
              <input
                id="dc-servers"
                type="number"
                value={formData.totalServers}
                onChange={e => setFormData({ ...formData, totalServers: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="dc-power" label="Power (kW)">
              <input
                id="dc-power"
                type="number"
                value={formData.powerCapacityKw}
                onChange={e => setFormData({ ...formData, powerCapacityKw: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="dc-status" label="Initial Status">
              <select
                id="dc-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as DataCenter['status'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Planned">Planned</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField id="dc-manager" label="Facility Manager">
              <input
                id="dc-manager"
                type="text"
                value={formData.manager}
                onChange={e => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="dc-phone" label="Contact Phone">
              <input
                id="dc-phone"
                type="text"
                value={formData.contactPhone}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>
          </div>

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
              Create Facility
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Data Center Modal */}
      <Modal
        isOpen={!!editingDc}
        onClose={() => setEditingDc(null)}
        title="Edit Data Center"
        description={`Update parameters for ${editingDc?.name}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField id="edit-dc-name" label="Facility Full Name" required error={formErrors.name}>
              <input
                id="edit-dc-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-dc-code" label="Facility Code" required error={formErrors.code}>
              <input
                id="edit-dc-code"
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 uppercase font-mono"
              />
            </FormField>

            <FormField id="edit-dc-city" label="City" required error={formErrors.city}>
              <input
                id="edit-dc-city"
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-dc-state" label="State">
              <input
                id="edit-dc-state"
                type="text"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>
          </div>

          <FormField id="edit-dc-address" label="Street Address">
            <input
              id="edit-dc-address"
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormField id="edit-dc-racks" label="Total Racks">
              <input
                id="edit-dc-racks"
                type="number"
                value={formData.totalRacks}
                onChange={e => setFormData({ ...formData, totalRacks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="edit-dc-servers" label="Total Servers">
              <input
                id="edit-dc-servers"
                type="number"
                value={formData.totalServers}
                onChange={e => setFormData({ ...formData, totalServers: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="edit-dc-power" label="Power (kW)">
              <input
                id="edit-dc-power"
                type="number"
                value={formData.powerCapacityKw}
                onChange={e => setFormData({ ...formData, powerCapacityKw: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="edit-dc-status" label="Status">
              <select
                id="edit-dc-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as DataCenter['status'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Planned">Planned</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField id="edit-dc-manager" label="Facility Manager">
              <input
                id="edit-dc-manager"
                type="text"
                value={formData.manager}
                onChange={e => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-dc-phone" label="Contact Phone">
              <input
                id="edit-dc-phone"
                type="text"
                value={formData.contactPhone}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>
          </div>

          <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingDc(null)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Data Center?"
        message={`This will permanently remove ${deleteTarget?.name} from BHARATDC platform.`}
        confirmText="Delete Data Center"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
