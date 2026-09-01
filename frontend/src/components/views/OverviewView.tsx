import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStatsByRole } from '../../data/mockData';
import { RiskSummaryCard } from '../dashboard/RiskSummaryCard';
import { RecentActivityFeed } from '../dashboard/RecentActivityFeed';
import { PropertyList } from '../dashboard/PropertyList';
import { ShieldCheck, FileSpreadsheet, AlertCircle, Compass } from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const stats = getDashboardStatsByRole(user.role);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl glass-panel relative overflow-hidden gradient-border-emerald">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight leading-none mb-1.5">
              Welcome Back, {user.name}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Veritas Real Estate Risk System is active. Accessing primary workspace role: <span className="text-emerald-400 font-bold">{user.role}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 py-1.5 px-3 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Audit Environment: Sandbox Live</span>
          </div>
        </div>
      </div>

      {/* Role specific quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel-light">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">{stats.stat1.label}</span>
          <span className="text-lg font-heading font-black text-white mt-1 block">{stats.stat1.value}</span>
        </div>
        <div className="p-4 rounded-xl glass-panel-light">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">{stats.stat2.label}</span>
          <span className="text-lg font-heading font-black text-white mt-1 block">{stats.stat2.value}</span>
        </div>
        <div className="p-4 rounded-xl glass-panel-light">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">{stats.stat3.label}</span>
          <span className="text-lg font-heading font-black text-white mt-1 block">{stats.stat3.value}</span>
        </div>
        <div className="p-4 rounded-xl glass-panel-light">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">{stats.stat4.label}</span>
          <span className="text-lg font-heading font-black text-emerald-400 mt-1 block">{stats.stat4.value}</span>
        </div>
      </div>

      {/* Risk Level Metrics */}
      <RiskSummaryCard />

      {/* Detail grid rows */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <PropertyList />
        </div>
        <div className="lg:col-span-4">
          <RecentActivityFeed />
        </div>
      </div>

    </div>
  );
};
