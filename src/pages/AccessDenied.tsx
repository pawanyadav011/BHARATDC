import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-5 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
        <ShieldAlert className="w-12 h-12" />
      </div>

      <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight mb-2">
        Access Denied
      </h1>

      <p className="text-sm text-[#94A3B8] max-w-md mb-8">
        You do not have permission to open this page.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-[#101C30] border border-[rgba(148,163,184,0.2)] hover:bg-[#15243B] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};
