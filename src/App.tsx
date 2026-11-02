import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppLayout } from './components/layout/AppLayout';
import { ToastContainer } from './components/common/ToastContainer';
import { BdcLogo } from './components/common/BdcLogo';
import { canAccessModule } from './utils/rbac';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Servers } from './pages/Servers';
import { ServerAllocationPage } from './pages/ServerAllocation';
import { MaintenancePage } from './pages/Maintenance';
import { DataCentersPage } from './pages/DataCenters';
import { RacksPage } from './pages/Racks';
import { ClientsPage } from './pages/Clients';
import { OrganizationsPage } from './pages/Organizations';
import { UsersPage } from './pages/Users';
import { ReportsPage } from './pages/Reports';
import { ActivityPage } from './pages/Activity';
import { NotificationsPage } from './pages/Notifications';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { AccessDenied } from './pages/AccessDenied';

// Protected Route wrapper ensuring user is authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07111F] flex flex-col items-center justify-center font-sans">
        <BdcLogo size="lg" />
        <div className="mt-4 flex items-center gap-2 text-xs text-[#94A3B8] font-mono">
          <span className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Route wrapper that checks RBAC permissions
const RoleRouteGuard: React.FC<{ modulePath: string; children: React.ReactNode }> = ({
  modulePath,
  children,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessModule(user.role, modulePath)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

// Public Route wrapper redirecting logged in user away from login
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Public Landing Route */}
        <Route path="/" element={<Landing />} />

        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Application Routes wrapped in AppLayout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route
            path="/servers"
            element={
              <RoleRouteGuard modulePath="servers">
                <Servers />
              </RoleRouteGuard>
            }
          />
          
          <Route
            path="/server-allocation"
            element={
              <RoleRouteGuard modulePath="server-allocation">
                <ServerAllocationPage />
              </RoleRouteGuard>
            }
          />
          
          <Route
            path="/maintenance"
            element={
              <RoleRouteGuard modulePath="maintenance">
                <MaintenancePage />
              </RoleRouteGuard>
            }
          />
          
          <Route
            path="/data-centers"
            element={
              <RoleRouteGuard modulePath="data-centers">
                <DataCentersPage />
              </RoleRouteGuard>
            }
          />
          
          <Route
            path="/racks"
            element={
              <RoleRouteGuard modulePath="racks">
                <RacksPage />
              </RoleRouteGuard>
            }
          />
          
          <Route
            path="/clients"
            element={
              <RoleRouteGuard modulePath="clients">
                <ClientsPage />
              </RoleRouteGuard>
            }
          />
          
          <Route
            path="/organizations"
            element={
              <RoleRouteGuard modulePath="organizations">
                <OrganizationsPage />
              </RoleRouteGuard>
            }
          />
          
          <Route
            path="/users"
            element={
              <RoleRouteGuard modulePath="users">
                <UsersPage />
              </RoleRouteGuard>
            }
          />
          
          <Route
            path="/reports"
            element={
              <RoleRouteGuard modulePath="reports">
                <ReportsPage />
              </RoleRouteGuard>
            }
          />
          
          <Route
            path="/activity"
            element={
              <RoleRouteGuard modulePath="activity">
                <ActivityPage />
              </RoleRouteGuard>
            }
          />
          <Route path="/history" element={<Navigate to="/activity" replace />} />
          
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route
            path="/settings"
            element={
              <RoleRouteGuard modulePath="settings">
                <SettingsPage />
              </RoleRouteGuard>
            }
          />

          <Route path="/access-denied" element={<AccessDenied />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <ToastContainer />
    </>
  );
};

import { ErrorBoundary } from './components/common/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="BHARATDC Application Error">
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
