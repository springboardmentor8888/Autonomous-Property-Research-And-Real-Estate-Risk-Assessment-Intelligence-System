import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { OverviewView } from './components/views/OverviewView';
import { ProfileView } from './components/views/ProfileView';
import { PropertyList } from './components/dashboard/PropertyList';
import { 
  PropertySearchView, AddPropertyView, LegalAuditingView, 
  FinancialRiskView, UserManagementView, AuditLogsView 
} from './components/views/RoleViews';
import { SandboxPanel } from './components/dashboard/SandboxPanel';

const AppContent: React.FC = () => {
  const { user, currentView } = useAuth();

  // If not logged in, show auth screens
  if (!user) {
    return <AuthScreen />;
  }

  // Render view depending on navigation workspace
  const renderWorkspaceView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView />;
      case 'profile':
        return <ProfileView />;
      case 'search':
        return <PropertySearchView />;
      case 'portfolio':
        return <PropertyList />;
      case 'listings':
        return <PropertyList />;
      case 'add-property':
        return <AddPropertyView />;
      case 'reports':
        return <FinancialRiskView />;
      case 'legal-review':
        return <LegalAuditingView />;
      case 'zoning-title':
        return <LegalAuditingView />;
      case 'risk-assessment':
        return <FinancialRiskView />;
      case 'comparables':
        return <FinancialRiskView />;
      case 'user-management':
        return <UserManagementView />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'settings':
        return (
          <div className="p-6 rounded-2xl glass-panel text-center max-w-xl mx-auto space-y-4">
            <h4 className="font-heading font-extrabold text-sm text-white">Veritas Integration Settings</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              API Gateways: Zoning API, Federal Flood Hazard indexes, and National Property Tax Ledger connectors are all active and operational.
            </p>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-left text-[10px] space-y-1.5 font-mono text-emerald-400">
              <div>ZONING_API_ENDPOINT = https://api.veritas-dilgence.io/v1/zoning</div>
              <div>ENV_FLOOD_DATABASE = host=10.45.1.2 port=5432 dbname=flood_hazards</div>
              <div>AUDIT_CHAIN_DEED_HASH = 0x8aef82...d2e3</div>
            </div>
          </div>
        );
      default:
        return <OverviewView />;
    }
  };

  return (
    <DashboardLayout>
      {renderWorkspaceView()}
      <SandboxPanel />
    </DashboardLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
