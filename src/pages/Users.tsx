import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Power
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { User as UserType, UserRole } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField } from '../components/common/FormField';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { canPerformAction, APP_ROLES } from '../utils/rbac';

export const UsersPage: React.FC = () => {
  const {
    users,
    organizations,
    dataCenters,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    isLoadingData,
    dataError,
    refetchData
  } = useDataCenter();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [orgFilter, setOrgFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'Staff' as UserRole,
    organization: organizations[0]?.name || 'BHARATDC Operations Command',
    phone: '',
    assignedDataCenter: dataCenters[0]?.name || 'All Facilities',
    status: 'Active' as UserType['status']
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canAdd = canPerformAction(currentUser?.role, 'users', 'add');
  const canEdit = canPerformAction(currentUser?.role, 'users', 'edit');
  const canDelete = canPerformAction(currentUser?.role, 'users', 'delete');
  const canToggle = canPerformAction(currentUser?.role, 'users', 'toggle');

  const filteredUsers = useMemo(() => {
    const q = (search || '').toLowerCase();
    return users.filter(u => {
      const displayName = u.fullName || u.name || '';
      const orgName = u.organization || '';
      const username = u.username || '';
      const email = u.email || '';
      const role = u.role || '';
      const matchesSearch =
        displayName.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        username.toLowerCase().includes(q) ||
        orgName.toLowerCase().includes(q) ||
        role.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesOrg = orgFilter === 'ALL' || u.organization === orgFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesOrg && matchesStatus;
    });
  }, [users, search, roleFilter, orgFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'Staff',
      organization: organizations[0]?.name || 'BHARATDC Operations Command',
      phone: '',
      assignedDataCenter: dataCenters[0]?.name || 'All Facilities',
      status: 'Active'
    });
    setFormErrors({});
    setShowPassword(false);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.fullName || user.name || '',
      username: user.username || user.email.split('@')[0],
      email: user.email,
      password: '',
      role: user.role,
      organization: user.organization || 'BHARATDC Operations Command',
      phone: user.phone || '',
      assignedDataCenter: user.assignedDataCenter || 'All Facilities',
      status: user.status
    });
    setFormErrors({});
    setShowPassword(false);
  };

  const handleToggleStatus = (user: UserType) => {
    if (!canToggle) return;
    const nextStatus: UserType['status'] = user.status === 'Active' ? 'Suspended' : 'Active';
    updateUser(user.id, { status: nextStatus });
  };

  const validateForm = (isNew: boolean) => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Please enter a full name.';
    if (!formData.email.trim()) errors.email = 'Please enter an email address.';
    if (isNew && !formData.password.trim()) errors.password = 'Please enter a password for this user.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    addUser({
      fullName: formData.name.trim(),
      name: formData.name.trim(),
      username: formData.username.trim() || formData.email.split('@')[0],
      email: formData.email.trim(),
      role: formData.role as UserRole,
      organization: formData.organization,
      phone: formData.phone.trim(),
      assignedDataCenter: formData.assignedDataCenter,
      status: formData.status
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !validateForm(false)) return;

    updateUser(editingUser.id, {
      fullName: formData.name.trim(),
      name: formData.name.trim(),
      username: formData.username.trim() || editingUser.username,
      email: formData.email.trim(),
      role: formData.role as UserRole,
      organization: formData.organization,
      phone: formData.phone.trim(),
      assignedDataCenter: formData.assignedDataCenter,
      status: formData.status
    });

    setEditingUser(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteUser(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'Super Admin':
      case 'Admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Shield className="w-3 h-3 text-purple-400" />
            <span>Super Admin</span>
          </span>
        );
      case 'Operations Manager':
      case 'Facility Operator':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <span>Operations Manager</span>
          </span>
        );
      case 'Network Engineer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <span>Network Engineer</span>
          </span>
        );
      case 'Compliance Auditor':
      case 'Auditor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span>Compliance Auditor</span>
          </span>
        );
      case 'Staff':
      case 'Staff / Technician':
      case 'Technician':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-slate-800 text-slate-300 border border-slate-700">
            <span>Staff / Technician</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Users</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Manage user accounts, assigned roles, and data center permissions
          </p>
        </div>
        {canAdd && (
          <button
            id="add-user-btn"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by user name, username, email, or role..."
        countText={`Showing ${filteredUsers.length} of ${users.length} users`}
        showReset={search !== '' || roleFilter !== 'ALL' || orgFilter !== 'ALL' || statusFilter !== 'ALL'}
        onResetFilters={() => {
          setSearch('');
          setRoleFilter('ALL');
          setOrgFilter('ALL');
          setStatusFilter('ALL');
        }}
        filters={
          <>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Network Engineer">Network Engineer</option>
              <option value="Compliance Auditor">Compliance Auditor</option>
              <option value="Staff">Staff / Technician</option>
            </select>

            <select
              value={orgFilter}
              onChange={e => setOrgFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Organizations</option>
              {organizations.map(o => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </>
        }
      />

      {/* Error Banner */}
      {dataError && <ErrorBanner message={dataError} onRetry={refetchData} />}

      {/* Users Table */}
      {isLoadingData && users.length === 0 ? (
        <LoadingSkeleton rows={6} type="table" />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description="No user accounts match your search criteria."
          secondaryActionText="Reset Filters"
          onSecondaryAction={() => {
            setSearch('');
            setRoleFilter('ALL');
            setOrgFilter('ALL');
            setStatusFilter('ALL');
          }}
          actionText={canAdd ? 'Add User' : undefined}
          onAction={canAdd ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Organization</th>
                  <th className="px-4 py-3.5">Assigned Data Center</th>
                  <th className="px-4 py-3.5">Last Active</th>
                  <th className="px-4 py-3.5">Status</th>
                  {(canEdit || canDelete || canToggle) && (
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                {filteredUsers.map(user => {
                  const name = user.fullName || user.name || 'User';
                  const initials = name
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={user.id} className="hover:bg-[#15243B]/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-[#F8FAFC]">{name}</div>
                            <div className="text-[11px] text-[#94A3B8] font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">{renderRoleBadge(user.role)}</td>
                      <td className="px-4 py-3.5 text-slate-200 font-medium">
                        {user.organization || 'Operations Command'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-mono">
                        {user.assignedDataCenter || 'All Facilities'}
                      </td>
                      <td className="px-4 py-3.5 text-[#64748B] font-mono">
                        {user.lastLogin || 'Just now'}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={user.status} />
                      </td>
                      {(canEdit || canDelete || canToggle) && (
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            {canToggle && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  user.status === 'Active'
                                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                                }`}
                                title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(user)}
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#15243B] rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(user)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Delete User"
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

      {/* Add User Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add User"
        description="Create a new user account with role-based access"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="user-name" label="Full Name" required error={formErrors.name}>
              <input
                id="user-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Patel"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="user-username" label="Username">
              <input
                id="user-username"
                type="text"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. ramesh"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="user-email" label="Email" required error={formErrors.email}>
              <input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="ramesh@bharatdc.local"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="user-password" label="Password" required error={formErrors.password}>
              <div className="relative">
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter initial password"
                  className="w-full pl-3 pr-9 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <FormField id="user-role" label="Role">
              <select
                id="user-role"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Operations Manager">Operations Manager</option>
                <option value="Network Engineer">Network Engineer</option>
                <option value="Compliance Auditor">Compliance Auditor</option>
                <option value="Staff">Staff / Technician</option>
              </select>
            </FormField>

            <FormField id="user-status" label="Status">
              <select
                id="user-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as UserType['status'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
              </select>
            </FormField>

            <FormField id="user-org" label="Organization">
              <select
                id="user-org"
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

            <FormField id="user-phone" label="Phone Number">
              <input
                id="user-phone"
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 22 2400 9922"
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
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
              Add User
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        description={`Update account information for ${editingUser?.fullName || editingUser?.name}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="edit-user-name" label="Full Name" required error={formErrors.name}>
              <input
                id="edit-user-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-user-username" label="Username">
              <input
                id="edit-user-username"
                type="text"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>

            <FormField id="edit-user-email" label="Email" required error={formErrors.email}>
              <input
                id="edit-user-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </FormField>

            <FormField id="edit-user-role" label="Role">
              <select
                id="edit-user-role"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Operations Manager">Operations Manager</option>
                <option value="Network Engineer">Network Engineer</option>
                <option value="Compliance Auditor">Compliance Auditor</option>
                <option value="Staff">Staff / Technician</option>
              </select>
            </FormField>

            <FormField id="edit-user-status" label="Status">
              <select
                id="edit-user-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as UserType['status'] })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
              </select>
            </FormField>

            <FormField id="edit-user-org" label="Organization">
              <select
                id="edit-user-org"
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

            <FormField id="edit-user-phone" label="Phone">
              <input
                id="edit-user-phone"
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </FormField>
          </div>

          <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
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
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.fullName || deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
