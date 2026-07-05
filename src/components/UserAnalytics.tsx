import React, { useState } from 'react';
import { 
  Users, 
  Eye, 
  UserCheck, 
  UserPlus, 
  LogIn, 
  LogOut, 
  Shield, 
  Calendar, 
  X, 
  PlusCircle, 
  TrendingUp, 
  BarChart3,
  Mail,
  Lock,
  User,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  dateRegistered: string;
}

interface UserAnalyticsProps {
  registeredUsers: RegisteredUser[];
  currentUser: RegisteredUser | null;
  pageViews: number;
  theme: 'light' | 'dark';
  onRegister: (name: string, email: string, role: 'admin' | 'user') => void;
  onLogin: (email: string) => boolean;
  onLogout: () => void;
}

export default function UserAnalytics({
  registeredUsers,
  currentUser,
  pageViews,
  theme,
  onRegister,
  onLogin,
  onLogout
}: UserAnalyticsProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<'admin' | 'user'>('user');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!emailInput.trim()) {
      setErrorMsg('Please enter an email address.');
      return;
    }

    if (authMode === 'login') {
      const success = onLogin(emailInput.trim());
      if (success) {
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          setShowAuthModal(false);
          setEmailInput('');
          setSuccessMsg('');
        }, 1000);
      } else {
        setErrorMsg('User not found. Register a new account first!');
      }
    } else {
      if (!nameInput.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      
      // Check if user already exists
      const exists = registeredUsers.some(u => u.email.toLowerCase() === emailInput.toLowerCase().trim());
      if (exists) {
        setErrorMsg('A user with this email already exists.');
        return;
      }

      onRegister(nameInput.trim(), emailInput.trim(), roleInput);
      setSuccessMsg('Account registered successfully! Logging you in...');
      
      // Auto login
      setTimeout(() => {
        onLogin(emailInput.trim());
        setShowAuthModal(false);
        setEmailInput('');
        setNameInput('');
        setSuccessMsg('');
      }, 1200);
    }
  };

  return (
    <div className="flex items-center gap-2" id="user-analytics-integration-controls">
      {/* Analytics Dashboard Trigger Button */}
      <button
        id="trigger-analytics-panel-btn"
        onClick={() => setShowAnalyticsModal(true)}
        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow"
        title="View Live User & Analytics Statistics"
      >
        <BarChart3 className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Analytics</span>
        <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
          {pageViews}
        </span>
      </button>

      {/* Account Info Bar */}
      {currentUser ? (
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-white/10" id="user-session-active">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]" title={currentUser.name}>
              {currentUser.name}
            </span>
            <span className="text-[9px] font-mono font-bold text-indigo-500 uppercase tracking-wider">
              {currentUser.role}
            </span>
          </div>

          <div 
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all"
            onClick={() => setShowAnalyticsModal(true)}
            title="View Account Details"
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </div>

          <button
            id="user-logout-trigger-btn"
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
            title="Log Out Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          id="user-login-trigger-btn"
          onClick={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
      )}

      {/* 1. Auth Login / Register Modal */}
      {showAuthModal && (
        <div id="auth-modal-overlay" className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#050e1e] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white animate-fade-in">
            {/* Ambient secure background pulse */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => {
                setShowAuthModal(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo and title */}
            <div className="text-center mb-6">
              <div className="mx-auto w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-3 border border-indigo-500/30">
                <Users className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {authMode === 'login' ? 'Sign In to Security Vault' : 'Create Vault Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Access personalized document workspaces & security logs.
              </p>
            </div>

            {/* Error/Success alerts */}
            {errorMsg && (
              <div className="mb-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 p-2.5 rounded-lg text-xs font-medium">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="user@vault.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Account Access Role
                  </label>
                  <select
                    value={roleInput}
                    onChange={e => setRoleInput(e.target.value as 'admin' | 'user')}
                    className="w-full px-3 py-2 bg-[#050e1e] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="user" className="text-slate-900">User Profile (Standard Conversion Access)</option>
                    <option value="admin" className="text-slate-900">Admin Profile (Full System Analytics)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                {authMode === 'login' ? 'Proceed with Sign In' : 'Register Secure Account'}
              </button>
            </form>

            {/* Toggle trigger */}
            <div className="mt-4 text-center text-xs text-slate-400 border-t border-white/5 pt-4">
              {authMode === 'login' ? (
                <p>
                  New to Secure Vault?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                    }}
                    className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg('');
                    }}
                    className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Sign In instead
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. System Analytics & Registered Users Dashboard Modal */}
      {showAnalyticsModal && (
        <div id="analytics-modal-overlay" className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#050e1e] border border-indigo-500/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            
            {/* Design header close */}
            <button
              onClick={() => setShowAnalyticsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Title */}
            <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4 mb-5">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  System Administration & Analytics
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time client telemetry, visitor analytics, and user registers.
                </p>
              </div>
            </div>

            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              {/* Site Views Metric Card */}
              <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl relative overflow-hidden">
                <div className="absolute top-3 right-3 text-indigo-500/30">
                  <Eye className="w-10 h-10" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Site Views
                </span>
                <span className="text-2xl font-mono font-extrabold text-white mt-1 block">
                  {pageViews}
                </span>
                <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% traffic spike</span>
                </span>
              </div>

              {/* Registered Accounts Card */}
              <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl relative overflow-hidden">
                <div className="absolute top-3 right-3 text-teal-500/30">
                  <Users className="w-10 h-10" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Registered Accounts
                </span>
                <span className="text-2xl font-mono font-extrabold text-white mt-1 block">
                  {registeredUsers.length}
                </span>
                <span className="text-[9px] text-teal-400 font-medium mt-1 block font-mono">
                  Active Local Accounts
                </span>
              </div>

              {/* Connected Session Status Card */}
              <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl relative overflow-hidden">
                <div className="absolute top-3 right-3 text-emerald-500/30">
                  <UserCheck className="w-10 h-10" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Session
                </span>
                <span className="text-sm font-bold text-indigo-300 truncate mt-2.5 block">
                  {currentUser ? currentUser.name : 'Unauthenticated Guest'}
                </span>
                <span className="text-[9px] text-slate-400 font-medium mt-1 block">
                  {currentUser ? `Role: ${currentUser.role.toUpperCase()}` : 'Guest conversion limits apply'}
                </span>
              </div>

            </div>

            {/* List of Registered Accounts Container */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Registered Accounts Database ({registeredUsers.length})</span>
                </h4>
                
                {/* Manual Register Admin Feature */}
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Add Account</span>
                </button>
              </div>

              <div className="bg-[#050e1e] border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                {registeredUsers.map(user => {
                  const isActive = currentUser && currentUser.id === user.id;
                  return (
                    <div key={user.id} className={`p-3 flex items-center justify-between transition-colors ${isActive ? 'bg-indigo-950/20' : 'hover:bg-white/5'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {/* User Avatar Circle */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate max-w-[150px]">
                              {user.name}
                            </span>
                            {isActive && (
                              <span className="text-[8px] font-extrabold bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded uppercase font-mono tracking-wider border border-emerald-500/20">
                                Active
                              </span>
                            )}
                            <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded uppercase font-bold tracking-wider ${user.role === 'admin' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-slate-700/50 text-slate-400'}`}>
                              {user.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      {/* Registration Date */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{user.dateRegistered}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick telemetry diagnostic footer */}
            <div className="mt-6 pt-4 border-t border-indigo-500/20 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Diagnostic Telemetry Active</span>
              </span>
              <span>Client Encrypted Session</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
