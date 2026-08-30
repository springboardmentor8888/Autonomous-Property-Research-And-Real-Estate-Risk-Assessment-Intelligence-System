import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  FileSearch,
  UserCheck,
  Scale,
  Map,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Search,
} from "lucide-react";

function DueDiligence() {
  const location = useLocation();
  const navigate = useNavigate();

  // Property received from PropertySearch page
  const selectedProperty = location.state?.property;

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const [checks, setChecks] = useState([
    {
      title: "Ownership Verification",
      description:
        "Verify current property ownership and ownership history.",
      icon: UserCheck,
      status: "Not analyzed",
      result: "",
    },
    {
      title: "Document Verification",
      description:
        "Analyze property documents for missing or inconsistent information.",
      icon: FileSearch,
      status: "Not analyzed",
      result: "",
    },
    {
      title: "Legal & Compliance",
      description:
        "Identify legal restrictions, disputes and compliance issues.",
      icon: Scale,
      status: "Not analyzed",
      result: "",
    },
    {
      title: "Location Analysis",
      description:
        "Analyze location, zoning and surrounding property information.",
      icon: Map,
      status: "Not analyzed",
      result: "",
    },
  ]);

  // Start AI Analysis
  const startAIAnalysis = () => {
    if (!selectedProperty) {
      alert("Please search and select a property first.");
      navigate("/properties");
      return;
    }

    setAnalyzing(true);
    setAnalysisComplete(false);

    // Reset checks
    setChecks((prev) =>
      prev.map((check) => ({
        ...check,
        status: "Analyzing...",
        result: "",
      }))
    );

    // Simulate AI analysis
    setTimeout(() => {
      setChecks([
        {
          title: "Ownership Verification",
          description:
            "Verify current property ownership and ownership history.",
          icon: UserCheck,
          status: "Completed",
          result: "Ownership information appears consistent.",
        },
        {
          title: "Document Verification",
          description:
            "Analyze property documents for missing or inconsistent information.",
          icon: FileSearch,
          status: "Completed",
          result: "Documents require further verification.",
        },
        {
          title: "Legal & Compliance",
          description:
            "Identify legal restrictions, disputes and compliance issues.",
          icon: Scale,
          status: "Warning",
          result: "Potential compliance issues detected.",
        },
        {
          title: "Location Analysis",
          description:
            "Analyze location, zoning and surrounding property information.",
          icon: Map,
          status: "Completed",
          result: "No major location risks detected.",
        },
      ]);

      setAnalyzing(false);
      setAnalysisComplete(true);
    }, 2500);
  };

  const getStatusIcon = (status) => {
    if (status === "Completed") {
      return <CheckCircle size={18} className="text-green-600" />;
    }

    if (status === "Warning") {
      return <AlertTriangle size={18} className="text-orange-500" />;
    }

    if (status === "Analyzing...") {
      return (
        <Loader2
          size={18}
          className="text-blue-500 animate-spin"
        />
      );
    }

    return <Clock size={18} className="text-gray-400" />;
  };

  const getStatusColor = (status) => {
    if (status === "Completed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Warning") {
      return "bg-orange-100 text-orange-700";
    }

    if (status === "Analyzing...") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-gray-100 text-gray-500";
  };

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center">
            <ShieldCheck
              className="text-green-600"
              size={24}
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Due Diligence
            </h1>

            <p className="mt-1 text-gray-500">
              Perform a complete AI-powered property risk investigation.
            </p>
          </div>
        </div>
      </div>

      {/* ================= SELECTED PROPERTY ================= */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        <p className="text-sm text-gray-500">
          Selected Property
        </p>

        {selectedProperty ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedProperty.address}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {selectedProperty.type} • Ready for AI analysis
              </p>
            </div>

            <button
              onClick={() => navigate("/properties")}
              className="flex items-center justify-center gap-2 border border-green-600 text-green-600 hover:bg-green-50 px-5 py-3 rounded-lg font-medium transition"
            >
              <Search size={18} />
              Change Property
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                No property selected
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Search for a property before starting due diligence.
              </p>
            </div>

            <button
              onClick={() => navigate("/properties")}
              className="flex items-center justify-center gap-2 border border-green-600 text-green-600 hover:bg-green-50 px-5 py-3 rounded-lg font-medium transition"
            >
              Search Property
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ================= AI ANALYSIS ================= */}
      <div className="bg-slate-900 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Sparkles
              className="text-green-400"
              size={24}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              AI Due Diligence Analysis
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              REDDA analyzes property information and identifies
              potential risks.
            </p>
          </div>
        </div>

        <button
          onClick={startAIAnalysis}
          disabled={analyzing || !selectedProperty}
          className="mt-6 flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-5 py-3 rounded-lg font-medium transition"
        >
          {analyzing ? (
            <>
              <Loader2
                size={19}
                className="animate-spin"
              />
              AI Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={19} />

              {analysisComplete
                ? "Run AI Analysis Again"
                : "Start AI Analysis"}

              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* AI Progress */}
        {analyzing && (
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">
                Analyzing property data...
              </span>

              <span className="text-green-400">
                Processing
              </span>
            </div>

            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}
      </div>

      {/* ================= AI SUMMARY ================= */}
      {analysisComplete && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle
                className="text-orange-500"
                size={22}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                AI Risk Summary
              </h2>

              <p className="text-sm text-gray-500">
                Preliminary findings generated by REDDA AI.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Overall Risk
              </p>

              <p className="text-2xl font-bold text-orange-500 mt-1">
                Medium
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Checks Completed
              </p>

              <p className="text-2xl font-bold text-green-600 mt-1">
                4 / 4
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Potential Issues
              </p>

              <p className="text-2xl font-bold text-red-600 mt-1">
                1
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= DUE DILIGENCE CHECKS ================= */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Due Diligence Checks
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            REDDA evaluates the following areas using AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {checks.map((check) => {
            const Icon = check.icon;

            return (
              <div
                key={check.title}
                className="border rounded-xl p-5 hover:shadow-sm transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon
                      size={21}
                      className="text-gray-600"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="font-semibold text-gray-800">
                        {check.title}
                      </h3>

                      <span
                        className={`w-fit flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${getStatusColor(
                          check.status
                        )}`}
                      >
                        {getStatusIcon(check.status)}
                        {check.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      {check.description}
                    </p>

                    {check.result && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">
                            AI Finding:
                          </span>{" "}
                          {check.result}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= WARNING ================= */}
      <div className="mt-6 flex gap-3 bg-orange-50 border border-orange-200 rounded-xl p-5">
        <AlertTriangle
          className="text-orange-500 flex-shrink-0"
          size={22}
        />

        <div>
          <h3 className="font-semibold text-orange-800">
            Important
          </h3>

          <p className="text-sm text-orange-700 mt-1">
            AI-generated findings are preliminary. Always verify
            results against official property records, legal
            documents and government sources before making a
            final investment decision.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DueDiligence;