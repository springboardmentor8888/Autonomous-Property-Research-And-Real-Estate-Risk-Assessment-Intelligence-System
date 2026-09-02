import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  ShieldAlert,
  FileText,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Properties",
      path: "/properties",
      icon: Building2,
    },
    {
      name: "Due Diligence",
      path: "/due-diligence",
      icon: ClipboardCheck,
    },
    {
      name: "Risk Assessment",
      path: "/risk-assessment",
      icon: ShieldAlert,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileText,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white flex flex-col border-r border-slate-800">

      <div className="px-5 pt-6 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
            <Sparkles size={21} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wide">
              REDDA
            </h1>

            <p className="text-xs text-slate-400">
              Real Estate Intelligence
            </p>
          </div>

        </div>
      </div>

      <div className="flex-1 px-4 py-6">

        <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>

        <nav className="space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-green-600 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">

                      <div
                        className={`flex items-center justify-center ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-white"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <span className="text-sm font-medium">
                        {item.name}
                      </span>

                    </div>

                    {isActive && (
                      <ChevronRight size={17} />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

        </nav>
      </div>

      <div className="px-4 pb-5">

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Sparkles
                size={18}
                className="text-green-400"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                REDDA AI
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />

                <span className="text-xs text-slate-400">
                  System Ready
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;