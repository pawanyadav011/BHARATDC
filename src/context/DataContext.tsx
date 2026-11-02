import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  ServerStatus
} from '../types';
import { loadInitialData, storage } from '../services/storageService';
import { authService } from '../services/authService';
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
} from '../services/mockData';
import {
  dataCentersApi,
  racksApi,
  serversApi,
  clientsApi,
  allocationsApi,
  maintenanceApi,
  organizationsApi,
  usersApi,
  activityApi,
  notificationsApi,
  reportsApi,
  healthApi
} from '../services/apiService';

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface DataContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  dataCenters: DataCenter[];
  racks: Rack[];
  servers: Server[];
  clients: Client[];
  allocations: ServerAllocation[];
  maintenance: MaintenanceRecord[];
  organizations: Organization[];
  users: User[];
  activity: ActivityLog[];
  activities: ActivityLog[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  stats: DashboardStats;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
  removeToast: (id: string) => void;
  // Simulation switches for reviewers
  simulateLoading: boolean;
  setSimulateLoading: (val: boolean) => void;
  simulateError: boolean;
  setSimulateError: (val: boolean) => void;

  // Server actions
  addServer: (server: Omit<Server, 'id'>) => void;
  updateServer: (id: string, updates: Partial<Server>) => void;
  deleteServer: (id: string) => void;

  // Data Center actions
  addDataCenter: (dc: Omit<DataCenter, 'id'>) => void;
  updateDataCenter: (id: string, updates: Partial<DataCenter>) => void;
  deleteDataCenter: (id: string) => void;

  // Rack actions
  addRack: (rack: Omit<Rack, 'id'>) => void;
  updateRack: (id: string, updates: Partial<Rack>) => void;
  deleteRack: (id: string) => void;

  // Client actions
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Allocation actions (UX: "Remove Assignment" instead of Deallocate)
  allocateServer: (data: { serverId: string; clientId: string; purpose: string; bandwidthQuotaTb: number; billingCycle: string }) => boolean;
  removeAssignment: (allocationId: string) => void;

  // Maintenance actions (UX: "Start Maintenance")
  addMaintenance: (record: Omit<MaintenanceRecord, 'id' | 'ticketNumber' | 'status'>) => void;
  startMaintenance: (recordId: string) => void;
  completeMaintenance: (recordId: string) => void;
  cancelMaintenance: (recordId: string) => void;

  // Organization actions
  addOrganization: (org: Omit<Organization, 'id'>) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;

  // User actions
  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Report actions
  generateReport: (title: string, type: ReportItem['type'], period: string) => void;

  // Global reset
  resetDemoData: () => void;
  resetToMockData: () => void;

  // Real backend loading & error flags
  isLoadingData: boolean;
  dataError: string | null;
  refetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadInitialData();

  const [users, setUsers] = useState<User[]>(initial.users);
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser() || initial.users[0] || null);
  const [dataCenters, setDataCenters] = useState<DataCenter[]>(initial.dataCenters);
  const [racks, setRacks] = useState<Rack[]>(initial.racks);
  const [servers, setServers] = useState<Server[]>(initial.servers);
  const [clients, setClients] = useState<Client[]>(initial.clients);
  const [allocations, setAllocations] = useState<ServerAllocation[]>(initial.allocations);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(initial.maintenance);
  const [organizations, setOrganizations] = useState<Organization[]>(initial.organizations);
  const [activity, setActivity] = useState<ActivityLog[]>(initial.activity);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initial.notifications);
  const [reports, setReports] = useState<ReportItem[]>(initial.reports);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [simulateLoading, setSimulateLoading] = useState<boolean>(false);
  const [simulateError, setSimulateError] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const refetchData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const health = await healthApi.check();
      if (!health) return;

      const [
        dcRes,
        racksRes,
        srvRes,
        cliRes,
        allocRes,
        mntRes,
        orgRes,
        usrRes,
        actRes,
        notifRes,
        repRes
      ] = await Promise.allSettled([
        dataCentersApi.getAll(),
        racksApi.getAll(),
        serversApi.getAll(),
        clientsApi.getAll(),
        allocationsApi.getAll(),
        maintenanceApi.getAll(),
        organizationsApi.getAll(),
        usersApi.getAll(),
        activityApi.getAll(),
        notificationsApi.getAll(),
        reportsApi.getAll(),
      ]);

      if (dcRes.status === 'fulfilled' && Array.isArray(dcRes.value.data)) {
        setDataCenters(dcRes.value.data.map((dc: any) => ({
          ...dc,
          name: dc.name || 'Facility Site',
          code: dc.code || 'DC-00',
          city: dc.city || 'India',
          state: dc.state || 'State',
          country: dc.country || 'India',
          address: dc.address || '',
          manager: dc.manager || 'Facility Director',
          contactPhone: dc.contactPhone || '+91 22 4000 1100',
          totalRacks: Number(dc.totalRacks ?? 30),
          totalServers: Number(dc.totalServers ?? 240),
          activeServers: Number(dc.activeServers ?? 150),
          powerCapacityKw: Number(dc.powerCapacityKw ?? 1500),
          status: dc.status || 'Active'
        })));
      }
      if (racksRes.status === 'fulfilled' && Array.isArray(racksRes.value.data)) {
        setRacks(racksRes.value.data.map((r: any) => ({
          ...r,
          rackNumber: r.rackNumber || 'RACK-00',
          dataCenterName: r.dataCenterName || 'Primary Facility',
          room: r.room || r.roomNumber || 'Server Hall 1',
          row: r.row || r.rowNumber || 'Row A',
          totalUnits: Number(r.totalUnits ?? 42),
          usedUnits: Number(r.usedUnits ?? 12),
          maxPowerKw: Number(r.maxPowerKw ?? 15),
          currentPowerKw: Number(r.currentPowerKw ?? r.powerKw ?? 4.5),
          temperatureC: Number(r.temperatureC ?? r.temperatureCelsius ?? 21.0),
          status: r.status || 'Available'
        })));
      }
      if (srvRes.status === 'fulfilled' && Array.isArray(srvRes.value.data)) {
        setServers(srvRes.value.data.map((s: any) => ({
          ...s,
          assetTag: s.assetTag || 'BDC-SRV-000',
          hostname: s.hostname || 'server.bharatdc.net',
          primaryIp: s.primaryIp || s.ipAddress || '10.10.10.10',
          model: s.model || 'Enterprise Server',
          cpu: s.cpu || s.cpuModel || 'Intel Xeon',
          ramGb: Number(s.ramGb ?? 64),
          storageTb: Number(s.storageTb ?? 16),
          status: s.status || 'Available'
        })));
      }
      if (cliRes.status === 'fulfilled' && Array.isArray(cliRes.value.data)) {
        setClients(cliRes.value.data.map((c: any) => ({
          ...c,
          name: c.name || 'Enterprise Client',
          organization: c.organization || 'General Organization',
          contactPerson: c.contactPerson || 'Client Lead',
          email: c.email || 'client@example.com',
          phone: c.phone || '+91 00 0000 0000',
          billingType: c.billingType || 'Monthly',
          slaTier: c.slaTier || 'Standard',
          status: c.status || 'Active',
          activeAllocationsCount: Number(c.activeAllocationsCount ?? 0)
        })));
      }
      if (allocRes.status === 'fulfilled' && Array.isArray(allocRes.value.data)) {
        setAllocations(allocRes.value.data.map((a: any) => ({
          ...a,
          serverHostname: a.serverHostname || 'server.bharatdc.net',
          assetTag: a.assetTag || 'BDC-SRV-000',
          clientName: a.clientName || 'Client',
          dataCenterName: a.dataCenterName || 'Primary Facility',
          purpose: a.purpose || 'Production Workload',
          billingCycle: a.billingCycle || 'Monthly',
          bandwidthQuotaTb: Number(a.bandwidthQuotaTb ?? 50),
          status: a.status || 'Active'
        })));
      }
      if (mntRes.status === 'fulfilled' && Array.isArray(mntRes.value.data)) {
        setMaintenance(mntRes.value.data.map((m: any) => ({
          ...m,
          ticketNumber: m.ticketNumber || 'MNT-2026-000',
          title: m.title || 'Scheduled Maintenance',
          dataCenterName: m.dataCenterName || 'Primary Facility',
          technician: m.technician || 'Technician',
          scheduledDate: m.scheduledDate || m.scheduledStart || '2026-09-25 10:00 IST',
          notes: m.notes || m.reason || '',
          type: m.type || 'Preventive',
          priority: m.priority || 'Medium',
          status: m.status || 'Scheduled'
        })));
      }
      if (orgRes.status === 'fulfilled' && Array.isArray(orgRes.value.data)) {
        setOrganizations(orgRes.value.data.map((o: any) => ({
          ...o,
          name: o.name || 'Organization',
          code: o.code || 'ORG',
          headquarters: o.headquarters || 'India',
          primaryContact: o.primaryContact || 'Lead',
          activeCentersCount: Number(o.activeCentersCount ?? o.activeDataCentersCount ?? 1),
          status: o.status || 'Active'
        })));
      }
      if (usrRes.status === 'fulfilled' && Array.isArray(usrRes.value.data)) {
        setUsers(usrRes.value.data.map((u: any) => ({
          ...u,
          fullName: u.fullName || u.name || 'User',
          email: u.email || 'user@bharatdc.in',
          role: u.role || 'Staff',
          assignedDataCenter: u.assignedDataCenter || 'All Facilities',
          status: u.status || 'Active'
        })));
      }
      if (actRes.status === 'fulfilled' && Array.isArray(actRes.value.data)) setActivity(actRes.value.data);
      if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value.data)) setNotifications(notifRes.value.data);
      if (repRes.status === 'fulfilled' && Array.isArray(repRes.value.data)) setReports(repRes.value.data);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to refresh data from server');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initial Fetch from Backend API with Fallback
  useEffect(() => {
    refetchData();
  }, [refetchData]);

  // Refetch fresh data whenever an authenticated user signs in
  useEffect(() => {
    if (currentUser) {
      refetchData();
    }
  }, [currentUser, refetchData]);

  // Sync to local storage
  useEffect(() => { storage.set('dataCenters', dataCenters); }, [dataCenters]);
  useEffect(() => { storage.set('racks', racks); }, [racks]);
  useEffect(() => { storage.set('servers', servers); }, [servers]);
  useEffect(() => { storage.set('clients', clients); }, [clients]);
  useEffect(() => { storage.set('allocations', allocations); }, [allocations]);
  useEffect(() => { storage.set('maintenance', maintenance); }, [maintenance]);
  useEffect(() => { storage.set('organizations', organizations); }, [organizations]);
  useEffect(() => { storage.set('users', users); }, [users]);
  useEffect(() => { storage.set('activity', activity); }, [activity]);
  useEffect(() => { storage.set('notifications', notifications); }, [notifications]);
  useEffect(() => { storage.set('reports', reports); }, [reports]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const logActivity = useCallback((action: string, targetType: ActivityLog['targetType'], targetName: string, details: string) => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now(),
      timestamp: 'Just now',
      userName: 'Rajesh Verma',
      action,
      targetType,
      targetName,
      details
    };
    setActivity(prev => [newLog, ...prev]);
    activityApi.create({
      userName: newLog.userName,
      action: newLog.action,
      targetType: newLog.targetType,
      targetName: newLog.targetName,
      details: newLog.details,
    }).catch(() => { });
  }, []);

  // Server management
  const addServer = useCallback(async (serverData: Omit<Server, 'id'>) => {
    const tempId = 'srv-' + Date.now();
    const newServer: Server = { ...serverData, id: tempId };
    setServers(prev => [newServer, ...prev]);
    logActivity('Add Server', 'Server', newServer.assetTag, `Created server ${newServer.hostname} with status ${newServer.status}`);
    showToast(`Server ${newServer.assetTag} added successfully.`);

    try {
      const res = await serversApi.create(serverData);
      if (res?.data) {
        setServers(prev => prev.map(s => s.id === tempId ? res.data : s));
      }
    } catch {
      // Retain optimistic server in state
    }
  }, [logActivity, showToast]);

  const updateServer = useCallback(async (id: string, updates: Partial<Server>) => {
    setServers(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    const target = servers.find(s => s.id === id);
    if (target) {
      logActivity('Server Updated', 'Server', target.assetTag, `Updated details for ${target.hostname}`);
      showToast(`Server ${target.assetTag} updated successfully.`);
    }

    try {
      await serversApi.update(id, updates);
    } catch {
      // Kept in optimistic state
    }
  }, [servers, logActivity, showToast]);

  const deleteServer = useCallback(async (id: string) => {
    const target = servers.find(s => s.id === id);
    setServers(prev => prev.filter(s => s.id !== id));
    setAllocations(prev => prev.filter(a => a.serverId !== id));
    if (target) {
      logActivity('Server Deleted', 'Server', target.assetTag, `Removed server ${target.hostname} from inventory`);
      showToast(`Server ${target.assetTag} deleted permanently.`);
    }

    try {
      await serversApi.delete(id);
    } catch {
      // Kept in optimistic state
    }
  }, [servers, logActivity, showToast]);

  // Data Center management
  const addDataCenter = useCallback(async (dcData: Omit<DataCenter, 'id'>) => {
    const tempId = 'dc-' + Date.now();
    const newDc: DataCenter = { ...dcData, id: tempId };
    setDataCenters(prev => [newDc, ...prev]);
    logActivity('Add Data Center', 'Data Center', newDc.name, `Added facility in ${newDc.city}`);
    showToast(`Data Center ${newDc.name} added successfully.`);

    try {
      const res = await dataCentersApi.create(dcData);
      if (res?.data) {
        setDataCenters(prev => prev.map(d => d.id === tempId ? res.data : d));
      }
    } catch {
      // Fallback in optimistic state
    }
  }, [logActivity, showToast]);

  const updateDataCenter = useCallback(async (id: string, updates: Partial<DataCenter>) => {
    setDataCenters(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    const target = dataCenters.find(d => d.id === id);
    if (target) {
      showToast(`Data Center ${target.name} updated.`);
    }

    try {
      await dataCentersApi.update(id, updates);
    } catch {
      // Handled
    }
  }, [dataCenters, showToast]);

  const deleteDataCenter = useCallback(async (id: string) => {
    const target = dataCenters.find(d => d.id === id);
    setDataCenters(prev => prev.filter(d => d.id !== id));
    if (target) {
      logActivity('Data Center Removed', 'Data Center', target.name, `Removed facility ${target.name}`);
      showToast(`Data Center ${target.name} removed.`);
    }

    try {
      await dataCentersApi.delete(id);
    } catch {
      // Handled
    }
  }, [dataCenters, logActivity, showToast]);

  // Rack management
  const addRack = useCallback(async (rackData: Omit<Rack, 'id'>) => {
    const tempId = 'rack-' + Date.now();
    const newRack: Rack = { ...rackData, id: tempId };
    setRacks(prev => [newRack, ...prev]);
    logActivity('Add Rack', 'Rack', newRack.rackNumber, `Commissioned in ${newRack.dataCenterName}`);
    showToast(`Rack ${newRack.rackNumber} added.`);

    try {
      const res = await racksApi.create(rackData);
      if (res?.data) {
        setRacks(prev => prev.map(r => r.id === tempId ? res.data : r));
      }
    } catch {
      // Handled
    }
  }, [logActivity, showToast]);

  const updateRack = useCallback(async (id: string, updates: Partial<Rack>) => {
    setRacks(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    showToast('Rack updated successfully.');

    try {
      await racksApi.update(id, updates);
    } catch {
      // Handled
    }
  }, [showToast]);

  const deleteRack = useCallback(async (id: string) => {
    const target = racks.find(r => r.id === id);
    setRacks(prev => prev.filter(r => r.id !== id));
    if (target) {
      logActivity('Rack Deleted', 'Rack', target.rackNumber, `Removed from ${target.dataCenterName}`);
      showToast(`Rack ${target.rackNumber} deleted.`);
    }

    try {
      await racksApi.delete(id);
    } catch {
      // Handled
    }
  }, [racks, logActivity, showToast]);

  // Client management
  const addClient = useCallback(async (clientData: Omit<Client, 'id'>) => {
    const tempId = 'client-' + Date.now();
    const newClient: Client = { ...clientData, id: tempId };
    setClients(prev => [newClient, ...prev]);
    logActivity('Add Client', 'Client', newClient.name, `Registered client under ${newClient.organization}`);
    showToast(`Client ${newClient.name} added successfully.`);

    try {
      const res = await clientsApi.create(clientData);
      if (res?.data) {
        setClients(prev => prev.map(c => c.id === tempId ? res.data : c));
      }
    } catch {
      // Handled
    }
  }, [logActivity, showToast]);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Client details updated.');

    try {
      await clientsApi.update(id, updates);
    } catch {
      // Handled
    }
  }, [showToast]);

  const deleteClient = useCallback(async (id: string) => {
    const target = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    if (target) {
      logActivity('Client Removed', 'Client', target.name, `Archived client account`);
      showToast(`Client ${target.name} removed.`);
    }

    try {
      await clientsApi.delete(id);
    } catch {
      // Handled
    }
  }, [clients, logActivity, showToast]);

  // Allocation management: allocateServer & removeAssignment
  const allocateServer = useCallback((data: { serverId: string; clientId: string; purpose: string; bandwidthQuotaTb: number; billingCycle: string }) => {
    const server = servers.find(s => s.id === data.serverId);
    const client = clients.find(c => c.id === data.clientId);
    if (!server || !client) return false;

    const tempId = 'alloc-' + Date.now();
    const newAlloc: ServerAllocation = {
      id: tempId,
      serverId: server.id,
      serverHostname: server.hostname,
      assetTag: server.assetTag,
      clientId: client.id,
      clientName: client.name,
      dataCenterName: server.dataCenterName,
      assignedDate: new Date().toISOString().split('T')[0],
      billingCycle: data.billingCycle,
      purpose: data.purpose,
      bandwidthQuotaTb: data.bandwidthQuotaTb,
      status: 'Active'
    };

    setAllocations(prev => [newAlloc, ...prev]);
    // Update server status to 'In Use'
    setServers(prev => prev.map(s => (s.id === server.id ? { ...s, status: 'In Use' as ServerStatus, allocatedClientId: client.id, clientName: client.name } : s)));
    // Update client count
    setClients(prev => prev.map(c => (c.id === client.id ? { ...c, activeAllocationsCount: c.activeAllocationsCount + 1 } : c)));

    logActivity('Server Allocated', 'Allocation', server.assetTag, `Assigned to ${client.name} for ${data.purpose}`);
    showToast(`Server ${server.assetTag} assigned to ${client.name}.`);

    // Asynchronously call allocations API
    allocationsApi.create({
      serverId: data.serverId,
      serverHostname: server.hostname,
      assetTag: server.assetTag,
      clientId: data.clientId,
      clientName: client.name,
      dataCenterName: server.dataCenterName,
      purpose: data.purpose,
      bandwidthQuotaTb: data.bandwidthQuotaTb,
      billingCycle: data.billingCycle,
    }).then(res => {
      if (res?.data) {
        setAllocations(prev => prev.map(a => a.id === tempId ? res.data : a));
      }
    }).catch(() => { });

    return true;
  }, [servers, clients, logActivity, showToast]);

  const removeAssignment = useCallback((allocationId: string) => {
    const alloc = allocations.find(a => a.id === allocationId);
    if (!alloc) return;

    setAllocations(prev => prev.filter(a => a.id !== allocationId));
    // Reset server status to 'Available'
    setServers(prev => prev.map(s => (s.id === alloc.serverId ? { ...s, status: 'Available' as ServerStatus, allocatedClientId: undefined, clientName: undefined } : s)));
    // Decrement client count
    setClients(prev => prev.map(c => (c.id === alloc.clientId ? { ...c, activeAllocationsCount: Math.max(0, c.activeAllocationsCount - 1) } : c)));

    logActivity('Remove Assignment', 'Allocation', alloc.assetTag, `Unlinked from client ${alloc.clientName}`);
    showToast(`Assignment removed for ${alloc.assetTag}. Server is now Available.`);

    allocationsApi.delete(allocationId).catch(() => { });
  }, [allocations, logActivity, showToast]);

  // Maintenance management
  const addMaintenance = useCallback(async (recordData: Omit<MaintenanceRecord, 'id' | 'ticketNumber' | 'status'>) => {
    const tempId = 'maint-' + Date.now();
    const ticketNumber = `MNT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: tempId,
      ticketNumber,
      status: 'Scheduled'
    };

    setMaintenance(prev => [newRecord, ...prev]);
    logActivity('Maintenance Scheduled', 'Maintenance', ticketNumber, `${newRecord.title} at ${newRecord.dataCenterName}`);
    showToast(`Maintenance ticket ${ticketNumber} created.`);

    try {
      const res = await maintenanceApi.create(recordData);
      if (res?.data) {
        setMaintenance(prev => prev.map(m => m.id === tempId ? res.data : m));
      }
    } catch {
      // Handled
    }
  }, [logActivity, showToast]);

  const startMaintenance = useCallback((recordId: string) => {
    const record = maintenance.find(m => m.id === recordId);
    if (!record) return;

    setMaintenance(prev => prev.map(m => (m.id === recordId ? { ...m, status: 'In Progress' } : m)));

    if (record.serverId) {
      setServers(prev => prev.map(s => (s.id === record.serverId ? { ...s, status: 'Under Maintenance' as ServerStatus } : s)));
    }

    logActivity('Start Maintenance', 'Maintenance', record.ticketNumber, `Technician ${record.technician} started work.`);
    showToast(`Maintenance started for ${record.ticketNumber}.`);

    maintenanceApi.start(recordId).catch(() => { });
  }, [maintenance, logActivity, showToast]);

  const completeMaintenance = useCallback((recordId: string) => {
    const record = maintenance.find(m => m.id === recordId);
    if (!record) return;

    setMaintenance(prev => prev.map(m => (m.id === recordId ? { ...m, status: 'Completed' } : m)));

    if (record.serverId) {
      setServers(prev => prev.map(s => {
        if (s.id === record.serverId) {
          const restoredStatus: ServerStatus = s.allocatedClientId ? 'In Use' : 'Available';
          return { ...s, status: restoredStatus };
        }
        return s;
      }));
    }

    logActivity('Maintenance Completed', 'Maintenance', record.ticketNumber, `Ticket resolved and closed.`);
    showToast(`Maintenance ticket ${record.ticketNumber} marked as completed.`);

    maintenanceApi.complete(recordId).catch(() => { });
  }, [maintenance, logActivity, showToast]);

  const cancelMaintenance = useCallback((recordId: string) => {
    const record = maintenance.find(m => m.id === recordId);
    if (!record) return;

    setMaintenance(prev => prev.map(m => (m.id === recordId ? { ...m, status: 'Cancelled' } : m)));

    if (record.serverId && record.status === 'In Progress') {
      setServers(prev => prev.map(s => {
        if (s.id === record.serverId) {
          const restoredStatus: ServerStatus = s.allocatedClientId ? 'In Use' : 'Available';
          return { ...s, status: restoredStatus };
        }
        return s;
      }));
    }

    showToast(`Maintenance ticket ${record.ticketNumber} cancelled.`);

    maintenanceApi.cancel(recordId).catch(() => { });
  }, [maintenance, showToast]);

  // Organization management
  const addOrganization = useCallback(async (orgData: Omit<Organization, 'id'>) => {
    const tempId = 'org-' + Date.now();
    const newOrg: Organization = { ...orgData, id: tempId };
    setOrganizations(prev => [newOrg, ...prev]);
    logActivity('Add Organization', 'Data Center', newOrg.name, `New partner org created`);
    showToast(`Organization ${newOrg.name} added.`);

    try {
      const res = await organizationsApi.create(orgData);
      if (res?.data) {
        setOrganizations(prev => prev.map(o => o.id === tempId ? res.data : o));
      }
    } catch {
      // Handled
    }
  }, [logActivity, showToast]);

  const updateOrganization = useCallback(async (id: string, updates: Partial<Organization>) => {
    setOrganizations(prev => prev.map(o => (o.id === id ? { ...o, ...updates } : o)));
    showToast('Organization updated.');

    try {
      await organizationsApi.update(id, updates);
    } catch {
      // Handled
    }
  }, [showToast]);

  const deleteOrganization = useCallback(async (id: string) => {
    const target = organizations.find(o => o.id === id);
    setOrganizations(prev => prev.filter(o => o.id !== id));
    if (target) {
      showToast(`Organization ${target.name} removed.`);
    }

    try {
      await organizationsApi.delete(id);
    } catch {
      // Handled
    }
  }, [organizations, showToast]);

  // User management
  const addUser = useCallback(async (userData: Omit<User, 'id' | 'lastLogin'>) => {
    const tempId = 'usr-' + Date.now();
    const newUser: User = { ...userData, id: tempId, lastLogin: 'Never' };
    setUsers(prev => [newUser, ...prev]);
    logActivity('User Added', 'User', newUser.fullName, `Created ${newUser.role} account`);
    showToast(`User ${newUser.fullName} added successfully.`);

    try {
      const res = await usersApi.create(userData);
      if (res?.data) {
        setUsers(prev => prev.map(u => u.id === tempId ? res.data : u));
      }
    } catch {
      // Handled
    }
  }, [logActivity, showToast]);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    showToast('User profile updated.');

    try {
      await usersApi.update(id, updates);
    } catch {
      // Handled
    }
  }, [showToast]);

  const deleteUser = useCallback(async (id: string) => {
    const target = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (target) {
      logActivity('User Deleted', 'User', target.fullName, `Revoked system access`);
      showToast(`User ${target.fullName} deleted.`);
    }

    try {
      await usersApi.delete(id);
    } catch {
      // Handled
    }
  }, [users, logActivity, showToast]);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    notificationsApi.markAsRead(id).catch(() => { });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
    notificationsApi.markAllAsRead().catch(() => { });
  }, [showToast]);

  // Reports
  const generateReport = useCallback(async (title: string, type: ReportItem['type'], period: string) => {
    const tempId = 'rep-' + Date.now();
    const newReport: ReportItem = {
      id: tempId,
      title,
      type,
      period,
      generatedDate: new Date().toISOString().split('T')[0],
      generatedBy: 'Rajesh Verma',
      fileSize: '1.2 MB',
      status: 'Ready'
    };
    setReports(prev => [newReport, ...prev]);
    logActivity('Generate Report', 'Server', title, `Created ${type} report for ${period}`);
    showToast(`Report "${title}" generated successfully.`);

    try {
      const res = await reportsApi.create({
        title,
        type,
        period,
        generatedBy: 'Rajesh Verma',
        fileSize: '1.2 MB',
        status: 'Ready'
      });
      if (res?.data) {
        setReports(prev => prev.map(r => r.id === tempId ? res.data : r));
      }
    } catch {
      // Handled
    }
  }, [logActivity, showToast]);

  // Global reset
  const resetDemoData = useCallback(() => {
    storage.resetAll();
    setDataCenters(INITIAL_DATA_CENTERS);
    setRacks(INITIAL_RACKS);
    setServers(INITIAL_SERVERS);
    setClients(INITIAL_CLIENTS);
    setAllocations(INITIAL_ALLOCATIONS);
    setMaintenance(INITIAL_MAINTENANCE);
    setOrganizations(INITIAL_ORGANIZATIONS);
    setUsers(INITIAL_USERS);
    setActivity(INITIAL_ACTIVITY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReports(INITIAL_REPORTS);
    setSimulateLoading(false);
    setSimulateError(false);
    showToast('Application data reset to clean initial state.');
  }, [showToast]);

  // Calculated stats for dashboard
  const stats: DashboardStats = {
    totalServers: servers.length,
    availableServers: servers.filter(s => s.status === 'Available').length,
    serversInUse: servers.filter(s => s.status === 'In Use').length,
    serversUnderMaintenance: servers.filter(s => s.status === 'Under Maintenance').length,
    serversNotWorking: servers.filter(s => s.status === 'Not Working').length,
    totalClients: clients.length,
    totalDataCenters: dataCenters.length,
    totalRacks: racks.length,
  };

  return (
    <DataContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        dataCenters,
        racks,
        servers,
        clients,
        allocations,
        maintenance,
        organizations,
        users,
        activity,
        activities: activity,
        notifications,
        reports,
        stats,
        toasts,
        showToast,
        dismissToast,
        removeToast: dismissToast,
        simulateLoading,
        setSimulateLoading,
        simulateError,
        setSimulateError,
        addServer,
        updateServer,
        deleteServer,
        addDataCenter,
        updateDataCenter,
        deleteDataCenter,
        addRack,
        updateRack,
        deleteRack,
        addClient,
        updateClient,
        deleteClient,
        allocateServer,
        removeAssignment,
        addMaintenance,
        startMaintenance,
        completeMaintenance,
        cancelMaintenance,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        addUser,
        updateUser,
        deleteUser,
        markNotificationRead,
        markAllNotificationsRead,
        generateReport,
        resetDemoData,
        resetToMockData: resetDemoData,
        isLoadingData,
        dataError,
        refetchData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataCenter = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataCenter must be used within a DataProvider');
  }
  return context;
};
