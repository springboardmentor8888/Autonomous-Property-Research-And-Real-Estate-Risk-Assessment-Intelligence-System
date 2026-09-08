import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../data/mockData';
import { Building2, ShieldAlert, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthScreen: React.FC = () => {
  const { login, register, loading, error } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('Buyer');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  const validateForm = () => {
    setValidationError(null);
    if (!email) {
      setValidationError('Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address.');
      return false;
    }

    if (!isLogin) {
      if (!name) {
        setValidationError('Full Name is required.');
        return false;
      }
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters.');
        return false;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isLogin) {
      await login(email, role);
    } else {
      await register(name, email, role);
    }
  };

  const quickFill = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setRole(demoRole);
    setValidationError(null);
    login(demoEmail, demoRole);
  };

  const rolesList: UserRole[] = [
    'Buyer',
    'Real Estate Agent',
    'Legal Advisor',
    'Financial Institution',
    'Administrator'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] relative overflow-hidden px-4">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 z-10 my-8">
        
        {/* Left Column: Visual and Branding */}
        <div className="md:col-span-5 flex flex-col justify-between p-8 rounded-2xl glass-panel relative overflow-hidden glow-emerald">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                VERITAS
              </span>
            </div>
            
            <h1 className="text-3xl font-heading font-bold leading-tight text-white mb-4">
              Real Estate Due Diligence &amp; Risk Intelligence
            </h1>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Veritas provides automated verification, risk analysis, and comprehensive report auditing for secure real estate transactions.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Available Test Roles
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => quickFill('buyer@example.com', 'Buyer')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 text-left text-xs text-slate-300 hover:text-white transition duration-200"
              >
                <span>Buyer Dashboard Demo</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/50">Load</span>
              </button>
              <button 
                onClick={() => quickFill('legal@example.com', 'Legal Advisor')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 text-left text-xs text-slate-300 hover:text-white transition duration-200"
              >
                <span>Legal Advisor Assessment</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/50">Load</span>
              </button>
              <button 
                onClick={() => quickFill('admin@example.com', 'Administrator')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 text-left text-xs text-slate-300 hover:text-white transition duration-200"
              >
                <span>System Admin Console</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/50">Load</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-[11px] text-slate-500 border-t border-slate-800/60 pt-4">
            Secured end-to-end database replication and audit tracking.
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="p-8 rounded-2xl glass-panel relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading font-bold text-white">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setValidationError(null);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
              >
                {isLogin ? 'Need an account?' : 'Already have an account?'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Form Validation and Server Error messages */}
              <AnimatePresence>
                {(validationError || error) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-2.5 text-xs text-red-300"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{validationError || error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name Field (Register Only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Field (Only for visual UI completeness, we bypass checking it for testing) */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 block">Confirm</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        placeholder="••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Role Selection Tabs */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-400 block">Select Assigned Project Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {rolesList.map((r) => {
                    const active = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSelect(r)}
                        className={`py-2 px-2.5 rounded-lg border text-center transition-all duration-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 ${
                          active
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                            : 'bg-slate-950/30 border-slate-800/80 text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                        }`}
                      >
                        {active && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        <span>{r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-950/50 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
