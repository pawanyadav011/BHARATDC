import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Server,
  HardDrive,
  Users,
  Building2,
  CheckCircle2,
  Wrench,
  ArrowUpRight,
  Plus,
  Cpu,
  Activity,
  Zap,
  Layers,
  History,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Building,
  Bell,
  Eye,
  Briefcase
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { APP_ROLES, normalizeRole } from '../utils/rbac';

export const Dashboard: React.FC = () => {
  const {
    stats,
    dataCenters,
    racks,
    servers,
    clients,
    allocations,
    maintenance,
    organizations,
    users,
    activity,
    notifications,
    reports,
    currentUser,
    startMaintenance,
    isLoadingData,
    simulateLoading,
    dataError,
    simulateError,
    refetchData
  } = useDataCenter();

  const userRole = normalizeRole(currentUser?.role);

  const upcomingMaintenance = maintenance
    .filter(m => m.status === 'Scheduled' || m.status === 'In Progress')
    .slice(0, 4);

  const recentAllocations = allocations.slice(0, 5);
  const recentActivities = (activity || []).slice(0, 5);
  const unreadNotifications = (notifications || []).filter(n => !n.read).slice(0, 4);

  const totalServersCount = Math.max(1, stats?.totalServers ?? servers.length ?? 1);
  const inUsePercent = Math.round(((stats?.serversInUse ?? 0) / totalServersCount) * 100);
  const availablePercent = Math.round(((stats?.availableServers ?? 0) / totalServersCount) * 100);
  const maintenancePercent = Math.round(((stats?.serversUnderMaintenance ?? 0) / totalServersCount) * 100);
  const notWorkingPercent = Math.round(((stats?.serversNotWorking ?? 0) / totalServersCount) * 100);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  if (isLoadingData || simulateLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" rows={6} />
        <LoadingSkeleton type="table" rows={6} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // Header Banner Content Per Role
  // -------------------------------------------------------------
  const getBannerInfo = () => {
    switch (userRole) {
      case APP_ROLES.SUPER_ADMIN:
        return {
          title: 'System Overview',
          subtitle: `Managing ${stats.totalServers} servers across ${stats.totalDataCenters} data centers, ${organizations.length} organizations, and ${users.length} users.`,
          badge: 'Super Admin',
        };
      case APP_ROLES.OPERATIONS_MANAGER:
        return {
          title: 'Operations Dashboard',
          subtitle: `Managing ${clients.length} clients, server allocations, and maintenance across ${stats.totalDataCenters} data centers.`,
          badge: 'Operations Manager',
        };
      case APP_ROLES.NETWORK_ENGINEER:
        return {
          title: 'Infrastructure Overview',
          subtitle: `Monitoring ${stats.totalRacks} racks and ${stats.totalServers} servers across ${stats.totalDataCenters} data centers.`,
          badge: 'Network Engineer',
        };
      case APP_ROLES.COMPLIANCE_AUDITOR:
        return {
          title: 'Audit & Compliance Dashboard',
          subtitle: `Auditing ${activity.length} activity logs and ${reports.length} reports across all data centers.`,
          badge: 'Compliance Auditor',
        };
      case APP_ROLES.STAFF:
      default:
        return {
          title: 'Staff Work Center',
          subtitle: 'Viewing assigned servers, maintenance tasks, and notifications.',
          badge: 'Staff',
        };
    }
  };

  const banner = getBannerInfo();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Data Error Notice */}
      {(dataError || simulateError) && (
        <ErrorBanner
          message={dataError || 'Connection error. Click retry to refresh.'}
          onRetry={refetchData}
        />
      )}

      {/* 1. Header Banner */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-[#101C30] border border-[rgba(148,163,184,0.16)] rounded-xl shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">
              {banner.title}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {banner.badge}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">{banner.subtitle}</p>
        </div>

        {/* Real Status Pills & Role-Specific Top Actions */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-[#0A1424] border border-[rgba(148,163,184,0.12)] rounded-lg text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{stats.totalDataCenters} Facilities</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>{stats.totalServers} Servers</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <span>Supabase Connected</span>
            </div>
          </div>

          {/* Quick jump based on role */}
          {userRole === APP_ROLES.SUPER_ADMIN && (
            <Link
              to="/users"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Add User</span>
            </Link>
          )}

          {userRole === APP_ROLES.OPERATIONS_MANAGER && (
            <Link
              to="/server-allocation"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Allocate Server</span>
            </Link>
          )}

          {userRole === APP_ROLES.NETWORK_ENGINEER && (
            <Link
              to="/servers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Add Server</span>
            </Link>
          )}

          {userRole === APP_ROLES.COMPLIANCE_AUDITOR && (
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Reports</span>
            </Link>
          )}

          {userRole === APP_ROLES.STAFF && (
            <Link
              to="/maintenance"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>View Tasks</span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Empty State Check */}
      {stats.totalServers === 0 && stats.totalDataCenters === 0 ? (
        <EmptyState
          title="No Data Center Infrastructure Configured"
          description="Get started by onboarding your first data center facility or synchronizing with your Supabase database."
          actionText="Add Data Center"
          onAction={() => window.location.assign('/data-centers')}
          secondaryActionText="Refresh Data"
          onSecondaryAction={refetchData}
        />
      ) : (
        <>
          {/* ========================================================= */}
          {/* 2. ROLE SPECIFIC KPI CARDS                                */}
          {/* ========================================================= */}

          {/* SUPER ADMIN KPI CARDS */}
          {userRole === APP_ROLES.SUPER_ADMIN && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4"
            >
              <div className="p-3.5 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#94A3B8]">Organizations</span>
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="mt-2 text-xl font-bold text-[#F8FAFC]">{organizations.length}</div>
                <div className="mt-1 text-[10px] text-emerald-400 font-mono">Active</div>
              </div>

              <div className="p-3.5 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#94A3B8]">Total Users</span>
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="mt-2 text-xl font-bold text-[#F8FAFC]">{users.length}</div>
                <div className="mt-1 text-[10px] text-blue-400 font-mono">Personnel</div>
              </div>

              <div className="p-3.5 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#94A3B8]">Data Centers</span>
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="mt-2 text-xl font-bold text-[#F8FAFC]">{stats.totalDataCenters}</div>
                <div className="mt-1 text-[10px] text-emerald-400 font-mono">100% Online</div>
              </div>

              <div className="p-3.5 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#94A3B8]">Total Servers</span>
                  <Server className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="mt-2 text-xl font-bold text-[#F8FAFC]">{stats.totalServers}</div>
                <div className="mt-1 text-[10px] text-blue-400 font-mono">Inventory</div>
              </div>

              <div className="p-3.5 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-400">Available</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="mt-2 text-xl font-bold text-emerald-400">{stats.availableServers}</div>
                <div className="mt-1 text-[10px] text-emerald-400 font-mono">{availablePercent}% Free</div>
              </div>

              <div className="p-3.5 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-blue-400">In Use</span>
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="mt-2 text-xl font-bold text-blue-400">{stats.serversInUse}</div>
                <div className="mt-1 text-[10px] text-blue-400 font-mono">{inUsePercent}% Active</div>
              </div>

              <div className="p-3.5 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-amber-400">Maintenance</span>
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="mt-2 text-xl font-bold text-amber-400">{stats.serversUnderMaintenance}</div>
                <div className="mt-1 text-[10px] text-amber-400 font-mono">In Progress</div>
              </div>

              <div className="p-3.5 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-purple-400">Total Clients</span>
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="mt-2 text-xl font-bold text-purple-400">{stats.totalClients}</div>
                <div className="mt-1 text-[10px] text-purple-400 font-mono">Subscribers</div>
              </div>
            </motion.div>
          )}

          {/* OPERATIONS MANAGER KPI CARDS */}
          {userRole === APP_ROLES.OPERATIONS_MANAGER && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
            >
              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#94A3B8]">Active Clients</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-[#F8FAFC]">{clients.length}</div>
                <div className="mt-1 text-[10px] text-emerald-400 font-mono">Subscribed Accounts</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#94A3B8]">Data Centers</span>
                  <Building2 className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-[#F8FAFC]">{stats.totalDataCenters}</div>
                <div className="mt-1 text-[10px] text-emerald-400 font-mono">100% Operational</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400">Available Servers</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-400">{stats.availableServers}</div>
                <div className="mt-1 text-[10px] text-emerald-400 font-mono">{availablePercent}% Ready</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-400">Server Allocations</span>
                  <Cpu className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-400">{allocations.length}</div>
                <div className="mt-1 text-[10px] text-blue-400 font-mono">Active Leases</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-400">Maintenance</span>
                  <Wrench className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-amber-400">{stats.serversUnderMaintenance}</div>
                <div className="mt-1 text-[10px] text-amber-400 font-mono">Work Orders</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-400">Total Servers</span>
                  <Server className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-purple-400">{stats.totalServers}</div>
                <div className="mt-1 text-[10px] text-purple-400 font-mono">{stats.serversInUse} in use • {stats.availableServers} free</div>
              </div>
            </motion.div>
          )}

          {/* NETWORK ENGINEER KPI CARDS */}
          {userRole === APP_ROLES.NETWORK_ENGINEER && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
            >
              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-400">Total Servers</span>
                  <Server className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-[#F8FAFC]">{stats.totalServers}</div>
                <div className="mt-1 text-[10px] text-blue-400 font-mono">In Inventory</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-cyan-400">Data Centers</span>
                  <Building2 className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-cyan-400">{stats.totalDataCenters}</div>
                <div className="mt-1 text-[10px] text-emerald-400 font-mono">Active Facilities</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-indigo-400">Total Racks</span>
                  <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-[#F8FAFC]">{stats.totalRacks} Racks</div>
                <div className="mt-1 text-[10px] text-indigo-400 font-mono">Configured</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400">Available</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-400">{stats.availableServers}</div>
                <div className="mt-1 text-[10px] text-emerald-400 font-mono">{availablePercent}% Available</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-400">In Use</span>
                  <HardDrive className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-400">{stats.serversInUse}</div>
                <div className="mt-1 text-[10px] text-blue-400 font-mono">{inUsePercent}% Allocated</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-400">Maintenance</span>
                  <Wrench className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-amber-400">{stats.serversUnderMaintenance}</div>
                <div className="mt-1 text-[10px] text-amber-400 font-mono">Under Service</div>
              </div>
            </motion.div>
          )}

          {/* COMPLIANCE AUDITOR KPI CARDS */}
          {userRole === APP_ROLES.COMPLIANCE_AUDITOR && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
            >
              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#94A3B8]">Activity Logs</span>
                  <History className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-[#F8FAFC]">{activity.length}</div>
                <div className="mt-1 text-[10px] text-blue-400 font-mono">Total Recorded</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-indigo-400">Organizations</span>
                  <Building className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-[#F8FAFC]">{organizations.length}</div>
                <div className="mt-1 text-[10px] text-indigo-400 font-mono">Registered</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-cyan-400">Reports</span>
                  <FileText className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-cyan-400">{reports.length}</div>
                <div className="mt-1 text-[10px] text-cyan-400 font-mono">Generated</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-400">Users</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-purple-400">{users.length}</div>
                <div className="mt-1 text-[10px] text-purple-400 font-mono">System Accounts</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400">Data Centers</span>
                  <Building2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-400">{stats.totalDataCenters}</div>
                <div className="mt-1 text-[10px] text-emerald-400 font-mono">Facilities</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-400">Maintenance</span>
                  <Wrench className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-amber-400">{maintenance.length}</div>
                <div className="mt-1 text-[10px] text-amber-400 font-mono">Tasks Recorded</div>
              </div>
            </motion.div>
          )}

          {/* STAFF / TECHNICIAN KPI CARDS */}
          {userRole === APP_ROLES.STAFF && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
            >
              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-400">My Assigned Servers</span>
                  <Server className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-[#F8FAFC]">
                  {servers.slice(0, 4).length}
                </div>
                <div className="mt-1 text-[10px] text-blue-400 font-mono">Assigned to MUM-1</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-400">My Tasks</span>
                  <Wrench className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-amber-400">
                  {maintenance.filter(m => m.status === 'Scheduled' || m.status === 'In Progress').length}
                </div>
                <div className="mt-1 text-[10px] text-amber-400 font-mono">Pending Action</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#94A3B8]">Open Maintenance</span>
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-[#F8FAFC]">{stats.serversUnderMaintenance}</div>
                <div className="mt-1 text-[10px] text-slate-400 font-mono">In Progress</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400">Upcoming Tasks</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-400">
                  {maintenance.filter(m => m.status === 'Scheduled').length}
                </div>
                <div className="mt-1 text-[10px] text-emerald-400 font-mono">Scheduled</div>
              </div>

              <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-400">Notifications</span>
                  <Bell className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-3 text-2xl font-bold text-purple-400">
                  {notifications.filter(n => !n.read).length}
                </div>
                <div className="mt-1 text-[10px] text-purple-400 font-mono">Unread Alerts</div>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* 3. MAIN WIDGETS & ROLE-SPECIFIC QUICK ACTIONS             */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Main Data Views */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              {/* Server Status Distribution & Capacity */}
              <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.12)] bg-[#122038]/60">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F8FAFC]">Server Status</h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Current availability across all racks
                    </p>
                  </div>
                  {userRole !== APP_ROLES.STAFF && (
                    <Link
                      to="/servers"
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <span>View Servers</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Status Bar */}
                <div className="p-5 border-b border-[rgba(148,163,184,0.1)] bg-[#0D1728]/40">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2.5 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-blue-400" />
                      Server Status Distribution
                    </span>
                    <span className="text-[#F8FAFC] font-semibold font-mono">{stats.serversInUse} of {stats.totalServers} in use</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-3 rounded-full bg-[#07111F] overflow-hidden flex border border-[rgba(148,163,184,0.12)] p-0.5">
                    <div
                      style={{ width: `${(stats.serversInUse / Math.max(1, stats.totalServers)) * 100}%` }}
                      className="bg-blue-500 rounded-l-full h-full shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-500"
                      title={`In Use: ${stats.serversInUse}`}
                    />
                    <div
                      style={{ width: `${(stats.availableServers / Math.max(1, stats.totalServers)) * 100}%` }}
                      className="bg-emerald-500 h-full shadow-[0_0_8px_rgba(52,211,153,0.6)] transition-all duration-500"
                      title={`Available: ${stats.availableServers}`}
                    />
                    <div
                      style={{ width: `${(stats.serversUnderMaintenance / Math.max(1, stats.totalServers)) * 100}%` }}
                      className="bg-amber-500 h-full shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all duration-500"
                      title={`Maintenance: ${stats.serversUnderMaintenance}`}
                    />
                    <div
                      style={{ width: `${(stats.serversNotWorking / Math.max(1, stats.totalServers)) * 100}%` }}
                      className="bg-rose-500 rounded-r-full h-full shadow-[0_0_8px_rgba(244,63,94,0.6)] transition-all duration-500"
                      title={`Not Working: ${stats.serversNotWorking}`}
                    />
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-[rgba(148,163,184,0.1)] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0" />
                      <span className="text-[#94A3B8]">
                        In Use: <b className="text-[#F8FAFC]">{stats.serversInUse}</b>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
                      <span className="text-[#94A3B8]">
                        Available: <b className="text-[#F8FAFC]">{stats.availableServers}</b>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0" />
                      <span className="text-[#94A3B8]">
                        Maintenance: <b className="text-[#F8FAFC]">{stats.serversUnderMaintenance}</b>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
                      <span className="text-[#94A3B8]">
                        Not Working: <b className="text-[#F8FAFC]">{stats.serversNotWorking}</b>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operating Facilities Table */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                      Operating Data Centers
                    </h4>
                    {userRole !== APP_ROLES.STAFF && (
                      <Link to="/data-centers" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                        Manage Data Centers →
                      </Link>
                    )}
                  </div>
                  <div className="divide-y divide-[rgba(148,163,184,0.08)]">
                    {dataCenters.map(dc => (
                      <div key={dc.id} className="py-3 flex items-center justify-between text-xs hover:bg-[#15243B]/40 px-2 rounded-lg transition-colors">
                        <div>
                          <span className="font-semibold text-[#F8FAFC]">{dc.name}</span>
                          <span className="text-[#64748B] ml-2 font-mono">({dc.city})</span>
                        </div>
                        <div className="flex items-center gap-4 font-mono">
                          <span className="text-[#94A3B8] text-[11px]">
                            {dc.totalRacks} Racks • {dc.powerCapacityKw} kW
                          </span>
                          <StatusBadge status={dc.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Second Big Widget: Recent Allocations OR Reports depending on role */}
              {userRole === APP_ROLES.COMPLIANCE_AUDITOR ? (
                <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.12)] bg-[#122038]/60">
                    <div>
                      <h3 className="text-sm font-semibold text-[#F8FAFC]">Reports</h3>
                      <p className="text-xs text-[#94A3B8] mt-0.5">Generated reports and documentation</p>
                    </div>
                    <Link to="/reports" className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1">
                      <span>View All</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="divide-y divide-[rgba(148,163,184,0.08)] text-xs">
                    {reports.length === 0 ? (
                      <p className="text-xs text-[#94A3B8] text-center py-6">No reports generated yet.</p>
                    ) : (
                      reports.slice(0, 5).map(rep => (
                        <div key={rep.id} className="p-4 flex items-center justify-between hover:bg-[#15243B]/50 transition-colors">
                          <div>
                            <div className="font-semibold text-[#F8FAFC]">{rep.title}</div>
                            <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                              {rep.type} • Generated by <span className="text-blue-400">{rep.generatedBy}</span>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-slate-300 text-xs block">{rep.period}</span>
                            <span className="text-[11px] text-[#64748B]">{rep.fileSize}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.12)] bg-[#122038]/60">
                    <div>
                      <h3 className="text-sm font-semibold text-[#F8FAFC]">Recent Server Allocations</h3>
                      <p className="text-xs text-[#94A3B8] mt-0.5">Latest client assignments and provisioned compute instances</p>
                    </div>
                    {userRole !== APP_ROLES.STAFF && (
                      <Link
                        to="/server-allocation"
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <span>View All</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  <div className="divide-y divide-[rgba(148,163,184,0.08)] text-xs">
                    {recentAllocations.length === 0 ? (
                      <p className="text-xs text-[#94A3B8] text-center py-6">No server allocations active.</p>
                    ) : (
                      recentAllocations.map(alloc => (
                        <div key={alloc.id} className="p-4 flex items-center justify-between hover:bg-[#15243B]/50 transition-colors">
                          <div>
                            <div className="font-semibold text-[#F8FAFC]">{alloc.clientName}</div>
                            <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                              {alloc.assetTag} • <span className="text-blue-400">{alloc.purpose}</span>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-medium text-slate-300 block">{alloc.dataCenterName}</span>
                            <span className="text-[11px] text-[#64748B]">{alloc.assignedDate}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Column: Role-Specific Quick Actions, Maintenance & Activity */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Quick Actions Card */}
              <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg p-5 space-y-3">
                <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  {/* SUPER ADMIN QUICK ACTIONS */}
                  {userRole === APP_ROLES.SUPER_ADMIN && (
                    <>
                      <Link
                        to="/users"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Add User</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </Link>

                      <Link
                        to="/organizations"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                            <Building className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Add Organization</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </Link>

                      <Link
                        to="/data-centers"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Add Data Center</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </Link>

                      <Link
                        to="/servers"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                            <Server className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Add Server</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </Link>
                    </>
                  )}

                  {/* OPERATIONS MANAGER QUICK ACTIONS */}
                  {userRole === APP_ROLES.OPERATIONS_MANAGER && (
                    <>
                      <Link
                        to="/clients"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Add Client</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </Link>

                      <Link
                        to="/server-allocation"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Allocate Server</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </Link>

                      <Link
                        to="/maintenance"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Schedule Maintenance</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </Link>
                    </>
                  )}

                  {/* NETWORK ENGINEER QUICK ACTIONS */}
                  {userRole === APP_ROLES.NETWORK_ENGINEER && (
                    <>
                      <Link
                        to="/servers"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                            <Server className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Add Server</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </Link>

                      <Link
                        to="/racks"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Manage Racks</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </Link>

                      <Link
                        to="/maintenance"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Update Maintenance</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </Link>
                    </>
                  )}

                  {/* COMPLIANCE AUDITOR QUICK ACTIONS */}
                  {userRole === APP_ROLES.COMPLIANCE_AUDITOR && (
                    <>
                      <Link
                        to="/activity"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                            <History className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">View Activity</span>
                        </div>
                        <Eye className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </Link>

                      <Link
                        to="/reports"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">Open Reports</span>
                        </div>
                        <Eye className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </Link>
                    </>
                  )}

                  {/* STAFF QUICK ACTIONS */}
                  {userRole === APP_ROLES.STAFF && (
                    <>
                      <Link
                        to="/servers"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                            <Server className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">View My Servers</span>
                        </div>
                        <Eye className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </Link>

                      <Link
                        to="/maintenance"
                        className="flex items-center justify-between p-3 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#0D1728]/70 hover:border-blue-500/40 hover:bg-[#15243B] transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white">View Maintenance</span>
                        </div>
                        <Eye className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Upcoming Maintenance */}
              {userRole !== APP_ROLES.COMPLIANCE_AUDITOR && (
                <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.12)] bg-[#122038]/60">
                    <div>
                      <h3 className="text-sm font-semibold text-[#F8FAFC]">Upcoming Maintenance</h3>
                      <p className="text-xs text-[#94A3B8] mt-0.5">Scheduled technician inspections</p>
                    </div>
                    <Link to="/maintenance" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                      View All
                    </Link>
                  </div>

                  <div className="p-4 space-y-3">
                    {upcomingMaintenance.length === 0 ? (
                      <p className="text-xs text-[#94A3B8] text-center py-6">
                        No upcoming maintenance scheduled.
                      </p>
                    ) : (
                      upcomingMaintenance.map(task => (
                        <div
                          key={task.id}
                          className="p-3 bg-[#0D1728]/80 border border-[rgba(148,163,184,0.12)] rounded-lg text-xs space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-[#F8FAFC] leading-snug">
                              {task.title}
                            </span>
                            <StatusBadge status={task.status} />
                          </div>
                          <div className="text-[#94A3B8] text-[11px] space-y-1 font-mono">
                            <div>Data Center: <span className="text-slate-300 font-medium">{task.dataCenterName}</span></div>
                            <div>Technician: <span className="text-slate-300 font-medium">{task.technician}</span></div>
                            <div className="text-[#64748B] pt-0.5">{task.scheduledDate}</div>
                          </div>
                          {task.status === 'Scheduled' && (
                            <button
                              type="button"
                              onClick={() => startMaintenance(task.id)}
                              className="w-full mt-1.5 py-1.5 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
                            >
                              Start Task
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Recent Activity / System Log */}
              <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(148,163,184,0.12)] bg-[#122038]/60">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-[#F8FAFC]">Recent Activity</h3>
                      <p className="text-xs text-[#94A3B8]">System event log</p>
                    </div>
                  </div>
                  {userRole !== APP_ROLES.STAFF && (
                    <Link to="/activity" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      View All
                    </Link>
                  )}
                </div>

                <div className="p-4 divide-y divide-[rgba(148,163,184,0.08)] text-xs font-mono">
                  {recentActivities.length === 0 ? (
                    <p className="text-xs text-[#94A3B8] text-center py-4">No recent activity logged.</p>
                  ) : (
                    recentActivities.map(act => (
                      <div key={act.id} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-blue-400 font-semibold">{act.action}</span>
                          <span className="text-[#64748B] text-[10px]">{act.timestamp}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] mt-0.5 truncate">{act.details || act.targetName}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};
