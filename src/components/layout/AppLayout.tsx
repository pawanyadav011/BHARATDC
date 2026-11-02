import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/ToastContainer';

import { ErrorBoundary } from '../common/ErrorBoundary';

const ROUTE_INFO: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Overview of servers, allocations, and data center operations'
  },
  '/organizations': {
    title: 'Organizations',
    description: 'Manage partner organizations and departments'
  },
  '/users': {
    title: 'Users',
    description: 'Manage team members, roles, and permissions'
  },
  '/clients': {
    title: 'Clients',
    description: 'Manage client accounts, service agreements, and server allocations'
  },
  '/data-centers': {
    title: 'Data Centers',
    description: 'Manage data center locations, capacity, and managers'
  },
  '/racks': {
    title: 'Racks',
    description: 'Manage server racks, capacity, and power'
  },
  '/servers': {
    title: 'Servers',
    description: 'Manage servers, specifications, and data center locations'
  },
  '/server-allocation': {
    title: 'Server Allocation',
    description: 'Assign servers to clients and track active allocations'
  },
  '/maintenance': {
    title: 'Maintenance',
    description: 'Schedule inspections, repairs, and track maintenance tasks'
  },
  '/notifications': {
    title: 'Notifications',
    description: 'System alerts, maintenance notices, and updates'
  },
  '/reports': {
    title: 'Reports',
    description: 'Download reports for data centers, servers, and clients'
  },
  '/activity': {
    title: 'Activity History',
    description: 'Recent actions, configuration changes, and system updates'
  },
  '/profile': {
    title: 'User Profile',
    description: 'Account credentials and profile settings'
  },
  '/settings': {
    title: 'Settings',
    description: 'Configure system settings, regional defaults, and data preferences'
  }
};

export const AppLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  const currentRouteMeta = ROUTE_INFO[location.pathname] || {
    title: 'BHARATDC',
    description: 'Data Center Management Platform'
  };

  return (
    <div className="flex h-screen bg-[#07111F] overflow-hidden font-sans text-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#07111F]">
        <Header
          onOpenMobileNav={() => setMobileNavOpen(true)}
          title={currentRouteMeta.title}
          description={currentRouteMeta.description}
        />

        {/* Scrollable Page Container with smooth transitions */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="max-w-7xl mx-auto space-y-6"
            >
              <ErrorBoundary fallbackTitle="This module encountered an issue loading its view">
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
