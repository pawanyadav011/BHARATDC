import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User as UserIcon,
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { BdcLogo } from '../components/common/BdcLogo';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useDataCenter();
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both username/email and password.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const loggedUser = await signIn(identifier.trim(), password.trim());
      setCurrentUser(loggedUser);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid username or password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111F] relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[450px] bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to Platform Link */}
        <div className="mb-6 flex justify-start">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors group px-3 py-1.5 rounded-lg bg-[#101C30]/80 border border-[rgba(148,163,184,0.15)] hover:border-blue-500/30"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-slate-400" />
            <span>Back to Platform</span>
          </button>
        </div>

        {/* Clean Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="flex items-center gap-3">
            <BdcLogo size="lg" />
            <span className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              BHARAT<span className="text-blue-500">DC</span>
            </span>
          </div>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Data Center Management Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#101C30]/90 backdrop-blur-xl py-8 px-6 sm:px-8 border border-[rgba(148,163,184,0.16)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email or Username Field */}
            <div>
              <label htmlFor="login-identifier-input" className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  id="login-identifier-input"
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  placeholder="Enter your email or username"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password-input" className="block text-xs font-semibold text-[#94A3B8]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(true);
                    setForgotSent(false);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 text-xs text-[#94A3B8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600 bg-[#0A1424] border-[rgba(148,163,184,0.3)] focus:ring-0"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-6 pt-5 border-t border-[rgba(148,163,184,0.12)]">
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2.5 text-center">
              Quick Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                id="demo-btn-admin"
                type="button"
                onClick={() => {
                  setIdentifier('admin');
                  setPassword('admin123');
                }}
                className="p-2 rounded-lg bg-[#0A1424] hover:bg-[#15243B] border border-[rgba(148,163,184,0.14)] hover:border-blue-500/40 text-left transition-colors group"
              >
                <div className="font-medium text-[#F8FAFC] text-[11px] group-hover:text-blue-400">Super Admin</div>
                <div className="text-[10px] text-slate-500 font-mono">admin / admin123</div>
              </button>

              <button
                id="demo-btn-operations"
                type="button"
                onClick={() => {
                  setIdentifier('operations');
                  setPassword('operations123');
                }}
                className="p-2 rounded-lg bg-[#0A1424] hover:bg-[#15243B] border border-[rgba(148,163,184,0.14)] hover:border-blue-500/40 text-left transition-colors group"
              >
                <div className="font-medium text-[#F8FAFC] text-[11px] group-hover:text-blue-400">Operations</div>
                <div className="text-[10px] text-slate-500 font-mono">operations / operations123</div>
              </button>

              <button
                id="demo-btn-engineer"
                type="button"
                onClick={() => {
                  setIdentifier('engineer');
                  setPassword('engineer123');
                }}
                className="p-2 rounded-lg bg-[#0A1424] hover:bg-[#15243B] border border-[rgba(148,163,184,0.14)] hover:border-blue-500/40 text-left transition-colors group"
              >
                <div className="font-medium text-[#F8FAFC] text-[11px] group-hover:text-blue-400">Engineer</div>
                <div className="text-[10px] text-slate-500 font-mono">engineer / engineer123</div>
              </button>

              <button
                id="demo-btn-auditor"
                type="button"
                onClick={() => {
                  setIdentifier('auditor');
                  setPassword('auditor123');
                }}
                className="p-2 rounded-lg bg-[#0A1424] hover:bg-[#15243B] border border-[rgba(148,163,184,0.14)] hover:border-blue-500/40 text-left transition-colors group"
              >
                <div className="font-medium text-[#F8FAFC] text-[11px] group-hover:text-blue-400">Auditor</div>
                <div className="text-[10px] text-slate-500 font-mono">auditor / auditor123</div>
              </button>

              <button
                id="demo-btn-staff"
                type="button"
                onClick={() => {
                  setIdentifier('staff');
                  setPassword('staff123');
                }}
                className="col-span-2 p-2 rounded-lg bg-[#0A1424] hover:bg-[#15243B] border border-[rgba(148,163,184,0.14)] hover:border-blue-500/40 text-center transition-colors group"
              >
                <span className="font-medium text-[#F8FAFC] text-[11px] group-hover:text-blue-400">Staff / Technician: </span>
                <span className="text-[10px] text-slate-500 font-mono">staff / staff123</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#101C30] border border-[rgba(148,163,184,0.2)] rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Reset Password</h3>
            {forgotSent ? (
              <div className="space-y-3">
                <p className="text-xs text-emerald-400">
                  Password reset instructions have been sent to your registered email address.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#94A3B8]">
                  Enter your official email or username to receive a password reset link.
                </p>
                <input
                  type="text"
                  placeholder="Enter email or username"
                  defaultValue={identifier}
                  className="w-full px-3 py-2 text-xs text-[#F8FAFC] bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
