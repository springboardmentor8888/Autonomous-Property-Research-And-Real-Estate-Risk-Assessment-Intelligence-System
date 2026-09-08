import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../data/mockData';
import { 
  Building2, LayoutDashboard, UserCog, LogOut, Search, FolderHeart, 
  ShieldAlert, PlusSquare, FileText, Scale, MapPin, LineChart, 
  GitCompare, Users, History, Settings, Menu, X, CheckSquare
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout, currentView, setCurrentView } = useAuth();

  if (!user) return null;

  // Custom Navigation list based on user role
  const getNavItems = (role: UserRole) => {
    const baseItems = [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    ];

    let roleItems: { id: string; label: string; icon: React.FC<any> }[] = [];

    switch (role) {
      case 'Buyer':
        roleItems = [
          { id: 'search', label: 'Property Search', icon: Search },
          { id: 'portfolio', label: 'My Saved Properties', icon: FolderHeart },
          { id: 'reports', label: 'Due Diligence Reports', icon: ShieldAlert },
        ];
        break;
      case 'Real Estate Agent':
        roleItems = [
          { id: 'listings', label: 'Property Listings', icon: Building2 },
          { id: 'add-property', label: 'Add New Property', icon: PlusSquare },
          { id: 'reports', label: 'Due Diligence Reports', icon: ShieldAlert },
        ];
        break;
      case 'Legal Advisor':
        roleItems = [
          { id: 'legal-review', label: 'Contracts Audit', icon: Scale },
          { id: 'zoning-title', label: 'Zoning & Titles', icon: MapPin },
          { id: 'reports', label: 'Due Diligence Reports', icon: FileText },
        ];
        break;
      case 'Financial Institution':
        roleItems = [
          { id: 'risk-assessment', label: 'Risk Valuation', icon: LineChart },
          { id: 'comparables', label: 'Comparable Analysis', icon: GitCompare },
          { id: 'reports', label: 'Reports Approval', icon: CheckSquare },
        ];
        break;
      case 'Administrator':
        roleItems = [
          { id: 'user-management', label: 'User Directory', icon: Users },
          { id: 'audit-logs', label: 'System Audit Logs', icon: History },
          { id: 'settings', label: 'System Config', icon: Settings },
        ];
        break;
    }

    return [...baseItems, ...roleItems, { id: 'profile', label: 'Profile Settings', icon: UserCog }];
  };

  const navItems = getNavItems(user.role);

  return (
    <>
      {/* Mobile Sidebar overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c1220]/90 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo and close button for mobile */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-heading font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                VERITAS
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-3 block mb-2">
              Navigation Workspace
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left text-xs font-medium flex items-center gap-3 transition-all duration-150 ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 border border-emerald-500/30 text-emerald-400 font-semibold'
                      : 'text-slate-400 border border-transparent hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <span className="inline-block text-[10px] text-emerald-400 font-medium px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/40">
                {user.role}
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full py-2 px-3 border border-red-900/20 hover:border-red-950 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300 font-medium text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition duration-150"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
