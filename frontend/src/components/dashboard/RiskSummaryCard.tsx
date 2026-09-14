import React from 'react';
import { MOCK_PROPERTIES } from '../../data/mockData';
import { ShieldCheck, ShieldAlert, Shield, Activity } from 'lucide-react';

export const RiskSummaryCard: React.FC = () => {
  const total = MOCK_PROPERTIES.length;
  const lowRisk = MOCK_PROPERTIES.filter((p) => p.riskLevel === 'Low').length;
  const medRisk = MOCK_PROPERTIES.filter((p) => p.riskLevel === 'Medium').length;
  const highRisk = MOCK_PROPERTIES.filter((p) => p.riskLevel === 'High').length;

  const lowPct = Math.round((lowRisk / total) * 100);
  const medPct = Math.round((medRisk / total) * 100);
  const highPct = Math.round((highRisk / total) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Reviewed Card */}
      <div className="p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-slate-700 transition duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reviewed Properties</p>
            <h3 className="text-2xl font-heading font-extrabold text-white mt-1">{total}</h3>
          </div>
          <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-slate-300">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>
        <div className="text-[10px] text-slate-400">
          <span className="text-emerald-400 font-semibold">+12%</span> from last week's assessment audit
        </div>
      </div>

      {/* Low Risk Card */}
      <div className="p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-emerald-500/25 transition duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Low Risk (Clear)</p>
            <h3 className="text-2xl font-heading font-extrabold text-emerald-400 mt-1">{lowRisk}</h3>
          </div>
          <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-900/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lowPct}%` }} />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400">
            <span>Progress Ratio</span>
            <span>{lowPct}%</span>
          </div>
        </div>
      </div>

      {/* Medium Risk Card */}
      <div className="p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-amber-500/25 transition duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Medium Risk (Review)</p>
            <h3 className="text-2xl font-heading font-extrabold text-amber-400 mt-1">{medRisk}</h3>
          </div>
          <div className="p-2.5 bg-amber-950/40 rounded-xl border border-amber-900/30 text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${medPct}%` }} />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400">
            <span>Progress Ratio</span>
            <span>{medPct}%</span>
          </div>
        </div>
      </div>

      {/* High Risk Card */}
      <div className="p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-red-500/25 transition duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">High Risk (Flagged)</p>
            <h3 className="text-2xl font-heading font-extrabold text-red-400 mt-1">{highRisk}</h3>
          </div>
          <div className="p-2.5 bg-red-950/40 rounded-xl border border-red-900/30 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${highPct}%` }} />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400">
            <span>Progress Ratio</span>
            <span>{highPct}%</span>
          </div>
        </div>
      </div>

    </div>
  );
};
