import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  ShieldAlert,
  FileText,
  Settings,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-5">
      
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">REDDA</h1>
        <p className="text-sm text-slate-400">
          Real Estate Intelligence
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">

        <a className="flex items-center gap-3 p-3 rounded-lg bg-slate-800">
          <LayoutDashboard size={20} />
          Dashboard
        </a>

        <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800">
          <Building2 size={20} />
          Properties
        </a>

        <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800">
          <ClipboardCheck size={20} />
          Due Diligence
        </a>

        <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800">
          <ShieldAlert size={20} />
          Risk Assessment
        </a>

        <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800">
          <FileText size={20} />
          Reports
        </a>

        <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800">
          <Settings size={20} />
          Settings
        </a>

      </nav>
    </aside>
  );
}

export default Sidebar;