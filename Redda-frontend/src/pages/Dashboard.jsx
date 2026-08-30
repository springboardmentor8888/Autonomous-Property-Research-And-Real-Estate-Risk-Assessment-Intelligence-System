function Dashboard() {
  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back! Here's your property overview.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Properties */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">
            Total Properties
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            24
          </h2>

          <p className="text-sm text-green-600 mt-2">
            View all properties →
          </p>
        </div>

        {/* Reports */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">
            Reports Generated
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            18
          </h2>

          <p className="text-sm text-green-600 mt-2">
            View all reports →
          </p>
        </div>

        {/* High Risk */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">
            High Risk Properties
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            6
          </h2>

          <p className="text-sm text-red-500 mt-2">
            Requires attention
          </p>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">
            Alerts
          </p>

          <h2 className="text-3xl font-bold text-orange-500 mt-2">
            3
          </h2>

          <p className="text-sm text-orange-500 mt-2">
            View alerts →
          </p>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Activity
          </h2>

          <button className="text-sm text-green-600 hover:underline">
            View all
          </button>
        </div>

        <div className="space-y-4">

          {/* Activity 1 */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium text-gray-800">
                Due diligence completed
              </p>

              <p className="text-sm text-gray-500">
                123 Main Street
              </p>
            </div>

            <p className="text-sm text-gray-400">
              2 hours ago
            </p>
          </div>

          {/* Activity 2 */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium text-gray-800">
                New report generated
              </p>

              <p className="text-sm text-gray-500">
                456 Oak Avenue
              </p>
            </div>

            <p className="text-sm text-gray-400">
              5 hours ago
            </p>
          </div>

          {/* Activity 3 */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium text-gray-800">
                Property data updated
              </p>

              <p className="text-sm text-gray-500">
                789 Pine Road
              </p>
            </div>

            <p className="text-sm text-gray-400">
              1 day ago
            </p>
          </div>

          {/* Activity 4 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                Risk assessment completed
              </p>

              <p className="text-sm text-gray-500">
                321 Maple Drive
              </p>
            </div>

            <p className="text-sm text-gray-400">
              2 days ago
            </p>
          </div>

        </div>
      </div>

      {/* Risk Summary + AI Insight */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Risk Summary */}
        <div className="bg-white rounded-xl shadow-sm border p-6">

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Risk Summary
            </h2>

            <span className="text-sm text-gray-500">
              24 Properties
            </span>
          </div>

          <div className="mt-6 space-y-6">

            {/* High Risk */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">
                  High Risk
                </span>

                <span className="text-sm font-semibold text-red-600">
                  6
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full w-1/4"></div>
              </div>
            </div>

            {/* Medium Risk */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Medium Risk
                </span>

                <span className="text-sm font-semibold text-orange-500">
                  12
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-orange-400 h-3 rounded-full w-1/2"></div>
              </div>
            </div>

            {/* Low Risk */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Low Risk
                </span>

                <span className="text-sm font-semibold text-green-600">
                  6
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full w-1/4"></div>
              </div>
            </div>

          </div>
        </div>

        {/* AI Property Insight */}
        <div className="bg-slate-900 rounded-xl shadow-sm p-6 text-white">

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              AI Property Insight
            </h2>

            <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
              AI Analysis
            </span>
          </div>

          <p className="mt-5 text-slate-300 leading-relaxed">
            6 properties require immediate attention based on
            current risk indicators. The most common issues are
            zoning compliance, tax records, and flood-zone
            verification.
          </p>

          <div className="mt-5 space-y-2">
            <p className="text-sm text-slate-300">
              ✓ Ownership records reviewed
            </p>

            <p className="text-sm text-slate-300">
              ⚠ Zoning verification required
            </p>

            <p className="text-sm text-slate-300">
              ⚠ Tax records need attention
            </p>
          </div>

          <button className="mt-6 bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg font-medium transition">
            View AI Analysis →
          </button>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;