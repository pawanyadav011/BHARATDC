export type ServerStatus = 'Available' | 'In Use' | 'Under Maintenance' | 'Not Working';

export interface DataCenter {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  address: string;
  totalRacks: number;
  totalServers: number;
  activeServers: number;
  powerCapacityKw: number;
  status: 'Active' | 'Planned' | 'Under Maintenance';
  manager: string;
  contactPhone: string;
}

export interface Rack {
  id: string;
  rackNumber: string;
  dataCenterId: string;
  dataCenterName: string;
  room: string;
  row: string;
  totalUnits: number; // e.g. 42
  usedUnits: number;
  maxPowerKw: number;
  currentPowerKw: number;
  status: 'Available' | 'Full' | 'Under Maintenance';
  temperatureC: number;
}

export interface Server {
  id: string;
  assetTag: string;
  hostname: string;
  serialNumber: string;
  dataCenterId: string;
  dataCenterName: string;
  rackId: string;
  rackNumber: string;
  unitPosition: string; // e.g., "U12 - U14"
  model: string;
  cpu: string;
  ramGb: number;
  storageTb: number;
  primaryIp: string;
  status: ServerStatus;
  allocatedClientId?: string;
  clientName?: string;
  purchaseDate: string;
  warrantyExpiry: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  contactPerson: string;
  billingType: 'Monthly' | 'Quarterly' | 'Annual';
  activeAllocationsCount: number;
  joinedDate: string;
  status: 'Active' | 'Suspended' | 'Pending';
  slaTier: 'Standard' | 'Premium' | 'Mission Critical';
}

export interface ServerAllocation {
  id: string;
  serverId: string;
  serverHostname: string;
  assetTag: string;
  clientId: string;
  clientName: string;
  dataCenterName: string;
  assignedDate: string;
  billingCycle: string;
  purpose: string;
  bandwidthQuotaTb: number;
  status: 'Active' | 'Pending Termination' | 'Terminated';
}

export interface MaintenanceRecord {
  id: string;
  ticketNumber: string;
  title: string;
  serverId?: string;
  serverHostname?: string;
  rackNumber?: string;
  dataCenterName: string;
  type: 'Preventive' | 'Hardware Replacement' | 'Firmware Update' | 'Emergency Repair';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  scheduledDate: string;
  technician: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes: string;
}

export type UserRole =
  | 'Super Admin'
  | 'Operations Manager'
  | 'Network Engineer'
  | 'Compliance Auditor'
  | 'Staff / Technician'
  | 'Staff'
  | 'Admin'
  | 'Facility Operator'
  | 'Technician'
  | 'Auditor'
  | 'Operator'
  | 'Viewer';

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: string;
  primaryContact: string;
  email: string;
  contactEmail?: string;
  phone: string;
  contactPhone?: string;
  activeCentersCount: number;
  activeDataCentersCount?: number;
  headquarters: string;
  registeredDate?: string;
  createdAt?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export interface User {
  id: string;
  fullName: string;
  name?: string;
  username?: string;
  email: string;
  role: UserRole;
  organization?: string;
  assignedDataCenter: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Invited';
  lastLogin: string;
  phone: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  user?: string;
  action: string;
  targetType: 'Server' | 'Rack' | 'Data Center' | 'Client' | 'Allocation' | 'Maintenance' | 'User';
  targetName: string;
  target?: string;
  dataCenterName?: string;
  ipAddress?: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'info' | 'warning' | 'critical';
  type?: 'info' | 'warning' | 'error' | 'success';
  category?: 'Maintenance' | 'Server' | 'Allocation' | 'Facility';
}

export interface ReportItem {
  id: string;
  title: string;
  type: string;
  period?: string;
  generatedDate?: string;
  generatedBy?: string;
  fileSize?: string;
  status?: 'Ready' | 'Generating' | string;
  description?: string;
}

export interface DashboardStats {
  totalServers: number;
  availableServers: number;
  serversInUse: number;
  serversUnderMaintenance: number;
  serversNotWorking: number;
  totalClients: number;
  totalDataCenters: number;
  totalRacks: number;
}
