import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PropertySearch from "./pages/PropertySearch";
import DueDiligence from "./pages/DueDiligence";
import RiskAssessment from "./pages/RiskAssessment";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/properties" element={<PropertySearch />} />
            <Route path="/due-diligence" element={<DueDiligence />} />
            <Route path="/risk-assessment" element={<RiskAssessment />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;