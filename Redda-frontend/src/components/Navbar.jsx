import { useState } from "react";
import { Bell, Search, LogOut, User, Settings } from "lucide-react";
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

    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">

      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-80">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search property..."
          className="outline-none w-full text-sm text-gray-700"
        />
      </div>

      <div className="flex items-center gap-5">

        <button className="relative">
          <Bell size={21} className="text-gray-600" />

          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">
                {userName}
              </p>

              <p className="text-xs text-gray-500">
                Admin
              </p>
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 w-60 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">

              <div className="px-4 py-3 border-b">
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
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  <Settings size={18} />
                  <span className="text-sm">
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