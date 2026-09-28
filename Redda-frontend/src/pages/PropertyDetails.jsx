import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Home,
  User,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Ruler,
  Building2,
  Landmark,
  Gavel,
  Droplets,
  Receipt,
  Download,
  Eye,
  Search,
  ExternalLink,
} from "lucide-react";

function PropertyDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedProperty = location.state?.property;

  const [activeTab, setActiveTab] = useState("overview");

  const property = {
    id: selectedProperty?.id || "REDDA-1001",
    address:
      selectedProperty?.address ||
      selectedProperty?.property ||
      "123 Main Street",
    city: selectedProperty?.city || "Austin",
    state: selectedProperty?.state || "Texas",
    zip: selectedProperty?.zip || "78701",
    type: selectedProperty?.type || "Residential",
    status: "Active",
    owner: "John Anderson",
    surveyNumber: "123/45",
    khasraNumber: "KHS-789456",
    ulpin: "28123456789012",
    area: "2,400 sq ft",
    yearBuilt: "2018",
    registrationDate: "15 March 2018",
    lastVerified: "28 September 2026",
    latitude: "30.2672",
    longitude: "-97.7431",
  };

  const riskScore = 18;

  const documents = [
    {
      name: "Sale Deed",
      type: "Ownership Document",
      status: "Verified",
      date: "15 Mar 2018",
    },
    {
      name: "Property Tax Receipt",
      type: "Tax Document",
      status: "Verified",
      date: "20 Aug 2026",
    },
    {
      name: "Ownership Record",
      type: "Land Record",
      status: "Verified",
      date: "28 Sep 2026",
    },
    {
      name: "Encumbrance Certificate",
      type: "Legal Document",
      status: "Pending Review",
      date: "25 Sep 2026",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "ownership", label: "Ownership", icon: User },
    { id: "history", label: "Property History", icon: Calendar },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  const getRiskColor = () => {
    if (riskScore >= 70) return "text-red-600";
    if (riskScore >= 40) return "text-orange-500";
    return "text-green-600";
  };

  const getRiskBg = () => {
    if (riskScore >= 70) return "bg-red-50 border-red-200";
    if (riskScore >= 40) return "bg-orange-50 border-orange-200";
    return "bg-green-50 border-green-200";
  };

  const startDueDiligence = () => {
    navigate("/due-diligence", {
      state: {
        property,
      },
    });
  };

  const startRiskAssessment = () => {
    navigate("/risk-assessment", {
      state: {
        property,
      },
    });
  };

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/p2.png')" }}
    >
      <div className="relative z-10 w-full min-h-screen p-2 md:p-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 md:p-6 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate("/properties")}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
              >
                <ArrowLeft size={21} />
              </button>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Home size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    Property Details
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {property.address}
                </h1>

                <div className="flex items-center gap-2 text-gray-500 mt-2">
                  <MapPin size={16} />
                  <span>
                    {property.city}, {property.state} {property.zip}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={startDueDiligence}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
              >
                <ShieldCheck size={18} />
                Due Diligence
              </button>

              <button
                onClick={startRiskAssessment}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition"
              >
                <AlertTriangle size={18} />
                Risk Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Property Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {property.type}
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl">
                <Building2 className="text-blue-600" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Property Area</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {property.area}
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl">
                <Ruler className="text-purple-600" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ownership</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  Verified
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="text-green-600" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Risk Score</p>
                <p className={`text-xl font-bold mt-1 ${getRiskColor()}`}>
                  {riskScore}/100
                </p>
              </div>

              <div className={`p-3 rounded-xl ${getRiskBg()}`}>
                <ShieldCheck className={getRiskColor()} size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-5 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 whitespace-nowrap font-medium transition ${
                    active
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Property Overview
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={MapPin}
                      label="Address"
                      value={`${property.address}, ${property.city}, ${property.state}`}
                    />

                    <InfoCard
                      icon={Building2}
                      label="Property Type"
                      value={property.type}
                    />

                    <InfoCard
                      icon={Ruler}
                      label="Land / Built Area"
                      value={property.area}
                    />

                    <InfoCard
                      icon={Calendar}
                      label="Year Built"
                      value={property.yearBuilt}
                    />

                    <InfoCard
                      icon={Landmark}
                      label="Survey Number"
                      value={property.surveyNumber}
                    />

                    <InfoCard
                      icon={Landmark}
                      label="ULPIN"
                      value={property.ulpin}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                  <h2 className="font-bold text-gray-900 mb-4">
                    Verification Status
                  </h2>

                  <div className="space-y-4">
                    <StatusRow
                      label="Ownership"
                      status="Verified"
                      success
                    />

                    <StatusRow
                      label="Registration"
                      status="Verified"
                      success
                    />

                    <StatusRow
                      label="Property Tax"
                      status="Verified"
                      success
                    />

                    <StatusRow
                      label="Legal Records"
                      status="Review Required"
                      success={false}
                    />
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Last verified
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {property.lastVerified}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Location
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="h-72 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin
                        size={42}
                        className="mx-auto text-blue-600 mb-3"
                      />
                      <p className="font-semibold text-gray-800">
                        Property Location
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {property.latitude}, {property.longitude}
                      </p>

                      <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                        <ExternalLink size={15} />
                        Open Map
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-900 mb-4">
                      Location Information
                    </h3>

                    <div className="space-y-4">
                      <DetailRow label="Latitude" value={property.latitude} />
                      <DetailRow
                        label="Longitude"
                        value={property.longitude}
                      />
                      <DetailRow
                        label="Address"
                        value={`${property.address}, ${property.city}`}
                      />
                      <DetailRow
                        label="State"
                        value={property.state}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Quick Actions
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <QuickAction
                    icon={ShieldCheck}
                    title="Due Diligence"
                    description="Analyze ownership and records"
                    onClick={startDueDiligence}
                  />

                  <QuickAction
                    icon={AlertTriangle}
                    title="Risk Assessment"
                    description="Check property risk"
                    onClick={startRiskAssessment}
                  />

                  <QuickAction
                    icon={FileText}
                    title="View Reports"
                    description="Open generated reports"
                    onClick={() => navigate("/reports")}
                  />

                  <QuickAction
                    icon={Search}
                    title="Search Another"
                    description="Find another property"
                    onClick={() => navigate("/properties")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ownership */}
          {activeTab === "ownership" && (
            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <User className="text-blue-600" size={22} />
                    </div>

                    <div>
                      <h2 className="font-bold text-gray-900">
                        Current Owner
                      </h2>
                      <p className="text-sm text-gray-500">
                        Official ownership record
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Owner Name</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {property.owner}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                  <h2 className="font-bold text-gray-900 mb-5">
                    Land Record Information
                  </h2>

                  <div className="space-y-4">
                    <DetailRow
                      label="Survey Number"
                      value={property.surveyNumber}
                    />

                    <DetailRow
                      label="Khasra Number"
                      value={property.khasraNumber}
                    />

                    <DetailRow
                      label="ULPIN"
                      value={property.ulpin}
                    />

                    <DetailRow
                      label="Land Area"
                      value={property.area}
                    />

                    <DetailRow
                      label="Registration Date"
                      value={property.registrationDate}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 p-5 bg-green-50 border border-green-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <CheckCircle
                    className="text-green-600 mt-0.5"
                    size={22}
                  />

                  <div>
                    <h3 className="font-bold text-green-800">
                      Ownership Record Verified
                    </h3>

                    <p className="text-sm text-green-700 mt-1">
                      Ownership information is currently marked as verified
                      in the REDDA property record.
                    </p>

                    <p className="text-xs text-green-600 mt-2">
                      Last checked: {property.lastVerified}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Property History */}
          {activeTab === "history" && (
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Property History
              </h2>

              <div className="relative">
                <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" />

                <div className="space-y-6">
                  <TimelineItem
                    date="28 Sep 2026"
                    title="Ownership Record Verified"
                    description="Current ownership record checked and updated."
                    icon={CheckCircle}
                  />

                  <TimelineItem
                    date="20 Aug 2026"
                    title="Property Tax Updated"
                    description="Latest property tax payment record received."
                    icon={Receipt}
                  />

                  <TimelineItem
                    date="15 Mar 2018"
                    title="Property Registered"
                    description="Property registration record created."
                    icon={Landmark}
                  />

                  <TimelineItem
                    date="10 Jan 2018"
                    title="Property Transaction"
                    description="Property transaction recorded."
                    icon={FileText}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === "documents" && (
            <div className="p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Property Documents
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Documents associated with this property
                  </p>
                </div>

                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">
                  <FileText size={17} />
                  Upload Document
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Document
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Type
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Date
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {documents.map((document) => (
                      <tr
                        key={document.name}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <FileText
                                size={18}
                                className="text-blue-600"
                              />
                            </div>

                            <span className="font-medium text-gray-900">
                              {document.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          {document.type}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              document.status === "Verified"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {document.status}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          {document.date}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                              <Eye size={17} />
                            </button>

                            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                              <Download size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Risk / Legal Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className={`rounded-2xl border p-5 shadow-lg ${getRiskBg()}`}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl">
                <ShieldCheck className={getRiskColor()} size={24} />
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  Overall Property Risk
                </p>

                <h2 className={`text-3xl font-bold ${getRiskColor()}`}>
                  Low Risk
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  Current REDDA risk score: {riskScore}/100
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <Gavel className="text-orange-600" size={24} />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Legal Review
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  Review Required
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                  One legal document requires additional verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon size={18} className="text-gray-700" />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-semibold text-gray-900 mt-1 break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900 sm:text-right">
        {value}
      </span>
    </div>
  );
}

function StatusRow({ label, status, success }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-700">{label}</span>

      <div className="flex items-center gap-1.5">
        {success ? (
          <CheckCircle size={16} className="text-green-600" />
        ) : (
          <AlertTriangle size={16} className="text-orange-500" />
        )}

        <span
          className={`text-xs font-semibold ${
            success ? "text-green-700" : "text-orange-600"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-gray-100 group-hover:bg-white rounded-xl transition">
          <Icon size={20} className="text-blue-600" />
        </div>

        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}

function TimelineItem({ date, title, description, icon: Icon }) {
  return (
    <div className="relative flex gap-4">
      <div className="relative z-10 w-10 h-10 shrink-0 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center">
        <Icon size={18} className="text-blue-600" />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-xs text-gray-500">{date}</span>
        </div>

        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

export default PropertyDetails;