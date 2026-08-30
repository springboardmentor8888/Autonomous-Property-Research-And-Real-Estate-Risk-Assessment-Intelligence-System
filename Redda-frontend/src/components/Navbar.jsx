import { Bell, Search } from "lucide-react";

function Navbar() {
  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      
      {/* Search */}
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-80">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search property..."
          className="outline-none w-full text-sm"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        
        <button className="relative">
          <Bell size={21} className="text-gray-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold">
            A
          </div>

          <div>
            <p className="text-sm font-semibold">User</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Navbar;