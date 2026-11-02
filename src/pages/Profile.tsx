import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Smartphone,
  Shield,
  Key,
  QrCode,
  Bell,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Radio
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { Modal } from '../components/common/Modal';

export const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, updateUser, showToast } = useDataCenter();
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 2FA state
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Notification matrix
  const [notifPreferences, setNotifPreferences] = useState({
    critical: { email: true, inApp: true, sms: true },
    warning: { email: true, inApp: true, sms: false },
    info: { email: false, inApp: true, sms: false }
  });

  const displayName = currentUser?.fullName || currentUser?.name || 'Rajesh Verma';
  const displayRole = currentUser?.role || 'Admin';
  const displayOrg = currentUser?.organization || 'National Informatics Operations';

  const [formData, setFormData] = useState({
    name: displayName,
    email: currentUser?.email || 'admin@bharatdc.in',
    phone: currentUser?.phone || '+91 22 2400 9001',
    organization: displayOrg,
    department: 'National Compute Operations Directorate'
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.fullName || currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        organization: currentUser.organization || 'National Informatics Operations',
        department: 'National Compute Operations Directorate'
      });
    }
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    if (currentUser) {
      const updated = {
        ...currentUser,
        fullName: formData.name.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        organization: formData.organization.trim()
      };
      setCurrentUser(updated);
      updateUser(currentUser.id, updated);
    }
    setIsEditing(false);
    setSavedSuccess(true);
    showToast('Profile information updated successfully.');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Please complete all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password updated successfully.');
  };

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">User Profile</h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Manage your account information, password, and notification preferences
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile configuration saved and committed to local credential registry.</span>
        </div>
      )}

      {/* Main Identity Card (Req 22) */}
      <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-[rgba(148,163,184,0.12)] bg-[#0D1728] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold flex items-center justify-center text-lg shadow-[0_0_16px_rgba(37,99,235,0.2)]">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#F8FAFC] text-base">{displayName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {displayRole}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">{formData.department} • {displayOrg}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isEditing && currentUser) {
                setFormData({
                  name: currentUser.fullName || currentUser.name || '',
                  email: currentUser.email || '',
                  phone: currentUser.phone || '',
                  organization: currentUser.organization || '',
                  department: 'National Compute Operations Directorate'
                });
              }
              setIsEditing(!isEditing);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] hover:bg-[#15243B] hover:text-white rounded-lg transition-colors self-start sm:self-auto"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#94A3B8] font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1.5">Authorized Email</label>
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1.5">Secured Phone (SMS Dispatch)</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1.5">Organization</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.organization}
                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>
          </div>

          {isEditing && (
            <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
              >
                Save Identity Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password Section (Req 22) */}
      <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg p-6 space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-[rgba(148,163,184,0.12)] pb-3">
          <Lock className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-[#F8FAFC] text-sm">Update Operator Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
          <div className="space-y-3">
            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#94A3B8] font-medium mb-1">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] font-medium mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication Section (Req 22) */}
      <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.12)] pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-[#F8FAFC] text-sm">Two-Factor Authentication (2FA)</h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            isTwoFactorEnabled
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
          }`}>
            {isTwoFactorEnabled ? '2FA ACTIVE' : '2FA DISABLED'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[#F8FAFC] font-medium text-xs">Time-based One-Time Password (TOTP) & Security Key</p>
            <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
              Enforces cryptographically signed authentication via authenticator app or FIPS 140-2 hardware token for every session.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] hover:bg-[#15243B] rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-400" />
              <span>Show QR / Setup Key</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const nextState = !isTwoFactorEnabled;
                setIsTwoFactorEnabled(nextState);
                showToast(nextState ? 'Two-Factor Authentication enabled.' : 'Two-Factor Authentication disabled.');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isTwoFactorEnabled
                  ? 'text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20'
                  : 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              {isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Preferences Matrix (Req 22) */}
      <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg p-6 space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-[rgba(148,163,184,0.12)] pb-3">
          <Bell className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-[#F8FAFC] text-sm">Notification Alert Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Severity Level</th>
                <th className="px-4 py-2.5 text-center">Email Dispatch</th>
                <th className="px-4 py-2.5 text-center">In-App Notification</th>
                <th className="px-4 py-2.5 text-center">SMS Urgent Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
              {(['critical', 'warning', 'info'] as const).map(sev => (
                <tr key={sev} className="hover:bg-[#15243B]/30 transition-colors">
                  <td className="px-4 py-3 font-semibold capitalize text-[#F8FAFC]">
                    {sev === 'critical' ? (
                      <span className="text-rose-400">Critical Incidents (Sev-1)</span>
                    ) : sev === 'warning' ? (
                      <span className="text-amber-400">Warning Thresholds (Sev-2)</span>
                    ) : (
                      <span className="text-blue-400">Informational & Audit (Sev-3)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={notifPreferences[sev].email}
                      onChange={e =>
                        setNotifPreferences({
                          ...notifPreferences,
                          [sev]: { ...notifPreferences[sev], email: e.target.checked }
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600 bg-[#0A1424] border-[rgba(148,163,184,0.3)] focus:ring-0 focus:ring-offset-0"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={notifPreferences[sev].inApp}
                      onChange={e =>
                        setNotifPreferences({
                          ...notifPreferences,
                          [sev]: { ...notifPreferences[sev], inApp: e.target.checked }
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600 bg-[#0A1424] border-[rgba(148,163,184,0.3)] focus:ring-0 focus:ring-offset-0"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={notifPreferences[sev].sms}
                      onChange={e =>
                        setNotifPreferences({
                          ...notifPreferences,
                          [sev]: { ...notifPreferences[sev], sms: e.target.checked }
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600 bg-[#0A1424] border-[rgba(148,163,184,0.3)] focus:ring-0 focus:ring-offset-0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Sessions List (Req 22) */}
      <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg p-6 space-y-4 text-xs">
        <h3 className="font-semibold text-[#F8FAFC] text-sm border-b border-[rgba(148,163,184,0.12)] pb-3">
          Active Workstation & Terminal Sessions
        </h3>

        <div className="space-y-3">
          {/* Current Session */}
          <div className="flex items-center justify-between p-3.5 border border-blue-500/30 rounded-xl bg-[#122038]">
            <div className="flex items-center gap-3.5">
              <Laptop className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold text-[#F8FAFC]">Console Terminal (Chrome on Linux x86_64)</div>
                <div className="text-[#94A3B8] font-mono text-[11px] mt-0.5">
                  IP: 10.14.0.12 (Internal LAN) • Active Session • Mumbai NOC
                </div>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              CURRENT SESSION
            </span>
          </div>

          {/* Secondary Mobile Session */}
          <div className="flex items-center justify-between p-3.5 border border-[rgba(148,163,184,0.12)] rounded-xl bg-[#0A1424]">
            <div className="flex items-center gap-3.5">
              <Smartphone className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Mobile NOC Inspector (iOS Mobile App)</div>
                <div className="text-[#94A3B8] font-mono text-[11px] mt-0.5">
                  IP: 172.16.8.44 (Secured VPN) • Last active 42 mins ago
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('Secondary session revoked.')}
              className="px-2.5 py-1 text-xs text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
            >
              Revoke
            </button>
          </div>
        </div>
      </div>

      {/* 2FA QR Code Modal (Req 22) */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Two-Factor Authentication Setup"
        description="Scan with Google Authenticator or your institutional TOTP key manager"
        maxWidth="md"
      >
        <div className="p-4 space-y-4 text-center">
          <div className="w-44 h-44 mx-auto p-3 bg-white rounded-xl shadow-md flex items-center justify-center">
            {/* High contrast visual QR grid placeholder */}
            <div className="w-full h-full border-4 border-slate-900 grid grid-cols-4 gap-1 p-2 bg-slate-100">
              <div className="bg-slate-900 rounded-xs" />
              <div className="bg-slate-900 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-900 rounded-xs" />
              <div className="bg-slate-900 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-900 rounded-xs" />
              <div className="bg-slate-900 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-900 rounded-xs" />
              <div className="bg-slate-900 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-900 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-900 rounded-xs" />
              <div className="bg-slate-900 rounded-xs" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#94A3B8]">Manual Secret Key:</span>
            <div className="font-mono text-xs text-blue-400 bg-[#0A1424] p-2 rounded-lg border border-[rgba(148,163,184,0.2)] select-all">
              BHDC-7712-4491-0982-KOLA
            </div>
          </div>

          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Enter the 6-digit code generated by your hardware authenticator to finalize enrollment.
          </p>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setIsQrModalOpen(false);
                showToast('TOTP key verified and registered.');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
            >
              Done / Verified
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
