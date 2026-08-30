import { BrowserRouter, Routes, Route } from "react-router-dom";
import DueDiligence from "./pages/DueDiligence";
import RiskAssessment from "./pages/RiskAssessment";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import PropertySearch from "./pages/PropertySearch";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-100">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div className="flex-1">

          {/* Navbar */}
          <Navbar />

          {/* Pages */}
          <main className="p-8">
            <Routes>

              <Route path="/" element={<Dashboard />} />

              <Route
                path="/properties"
                element={<PropertySearch />}
              />
                 <Route
                   path="/due-diligence"
                  element={<DueDiligence />}
              />
              <Route
               path="/risk-assessment"
                element={<RiskAssessment />} 
                />
                <Route
                 path="/reports"
                  element={<Reports />} 
                  />
                  <Route
                   path="/settings"
                    element={<Settings />} 
                    />
            </Routes>
            
          </main>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;