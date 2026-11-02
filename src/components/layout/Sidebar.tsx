import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  Users,
  Briefcase,
  Building2,
  Server,
  HardDrive,
  Cpu,
  Wrench,
  Bell,
  FileText,
  History,
  UserCheck,
  Sliders,
  X
} from 'lucide-react';
import { useDataCenter } from '../../context/DataContext';
import { BdcLogo } from '../common/BdcLogo';
import { canAccessModule } from '../../utils/rbac';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { notifications, currentUser } = useDataCenter();
  const unreadCount = notifications.filter(n => !n.read).length;
  const userRole = currentUser?.role || 'Staff';

  const rawGroups: NavGroup[] = [
    {
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      label: 'ORGANIZATION',
      items: [
        { name: 'Organizations', path: '/organizations', icon: Building },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Clients', path: '/clients', icon: Briefcase }
      ]
    },
    {
      label: 'INFRASTRUCTURE',
      items: [
        { name: 'Data Centers', path: '/data-centers', icon: Building2 },
        { name: 'Racks', path: '/racks', icon: Server },
        { name: 'Servers', path: '/servers', icon: HardDrive },
        { name: 'Server Allocation', path: '/server-allocation', icon: Cpu }
      ]
    },
    {
      label: 'OPERATIONS',
      items: [
        { name: 'Maintenance', path: '/maintenance', icon: Wrench },
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount }
      ]
    },
    {
      label: 'REPORTS & LOGS',
      items: [
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Activity History', path: '/activity', icon: History }
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Profile', path: '/profile', icon: UserCheck },
        { name: 'Settings', path: '/settings', icon: Sliders }
      ]
    }
  ];

  // Dynamically filter navigation items based on user's role
  const navigationGroups = rawGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => canAccessModule(userRole, item.path))
    }))
    .filter(group => group.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A1424] text-[#F8FAFC] select-none border-r border-[rgba(148,163,184,0.12)]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[rgba(148,163,184,0.12)] bg-[#07111F]/60 backdrop-blur-md shrink-0">
        <NavLink to="/" className="hover:opacity-90 transition-opacity flex items-center gap-2.5">
          <BdcLogo size="sm" />
          <span className="text-sm font-bold tracking-tight text-[#F8FAFC]">
            BHARAT<span className="text-blue-500">DC</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold ml-auto">
            PRO
          </span>
        </NavLink>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin" aria-label="Main Navigation">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.label && (
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
                {group.label}
              </div>
            )}
            <ul className="space-y-1">
              {group.items.map(item => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onCloseMobile();
                    }}
                    className={({ isActive }) =>
                      `group relative flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600/15 text-blue-400 font-semibold shadow-[inset_0_0_12px_rgba(37,99,235,0.08)] border-l-2 border-blue-500 pl-2.5'
                          : 'text-[#94A3B8] hover:bg-[#122038] hover:text-[#F8FAFC] hover:translate-x-0.5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <item.icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]'
                                : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer System Status */}
      <div className="p-3 border-t border-[rgba(148,163,184,0.1)] bg-[#07111F]/40 text-xs">
        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            System Online
          </span>
          <span className="font-mono text-[10px] text-slate-500">v2.4.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (persistent) */}
      <aside
        id="app-desktop-sidebar"
        className="hidden lg:block w-64 h-screen shrink-0 border-r border-[rgba(148,163,184,0.12)] bg-[#0A1424]"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav-backdrop"
          className="lg:hidden fixed inset-0 z-50 flex bg-[#07111F]/80 backdrop-blur-sm transition-opacity"
          onClick={e => {
            if (e.target === e.currentTarget) onCloseMobile();
          }}
        >
          <div className="w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200 bg-[#0A1424]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
