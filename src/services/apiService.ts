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
  ReportItem,
  DashboardStats,
} from '../types';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  'http://localhost:5000/api';

class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

let authToken: string | null = localStorage.getItem('bharatdc_auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('bharatdc_auth_token', token);
  } else {
    localStorage.removeItem('bharatdc_auth_token');
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');
  const activeToken = authToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('bharatdc_auth_token') : null);
  if (activeToken) {
    headers.set('Authorization', `Bearer ${activeToken}`);
  }

  const cachedUserStr = localStorage.getItem('bharatdc_current_user');
  if (cachedUserStr) {
    try {
      const cachedUser = JSON.parse(cachedUserStr);
      if (cachedUser?.role) {
        headers.set('X-User-Role', cachedUser.role);
      }
      if (cachedUser?.email) {
        headers.set('X-User-Email', cachedUser.email);
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `HTTP error ${response.status}`;
    throw new ApiError(errorMsg, response.status, data?.details);
  }

  return data;
}

// ==========================================
// HEALTH CHECK
// ==========================================
export const healthApi = {
  check: () => request<{ status: string; service: string; version: string; database: any }>('/health'),
};

// ==========================================
// AUTHENTICATION API
// ==========================================
export const authApi = {
  login: async (credentials: { email?: string; username?: string; identifier?: string; password?: string; facility?: string }) => {
    const res = await request<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },
  logout: async () => {
    try {
      await request<{ success: boolean }>('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },
  getMe: () => request<{ success: boolean; user: User }>('/auth/me'),
};

// ==========================================
// DATA CENTERS API
// ==========================================
export const dataCentersApi = {
  getAll: () => request<{ success: boolean; data: DataCenter[] }>('/data-centers'),
  getById: (id: string) => request<{ success: boolean; data: DataCenter }>(`/data-centers/${id}`),
  create: (data: Omit<DataCenter, 'id'>) =>
    request<{ success: boolean; data: DataCenter }>('/data-centers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<DataCenter>) =>
    request<{ success: boolean; data: DataCenter }>(`/data-centers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/data-centers/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// RACKS API
// ==========================================
export const racksApi = {
  getAll: () => request<{ success: boolean; data: Rack[] }>('/racks'),
  getById: (id: string) => request<{ success: boolean; data: Rack }>(`/racks/${id}`),
  create: (data: Omit<Rack, 'id'>) =>
    request<{ success: boolean; data: Rack }>('/racks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<Rack>) =>
    request<{ success: boolean; data: Rack }>(`/racks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/racks/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// SERVERS API
// ==========================================
export const serversApi = {
  getAll: () => request<{ success: boolean; data: Server[] }>('/servers'),
  getById: (id: string) => request<{ success: boolean; data: Server }>(`/servers/${id}`),
  create: (data: Omit<Server, 'id'>) =>
    request<{ success: boolean; data: Server }>('/servers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<Server>) =>
    request<{ success: boolean; data: Server }>(`/servers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/servers/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// CLIENTS API
// ==========================================
export const clientsApi = {
  getAll: () => request<{ success: boolean; data: Client[] }>('/clients'),
  getById: (id: string) => request<{ success: boolean; data: Client }>(`/clients/${id}`),
  create: (data: Omit<Client, 'id'>) =>
    request<{ success: boolean; data: Client }>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<Client>) =>
    request<{ success: boolean; data: Client }>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/clients/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// SERVER ALLOCATIONS API
// ==========================================
export const allocationsApi = {
  getAll: () => request<{ success: boolean; data: ServerAllocation[] }>('/allocations'),
  getById: (id: string) => request<{ success: boolean; data: ServerAllocation }>(`/allocations/${id}`),
  create: (data: {
    serverId: string;
    serverHostname?: string;
    assetTag?: string;
    clientId: string;
    clientName?: string;
    dataCenterName?: string;
    purpose: string;
    bandwidthQuotaTb: number;
    billingCycle: string;
  }) =>
    request<{ success: boolean; data: ServerAllocation }>('/allocations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/allocations/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// MAINTENANCE API
// ==========================================
export const maintenanceApi = {
  getAll: () => request<{ success: boolean; data: MaintenanceRecord[] }>('/maintenance'),
  getById: (id: string) => request<{ success: boolean; data: MaintenanceRecord }>(`/maintenance/${id}`),
  create: (data: Omit<MaintenanceRecord, 'id' | 'ticketNumber' | 'status'>) =>
    request<{ success: boolean; data: MaintenanceRecord }>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<MaintenanceRecord>) =>
    request<{ success: boolean; data: MaintenanceRecord }>(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/maintenance/${id}`, {
      method: 'DELETE',
    }),
  start: (id: string) =>
    request<{ success: boolean; data: MaintenanceRecord }>(`/maintenance/${id}/start`, {
      method: 'POST',
    }),
  complete: (id: string) =>
    request<{ success: boolean; data: MaintenanceRecord }>(`/maintenance/${id}/complete`, {
      method: 'POST',
    }),
  cancel: (id: string) =>
    request<{ success: boolean; data: MaintenanceRecord }>(`/maintenance/${id}/cancel`, {
      method: 'POST',
    }),
};

// ==========================================
// ORGANIZATIONS API
// ==========================================
export const organizationsApi = {
  getAll: () => request<{ success: boolean; data: Organization[] }>('/organizations'),
  getById: (id: string) => request<{ success: boolean; data: Organization }>(`/organizations/${id}`),
  create: (data: Omit<Organization, 'id'>) =>
    request<{ success: boolean; data: Organization }>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<Organization>) =>
    request<{ success: boolean; data: Organization }>(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/organizations/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// USERS API
// ==========================================
export const usersApi = {
  getAll: () => request<{ success: boolean; data: User[] }>('/users'),
  getById: (id: string) => request<{ success: boolean; data: User }>(`/users/${id}`),
  create: (data: Omit<User, 'id' | 'lastLogin'>) =>
    request<{ success: boolean; data: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<User>) =>
    request<{ success: boolean; data: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// ACTIVITY LOGS API
// ==========================================
export const activityApi = {
  getAll: () => request<{ success: boolean; data: ActivityLog[] }>('/activity'),
  getById: (id: string) => request<{ success: boolean; data: ActivityLog }>(`/activity/${id}`),
  create: (data: Omit<ActivityLog, 'id' | 'timestamp'>) =>
    request<{ success: boolean; data: ActivityLog }>('/activity', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/activity/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// NOTIFICATIONS API
// ==========================================
export const notificationsApi = {
  getAll: () => request<{ success: boolean; data: NotificationItem[] }>('/notifications'),
  getById: (id: string) => request<{ success: boolean; data: NotificationItem }>(`/notifications/${id}`),
  create: (data: Omit<NotificationItem, 'id' | 'timestamp'>) =>
    request<{ success: boolean; data: NotificationItem }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<NotificationItem>) =>
    request<{ success: boolean; data: NotificationItem }>(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    }),
  markAsRead: (id: string) =>
    request<{ success: boolean; data: NotificationItem }>(`/notifications/${id}/read`, {
      method: 'POST',
    }),
  markAllAsRead: () =>
    request<{ success: boolean; message: string }>('/notifications/mark-all-read', {
      method: 'POST',
    }),
};

// ==========================================
// REPORTS API
// ==========================================
export const reportsApi = {
  getAll: () => request<{ success: boolean; data: ReportItem[] }>('/reports'),
  getById: (id: string) => request<{ success: boolean; data: ReportItem }>(`/reports/${id}`),
  create: (data: Omit<ReportItem, 'id' | 'generatedDate'>) =>
    request<{ success: boolean; data: ReportItem }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<ReportItem>) =>
    request<{ success: boolean; data: ReportItem }>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/reports/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// DASHBOARD API
// ==========================================
export const dashboardApi = {
  getStats: () => request<{ success: boolean; data: DashboardStats }>('/dashboard/stats'),
};
