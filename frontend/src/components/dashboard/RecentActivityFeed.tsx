import React from 'react';
import { MOCK_ACTIVITIES } from '../../data/mockData';
import { User, AlertTriangle, CheckCircle, Info, Calendar } from 'lucide-react';

export const RecentActivityFeed: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'danger':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-950/40 border border-emerald-900/30';
      case 'danger':
        return 'bg-red-950/40 border border-red-900/30';
      case 'warning':
        return 'bg-amber-950/40 border border-amber-900/30';
      default:
        return 'bg-blue-950/40 border border-blue-900/30';
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-5 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Recent System Activity</h3>
        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Live Feed
        </span>
      </div>

      <div className="space-y-4">
        {MOCK_ACTIVITIES.map((activity) => (
          <div key={activity.id} className="flex gap-3 text-xs leading-normal">
            {/* Status Icon Wrapper */}
            <div className={`p-2 rounded-xl shrink-0 h-8 w-8 flex items-center justify-center ${getStatusBg(activity.status)}`}>
              {getStatusIcon(activity.status)}
            </div>

            {/* Content info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-semibold text-slate-200 truncate">{activity.user}</span>
                <span className="text-[9px] text-slate-500 shrink-0">{activity.timestamp}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-[9px] font-medium uppercase text-slate-500">
                  {activity.role}
                </span>
                <span className="truncate">{activity.address}</span>
              </div>
              
              <p className="text-slate-300 font-medium text-[11px] leading-relaxed">
                {activity.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
