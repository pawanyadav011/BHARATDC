import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Server,
  LayoutGrid,
  List,
  ExternalLink,
  Zap,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataCenter } from '../context/DataContext';
import { Client } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField } from '../components/common/FormField';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';

import { canPerformAction } from '../utils/rbac';

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    clients,
    organizations,
    allocations,
    currentUser,
    addClient,
    updateClient,
    deleteClient,
    isLoadingData,
    dataError,
    refetchData
  } = useDataCenter();

  const canAdd = canPerformAction(currentUser?.role, 'clients', 'add');
  const canEdit = canPerformAction(currentUser?.role, 'clients', 'edit');
  const canDelete = canPerformAction(currentUser?.role, 'clients', 'delete');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    organization: organizations[0]?.name || '',
    email: '',
    phone: '',
    contactPerson: '',
    billingType: 'Monthly' as Client['billingType'],
    slaTier: 'Standard' as Client['slaTier'],
    status: 'Active' as Client['status']
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredClients = useMemo(() => {
    const q = (search || '').toLowerCase();
    return clients.filter(c => {
      const matchesSearch =
        (c.name || '').toLowerCase().includes(q) ||
        (c.organization || '').toLowerCase().includes(q) ||
        (c.contactPerson || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesSla = slaFilter === 'ALL' || c.slaTier === slaFilter;

      return matchesSearch && matchesStatus && matchesSla;
    });
  }, [clients, search, statusFilter, slaFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      organization: organizations[0]?.name || '',
      email: '',
      phone: '',
      contactPerson: '',
      billingType: 'Monthly',
      slaTier: 'Standard',
      status: 'Active'
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      organization: client.organization,
      email: client.email,
      phone: client.phone,
      contactPerson: client.contactPerson,
      billingType: client.billingType,
      slaTier: client.slaTier,
      status: client.status
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Please enter a client name.';
    if (!formData.email.trim()) errors.email = 'Please enter an email address.';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Please enter a contact person.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    addClient({
      name: formData.name.trim(),
      organization: formData.organization,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      contactPerson: formData.contactPerson.trim(),
      billingType: formData.billingType,
      slaTier: formData.slaTier,
      activeAllocationsCount: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      status: formData.status
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !validateForm()) return;

    updateClient(editingClient.id, {
      name: formData.name.trim(),
      organization: formData.organization,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      contactPerson: formData.contactPerson.trim(),
      billingType: formData.billingType,
      slaTier: formData.slaTier,
      status: formData.status
    });

    setEditingClient(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteClient(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const renderSlaTierBadge = (tier: string) => {
    switch (tier) {
      case 'Mission Critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Mission Critical (99.999%)
          </span>
        );
      case 'Premium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Premium (99.99%)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0A1424] text-slate-300 border border-[rgba(148,163,184,0.2)]">
            Standard (99.9%)
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Clients</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Client accounts, contact information, and service level agreements
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-[#101C30] border border-[rgba(148,163,184,0.18)] rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid"
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
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {canAdd && (
            <button
              id="add-client-btn"
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by client name, organization, or contact email..."
        countText={`Showing ${filteredClients.length} of ${clients.length} clients`}
        showReset={search !== '' || statusFilter !== 'ALL' || slaFilter !== 'ALL'}
        onResetFilters={() => {
          setSearch('');
          setStatusFilter('ALL');
          setSlaFilter('ALL');
        }}
        filters={
          <>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select
              value={slaFilter}
              onChange={e => setSlaFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All SLA Tiers</option>
              <option value="Mission Critical">Mission Critical</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
            </select>
          </>
        }
      />

      {/* Data Error Notice */}
      {dataError && (
        <ErrorBanner message={dataError} onRetry={refetchData} />
      )}

      {/* Content View: Cards vs Table */}
      {isLoadingData && clients.length === 0 ? (
        <LoadingSkeleton rows={6} type={viewMode} />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="No clients match your filter criteria."
          secondaryActionText="Reset Filters"
          onSecondaryAction={() => {
            setSearch('');
            setStatusFilter('ALL');
            setSlaFilter('ALL');
          }}
          actionText="Add Client"
          onAction={handleOpenAdd}
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => {
            const clientAllocations = allocations.filter(a => a.clientId === client.id);
            const totalBandwidth = clientAllocations.reduce((acc, curr) => acc + (curr.bandwidthQuotaTb || 0), 0);

            return (
              <div
                key={client.id}
                className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-[rgba(148,163,184,0.25)] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[#F8FAFC] text-sm">{client.name}</h3>
                      <p className="text-xs text-blue-400 font-medium mt-0.5">{client.organization}</p>
                    </div>
                    <StatusBadge status={client.status} />
                  </div>

                  <div className="mt-3">
                    {renderSlaTierBadge(client.slaTier)}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[rgba(148,163,184,0.1)] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#94A3B8]">
                      <span>Primary Contact:</span>
                      <span className="text-[#F8FAFC] font-medium">{client.contactPerson}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#94A3B8]">
                      <span>Contact Email:</span>
                      <span className="text-slate-300 font-mono text-[11px] truncate max-w-[170px]">{client.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#94A3B8]">
                      <span>Allocated Servers:</span>
                      <span className="text-blue-400 font-bold font-mono">
                        {client.activeAllocationsCount || clientAllocations.length} Nodes
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#94A3B8]">
                      <span>Bandwidth Quota:</span>
                      <span className="text-[#F8FAFC] font-mono">{totalBandwidth > 0 ? `${totalBandwidth} TB` : 'Unmetered'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#94A3B8]">
                      <span>Billing Model:</span>
                      <span className="text-slate-300">{client.billingType}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[rgba(148,163,184,0.1)] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/server-allocation')}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    <span>View Allocations</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(client)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#15243B] rounded-lg transition-colors"
                          title="Edit Client"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(client)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clients Table */
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Client Name</th>
                  <th className="px-4 py-3.5">Organization</th>
                  <th className="px-4 py-3.5">Primary Contact</th>
                  <th className="px-4 py-3.5">SLA Tier</th>
                  <th className="px-4 py-3.5">Allocations</th>
                  <th className="px-4 py-3.5">Billing</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-[#15243B]/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#F8FAFC]">{client.name}</div>
                      <div className="text-[11px] text-[#64748B] font-mono mt-0.5">Joined {client.joinedDate}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-200 font-medium">
                      {client.organization}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-200 font-medium">{client.contactPerson}</div>
                      <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">{client.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {renderSlaTierBadge(client.slaTier)}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-400">
                      {client.activeAllocationsCount} Servers
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {client.billingType}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={client.status} />
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(client)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#15243B] rounded-lg transition-colors"
                              title="Edit Client"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(client)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Client"
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

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Institutional Client"
        description="Register a new institutional client account into BHARATDC"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="client-name" label="Client Account Name" required error={formErrors.name}>
              <input
                id="client-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. State Energy Automation"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="client-org" label="Parent Organization">
              <select
                id="client-org"
                value={formData.organization}
                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                {organizations.map(o => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="client-person" label="Primary Contact Person" required error={formErrors.contactPerson}>
              <input
                id="client-person"
                type="text"
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Meera Nambiar"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="client-email" label="Contact Email" required error={formErrors.email}>
              <input
                id="client-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. meera@energy.gov.in"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="client-phone" label="Contact Phone">
              <input
                id="client-phone"
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 22 2266 0555"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="client-sla" label="SLA Tier">
              <select
                id="client-sla"
                value={formData.slaTier}
                onChange={e => setFormData({ ...formData, slaTier: e.target.value as Client['slaTier'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Mission Critical">Mission Critical (Tier IV)</option>
                <option value="Premium">Premium (Tier III)</option>
                <option value="Standard">Standard (Tier II)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="client-billing" label="Billing Cadence">
              <select
                id="client-billing"
                value={formData.billingType}
                onChange={e => setFormData({ ...formData, billingType: e.target.value as Client['billingType'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </FormField>

            <FormField id="client-status" label="Initial Status">
              <select
                id="client-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Client['status'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
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
              Register Client
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        title="Edit Client Account"
        description={`Modify settings for ${editingClient?.name}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="edit-client-name" label="Client Account Name" required error={formErrors.name}>
              <input
                id="edit-client-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-client-org" label="Parent Organization">
              <select
                id="edit-client-org"
                value={formData.organization}
                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                {organizations.map(o => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="edit-client-person" label="Primary Contact" required error={formErrors.contactPerson}>
              <input
                id="edit-client-person"
                type="text"
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-client-email" label="Contact Email" required error={formErrors.email}>
              <input
                id="edit-client-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-client-phone" label="Phone">
              <input
                id="edit-client-phone"
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="edit-client-sla" label="SLA Tier">
              <select
                id="edit-client-sla"
                value={formData.slaTier}
                onChange={e => setFormData({ ...formData, slaTier: e.target.value as Client['slaTier'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Mission Critical">Mission Critical (Tier IV)</option>
                <option value="Premium">Premium (Tier III)</option>
                <option value="Standard">Standard (Tier II)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="edit-client-billing" label="Billing Cadence">
              <select
                id="edit-client-billing"
                value={formData.billingType}
                onChange={e => setFormData({ ...formData, billingType: e.target.value as Client['billingType'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </FormField>

            <FormField id="edit-client-status" label="Status">
              <select
                id="edit-client-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Client['status'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </FormField>
          </div>

          <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingClient(null)}
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
        title="Delete Client Account?"
        message={`This will permanently remove ${deleteTarget?.name} from BHARATDC platform.`}
        confirmText="Delete Client"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
