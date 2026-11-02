import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Building, Globe, MapPin, Mail, ShieldCheck } from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { Organization } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField } from '../components/common/FormField';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';

import { canPerformAction } from '../utils/rbac';

export const OrganizationsPage: React.FC = () => {
  const {
    organizations,
    currentUser,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    isLoadingData,
    dataError,
    refetchData
  } = useDataCenter();

  const canAdd = canPerformAction(currentUser?.role, 'organizations', 'add');
  const canEdit = canPerformAction(currentUser?.role, 'organizations', 'edit');
  const canDelete = canPerformAction(currentUser?.role, 'organizations', 'delete');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Government' as Organization['type'],
    contactEmail: '',
    contactPhone: '',
    headquarters: '',
    status: 'Active' as Organization['status'],
    activeDataCentersCount: 1
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredOrgs = useMemo(() => {
    const q = (search || '').toLowerCase();
    return organizations.filter(org => {
      const emailStr = org.email || org.contactEmail || '';
      const matchesSearch =
        (org.name || '').toLowerCase().includes(q) ||
        (org.code || '').toLowerCase().includes(q) ||
        (org.headquarters || '').toLowerCase().includes(q) ||
        emailStr.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || org.status === statusFilter;
      const matchesSector = sectorFilter === 'ALL' || org.type === sectorFilter;

      return matchesSearch && matchesStatus && matchesSector;
    });
  }, [organizations, search, statusFilter, sectorFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      type: 'Government',
      contactEmail: '',
      contactPhone: '',
      headquarters: '',
      status: 'Active',
      activeDataCentersCount: 1
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      code: org.code,
      type: org.type,
      contactEmail: org.email || org.contactEmail || '',
      contactPhone: org.phone || org.contactPhone || '',
      headquarters: org.headquarters,
      status: org.status,
      activeDataCentersCount: org.activeCentersCount ?? org.activeDataCentersCount ?? 1
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Please enter an organization name.';
    if (!formData.code.trim()) errors.code = 'Please enter an organization code.';
    if (!formData.contactEmail.trim()) errors.contactEmail = 'Please enter a contact email address.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    addOrganization({
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      type: formData.type,
      primaryContact: formData.name.trim() + ' Office',
      email: formData.contactEmail.trim(),
      contactEmail: formData.contactEmail.trim(),
      phone: formData.contactPhone.trim(),
      contactPhone: formData.contactPhone.trim(),
      headquarters: formData.headquarters.trim(),
      status: formData.status,
      activeCentersCount: Number(formData.activeDataCentersCount),
      activeDataCentersCount: Number(formData.activeDataCentersCount),
      createdAt: new Date().toISOString().split('T')[0]
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg || !validateForm()) return;

    updateOrganization(editingOrg.id, {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      type: formData.type,
      email: formData.contactEmail.trim(),
      contactEmail: formData.contactEmail.trim(),
      phone: formData.contactPhone.trim(),
      contactPhone: formData.contactPhone.trim(),
      headquarters: formData.headquarters.trim(),
      status: formData.status,
      activeCentersCount: Number(formData.activeDataCentersCount),
      activeDataCentersCount: Number(formData.activeDataCentersCount)
    });

    setEditingOrg(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteOrganization(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Organizations</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Partner organizations, ministries, and tenant accounts on BHARATDC
          </p>
        </div>
        {canAdd && (
          <button
            id="add-org-btn"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Organization</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by organization name, code, headquarters, or email..."
        countText={`Showing ${filteredOrgs.length} of ${organizations.length} organizations`}
        showReset={search !== '' || statusFilter !== 'ALL' || sectorFilter !== 'ALL'}
        onResetFilters={() => {
          setSearch('');
          setStatusFilter('ALL');
          setSectorFilter('ALL');
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
              <option value="Suspended">Suspended</option>
            </select>

            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Sectors</option>
              <option value="Government">Government</option>
              <option value="Public Sector">Public Sector</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Defense / Strategic">Defense / Strategic</option>
            </select>
          </>
        }
      />

      {/* Data Error Notice */}
      {dataError && (
        <ErrorBanner message={dataError} onRetry={refetchData} />
      )}

      {/* Orgs Table (Req 11) */}
      {isLoadingData && organizations.length === 0 ? (
        <LoadingSkeleton rows={6} type="table" />
      ) : filteredOrgs.length === 0 ? (
        <EmptyState
          title="No organizations found"
          description="No organizations match the current filter selection."
          secondaryActionText="Reset Filters"
          onSecondaryAction={() => {
            setSearch('');
            setStatusFilter('ALL');
            setSectorFilter('ALL');
          }}
          actionText="Add Organization"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Organization</th>
                  <th className="px-4 py-3.5">Sector Type</th>
                  <th className="px-4 py-3.5">Headquarters</th>
                  <th className="px-4 py-3.5">Contact Point</th>
                  <th className="px-4 py-3.5">Active Sites</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                {filteredOrgs.map(org => (
                  <tr key={org.id} className="hover:bg-[#15243B]/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#F8FAFC]">{org.name}</div>
                      <div className="font-mono text-[11px] text-blue-400 mt-0.5">{org.code}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#0A1424] text-blue-300 border border-blue-500/20">
                        {org.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-200 font-medium">
                      {org.headquarters}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 font-mono">
                      <div>{org.email || org.contactEmail}</div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">{org.phone || org.contactPhone}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#F8FAFC] font-semibold">
                      {org.activeCentersCount ?? org.activeDataCentersCount ?? 0} Facilities
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={org.status} />
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(org)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#15243B] rounded-lg transition-colors"
                              title="Edit Organization"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(org)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Organization"
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

      {/* Add Organization Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Organization"
        description="Register a new public sector or enterprise organization on BHARATDC"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <FormField id="org-name" label="Organization Full Name" required error={formErrors.name}>
            <input
              id="org-name"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Indian Oil & Gas Digital Corporation"
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="org-code" label="Identifier Code" required error={formErrors.code}>
              <input
                id="org-code"
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. IOGDC"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 uppercase font-mono"
              />
            </FormField>

            <FormField id="org-type" label="Sector Classification">
              <select
                id="org-type"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as Organization['type'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Government">Government</option>
                <option value="Public Sector">Public Sector</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Defense / Strategic">Defense / Strategic</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="org-email" label="Official Contact Email" required error={formErrors.contactEmail}>
              <input
                id="org-email"
                type="email"
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="e.g. contact@domain.gov.in"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="org-phone" label="Official Phone">
              <input
                id="org-phone"
                type="text"
                value={formData.contactPhone}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="e.g. +91 11 2309 8811"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>
          </div>

          <FormField id="org-hq" label="Headquarters Location">
            <input
              id="org-hq"
              type="text"
              value={formData.headquarters}
              onChange={e => setFormData({ ...formData, headquarters: e.target.value })}
              placeholder="e.g. New Delhi, India"
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <FormField id="org-status" label="Initial Status">
            <select
              id="org-status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as Organization['status'] })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
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
              Register Organization
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Organization Modal */}
      <Modal
        isOpen={!!editingOrg}
        onClose={() => setEditingOrg(null)}
        title="Edit Organization"
        description={`Update records for ${editingOrg?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <FormField id="edit-org-name" label="Organization Full Name" required error={formErrors.name}>
            <input
              id="edit-org-name"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="edit-org-code" label="Identifier Code" required error={formErrors.code}>
              <input
                id="edit-org-code"
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 uppercase font-mono"
              />
            </FormField>

            <FormField id="edit-org-type" label="Sector Classification">
              <select
                id="edit-org-type"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as Organization['type'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Government">Government</option>
                <option value="Public Sector">Public Sector</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Defense / Strategic">Defense / Strategic</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="edit-org-email" label="Contact Email" required error={formErrors.contactEmail}>
              <input
                id="edit-org-email"
                type="email"
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-org-phone" label="Phone">
              <input
                id="edit-org-phone"
                type="text"
                value={formData.contactPhone}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>
          </div>

          <FormField id="edit-org-hq" label="Headquarters">
            <input
              id="edit-org-hq"
              type="text"
              value={formData.headquarters}
              onChange={e => setFormData({ ...formData, headquarters: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </FormField>

          <FormField id="edit-org-status" label="Status">
            <select
              id="edit-org-status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as Organization['status'] })}
              className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </FormField>

          <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingOrg(null)}
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
        title="Delete Organization?"
        message={`This will permanently delete ${deleteTarget?.name} from BHARATDC records.`}
        confirmText="Delete Organization"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
