import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../data/mockData';
import { MOCK_USERS } from '../../data/mockData';
import { Settings, ShieldCheck, Check, Clock, Radio, Play, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SandboxPanel: React.FC = () => {
  const { user, login, currentView, setCurrentView } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [lagEnabled, setLagEnabled] = useState(false);

  if (!user) return null;

  const demoSteps = [
    { label: 'Role-Based Authentication UI', desc: 'Validations, registration, loading spinners.' },
    { label: 'Dynamic Sidebar Workspace', desc: 'Navigation workspace menu auto-adjusts based on active permissions.' },
    { label: 'Audit Log Ledger Table', desc: 'View properties, search, and filter reports.' },
    { label: 'Specific Role Workspaces', desc: 'Buyer lookup tool, Agent add-property form, Legal checks checklist, Admin directories.' }
  ];

  const handleRoleQuickSwitch = async (role: UserRole) => {
    const defaultEmails: Record<UserRole, string> = {
      'Buyer': 'buyer@example.com',
      'Real Estate Agent': 'agent@example.com',
      'Legal Advisor': 'legal@example.com',
      'Financial Institution': 'finance@example.com',
      'Administrator': 'admin@example.com'
    };
    await login(defaultEmails[role], role);
  };

  const rolesList: UserRole[] = [
    'Buyer',
    'Real Estate Agent',
    'Legal Advisor',
    'Financial Institution',
    'Administrator'
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full shadow-lg shadow-emerald-950/60 flex items-center justify-center cursor-pointer transition-all duration-300 hover:rotate-45"
        title="Veritas Demo Control Panel"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-[#0c1220]/95 backdrop-blur-md border-l border-slate-800 z-50 p-6 flex flex-col justify-between overflow-y-auto text-xs"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                      Milestone 1 Sandbox
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Presentation Date: Sep 2, 2026</p>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Role Switches */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider">
                    1-Click Role Switcher
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Instantly override the active workspace to demonstrate different team modules without logging out:
                  </p>
                  <div className="space-y-1.5">
                    {rolesList.map((r) => {
                      const active = user.role === r;
                      return (
                        <button
                          key={r}
                          onClick={() => handleRoleQuickSwitch(r)}
                          className={`w-full py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-all duration-150 ${
                            active
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold'
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <span>{r}</span>
                          {active ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-semibold">Active</span>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Presentation Checklist */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider">
                    Milestone 1 Demo Steps
                  </h4>
                  <div className="space-y-2.5">
                    {demoSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <div className="p-1 bg-emerald-950 rounded-lg text-emerald-400 border border-emerald-900 shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="font-medium text-slate-200 block">{step.label}</span>
                          <span className="text-[10px] text-slate-500 leading-relaxed block mt-0.5">{step.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sandbox Footer */}
              <div className="mt-8 border-t border-slate-800 pt-4 space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Demo Environment</span>
                  </div>
                  <span className="font-bold text-white">Sandbox Local</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentView('overview');
                    setIsOpen(false);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-center flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Presentation</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
