import {
  Building2,
  FileText,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Home,
  Sparkles,
  Database,
  ArrowUpRight,
} from "lucide-react";

function Dashboard() {
  const activities = [
    {
      title: "Due diligence completed",
      address: "123 Main Street",
      time: "2 hours ago",
      image: "/image1.png",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "New report generated",
      address: "456 Oak Avenue",
      time: "5 hours ago",
      image: "/image2.png",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Property data updated",
      address: "789 Pine Road",
      time: "1 day ago",
      image: "/image3.png",
      icon: Database,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Risk assessment completed",
      address: "321 Maple Drive",
      time: "2 days ago",
      image: "/image.png",
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/p2.png')" }}
    >
    

      <div className="relative z-10 space-y-6 p-2">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-slate-600">
            Welcome back! Here's your property overview.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* Total Properties */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/70 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">

              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                <Building2
                  className="text-green-600"
                  size={23}
                />
              </div>

              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <ArrowUpRight size={16} />
                +12%
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Total Properties
            </p>

            <div className="flex items-end gap-3 mt-1">
              <h2 className="text-3xl font-bold text-slate-900">
                24
              </h2>

              <span className="text-xs text-slate-400 mb-1">
                this month
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-green-600 cursor-pointer hover:underline">
              View all properties →
            </p>
          </div>

          {/* Reports */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/70 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">

              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText
                  className="text-blue-600"
                  size={23}
                />
              </div>

              <div className="flex items-center gap-1 text-blue-600 text-sm font-semibold">
                <ArrowUpRight size={16} />
                +29%
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Reports Generated
            </p>

            <div className="flex items-end gap-3 mt-1">
              <h2 className="text-3xl font-bold text-slate-900">
                18
              </h2>

              <span className="text-xs text-slate-400 mb-1">
                this month
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-green-600 cursor-pointer hover:underline">
              View all reports →
            </p>
          </div>

          {/* High Risk */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/70 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">

              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle
                  className="text-red-600"
                  size={23}
                />
              </div>

              <span className="text-sm font-semibold text-red-500">
                25%
              </span>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              High Risk Properties
            </p>

            <div className="flex items-end gap-3 mt-1">
              <h2 className="text-3xl font-bold text-red-600">
                6
              </h2>

              <span className="text-xs text-red-400 mb-1">
                require attention
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-red-500">
              Requires attention
            </p>
          </div>

          {/* Alerts */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/70 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">

              <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                <Bell
                  className="text-orange-500"
                  size={23}
                />
              </div>

              <span className="text-sm font-semibold text-orange-500">
                1 urgent
              </span>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Alerts
            </p>

            <div className="flex items-end gap-3 mt-1">
              <h2 className="text-3xl font-bold text-orange-500">
                3
              </h2>

              <span className="text-xs text-orange-400 mb-1">
                requires action
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-orange-500">
              View alerts →
            </p>
          </div>

        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <div className="xl:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl border border-white/70 shadow-lg p-6">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Activity
              </h2>

              <button className="text-sm font-semibold text-green-600 hover:underline">
                View all
              </button>
            </div>

            <div className="space-y-1">

              {activities.map((activity, index) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 py-3 border-b last:border-b-0 border-slate-100"
                  >

                    <img
                      src={activity.image}
                      alt="Property"
                      className="w-16 h-14 rounded-xl object-cover shadow-sm"
                    />

                    <div
                      className={`w-9 h-9 rounded-full ${activity.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon
                        size={18}
                        className={activity.color}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">
                        {activity.title}
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        {activity.address}
                      </p>
                    </div>

                    <span className="text-sm text-slate-400 whitespace-nowrap">
                      {activity.time}
                    </span>

                  </div>
                );
              })}

            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Portfolio Health */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 min-h-[250px] shadow-lg">

              <div className="absolute inset-0 opacity-20">
                <img
                  src="/p2.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative z-10">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <ShieldCheck
                      size={23}
                      className="text-green-400"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Portfolio Health
                    </h2>

                    <p className="text-xs text-slate-300">
                      Overall safety score of your properties
                    </p>
                  </div>

                </div>

                <div className="flex items-center justify-between mt-6">

                  <div className="space-y-3">

                    <div className="flex items-center gap-2 text-sm">
                      <Home
                        size={17}
                        className="text-green-400"
                      />

                      <span>
                        <b>24</b> Properties analyzed
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle
                        size={17}
                        className="text-orange-400"
                      />

                      <span>
                        <b>6</b> Require attention
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck
                        size={17}
                        className="text-green-400"
                      />

                      <span>
                        <b>18</b> Safe to purchase
                      </span>
                    </div>

                  </div>

                  <div className="w-28 h-28 rounded-full border-[10px] border-green-400/30 border-t-green-400 flex items-center justify-center">

                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        78
                      </div>

                      <div className="text-xs text-slate-300">
                        /100
                      </div>
                    </div>

                  </div>

                </div>

                <div className="inline-flex items-center gap-2 mt-5 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  LOW RISK
                </div>

              </div>
            </div>

            {/* REDDA AI */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50/95 to-white/95 backdrop-blur-md border border-green-100 p-6 min-h-[190px] shadow-lg">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Sparkles
                      size={22}
                      className="text-green-600"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      REDDA AI
                    </h2>

                    <p className="text-xs text-slate-500">
                      Purchase Intelligence
                    </p>
                  </div>

                </div>

                <span className="text-xs font-semibold bg-green-100 text-green-600 px-3 py-1.5 rounded-full">
                  AI Analysis
                </span>

              </div>

              <p className="mt-5 text-sm text-slate-600 max-w-md">
                6 properties require additional due diligence before purchase.
              </p>

              <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition">
                View AI Analysis →
              </button>

            </div>

          </div>

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Risk Summary */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/70 shadow-lg p-6">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold text-slate-900">
                Risk Summary
              </h2>

              <span className="text-sm text-slate-400">
                24 Properties
              </span>

            </div>

            <div className="mt-6 space-y-5">

              {/* High Risk */}
              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-sm text-slate-600">
                    High Risk
                  </span>

                  <span className="text-sm font-semibold text-red-600">
                    6
                  </span>

                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-red-500 rounded-full"></div>
                </div>

              </div>

              {/* Medium Risk */}
              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-sm text-slate-600">
                    Medium Risk
                  </span>

                  <span className="text-sm font-semibold text-orange-500">
                    12
                  </span>

                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-orange-400 rounded-full"></div>
                </div>

              </div>

              {/* Low Risk */}
              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-sm text-slate-600">
                    Low Risk
                  </span>

                  <span className="text-sm font-semibold text-green-600">
                    6
                  </span>

                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-green-500 rounded-full"></div>
                </div>

              </div>

            </div>
          </div>

          {/* Properties Requiring Attention */}
          <div className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle
                    size={22}
                    className="text-red-400"
                  />
                </div>

                <h2 className="text-xl font-bold">
                  Properties Requiring Attention
                </h2>

              </div>

              <button className="text-sm text-green-400 hover:underline">
                View all
              </button>

            </div>

            <div className="mt-5 space-y-4">

              <div className="flex items-center justify-between border-b border-slate-700 pb-3">

                <div>
                  <p className="font-semibold">
                    123 Main Street
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Zoning verification required
                  </p>
                </div>

                <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
                  High Risk
                </span>

              </div>

              <div className="flex items-center justify-between border-b border-slate-700 pb-3">

                <div>
                  <p className="font-semibold">
                    456 Oak Avenue
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Tax records need attention
                  </p>
                </div>

                <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">
                  Medium Risk
                </span>

              </div>

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-semibold">
                    789 Pine Road
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Flood-zone verification
                  </p>
                </div>

                <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">
                  Medium Risk
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;