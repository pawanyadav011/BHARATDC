import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  ChevronDown,
  Search,
  Command
} from 'lucide-react';
import { useDataCenter } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenMobileNav: () => void;
  title: string;
  description?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileNav,
  title,
  description
}) => {
  const {
    currentUser,
    setCurrentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead
  } = useDataCenter();
  const { signOut } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;
  const userName = currentUser?.fullName || currentUser?.name || 'Staff User';
  const userEmail = currentUser?.email || 'staff@bharatdc.in';
  const userRole = currentUser?.role || 'Staff';
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    navigate(`/servers?q=${encodeURIComponent(globalSearch.trim())}`);
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#0A1424]/85 backdrop-blur-md border-b border-[rgba(148,163,184,0.12)] shrink-0 transition-colors"
    >
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          id="mobile-menu-toggle-btn"
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight truncate">
            {title}
          </h1>
          {description && (
            <p className="hidden md:block text-xs text-[#94A3B8] truncate">{description}</p>
          )}
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form
        onSubmit={handleGlobalSearchSubmit}
        className="hidden md:flex items-center relative max-w-sm w-full mx-4"
      >
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          placeholder="Global search (servers, racks, clients)..."
          className="w-full pl-9 pr-14 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 bg-[#101C30]/70 border border-[rgba(148,163,184,0.18)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
        <div className="absolute right-2.5 flex items-center gap-0.5 pointer-events-none text-[10px] text-slate-500 font-mono border border-slate-700/60 rounded px-1.5 py-0.5 bg-[#07111F]">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>
      </form>

      {/* Right side: Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-bell-btn"
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#0A1424] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#101C30] rounded-xl border border-[rgba(148,163,184,0.18)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(148,163,184,0.12)] bg-[#122038]/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#F8FAFC]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[rgba(148,163,184,0.08)]">
                {notifications.slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    onClick={() => markNotificationRead(item.id)}
                    className={`p-3.5 text-xs hover:bg-[#15243B]/60 cursor-pointer transition-colors ${
                      !item.read ? 'bg-blue-600/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-[#F8FAFC] leading-snug">{item.title}</h4>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">{item.timestamp}</span>
                    </div>
                    <p className="text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-[rgba(148,163,184,0.12)] text-center bg-[#0D1728]/60">
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium block py-1 transition-colors"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            id="user-profile-menu-btn"
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 text-left rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label="User account menu"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md border border-blue-400/30">
              {userInitials}
            </div>
            <div className="hidden md:block text-left pr-1">
              <div className="text-xs font-semibold text-[#F8FAFC] leading-tight">{userName}</div>
              <div className="text-[10px] text-[#94A3B8]">{userRole}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#101C30] rounded-xl border border-[rgba(148,163,184,0.18)] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-[rgba(148,163,184,0.12)]">
                <p className="text-xs font-semibold text-[#F8FAFC]">{userName}</p>
                <p className="text-[11px] text-[#94A3B8] truncate">{userEmail}</p>
                <span className="mt-1.5 inline-block text-[10px] px-1.5 py-0.5 rounded font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {userRole}
                </span>
              </div>

              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-[#15243B] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-[#15243B] transition-colors"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Settings</span>
              </Link>

              <div className="my-1 border-t border-[rgba(148,163,184,0.12)]" />

              <button
                id="header-logout-btn"
                type="button"
                onClick={async () => {
                  setProfileOpen(false);
                  setCurrentUser(null);
                  await signOut();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 text-left transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
