"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      {/* Header */}
      <header className="bg-slate-900 text-white px-10 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Real Estate Due Diligence Agent
        </h1>

        <button
          onClick={handleLogout}
          className="bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
        >
          Logout
        </button>
      </header>

      {/* Dashboard Content */}
      <section className="max-w-7xl mx-auto mt-12">

        <h2 className="text-4xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="mt-3 text-lg text-slate-600">
          Welcome to your property due diligence workspace.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">

          {/* Search Property */}
          <div className="bg-white rounded-2xl shadow-sm border p-7">
            <h3 className="text-2xl font-bold text-slate-900">
              Search Property
            </h3>

            <p className="mt-5 text-lg text-slate-600">
              Search for a property using its address.
            </p>

            <button
              onClick={() => router.push("/property-search")}
              className="mt-7 bg-slate-900 text-white px-6 py-4 rounded-lg font-semibold hover:bg-slate-800"
            >
              Search Property
            </button>
          </div>

          {/* Due Diligence Reports */}
          <div className="bg-white rounded-2xl shadow-sm border p-7">
            <h3 className="text-2xl font-bold text-slate-900">
              Due Diligence Reports
            </h3>

            <p className="mt-5 text-lg text-slate-600">
              View property due diligence reports.
            </p>

            <button
              onClick={() => router.push("/reports")}
              className="mt-7 bg-slate-900 text-white px-6 py-4 rounded-lg font-semibold hover:bg-slate-800"
            >
              View Reports
            </button>
          </div>

          {/* Property History */}
          <div className="bg-white rounded-2xl shadow-sm border p-7">
            <h3 className="text-2xl font-bold text-slate-900">
              Property History
            </h3>

            <p className="mt-5 text-lg text-slate-600">
              Review historical property information.
            </p>

            <button
              onClick={() => router.push("/history")}
              className="mt-7 bg-slate-900 text-white px-6 py-4 rounded-lg font-semibold hover:bg-slate-800"
            >
              View History
            </button>
          </div>

        </div>
      </section>

    </main>
  );
}