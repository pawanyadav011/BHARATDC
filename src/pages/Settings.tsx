import React, { useState } from 'react';
import { RefreshCw, Save, CheckCircle2, Globe, Database } from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { refetchData, showToast } = useDataCenter();

  const [platformName, setPlatformName] = useState('BHARATDC');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata (IST, UTC+05:30)');
  const [currency, setCurrency] = useState('INR (₹)');
  const [tempUnit, setTempUnit] = useState('Celsius (°C)');
  const [backupSchedule, setBackupSchedule] = useState('Daily at 02:00 IST');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    showToast('Platform settings saved successfully.');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmSync = async () => {
    setIsSyncConfirmOpen(false);
    await refetchData();
    setSyncSuccess(true);
    showToast('Application synchronized with Supabase database.');
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Settings</h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Configure system preferences, regional standards, and database synchronization
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Platform settings saved successfully.</span>
        </div>
      )}

      {syncSuccess && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span>Data synchronized with Supabase PostgreSQL.</span>
        </div>
      )}

      {/* General Configuration */}
      <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg p-6 space-y-5 text-xs">
        <div className="flex items-center gap-2 border-b border-[rgba(148,163,184,0.12)] pb-3">
          <Globe className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-[#F8FAFC] text-sm">
            Regional Preferences
          </h3>
        </div>

        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#94A3B8] font-medium mb-1.5">Platform Name</label>
              <input
                type="text"
                value={platformName}
                onChange={e => setPlatformName(e.target.value)}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1.5">Time Zone</label>
              <select
                value={timeZone}
                onChange={e => setTimeZone(e.target.value)}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Asia/Kolkata (IST, UTC+05:30)">Asia/Kolkata (IST, UTC+05:30)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="INR (₹)">Indian Rupee (INR - ₹)</option>
                <option value="USD ($)">US Dollar (USD - $)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1.5">Temperature Scale</label>
              <select
                value={tempUnit}
                onChange={e => setTempUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Celsius (°C)">Celsius (°C)</option>
                <option value="Fahrenheit (°F)">Fahrenheit (°F)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1.5">Automated Snapshot Schedule</label>
              <select
                value={backupSchedule}
                onChange={e => setBackupSchedule(e.target.value)}
                className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="Daily at 02:00 IST">Daily at 02:00 IST</option>
                <option value="Every 6 hours">Every 6 hours</option>
                <option value="Weekly Full Snapshot">Weekly Full Snapshot</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database Synchronization */}
      <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg p-6 space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-[rgba(148,163,184,0.12)] pb-3">
          <Database className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-[#F8FAFC] text-sm">Database Synchronization</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0A1424] border border-[rgba(148,163,184,0.1)]">
          <div>
            <span className="font-semibold text-[#F8FAFC] block text-xs">Sync with Supabase PostgreSQL</span>
            <span className="text-[#94A3B8] text-[11px] block mt-0.5 leading-relaxed">
              Refreshes all facilities, racks, servers, clients, allocations, and maintenance records from the live database.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsSyncConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Database</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isSyncConfirmOpen}
        title="Sync Database?"
        message="This will re-fetch the latest records for all data centers, racks, servers, clients, and allocations directly from Supabase PostgreSQL."
        confirmText="Sync Now"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={handleConfirmSync}
        onCancel={() => setIsSyncConfirmOpen(false)}
      />
    </div>
  );
};
