import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">
          <Dashboard />
        </main>
      </div>

    </div>
  );
}

export default App;