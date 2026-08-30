import { useState } from "react";
import {
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
} from "lucide-react";

function RiskAssessment() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalysis = () => {
    setAnalyzing(true);

    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 2000);
  };

  const risks = [
    {
      title: "Ownership Risk",
      level: "Low",
      score: 18,
      description:
        "No major ownership inconsistency detected in the available property information.",
    },
    {
      title: "Document Risk",
      level: "Medium",
      score: 46,
      description:
        "Some property documents may require additional verification.",
    },
    {
      title: "Legal Risk",
      level: "Low",
      score: 22,
      description:
        "No major legal issue detected from the available information.",
    },
    {
      title: "Location Risk",
      level: "High",
      score: 74,
      description:
        "Location-related factors require additional investigation.",
    },
  ];

  const getRiskStyle = (level) => {
    if (level === "Low") {
      return {
        badge: "bg-green-100 text-green-700",
        icon: "text-green-600",
      };
    }

    if (level === "Medium") {
      return {
        badge: "bg-yellow-100 text-yellow-700",
        icon: "text-yellow-600",
      };
    }

    return {
      badge: "bg-red-100 text-red-700",
      icon: "text-red-600",
    };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-red-100 flex items-center justify-center">
            <ShieldAlert
              size={24}
              className="text-red-600"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Risk Assessment
            </h1>

            <p className="mt-1 text-gray-500">
              Identify and evaluate potential risks associated with a property.
            </p>
          </div>
        </div>
      </div>

      {/* Selected Property */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
        <p className="text-sm text-gray-500">
          Property Under Assessment
        </p>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              123 Main Street, Austin, TX
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Residential Property
            </p>
          </div>

          <span className="w-fit bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
            Research Ready
          </span>
        </div>
      </div>

      {/* AI Risk Analysis */}
      <div className="bg-slate-900 rounded-xl p-6 text-white mb-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles
              size={24}
              className="text-green-400"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold">
              AI Risk Analysis
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              REDDA AI evaluates property data, documents, legal information
              and location factors to identify potential risks.
            </p>

            <button
              onClick={handleAnalysis}
              disabled={analyzing}
              className="mt-5 flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 px-5 py-3 rounded-lg font-medium transition"
            >
              <Sparkles size={18} />

              {analyzing
                ? "Analyzing Property..."
                : analyzed
                ? "Analysis Completed"
                : "Start AI Risk Analysis"}

              {!analyzing && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Overall Risk */}
      {analyzed && (
        <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-sm text-gray-500">
                Overall Property Risk
              </p>

              <h2 className="text-4xl font-bold text-orange-500 mt-2">
                Medium Risk
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                AI confidence score: 82%
              </p>
            </div>

            <div className="w-full md:w-64">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">
                  Risk Score
                </span>

                <span className="font-semibold text-gray-700">
                  52 / 100
                </span>
              </div>

              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: "52%" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Categories */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Risk Categories
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            AI assessment across major property risk categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {risks.map((risk) => {
            const style = getRiskStyle(risk.level);

            return (
              <div
                key={risk.title}
                className="border rounded-xl p-5 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert
                      size={22}
                      className={style.icon}
                    />

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {risk.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {risk.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${style.badge}`}
                  >
                    {risk.level}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">
                      Risk Score
                    </span>

                    <span className="font-semibold text-gray-700">
                      {risk.score}/100
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-700 rounded-full"
                      style={{
                        width: `${risk.score}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Findings */}
      {analyzed && (
        <div className="mt-6 bg-white border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <CheckCircle
              size={22}
              className="text-green-600"
            />

            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                AI Findings
              </h2>

              <p className="text-sm text-gray-500">
                Key findings identified during automated analysis.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle
                size={20}
                className="text-green-600 flex-shrink-0"
              />

              <p className="text-sm text-green-800">
                Ownership information appears consistent with the available data.
              </p>
            </div>

            <div className="flex gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <Info
                size={20}
                className="text-yellow-600 flex-shrink-0"
              />

              <p className="text-sm text-yellow-800">
                Additional document verification is recommended before final approval.
              </p>
            </div>

            <div className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertTriangle
                size={20}
                className="text-red-600 flex-shrink-0"
              />

              <p className="text-sm text-red-800">
                Location-related risk requires further investigation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-5">
        <div className="flex gap-3">
          <AlertTriangle
            size={22}
            className="text-orange-500 flex-shrink-0"
          />

          <div>
            <h3 className="font-semibold text-orange-800">
              Important
            </h3>

            <p className="text-sm text-orange-700 mt-1">
              AI risk scores are preliminary assessments. Always verify
              findings using official property records and qualified
              professional advice before making financial or legal decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskAssessment;