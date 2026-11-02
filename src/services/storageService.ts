import {
  DataCenter,
  Rack,
  Server,
  Client,
  ServerAllocation,
  MaintenanceRecord,
  Organization,
  User,
  ActivityLog,
  NotificationItem,
  ReportItem
} from '../types';
import {
  INITIAL_DATA_CENTERS,
  INITIAL_RACKS,
  INITIAL_SERVERS,
  INITIAL_CLIENTS,
  INITIAL_ALLOCATIONS,
  INITIAL_MAINTENANCE,
  INITIAL_ORGANIZATIONS,
  INITIAL_USERS,
  INITIAL_ACTIVITY,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS
} from './mockData';

const STORAGE_PREFIX = 'bharatdc_app_data_v1_';

export const storage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error', e);
    }
  },
  resetAll: (): void => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Storage reset error', e);
    }
  }
};

export const loadInitialData = () => {
  return {
    dataCenters: storage.get<DataCenter[]>('dataCenters', INITIAL_DATA_CENTERS),
    racks: storage.get<Rack[]>('racks', INITIAL_RACKS),
    servers: storage.get<Server[]>('servers', INITIAL_SERVERS),
    clients: storage.get<Client[]>('clients', INITIAL_CLIENTS),
    allocations: storage.get<ServerAllocation[]>('allocations', INITIAL_ALLOCATIONS),
    maintenance: storage.get<MaintenanceRecord[]>('maintenance', INITIAL_MAINTENANCE),
    organizations: storage.get<Organization[]>('organizations', INITIAL_ORGANIZATIONS),
    users: storage.get<User[]>('users', INITIAL_USERS),
    activity: storage.get<ActivityLog[]>('activity', INITIAL_ACTIVITY),
    notifications: storage.get<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS),
    reports: storage.get<ReportItem[]>('reports', INITIAL_REPORTS),
  };
};
