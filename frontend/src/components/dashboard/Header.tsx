import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, Search, ShieldCheck, Database, HardDrive } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, currentView } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const getViewTitle = (view: string) => {
    switch (view) {
      case 'overview':
        return 'Overview Dashboard';
      case 'profile':
        return 'Profile Settings';
      case 'search':
        return 'Property Valuation Search';
      case 'portfolio':
        return 'My Property Portfolio';
      case 'reports':
        return 'Due Diligence Reports';
      case 'listings':
        return 'Manage Real Estate Listings';
      case 'add-property':
        return 'Add Property for Valuation';
      case 'legal-review':
        return 'Legal & Title Audit';
      case 'zoning-title':
        return 'Zoning & Encroachment Logs';
      case 'risk-assessment':
        return 'Financial Risk Valuation';
      case 'comparables':
        return 'Comparable Property Sales';
      case 'user-management':
        return 'System User Management';
      case 'audit-logs':
        return 'Immutable System Audit Logs';
      case 'settings':
        return 'System Platform Configurations';
      default:
        return 'Veritas Workspace';
    }
  };

  const notifications = [
    { id: '1', text: 'Elena Rostova flagged 404 Industrial Parkway', time: '15 mins ago', read: false },
    { id: '2', text: 'Zoning API database replication complete', time: '1 hour ago', read: true },
    { id: '3', text: 'New property verification submitted', time: '4 hours ago', read: true }
  ];

  return (
    <header className="h-16 border-b border-slate-800/60 bg-[#090d16]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left side: Hamburger and View Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-400 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {getViewTitle(currentView)}
          </h2>
          <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
            Veritas System • Role: <span className="text-emerald-400">{user.role}</span> Workspace
          </p>
        </div>
      </div>

      {/* Right side: System Status & User Options */}
      <div className="flex items-center gap-4">
        
        {/* Status Indicators */}
        <div className="hidden md:flex items-center gap-3 border-r border-slate-800/80 pr-4 text-[10px] font-semibold text-slate-400">
          <div className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL: Live</span>
          </div>
          <div className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Redis: Connected</span>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Quick search properties..."
            className="w-48 bg-slate-900/60 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 focus:w-60 transition-all duration-300"
          />
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
          </button>

          {showNotifications && (
            <>
              <div 
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-2 w-72 glass-panel rounded-xl shadow-2xl overflow-hidden z-50 py-1.5">
                <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  <span className="text-[10px] text-emerald-400 font-medium cursor-pointer">Mark all read</span>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => setShowNotifications(false)}
                      className={`p-3 text-xs hover:bg-slate-800/30 cursor-pointer transition ${!n.read ? 'bg-emerald-500/[0.02]' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${!n.read ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <div>
                          <p className="text-slate-300 leading-tight">{n.text}</p>
                          <span className="text-[9px] text-slate-500 block mt-1">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Mini Avatar block */}
        <div className="flex items-center gap-2">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-8 h-8 rounded-lg object-cover border border-slate-800"
          />
        </div>
      </div>
      
    </header>
  );
};
