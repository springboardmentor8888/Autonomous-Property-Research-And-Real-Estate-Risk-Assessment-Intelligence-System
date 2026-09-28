import { useMemo, useState } from "react";
import {
  Sparkles,
  Search,
  Brain,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Scale,
  Landmark,
  Map,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  Send,
  Building2,
  UserCheck,
  FileText,
  Gavel,
  BadgeCheck,
  Info,
  X,
} from "lucide-react";

function AIIntelligence() {
  const [search, setSearch] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  const properties = [
    {
      id: "REDDA-1001",
      address: "123 Main Street",
      city: "Austin",
      state: "Texas",
      type: "Residential Property",
      owner: "John Anderson",
      risk: "Low",
      score: 18,
      status: "Research Ready",
      lastUpdated: "Today",
    },
    {
      id: "REDDA-1002",
      address: "456 Oak Avenue",
      city: "Dallas",
      state: "Texas",
      type: "Commercial Property",
      owner: "Robert Williams",
      risk: "Medium",
      score: 46,
      status: "Attention Required",
      lastUpdated: "Yesterday",
    },
    {
      id: "REDDA-1003",
      address: "789 Pine Road",
      city: "Houston",
      state: "Texas",
      type: "Residential Property",
      owner: "Michael Brown",
      risk: "High",
      score: 78,
      status: "Alert",
      lastUpdated: "2 days ago",
    },
  ];

  const selectedData = selectedProperty || properties[0];

  const riskData = useMemo(() => {
    if (selectedData.score <= 30) {
      return {
        label: "Low Risk",
        color: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-200",
        icon: CheckCircle,
      };
    }

    if (selectedData.score <= 60) {
      return {
        label: "Medium Risk",
        color: "text-yellow-700",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        icon: AlertTriangle,
      };
    }

    return {
      label: "High Risk",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: ShieldAlert,
    };
  }, [selectedData]);

  const handleSearch = () => {
    if (!search.trim()) return;

    const result = properties.find((property) =>
      `${property.address} ${property.city} ${property.state} ${property.id}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (result) {
      setSelectedProperty(result);
      setAnalysisComplete(false);
      setChatMessages([]);
    } else {
      setSelectedProperty({
        id: `REDDA-${Date.now().toString().slice(-4)}`,
        address: search.trim(),
        city: "Unknown",
        state: "Location",
        type: "Property",
        owner: "Pending Verification",
        risk: "Medium",
        score: 42,
        status: "Research Required",
        lastUpdated: "Just now",
      });

      setAnalysisComplete(false);
      setChatMessages([]);
    }
  };

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2200);
  };

  const resetAnalysis = () => {
    setAnalysisComplete(false);
    setChatMessages([]);
  };

  const handleQuestion = () => {
    if (!question.trim()) return;

    const userQuestion = question.trim();

    setChatMessages((prev) => [
      ...prev,
      {
        type: "user",
        message: userQuestion,
      },
      {
        type: "ai",
        message:
          "Based on the available property intelligence, REDDA currently identifies no critical issue related to this question. A complete answer will be available once live land records, legal records, documents, and property APIs are connected.",
      },
    ]);

    setQuestion("");
  };

  const analysisCards = [
    {
      title: "Ownership Intelligence",
      description:
        "Ownership identity and property ownership information analysis.",
      icon: UserCheck,
      status: "Verified",
      statusClass: "text-green-700 bg-green-50",
      score: "Low Risk",
      details: [
        "Owner identity available",
        "No ownership conflict detected",
        "Ownership verification recommended",
      ],
    },
    {
      title: "Document Intelligence",
      description:
        "Analysis of property documents and document completeness.",
      icon: FileCheck,
      status: "Reviewed",
      statusClass: "text-green-700 bg-green-50",
      score: "Low Risk",
      details: [
        "Core documents available",
        "No obvious document conflict",
        "Document authenticity requires source verification",
      ],
    },
    {
      title: "Legal Intelligence",
      description:
        "Potential legal disputes, restrictions and litigation indicators.",
      icon: Scale,
      status: "Clear",
      statusClass: "text-green-700 bg-green-50",
      score: "Low Risk",
      details: [
        "No major dispute indicator detected",
        "No critical legal warning",
        "Court record verification recommended",
      ],
    },
    {
      title: "Tax Intelligence",
      description:
        "Property tax and financial obligation intelligence.",
      icon: Landmark,
      status: "Checked",
      statusClass: "text-green-700 bg-green-50",
      score: "Low Risk",
      details: [
        "Tax information appears consistent",
        "No major outstanding indicator",
        "Latest tax receipt should be verified",
      ],
    },
    {
      title: "Zoning Intelligence",
      description:
        "Land use, zoning and location-related property checks.",
      icon: Map,
      status: "Analyzed",
      statusClass: "text-yellow-700 bg-yellow-50",
      score: "Medium Risk",
      details: [
        "Zoning information requires verification",
        "Land-use compatibility should be checked",
        "Local authority records recommended",
      ],
    },
    {
      title: "Monitoring Intelligence",
      description:
        "Continuous monitoring of changes and property alerts.",
      icon: Activity,
      status: "Active",
      statusClass: "text-green-700 bg-green-50",
      score: "Monitoring",
      details: [
        "Property monitoring is active",
        "No new critical alert",
        "Automatic re-check recommended",
      ],
    },
  ];

  const findings = [
    {
      type: "positive",
      icon: CheckCircle,
      title: "Ownership information available",
      text: "Current property ownership information is available for review.",
    },
    {
      type: "positive",
      icon: ShieldCheck,
      title: "No critical legal warning detected",
      text: "The current intelligence layer does not indicate a critical legal issue.",
    },
    {
      type: "warning",
      icon: AlertTriangle,
      title: "Zoning verification recommended",
      text: "Zoning and permitted land use should be verified against authoritative records.",
    },
    {
      type: "warning",
      icon: FileText,
      title: "Document source verification required",
      text: "Property documents should be cross-checked with official records before a final decision.",
    },
  ];

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/p2.png')",
      }}
    >
      <div className="relative z-10 min-h-screen w-full p-3 md:p-5">
        <div className="max-w-[1600px] mx-auto space-y-5">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={25} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                      AI Property Intelligence
                    </h1>

                    <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      AI POWERED
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mt-1">
                    REDDA AI analyzes property information, risks, documents,
                    ownership and legal intelligence.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-700">
                    AI System Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="Search property address, property ID or location..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              <button
                onClick={handleSearch}
                className="px-6 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Search size={18} />
                Analyze Property
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-slate-500 mr-1">
                Try:
              </span>

              {properties.map((property) => (
                <button
                  key={property.id}
                  onClick={() => {
                    setSelectedProperty(property);
                    setSearch(property.address);
                    setAnalysisComplete(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-green-50 hover:text-green-700 text-xs font-medium text-slate-600 transition"
                >
                  {property.address}
                </button>
              ))}
            </div>
          </div>

          {/* Property Summary */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                    <Building2
                      size={26}
                      className="text-green-600"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedData.address}
                      </h2>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          selectedData.status === "Alert"
                            ? "bg-red-50 text-red-700"
                            : selectedData.status ===
                              "Attention Required"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {selectedData.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      {selectedData.city}, {selectedData.state}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>
                        ID:{" "}
                        <strong className="text-slate-700">
                          {selectedData.id}
                        </strong>
                      </span>

                      <span>
                        Type:{" "}
                        <strong className="text-slate-700">
                          {selectedData.type}
                        </strong>
                      </span>

                      <span>
                        Owner:{" "}
                        <strong className="text-slate-700">
                          {selectedData.owner}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={resetAnalysis}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm flex items-center gap-2"
                  >
                    <RefreshCw size={17} />
                    Reset
                  </button>

                  <button
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm flex items-center gap-2 shadow-md"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain size={18} />
                        Run AI Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="border-t border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                    <Brain
                      size={22}
                      className="text-green-600 animate-pulse"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800">
                        REDDA AI is analyzing the property...
                      </p>

                      <span className="text-xs text-slate-500">
                        Processing
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-[75%]" />
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Checking ownership, documents, legal records, tax,
                      zoning and monitoring intelligence.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Intelligence Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Risk Score */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm text-slate-500">
                    Overall Property Risk
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    AI Risk Assessment
                  </h3>
                </div>

                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                  <ShieldCheck
                    size={22}
                    className="text-green-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 shrink-0">
                  <svg
                    className="w-32 h-32 -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-slate-100"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="314"
                      strokeDashoffset={
                        314 - (314 * selectedData.score) / 100
                      }
                      className={
                        selectedData.score <= 30
                          ? "text-green-500"
                          : selectedData.score <= 60
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">
                      {selectedData.score}
                    </span>

                    <span className="text-xs text-slate-400">
                      / 100
                    </span>
                  </div>
                </div>

                <div>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${riskData.bg} ${riskData.color}`}
                  >
                    <riskData.icon size={16} />
                    <span className="text-sm font-semibold">
                      {riskData.label}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mt-3 leading-6">
                    REDDA AI evaluates multiple property intelligence
                    categories to calculate the current risk level.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-green-600">
                    4
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Low Risk
                  </p>
                </div>

                <div>
                  <p className="text-xl font-bold text-yellow-600">
                    1
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Attention
                  </p>
                </div>

                <div>
                  <p className="text-xl font-bold text-red-600">
                    0
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Critical
                  </p>
                </div>
              </div>
            </div>

            {/* AI Status */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                    <Brain
                      size={23}
                      className="text-green-600"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      REDDA AI Intelligence Summary
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Multi-dimensional property analysis
                    </p>
                  </div>
                </div>

                {analysisComplete ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700">
                    <CheckCircle size={17} />
                    <span className="text-sm font-semibold">
                      Analysis Complete
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600">
                    <Clock size={17} />
                    <span className="text-sm font-semibold">
                      Awaiting Analysis
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <UserCheck
                      size={20}
                      className="text-green-600"
                    />
                    <CheckCircle
                      size={17}
                      className="text-green-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Ownership
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    Clear
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <FileCheck
                      size={20}
                      className="text-green-600"
                    />
                    <CheckCircle
                      size={17}
                      className="text-green-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Documents
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    Reviewed
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <Scale
                      size={20}
                      className="text-green-600"
                    />
                    <CheckCircle
                      size={17}
                      className="text-green-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Legal
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    Clear
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <Map
                      size={20}
                      className="text-yellow-600"
                    />
                    <AlertTriangle
                      size={17}
                      className="text-yellow-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Zoning
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    Review
                  </p>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                  <Sparkles
                    size={20}
                    className="text-green-600 mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-semibold text-slate-800">
                      AI Insight
                    </p>

                    <p className="text-sm text-slate-600 leading-6 mt-1">
                      The property currently shows a relatively low
                      overall risk profile. Ownership, document and
                      legal indicators appear consistent, while zoning
                      and official document verification should be
                      completed before final due diligence approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intelligence Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Property Intelligence
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Detailed AI analysis across major due diligence
                  categories.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {analysisCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 hover:shadow-2xl transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <Icon
                          size={22}
                          className="text-green-600"
                        />
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${card.statusClass}`}
                      >
                        {card.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 mt-4">
                      {card.title}
                    </h3>

                    <p className="text-sm text-slate-500 leading-6 mt-2">
                      {card.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        AI Assessment
                      </span>

                      <span className="text-sm font-semibold text-slate-700">
                        {card.score}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowDetails(card)}
                      className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 flex items-center justify-center gap-2"
                    >
                      View Intelligence
                      <ChevronRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Findings + Recommendation */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Findings */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center">
                  <AlertTriangle
                    size={22}
                    className="text-yellow-600"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    AI Key Findings
                  </h2>

                  <p className="text-sm text-slate-500">
                    Important observations identified by REDDA AI.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {findings.map((finding, index) => {
                  const Icon = finding.icon;

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          finding.type === "positive"
                            ? "bg-green-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={
                            finding.type === "positive"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {finding.title}
                        </p>

                        <p className="text-sm text-slate-500 mt-1 leading-6">
                          {finding.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-slate-950 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center">
                  <Sparkles
                    size={22}
                    className="text-green-400"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-lg">
                    AI Recommendation
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Based on current intelligence
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <BadgeCheck
                    size={20}
                    className="text-green-400"
                  />

                  <span className="font-semibold text-green-400">
                    Proceed with verification
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-7 mt-4">
                  Current intelligence does not indicate a critical
                  property risk. However, official ownership,
                  document, zoning and legal records should be
                  independently verified before making a final
                  property decision.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    AI Confidence
                  </span>

                  <span className="font-bold text-white">
                    86%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div className="h-full w-[86%] bg-green-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Assistant */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <Brain
                  size={23}
                  className="text-green-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Ask REDDA AI
                </h2>

                <p className="text-sm text-slate-500">
                  Ask questions about this property.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {[
                "Is this property safe?",
                "What are the main risks?",
                "Are ownership details clear?",
                "What should I verify?",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setQuestion(item)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-green-50 hover:text-green-700 text-xs font-medium text-slate-600 transition"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleQuestion();
                }}
                placeholder="Ask REDDA AI anything about this property..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />

              <button
                onClick={handleQuestion}
                className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 font-semibold"
              >
                <Send size={17} />
                Ask
              </button>
            </div>

            {chatMessages.length > 0 && (
              <div className="mt-5 space-y-3 max-h-72 overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.type === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-6 ${
                        message.type === "user"
                          ? "bg-green-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {message.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info size={16} />
                <span>
                  AI intelligence shown here is currently demonstration
                  data and should be connected to authoritative property
                  data sources before production use.
                </span>
              </div>

              <span className="text-xs text-slate-400">
                Last analysis: {selectedData.lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Brain
                    size={20}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {showDetails.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    REDDA AI Intelligence
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-slate-600 leading-6">
                {showDetails.description}
              </p>

              <div className="mt-5">
                <h4 className="font-semibold text-slate-900 mb-3">
                  AI Findings
                </h4>

                <div className="space-y-2">
                  {showDetails.details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <CheckCircle
                        size={18}
                        className="text-green-600 mt-0.5 shrink-0"
                      />

                      <span className="text-sm text-slate-600">
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={19}
                    className="text-green-600 mt-0.5"
                  />

                  <div>
                    <p className="font-semibold text-green-800">
                      Current Assessment
                    </p>

                    <p className="text-sm text-green-700 mt-1">
                      {showDetails.score}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIIntelligence;