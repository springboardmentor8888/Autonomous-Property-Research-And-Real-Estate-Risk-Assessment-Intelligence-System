import { useState } from "react";
import { Bell, Search, LogOut, Settings, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

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

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 w-80 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search property..."
          className="outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-5">
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 transition"
          title="Notifications"
        >
          <Bell size={21} className="text-gray-600" />

          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">
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

          {showMenu && (
            <div className="absolute right-0 top-14 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {userName}
                    </p>

                    <p className="text-xs text-gray-500 truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </div>

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
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;