import { useState } from "react";
import {
  Bell,
  Search,
  LogOut,
  Settings,
  ChevronDown,
  Sparkles,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [search, setSearch] = useState("");

  const userName = localStorage.getItem("reddaUserName") || "User";
  const userEmail = localStorage.getItem("reddaUserEmail") || "";

  const handleLogout = () => {
    localStorage.removeItem("reddaLoggedIn");
    localStorage.removeItem("reddaUserName");
    localStorage.removeItem("reddaUserEmail");

    setShowMenu(false);
    navigate("/login", { replace: true });
  };

  const handleSettings = () => {
    setShowMenu(false);
    navigate("/settings");
  };

  const handleSearch = (e) => {
    if (e.key !== "Enter") return;

    const value = search.trim().toLowerCase();

    if (!value) return;

    if (
      value.includes("ai") ||
      value.includes("intelligence") ||
      value.includes("analysis")
    ) {
      navigate("/ai-intelligence");
    } else if (
      value.includes("property") ||
      value.includes("properties")
    ) {
      navigate("/properties");
    } else if (
      value.includes("risk") ||
      value.includes("assessment")
    ) {
      navigate("/risk-assessment");
    } else if (
      value.includes("report") ||
      value.includes("reports")
    ) {
      navigate("/reports");
    } else if (
      value.includes("monitor") ||
      value.includes("monitoring")
    ) {
      navigate("/monitoring");
    } else if (
      value.includes("due") ||
      value.includes("diligence")
    ) {
      navigate("/due-diligence");
    }

    setSearch("");
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">

      {/* Left Side */}
      <div className="flex items-center gap-4 min-w-0">

        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 w-56 md:w-80 lg:w-96 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition bg-white">

          <Search
            size={18}
            className="text-gray-400 shrink-0"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search property or module..."
            className="outline-none w-full text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* AI Quick Access */}
        <button
          onClick={() => navigate("/ai-intelligence")}
          className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100 text-green-700 hover:bg-green-100 transition"
          title="Open AI Intelligence"
        >
          <Sparkles size={17} />

          <span className="text-sm font-semibold">
            AI Intelligence
          </span>
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 md:gap-5">

        {/* AI Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>

          <span className="text-xs font-medium text-slate-600">
            AI Ready
          </span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-lg hover:bg-gray-100 transition"
          title="Notifications"
        >
          <Bell
            size={21}
            className="text-gray-600"
          />

          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* User Menu */}
        <div className="relative">

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 md:gap-3 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition"
          >

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="text-left hidden sm:block max-w-32">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {userName}
              </p>

              <p className="text-xs text-gray-500">
                Admin
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${
                showMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />

              <div className="absolute right-0 top-14 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">

                {/* Profile Header */}
                <div className="px-4 py-4 border-b border-gray-100 bg-slate-50">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {userName}
                      </p>

                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {userEmail}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />

                        <span className="text-xs text-green-600 font-medium">
                          Account Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Intelligence */}
                <div className="p-2 border-b border-gray-100">

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate("/ai-intelligence");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <Brain size={17} className="text-green-600" />
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-medium">
                        AI Intelligence
                      </p>

                      <p className="text-xs text-gray-400">
                        Analyze properties with REDDA AI
                      </p>
                    </div>
                  </button>
                </div>

                {/* Menu */}
                <div className="p-2">

                  <button
                    onClick={handleSettings}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Settings size={18} />

                    <span className="text-sm font-medium">
                      Settings
                    </span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={18} />

                    <span className="text-sm font-medium">
                      Logout
                    </span>
                  </button>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;