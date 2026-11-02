import { UserRole } from '../types';

export const APP_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  OPERATIONS_MANAGER: 'Operations Manager',
  NETWORK_ENGINEER: 'Network Engineer',
  COMPLIANCE_AUDITOR: 'Compliance Auditor',
  STAFF: 'Staff',
} as const;

/**
 * Normalizes any legacy or variant role string into one of the 5 standard enterprise roles.
 */
export const normalizeRole = (role?: string | null): string => {
  if (!role) return APP_ROLES.STAFF;
  const r = role.trim().toLowerCase();

  if (r.includes('super') || r === 'super admin') return APP_ROLES.SUPER_ADMIN;
  if (r.includes('admin')) return APP_ROLES.SUPER_ADMIN;
  if (r.includes('operat') || r.includes('manager') || r.includes('ops')) return APP_ROLES.OPERATIONS_MANAGER;
  if (r.includes('network') || r.includes('engineer')) return APP_ROLES.NETWORK_ENGINEER;
  if (r.includes('audit') || r.includes('compliance')) return APP_ROLES.COMPLIANCE_AUDITOR;
  if (r.includes('tech') || r.includes('staff') || r.includes('technician')) return APP_ROLES.STAFF;

  return APP_ROLES.STAFF;
};

/**
 * Returns true if the user role can access the specified module / route path.
 */
export const canAccessModule = (role: string | undefined | null, path: string): boolean => {
  const normRole = normalizeRole(role);
  const cleanPath = path.toLowerCase().replace(/^\//, '').split('?')[0];

  // Base paths accessible by all authenticated roles
  if (
    cleanPath === '' ||
    cleanPath === 'dashboard' ||
    cleanPath === 'profile' ||
    cleanPath === 'notifications'
  ) {
    return true;
  }

  switch (normRole) {
    case APP_ROLES.SUPER_ADMIN:
      // Super Admin has access to all modules
      return true;

    case APP_ROLES.OPERATIONS_MANAGER:
      // Allowed: Dashboard, Organizations (view), Clients, Data Centers, Server Allocation, Maintenance, Notifications, Reports, Activity, Profile
      return [
        'organizations',
        'clients',
        'data-centers',
        'server-allocation',
        'maintenance',
        'reports',
        'activity',
        'history',
      ].includes(cleanPath);

    case APP_ROLES.NETWORK_ENGINEER:
      // Allowed: Dashboard, Data Centers, Racks, Servers, Server Allocation, Maintenance, Notifications, Activity, Profile
      return [
        'data-centers',
        'racks',
        'servers',
        'server-allocation',
        'maintenance',
        'activity',
        'history',
      ].includes(cleanPath);

    case APP_ROLES.COMPLIANCE_AUDITOR:
      // Allowed: Dashboard, Data Centers, Racks, Servers, Clients, Reports, Activity, Notifications, Profile
      return [
        'data-centers',
        'racks',
        'servers',
        'clients',
        'reports',
        'activity',
        'history',
      ].includes(cleanPath);

    case APP_ROLES.STAFF:
      // Allowed: Dashboard, Servers, Maintenance, Notifications, Profile
      return ['servers', 'maintenance'].includes(cleanPath);

    default:
      return false;
  }
};

export type ActionType = 'add' | 'edit' | 'delete' | 'toggle' | 'allocate' | 'report' | 'settings' | 'manage_users';

/**
 * Checks whether the given role can execute a specific action in a module.
 */
export const canPerformAction = (
  role: string | undefined | null,
  module: string,
  action: ActionType
): boolean => {
  const normRole = normalizeRole(role);
  const mod = module.toLowerCase().replace(/^\//, '');

  // Super Admin can do everything
  if (normRole === APP_ROLES.SUPER_ADMIN) {
    return true;
  }

  // Compliance Auditor is strictly read-only (+ generate reports)
  if (normRole === APP_ROLES.COMPLIANCE_AUDITOR) {
    if (action === 'report' && mod === 'reports') return true;
    return false;
  }

  // Operations Manager actions
  if (normRole === APP_ROLES.OPERATIONS_MANAGER) {
    if (mod === 'users' || mod === 'settings' || mod === 'racks') return false;
    if (mod === 'organizations') return action !== 'delete'; // Can view/edit orgs
    if (mod === 'clients') return true; // Full client management
    if (mod === 'server-allocation' || mod === 'allocations') return true; // Server allocation
    if (mod === 'maintenance') return true; // Schedule maintenance
    if (mod === 'data-centers') return action !== 'delete';
    if (mod === 'reports') return true;
    return false;
  }

  // Network Engineer actions
  if (normRole === APP_ROLES.NETWORK_ENGINEER) {
    if (mod === 'users' || mod === 'organizations' || mod === 'settings' || mod === 'clients') return false;
    if (mod === 'servers') return action !== 'delete'; // Add & edit servers
    if (mod === 'racks') return action !== 'delete'; // Manage racks
    if (mod === 'data-centers') return action !== 'delete'; // View/edit DC telemetry
    if (mod === 'server-allocation' || mod === 'allocations') return true;
    if (mod === 'maintenance') return true; // Update maintenance
    return false;
  }

  // Staff / Technician actions
  if (normRole === APP_ROLES.STAFF) {
    if (mod === 'maintenance' && (action === 'edit' || action === 'toggle')) return true; // Can start/update assigned maintenance
    if (mod === 'profile') return true;
    return false;
  }

  return false;
};
