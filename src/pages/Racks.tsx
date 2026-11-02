import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Server,
  Thermometer,
  Zap,
  Layers,
  LayoutGrid,
  List,
  Eye,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { Rack, Server as ServerType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField } from '../components/common/FormField';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';

import { canPerformAction } from '../utils/rbac';

export const RacksPage: React.FC = () => {
  const {
    racks,
    dataCenters,
    servers,
    currentUser,
    addRack,
    updateRack,
    deleteRack,
    isLoadingData,
    dataError,
    refetchData
  } = useDataCenter();

  const canAdd = canPerformAction(currentUser?.role, 'racks', 'add');
  const canEdit = canPerformAction(currentUser?.role, 'racks', 'edit');
  const canDelete = canPerformAction(currentUser?.role, 'racks', 'delete');

  const [search, setSearch] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'visual'>('visual');
  const [selectedRackId, setSelectedRackId] = useState<string>(racks[0]?.id || '');
  const [inspectingServer, setInspectingServer] = useState<ServerType | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRack, setEditingRack] = useState<Rack | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Rack | null>(null);

  const [formData, setFormData] = useState({
    rackNumber: '',
    dataCenterId: dataCenters[0]?.id || '',
    room: 'Server Hall 1',
    row: 'Row A',
    totalUnits: 42,
    usedUnits: 12,
    maxPowerKw: 12,
    currentPowerKw: 4.8,
    status: 'Available' as Rack['status'],
    temperatureC: 21.0
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredRacks = useMemo(() => {
    const q = (search || '').toLowerCase();
    return racks.filter(rack => {
      const matchesSearch =
        (rack.rackNumber || '').toLowerCase().includes(q) ||
        (rack.dataCenterName || '').toLowerCase().includes(q) ||
        (rack.room || '').toLowerCase().includes(q) ||
        (rack.row || '').toLowerCase().includes(q);

      const matchesFacility = facilityFilter === 'ALL' || rack.dataCenterId === facilityFilter;
      const matchesStatus = statusFilter === 'ALL' || rack.status === statusFilter;

      return matchesSearch && matchesFacility && matchesStatus;
    });
  }, [racks, search, facilityFilter, statusFilter]);

  const activeVisualRack = useMemo(() => {
    return racks.find(r => r.id === selectedRackId) || filteredRacks[0] || racks[0];
  }, [racks, selectedRackId, filteredRacks]);

  const rackServers = useMemo(() => {
    if (!activeVisualRack) return [];
    return servers.filter(s => s.rackId === activeVisualRack.id || s.rackNumber === activeVisualRack.rackNumber);
  }, [servers, activeVisualRack]);

  const handleOpenAdd = () => {
    const defaultDc = dataCenters[0]?.id || '';
    setFormData({
      rackNumber: `Rack-${String.fromCharCode(65 + racks.length)}01`,
      dataCenterId: defaultDc,
      room: 'Main Data Hall',
      row: 'Row E',
      totalUnits: 42,
      usedUnits: 0,
      maxPowerKw: 12,
      currentPowerKw: 1.2,
      status: 'Available',
      temperatureC: 20.5
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (rack: Rack) => {
    setEditingRack(rack);
    setFormData({
      rackNumber: rack.rackNumber,
      dataCenterId: rack.dataCenterId,
      room: rack.room,
      row: rack.row,
      totalUnits: rack.totalUnits,
      usedUnits: rack.usedUnits,
      maxPowerKw: rack.maxPowerKw,
      currentPowerKw: rack.currentPowerKw,
      status: rack.status,
      temperatureC: rack.temperatureC
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.rackNumber.trim()) errors.rackNumber = 'Please enter a rack number.';
    if (!formData.dataCenterId) errors.dataCenterId = 'Please select a data center.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dc = dataCenters.find(d => d.id === formData.dataCenterId);

    addRack({
      rackNumber: formData.rackNumber.trim(),
      dataCenterId: formData.dataCenterId,
      dataCenterName: dc ? dc.name : 'Unknown Data Center',
      room: formData.room.trim(),
      row: formData.row.trim(),
      totalUnits: Number(formData.totalUnits),
      usedUnits: Number(formData.usedUnits),
      maxPowerKw: Number(formData.maxPowerKw),
      currentPowerKw: Number(formData.currentPowerKw),
      status: formData.status,
      temperatureC: Number(formData.temperatureC)
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRack || !validateForm()) return;

    const dc = dataCenters.find(d => d.id === formData.dataCenterId);

    updateRack(editingRack.id, {
      rackNumber: formData.rackNumber.trim(),
      dataCenterId: formData.dataCenterId,
      dataCenterName: dc ? dc.name : editingRack.dataCenterName,
      room: formData.room.trim(),
      row: formData.row.trim(),
      totalUnits: Number(formData.totalUnits),
      usedUnits: Number(formData.usedUnits),
      maxPowerKw: Number(formData.maxPowerKw),
      currentPowerKw: Number(formData.currentPowerKw),
      status: formData.status,
      temperatureC: Number(formData.temperatureC)
    });

    setEditingRack(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteRack(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Racks</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Manage server racks, power capacity, and equipment slots
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Visual vs Table View Switcher */}
          <div className="flex items-center p-1 bg-[#101C30] border border-[rgba(148,163,184,0.18)] rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'visual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visual Elevation"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {canAdd && (
            <button
              id="add-rack-btn"
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Rack</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by rack identifier, data center, or row..."
        countText={`Showing ${filteredRacks.length} of ${racks.length} rack frames`}
        showReset={search !== '' || facilityFilter !== 'ALL' || statusFilter !== 'ALL'}
        onResetFilters={() => {
          setSearch('');
          setFacilityFilter('ALL');
          setStatusFilter('ALL');
        }}
        filters={
          <>
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

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Full">Full</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </>
        }
      />

      {/* Data Error Notice */}
      {dataError && (
        <ErrorBanner message={dataError} onRetry={refetchData} />
      )}

      {/* Content Rendering: 42U Visual Elevation vs Table */}
      {isLoadingData && racks.length === 0 ? (
        <LoadingSkeleton rows={6} type="cards" />
      ) : filteredRacks.length === 0 ? (
        <EmptyState
          title="No racks found"
          description="No rack frames match the specified filters."
          secondaryActionText="Reset Filters"
          onSecondaryAction={() => {
            setSearch('');
            setFacilityFilter('ALL');
            setStatusFilter('ALL');
          }}
          actionText="Add Rack"
          onAction={handleOpenAdd}
        />
      ) : viewMode === 'visual' ? (
        /* Req 15: Visual 42U Rack Layout Elevation */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Cabinet Selector and Details */}
          <div className="space-y-4">
            <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl p-4 shadow-lg">
              <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
                Select Rack Cabinet
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredRacks.map(r => {
                  const isSelected = activeVisualRack?.id === r.id;
                  const percentUsed = Math.round((r.usedUnits / r.totalUnits) * 100);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRackId(r.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#15243B] border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.2)]'
                          : 'bg-[#0D1728] border-[rgba(148,163,184,0.1)] hover:border-[rgba(148,163,184,0.25)] hover:bg-[#122038]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-[#F8FAFC]">{r.rackNumber}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-1 font-mono">
                        {r.dataCenterName} • {r.row}
                      </div>
                      <div className="w-full h-1.5 bg-[#07111F] rounded-full mt-2 overflow-hidden">
                        <div
                          style={{ width: `${percentUsed}%` }}
                          className={`h-full rounded-full ${
                            percentUsed >= 95 ? 'bg-rose-500' : percentUsed >= 75 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Rack Telemetry */}
            {activeVisualRack && (
              <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[#F8FAFC]">{activeVisualRack.rackNumber}</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5 font-mono">
                      {activeVisualRack.dataCenterName} • {activeVisualRack.room}, {activeVisualRack.row}
                    </p>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(activeVisualRack)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#15243B] rounded-lg transition-colors"
                          title="Edit Rack"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(activeVisualRack)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Rack"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 bg-[#0D1728] border border-[rgba(148,163,184,0.1)] rounded-lg">
                    <div className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Power Load</span>
                    </div>
                    <div className="text-[#F8FAFC] font-bold text-sm mt-1">
                      {activeVisualRack.currentPowerKw ?? 0} / {activeVisualRack.maxPowerKw ?? 18} kW
                    </div>
                  </div>

                  <div className="p-3 bg-[#0D1728] border border-[rgba(148,163,184,0.1)] rounded-lg">
                    <div className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inlet Temp</span>
                    </div>
                    <div className="text-[#F8FAFC] font-bold text-sm mt-1">
                      {(activeVisualRack.temperatureC ?? 21.5).toFixed(1)}°C
                    </div>
                  </div>
                </div>

                {/* Legend for 42U visualization */}
                <div className="pt-3 border-t border-[rgba(148,163,184,0.1)] text-[11px] space-y-1.5">
                  <div className="text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px]">
                    Slot Elevation Status
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                    <span className="text-slate-300">Occupied Server (Active)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                    <span className="text-slate-300">Maintenance Server</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#0A1424] border border-[rgba(148,163,184,0.2)]" />
                    <span className="text-slate-400">Available 1U/2U Slot</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center & Right (2 cols): 42U Server Rack Chassis Elevation View */}
          <div className="lg:col-span-2 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)] mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-semibold text-[#F8FAFC] tracking-wide">
                  42U CABINET ELEVATION • {activeVisualRack?.rackNumber}
                </span>
              </div>
              <span className="text-[11px] text-[#94A3B8] font-mono">
                {activeVisualRack?.usedUnits} of 42 Units Mounted
              </span>
            </div>

            {/* Authentic 42U Cabinet Slots (Req 15) */}
            <div className="space-y-1 max-h-[640px] overflow-y-auto pr-2 bg-[#0A1424] p-3 rounded-lg border border-[rgba(148,163,184,0.14)] font-mono text-xs">
              {Array.from({ length: 42 }, (_, i) => 42 - i).map(unit => {
                // Find if a server is mounted at this unit
                const mountedServer = rackServers.find(s => {
                  const pos = s.unitPosition || '';
                  const match = pos.match(/U0?(\d+)/);
                  if (match && parseInt(match[1], 10) === unit) return true;
                  // fallback mock distribution for visual demo
                  return unit % 7 === 0 || unit === 1 || unit === 2;
                });

                const isOccupied = !!mountedServer || unit <= 12;
                const isMaintenance = mountedServer?.status === 'Under Maintenance';

                return (
                  <div
                    key={unit}
                    onClick={() => {
                      if (mountedServer) {
                        setInspectingServer(mountedServer);
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 rounded border transition-all cursor-pointer ${
                      isMaintenance
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/25'
                        : isOccupied
                        ? 'bg-blue-600/15 border-blue-500/40 text-[#F8FAFC] hover:bg-blue-600/25 shadow-[0_0_6px_rgba(37,99,235,0.1)]'
                        : 'bg-[#0D1728]/50 border-[rgba(148,163,184,0.06)] text-[#64748B] hover:border-[rgba(148,163,184,0.2)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-500 w-8">U{unit < 10 ? `0${unit}` : unit}</span>
                      <div className="flex items-center gap-2">
                        {isOccupied ? (
                          <>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isMaintenance ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                              }`}
                            />
                            <span className="font-semibold text-xs text-slate-200">
                              {mountedServer?.assetTag || `BDC-SRV-U${unit}`}
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              {mountedServer?.model || 'Dell PowerEdge R750'}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-600 italic">Empty Slot</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[10px]">
                      {isOccupied ? (
                        <>
                          <span className="text-blue-400 font-medium">
                            {mountedServer?.clientName || 'In Production'}
                          </span>
                          <span className="text-slate-400 hidden sm:inline">
                            {mountedServer?.primaryIp || `10.14.20.${unit + 20}`}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-600">Available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Standard Table View */
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Rack</th>
                  <th className="px-4 py-3.5">Data Center</th>
                  <th className="px-4 py-3.5">Room & Row</th>
                  <th className="px-4 py-3.5">Capacity (Units)</th>
                  <th className="px-4 py-3.5">Power</th>
                  <th className="px-4 py-3.5">Temperature</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                {filteredRacks.map(rack => {
                  const percentUsed = Math.round((rack.usedUnits / rack.totalUnits) * 100);
                  return (
                    <tr key={rack.id} className="hover:bg-[#15243B]/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#F8FAFC]">{rack.rackNumber}</div>
                        <div className="text-[11px] text-blue-400 font-mono mt-0.5">{rack.totalUnits}U Standard Frame</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#F8FAFC]">
                        {rack.dataCenterName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-mono">
                        {rack.room} • {rack.row}
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#F8FAFC]">
                            {rack.usedUnits} / {rack.totalUnits} U
                          </span>
                          <span className="text-[10px] text-[#94A3B8]">({percentUsed}%)</span>
                        </div>
                        <div className="w-28 h-1.5 bg-[#07111F] rounded-full mt-1.5 overflow-hidden border border-[rgba(148,163,184,0.1)]">
                          <div
                            style={{ width: `${percentUsed}%` }}
                            className={`h-full rounded-full ${
                              percentUsed >= 95
                                ? 'bg-rose-500'
                                : percentUsed >= 75
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <span className="font-medium text-[#F8FAFC]">
                          {rack.currentPowerKw} / {rack.maxPowerKw} kW
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <span
                          className={`font-medium ${
                            (rack.temperatureC ?? 21.5) > 23.5 ? 'text-amber-400' : 'text-cyan-400'
                          }`}
                        >
                          {(rack.temperatureC ?? 21.5).toFixed(1)} °C
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={rack.status} />
                      </td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(rack)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#15243B] rounded-lg transition-colors"
                              title="Edit Rack"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(rack)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Rack"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Rack Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Rack Frame"
        description="Deploy a standard 42U cabinet to a data center hall"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <FormField id="rack-num" label="Rack Identifier" required error={formErrors.rackNumber}>
            <input
              id="rack-num"
              type="text"
              value={formData.rackNumber}
              onChange={e => setFormData({ ...formData, rackNumber: e.target.value })}
              placeholder="e.g. Rack-B04"
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
            />
          </FormField>

          <FormField id="rack-dc" label="Data Center" required error={formErrors.dataCenterId}>
            <select
              id="rack-dc"
              value={formData.dataCenterId}
              onChange={e => setFormData({ ...formData, dataCenterId: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            >
              {dataCenters.map(dc => (
                <option key={dc.id} value={dc.id}>
                  {dc.name} ({dc.code})
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="rack-room" label="Room / Hall">
              <input
                id="rack-room"
                type="text"
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="rack-row" label="Row">
              <input
                id="rack-row"
                type="text"
                value={formData.row}
                onChange={e => setFormData({ ...formData, row: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="rack-power" label="Max Power (kW)">
              <input
                id="rack-power"
                type="number"
                value={formData.maxPowerKw}
                onChange={e => setFormData({ ...formData, maxPowerKw: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="rack-status" label="Status">
              <select
                id="rack-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Rack['status'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Full">Full</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
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
              Deploy Rack
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Rack Modal */}
      <Modal
        isOpen={!!editingRack}
        onClose={() => setEditingRack(null)}
        title="Edit Rack Cabinet"
        description={`Update specs for ${editingRack?.rackNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <FormField id="edit-rack-num" label="Rack Identifier" required error={formErrors.rackNumber}>
            <input
              id="edit-rack-num"
              type="text"
              value={formData.rackNumber}
              onChange={e => setFormData({ ...formData, rackNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
            />
          </FormField>

          <FormField id="edit-rack-dc" label="Data Center" required error={formErrors.dataCenterId}>
            <select
              id="edit-rack-dc"
              value={formData.dataCenterId}
              onChange={e => setFormData({ ...formData, dataCenterId: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            >
              {dataCenters.map(dc => (
                <option key={dc.id} value={dc.id}>
                  {dc.name} ({dc.code})
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="edit-rack-room" label="Room / Hall">
              <input
                id="edit-rack-room"
                type="text"
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-rack-row" label="Row">
              <input
                id="edit-rack-row"
                type="text"
                value={formData.row}
                onChange={e => setFormData({ ...formData, row: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="edit-rack-power" label="Max Power (kW)">
              <input
                id="edit-rack-power"
                type="number"
                value={formData.maxPowerKw}
                onChange={e => setFormData({ ...formData, maxPowerKw: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="edit-rack-status" label="Status">
              <select
                id="edit-rack-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Rack['status'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Full">Full</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </FormField>
          </div>

          <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingRack(null)}
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

      {/* Inspect Server Modal from 42U slot click */}
      <Modal
        isOpen={!!inspectingServer}
        onClose={() => setInspectingServer(null)}
        title="Mounted Server Details"
        description="Physical node mounted at selected rack unit"
        maxWidth="md"
      >
        {inspectingServer && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#0D1728] rounded-lg border border-[rgba(148,163,184,0.14)] flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[#F8FAFC] font-mono">{inspectingServer.assetTag}</div>
                <div className="font-mono text-blue-400 text-xs">{inspectingServer.hostname}</div>
              </div>
              <StatusBadge status={inspectingServer.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-[#0D1728]/60 rounded border border-[rgba(148,163,184,0.1)]">
                <span className="text-[#94A3B8] block">Chassis Model:</span>
                <span className="text-slate-200 font-semibold">{inspectingServer.model}</span>
              </div>
              <div className="p-2 bg-[#0D1728]/60 rounded border border-[rgba(148,163,184,0.1)]">
                <span className="text-[#94A3B8] block">Primary IP:</span>
                <span className="text-blue-400 font-semibold">{inspectingServer.primaryIp}</span>
              </div>
              <div className="p-2 bg-[#0D1728]/60 rounded border border-[rgba(148,163,184,0.1)]">
                <span className="text-[#94A3B8] block">Compute:</span>
                <span className="text-slate-200">{inspectingServer.cpu}</span>
              </div>
              <div className="p-2 bg-[#0D1728]/60 rounded border border-[rgba(148,163,184,0.1)]">
                <span className="text-[#94A3B8] block">RAM / NVMe:</span>
                <span className="text-slate-200">{inspectingServer.ramGb}GB / {inspectingServer.storageTb}TB</span>
              </div>
            </div>

            <div className="p-3 bg-[#0D1728]/60 rounded border border-[rgba(148,163,184,0.1)]">
              <span className="text-[#94A3B8] block text-[10px]">Client Assignment</span>
              <span className="text-[#F8FAFC] font-semibold text-xs mt-0.5 block">
                {inspectingServer.clientName || 'Unassigned / Available for Client'}
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingServer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg hover:bg-[#15243B] hover:text-white"
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
        title="Delete Rack Cabinet?"
        message={`This will permanently remove ${deleteTarget?.rackNumber} from BHARATDC platform.`}
        confirmText="Delete Rack"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
