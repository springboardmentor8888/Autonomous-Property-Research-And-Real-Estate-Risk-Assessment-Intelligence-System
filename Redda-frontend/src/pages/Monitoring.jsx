import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Gavel,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

function Monitoring() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [checkingId, setCheckingId] = useState(null);

  const [monitoredProperties, setMonitoredProperties] = useState([
    {
      id: "REDDA-1001",
      address: "123 Main Street",
      city: "Austin",
      state: "Texas",
      riskScore: 18,
      riskLevel: "Low",
      status: "Monitoring",
      lastChecked: "28 Sep 2026",
      nextCheck: "05 Oct 2026",
      alerts: 0,
      checks: {
        ownership: "Verified",
        tax: "Verified",
        legal: "Verified",
        zoning: "Verified",
      },
    },
    {
      id: "REDDA-1002",
      address: "456 Oak Avenue",
      city: "Dallas",
      state: "Texas",
      riskScore: 46,
      riskLevel: "Medium",
      status: "Attention Required",
      lastChecked: "27 Sep 2026",
      nextCheck: "04 Oct 2026",
      alerts: 2,
      checks: {
        ownership: "Verified",
        tax: "Updated",
        legal: "Review Required",
        zoning: "Verified",
      },
    },
    {
      id: "REDDA-1003",
      address: "789 Pine Road",
      city: "Houston",
      state: "Texas",
      riskScore: 78,
      riskLevel: "High",
      status: "Alert",
      lastChecked: "26 Sep 2026",
      nextCheck: "03 Oct 2026",
      alerts: 4,
      checks: {
        ownership: "Review Required",
        tax: "Updated",
        legal: "Issue Found",
        zoning: "Review Required",
      },
    },
    {
      id: "REDDA-1004",
      address: "321 Maple Drive",
      city: "San Antonio",
      state: "Texas",
      riskScore: 22,
      riskLevel: "Low",
      status: "Monitoring",
      lastChecked: "25 Sep 2026",
      nextCheck: "02 Oct 2026",
      alerts: 1,
      checks: {
        ownership: "Verified",
        tax: "Verified",
        legal: "Verified",
        zoning: "Updated",
      },
    },
  ]);

  const [activities] = useState([
    {
      id: 1,
      property: "123 Main Street",
      type: "Ownership",
      message: "Ownership record verified successfully.",
      time: "2 hours ago",
      level: "success",
    },
    {
      id: 2,
      property: "456 Oak Avenue",
      type: "Legal",
      message: "Legal record requires additional review.",
      time: "5 hours ago",
      level: "warning",
    },
    {
      id: 3,
      property: "789 Pine Road",
      type: "Risk",
      message: "Risk score increased from 71 to 78.",
      time: "Yesterday",
      level: "danger",
    },
    {
      id: 4,
      property: "321 Maple Drive",
      type: "Zoning",
      message: "New zoning information detected.",
      time: "2 days ago",
      level: "warning",
    },
  ]);

  const [newProperty, setNewProperty] = useState({
    address: "",
    city: "",
    state: "",
  });

  const filteredProperties = useMemo(() => {
    return monitoredProperties.filter((property) => {
      const matchesSearch =
        property.address
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        property.city
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        property.id
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        property.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [monitoredProperties, search, statusFilter]);

  const totalProperties = monitoredProperties.length;

  const alertProperties = monitoredProperties.filter(
    (property) => property.status === "Alert"
  ).length;

  const attentionProperties = monitoredProperties.filter(
    (property) => property.status === "Attention Required"
  ).length;

  const lowRiskProperties = monitoredProperties.filter(
    (property) => property.riskLevel === "Low"
  ).length;

  const getRiskStyle = (riskLevel) => {
    if (riskLevel === "High") {
      return {
        badge: "bg-red-100 text-red-700",
        text: "text-red-600",
        background: "bg-red-50 border-red-200",
      };
    }

    if (riskLevel === "Medium") {
      return {
        badge: "bg-orange-100 text-orange-700",
        text: "text-orange-600",
        background: "bg-orange-50 border-orange-200",
      };
    }

    return {
      badge: "bg-green-100 text-green-700",
      text: "text-green-600",
      background: "bg-green-50 border-green-200",
    };
  };

  const getStatusStyle = (status) => {
    if (status === "Alert") {
      return "bg-red-100 text-red-700";
    }

    if (status === "Attention Required") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-green-100 text-green-700";
  };

  const getCheckStyle = (status) => {
    if (status === "Verified") {
      return "text-green-600 bg-green-50";
    }

    if (status === "Updated") {
      return "text-blue-600 bg-blue-50";
    }

    if (status === "Review Required") {
      return "text-orange-600 bg-orange-50";
    }

    return "text-red-600 bg-red-50";
  };

  const handleRunCheck = (id) => {
    setCheckingId(id);

    setTimeout(() => {
      setMonitoredProperties((current) =>
        current.map((property) =>
          property.id === id
            ? {
                ...property,
                lastChecked: "28 Sep 2026",
                nextCheck: "05 Oct 2026",
              }
            : property
        )
      );

      setCheckingId(null);
    }, 1500);
  };

  const handleViewDetails = (property) => {
    navigate("/property-details", {
      state: {
        property: {
          id: property.id,
          address: property.address,
          city: property.city,
          state: property.state,
          type: "Residential Property",
        },
      },
    });
  };

  const handleAddProperty = (event) => {
    event.preventDefault();

    if (!newProperty.address.trim()) {
      alert("Please enter a property address.");
      return;
    }

    const property = {
      id: `REDDA-${1000 + monitoredProperties.length + 1}`,
      address: newProperty.address.trim(),
      city: newProperty.city.trim() || "Unknown City",
      state: newProperty.state.trim() || "Unknown State",
      riskScore: 0,
      riskLevel: "Low",
      status: "Monitoring",
      lastChecked: "Not checked",
      nextCheck: "Pending",
      alerts: 0,
      checks: {
        ownership: "Pending",
        tax: "Pending",
        legal: "Pending",
        zoning: "Pending",
      },
    };

    setMonitoredProperties((current) => [property, ...current]);

    setNewProperty({
      address: "",
      city: "",
      state: "",
    });

    setShowAddModal(false);
  };

  const handleRemoveProperty = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to stop monitoring this property?"
    );

    if (!confirmed) {
      return;
    }

    setMonitoredProperties((current) =>
      current.filter((property) => property.id !== id)
    );
  };

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/p2.png')",
      }}
    >
      <div className="relative z-10 w-full min-h-screen p-2 md:p-4">

        {/* HEADER */}

        <div className="bg-white rounded-2xl border shadow-sm p-5 md:p-6 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity
                  size={21}
                  className="text-blue-600"
                />

                <span className="text-sm font-semibold text-blue-600">
                  Property Monitoring
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Monitoring
              </h1>

              <p className="text-gray-500 mt-2">
                Continuously monitor properties for ownership,
                legal, tax, zoning and risk changes.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition"
            >
              <Plus size={19} />
              Add Property
            </button>

          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">

          <SummaryCard
            icon={ShieldCheck}
            label="Monitored Properties"
            value={totalProperties}
            description="Currently being monitored"
            iconClass="text-blue-600"
            iconBackground="bg-blue-50"
          />

          <SummaryCard
            icon={AlertTriangle}
            label="Active Alerts"
            value={alertProperties}
            description="Properties with alerts"
            iconClass="text-red-600"
            iconBackground="bg-red-50"
          />

          <SummaryCard
            icon={Clock}
            label="Attention Required"
            value={attentionProperties}
            description="Need your review"
            iconClass="text-orange-600"
            iconBackground="bg-orange-50"
          />

          <SummaryCard
            icon={CheckCircle}
            label="Low Risk"
            value={lowRiskProperties}
            description="No major issues detected"
            iconClass="text-green-600"
            iconBackground="bg-green-50"
          />

        </div>

        {/* SEARCH AND FILTER */}

        <div className="bg-white rounded-2xl border shadow-sm p-5 mb-5">

          <div className="flex flex-col lg:flex-row gap-3">

            <div className="flex items-center gap-3 border rounded-xl px-4 py-3 flex-1 focus-within:ring-2 focus-within:ring-blue-500">

              <Search
                size={19}
                className="text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search property or property ID..."
                className="outline-none w-full text-gray-700"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="border rounded-xl px-4 py-3 outline-none text-gray-700 bg-white"
            >
              <option value="All">All Status</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Attention Required">
                Attention Required
              </option>
              <option value="Alert">Alert</option>
            </select>

          </div>

        </div>

        {/* PROPERTY LIST */}

        <div className="space-y-4">

          {filteredProperties.length === 0 ? (

            <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">

              <Activity
                size={42}
                className="mx-auto text-gray-300"
              />

              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                No monitored properties found
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Try another search or add a property to monitoring.
              </p>

            </div>

          ) : (

            filteredProperties.map((property) => {

              const riskStyle = getRiskStyle(
                property.riskLevel
              );

              return (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl border shadow-sm p-5"
                >

                  {/* PROPERTY HEADER */}

                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                    <div className="flex items-start gap-4">

                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <MapPin
                          size={23}
                          className="text-blue-600"
                        />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-lg font-bold text-gray-900">
                            {property.address}
                          </h2>

                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(
                              property.status
                            )}`}
                          >
                            {property.status}
                          </span>

                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                          {property.city}, {property.state}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {property.id}
                        </p>
                      </div>

                    </div>

                    {/* RISK */}

                    <div
                      className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${riskStyle.background}`}
                    >

                      <div>
                        <p className="text-xs text-gray-500">
                          Risk Score
                        </p>

                        <p
                          className={`text-2xl font-bold ${riskStyle.text}`}
                        >
                          {property.riskScore}
                          <span className="text-sm font-medium text-gray-400">
                            /100
                          </span>
                        </p>
                      </div>

                      {property.riskLevel === "High" ? (
                        <TrendingUp
                          className="text-red-600"
                          size={24}
                        />
                      ) : (
                        <TrendingDown
                          className="text-green-600"
                          size={24}
                        />
                      )}

                    </div>

                  </div>

                  {/* MONITORING CHECKS */}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

                    <MonitoringCheck
                      label="Ownership"
                      value={property.checks.ownership}
                      icon={ShieldCheck}
                      style={getCheckStyle(
                        property.checks.ownership
                      )}
                    />

                    <MonitoringCheck
                      label="Tax Records"
                      value={property.checks.tax}
                      icon={FileText}
                      style={getCheckStyle(
                        property.checks.tax
                      )}
                    />

                    <MonitoringCheck
                      label="Legal"
                      value={property.checks.legal}
                      icon={Gavel}
                      style={getCheckStyle(
                        property.checks.legal
                      )}
                    />

                    <MonitoringCheck
                      label="Zoning"
                      value={property.checks.zoning}
                      icon={MapPin}
                      style={getCheckStyle(
                        property.checks.zoning
                      )}
                    />

                  </div>

                  {/* FOOTER */}

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-5 pt-5 border-t">

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">

                      <div className="flex items-center gap-2">
                        <Clock size={15} />
                        Last checked:
                        <span className="font-medium text-gray-700">
                          {property.lastChecked}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar size={15} />
                        Next check:
                        <span className="font-medium text-gray-700">
                          {property.nextCheck}
                        </span>
                      </div>

                      {property.alerts > 0 && (
                        <div className="flex items-center gap-2 text-red-600">
                          <Bell size={15} />
                          {property.alerts} alert
                          {property.alerts > 1 ? "s" : ""}
                        </div>
                      )}

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          handleViewDetails(property)
                        }
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700"
                      >
                        <Eye size={16} />
                        Details
                      </button>

                      <button
                        onClick={() =>
                          handleRunCheck(property.id)
                        }
                        disabled={checkingId === property.id}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium"
                      >
                        <RefreshCw
                          size={16}
                          className={
                            checkingId === property.id
                              ? "animate-spin"
                              : ""
                          }
                        />

                        {checkingId === property.id
                          ? "Checking..."
                          : "Run Check"}
                      </button>

                      <button
                        onClick={() =>
                          handleRemoveProperty(property.id)
                        }
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Stop Monitoring"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* ACTIVITY */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">

          <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-5">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Monitoring Activity
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Recent changes detected by REDDA.
                </p>
              </div>

              <Activity
                size={22}
                className="text-blue-600"
              />

            </div>

            <div className="space-y-4">

              {activities.map((activity) => {

                const activityStyle =
                  activity.level === "danger"
                    ? "bg-red-50 text-red-600"
                    : activity.level === "warning"
                    ? "bg-orange-50 text-orange-600"
                    : "bg-green-50 text-green-600";

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3"
                  >

                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${activityStyle}`}
                    >
                      {activity.level === "danger" ? (
                        <AlertTriangle size={17} />
                      ) : activity.level === "warning" ? (
                        <Bell size={17} />
                      ) : (
                        <CheckCircle size={17} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">

                        <p className="font-medium text-gray-800">
                          {activity.property}
                        </p>

                        <span className="text-xs text-gray-400">
                          {activity.time}
                        </span>

                      </div>

                      <p className="text-sm text-gray-500 mt-1">
                        {activity.message}
                      </p>

                      <span className="inline-block text-xs text-gray-400 mt-1">
                        {activity.type}
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* MONITORING INFO */}

          <div className="bg-slate-900 rounded-2xl p-5 text-white">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Activity
                  size={21}
                  className="text-blue-400"
                />
              </div>

              <div>
                <h2 className="font-bold">
                  REDDA Monitoring
                </h2>

                <p className="text-xs text-slate-400">
                  Continuous property intelligence
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-4">

              <MonitoringFeature
                icon={ShieldCheck}
                title="Ownership"
                text="Detect ownership record changes."
              />

              <MonitoringFeature
                icon={FileText}
                title="Tax Records"
                text="Track property tax updates."
              />

              <MonitoringFeature
                icon={Gavel}
                title="Legal"
                text="Monitor legal and dispute information."
              />

              <MonitoringFeature
                icon={MapPin}
                title="Zoning"
                text="Detect zoning and land-use changes."
              />

            </div>

          </div>

        </div>

      </div>

      {/* ADD PROPERTY MODAL */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

            <div className="flex items-center justify-between p-5 border-b">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add Property to Monitoring
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Start monitoring a property for future changes.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={19} />
              </button>

            </div>

            <form
              onSubmit={handleAddProperty}
              className="p-5 space-y-4"
            >

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Address
                </label>

                <input
                  type="text"
                  value={newProperty.address}
                  onChange={(event) =>
                    setNewProperty({
                      ...newProperty,
                      address: event.target.value,
                    })
                  }
                  placeholder="Enter property address"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    value={newProperty.city}
                    onChange={(event) =>
                      setNewProperty({
                        ...newProperty,
                        city: event.target.value,
                      })
                    }
                    placeholder="City"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>

                  <input
                    type="text"
                    value={newProperty.state}
                    onChange={(event) =>
                      setNewProperty({
                        ...newProperty,
                        state: event.target.value,
                      })
                    }
                    placeholder="State"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                >
                  <Plus size={17} />
                  Start Monitoring
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  iconBackground,
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBackground}`}
        >
          <Icon
            size={22}
            className={iconClass}
          />
        </div>

      </div>

    </div>
  );
}

function MonitoringCheck({
  label,
  value,
  icon: Icon,
  style,
}) {
  return (
    <div className="border rounded-xl p-3">

      <div className="flex items-center gap-2">

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${style}`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0">

          <p className="text-xs text-gray-500">
            {label}
          </p>

          <p className="text-xs font-semibold mt-0.5 truncate">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

function MonitoringFeature({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <Icon
          size={16}
          className="text-blue-400"
        />
      </div>

      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="text-xs text-slate-400 mt-0.5">
          {text}
        </p>
      </div>

    </div>
  );
}

export default Monitoring;