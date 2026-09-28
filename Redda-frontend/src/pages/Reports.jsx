import { useState } from "react";
import {
  FileText,
  Search,
  Download,
  Eye,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Building2,
  ShieldCheck,
  Scale,
  Map,
  Activity,
  FileCheck,
  UserCheck,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";

function Reports() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);

  const reports = [
    {
      id: 1,
      propertyId: "REDDA-1001",
      property: "123 Main Street",
      location: "Austin, TX",
      address: "123 Main Street, Austin, Texas",
      type: "Residential Property",
      risk: "Low",
      score: 18,
      status: "Completed",
      date: "30 Aug 2026",
      owner: "Verified",
      ownerName: "Ownership Record Verified",
      documents: "12/12",
      monitoring: "Active",
      alerts: 0,
      checks: {
        ownership: "Passed",
        documents: "Passed",
        legal: "Passed",
        tax: "Passed",
        zoning: "Passed",
      },
      findings: [
        "Ownership information is available and verified.",
        "Required property documents are available.",
        "No significant legal issue was identified in the available data.",
        "Tax and zoning checks are currently clear.",
      ],
    },
    {
      id: 2,
      propertyId: "REDDA-1002",
      property: "456 Oak Avenue",
      location: "Dallas, TX",
      address: "456 Oak Avenue, Dallas, Texas",
      type: "Residential Property",
      risk: "Medium",
      score: 46,
      status: "Completed",
      date: "29 Aug 2026",
      owner: "Verified",
      ownerName: "Ownership Record Verified",
      documents: "10/12",
      monitoring: "Active",
      alerts: 1,
      checks: {
        ownership: "Passed",
        documents: "Review",
        legal: "Passed",
        tax: "Review",
        zoning: "Passed",
      },
      findings: [
        "Ownership information is currently verified.",
        "Two expected documents require additional verification.",
        "Tax information requires further review.",
        "No major zoning issue is currently recorded.",
      ],
    },
    {
      id: 3,
      propertyId: "REDDA-1003",
      property: "789 Pine Road",
      location: "Houston, TX",
      address: "789 Pine Road, Houston, Texas",
      type: "Residential Property",
      risk: "High",
      score: 78,
      status: "Completed",
      date: "28 Aug 2026",
      owner: "Review Required",
      ownerName: "Ownership Verification Required",
      documents: "7/12",
      monitoring: "Active",
      alerts: 3,
      checks: {
        ownership: "Review",
        documents: "Review",
        legal: "Review",
        tax: "Passed",
        zoning: "Review",
      },
      findings: [
        "Ownership verification requires additional review.",
        "Several property documents are missing or incomplete.",
        "Legal information requires further investigation.",
        "Zoning information should be independently verified.",
      ],
    },
    {
      id: 4,
      propertyId: "REDDA-1004",
      property: "321 Maple Drive",
      location: "San Antonio, TX",
      address: "321 Maple Drive, San Antonio, Texas",
      type: "Residential Property",
      risk: "Low",
      score: 22,
      status: "Completed",
      date: "27 Aug 2026",
      owner: "Verified",
      ownerName: "Ownership Record Verified",
      documents: "12/12",
      monitoring: "Active",
      alerts: 0,
      checks: {
        ownership: "Passed",
        documents: "Passed",
        legal: "Passed",
        tax: "Passed",
        zoning: "Passed",
      },
      findings: [
        "Ownership information is currently verified.",
        "All required documents are available.",
        "Legal and tax checks are currently clear.",
        "Zoning information is currently consistent with the available data.",
      ],
    },
    {
      id: 5,
      propertyId: "REDDA-1005",
      property: "654 Cedar Lane",
      location: "Austin, TX",
      address: "654 Cedar Lane, Austin, Texas",
      type: "Residential Property",
      risk: "High",
      score: 84,
      status: "Completed",
      date: "26 Aug 2026",
      owner: "Review Required",
      ownerName: "Ownership Verification Required",
      documents: "6/12",
      monitoring: "Active",
      alerts: 4,
      checks: {
        ownership: "Review",
        documents: "Review",
        legal: "Review",
        tax: "Review",
        zoning: "Review",
      },
      findings: [
        "Ownership information requires additional verification.",
        "Multiple expected documents are currently unavailable.",
        "Legal information requires detailed review.",
        "Tax and zoning information require additional verification.",
      ],
    },
  ];

  const filteredReports = reports.filter((report) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      report.property.toLowerCase().includes(searchValue) ||
      report.location.toLowerCase().includes(searchValue) ||
      report.propertyId.toLowerCase().includes(searchValue);

    const matchesRisk =
      riskFilter === "All" || report.risk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const getRiskStyle = (risk) => {
    if (risk === "High") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (risk === "Medium") {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }

    return "bg-green-100 text-green-700 border-green-200";
  };

  const getRiskIcon = (risk) => {
    if (risk === "High") {
      return <AlertTriangle size={15} />;
    }

    if (risk === "Medium") {
      return <Clock size={15} />;
    }

    return <CheckCircle size={15} />;
  };

  const getScoreColor = (score) => {
    if (score >= 70) {
      return "bg-red-500";
    }

    if (score >= 40) {
      return "bg-orange-500";
    }

    return "bg-green-500";
  };

  const getCheckStyle = (status) => {
    if (status === "Passed") {
      return {
        box: "bg-green-50 border-green-200",
        icon: "text-green-600",
        text: "text-green-700",
        iconElement: <CheckCircle size={18} />,
      };
    }

    return {
      box: "bg-orange-50 border-orange-200",
      icon: "text-orange-600",
      text: "text-orange-700",
      iconElement: <AlertTriangle size={18} />,
    };
  };

  const generateReport = (report) => {
    setGeneratingReport(true);

    setTimeout(() => {
      setGeneratedReports((previous) => {
        if (previous.includes(report.id)) {
          return previous;
        }

        return [...previous, report.id];
      });

      setGeneratingReport(false);
      setSelectedReport(report);
    }, 1200);
  };

  const handleDownload = (report) => {
    const reportText = `
============================================================
REDDA
REAL ESTATE PROPERTY DUE DILIGENCE REPORT
============================================================

PROPERTY INFORMATION
------------------------------------------------------------
Property ID: ${report.propertyId}
Property: ${report.property}
Address: ${report.address}
Location: ${report.location}
Property Type: ${report.type}

OWNERSHIP VERIFICATION
------------------------------------------------------------
Status: ${report.owner}
Verification: ${report.ownerName}

DOCUMENT VERIFICATION
------------------------------------------------------------
Documents Verified: ${report.documents}

DUE DILIGENCE CHECKS
------------------------------------------------------------
Ownership: ${report.checks.ownership}
Documents: ${report.checks.documents}
Legal: ${report.checks.legal}
Tax: ${report.checks.tax}
Zoning: ${report.checks.zoning}

RISK ASSESSMENT
------------------------------------------------------------
Risk Level: ${report.risk}
Risk Score: ${report.score}/100

MONITORING
------------------------------------------------------------
Monitoring Status: ${report.monitoring}
Active Alerts: ${report.alerts}

KEY FINDINGS
------------------------------------------------------------
${report.findings.map((item, index) => `${index + 1}. ${item}`).join("\n")}

AI ANALYSIS
------------------------------------------------------------
REDDA analyzed the available property, ownership,
document, legal, tax, zoning and risk information.

The current assessment indicates a ${report.risk.toLowerCase()}
risk level with a risk score of ${report.score}/100.

RECOMMENDATION
------------------------------------------------------------
${
  report.risk === "High"
    ? "Additional ownership, legal and document verification is recommended before proceeding."
    : report.risk === "Medium"
    ? "Additional document, tax and property verification is recommended before final approval."
    : "The available information indicates relatively low risk. Standard property verification should still be completed."
}

REPORT STATUS
------------------------------------------------------------
Status: ${report.status}
Report Date: ${report.date}

============================================================
Generated by:
REDDA AI Property Intelligence System
============================================================
`;

    const blob = new Blob([reportText], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.property.replace(
      /\s+/g,
      "-"
    )}-REDDA-Due-Diligence-Report.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const totalReports = reports.length;

  const highRiskReports = reports.filter(
    (report) => report.risk === "High"
  ).length;

  const mediumRiskReports = reports.filter(
    (report) => report.risk === "Medium"
  ).length;

  const lowRiskReports = reports.filter(
    (report) => report.risk === "Low"
  ).length;

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/p2.png')",
      }}
    >
      <div className="relative z-10 w-full min-h-screen p-2 md:p-4">

        {/* HEADER */}

        <div className="mb-8">
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
              <FileText
                size={24}
                className="text-green-600"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Reports
              </h1>

              <p className="mt-1 text-gray-500">
                Generate, review and manage property due diligence
                reports.
              </p>
            </div>

          </div>
        </div>

        {/* AI SUMMARY */}

        <div className="bg-slate-900 rounded-2xl p-6 text-white mb-6 shadow-xl">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Sparkles
                size={23}
                className="text-green-400"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                AI Report Intelligence
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                REDDA combines due diligence, risk and monitoring
                information into a property report.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-slate-400">
                Total Reports
              </p>

              <p className="text-2xl font-bold mt-1">
                {totalReports}
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-slate-400">
                High Risk
              </p>

              <p className="text-2xl font-bold text-red-400 mt-1">
                {highRiskReports}
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-slate-400">
                Medium Risk
              </p>

              <p className="text-2xl font-bold text-orange-400 mt-1">
                {mediumRiskReports}
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-slate-400">
                Low Risk
              </p>

              <p className="text-2xl font-bold text-green-400 mt-1">
                {lowRiskReports}
              </p>
            </div>

          </div>
        </div>

        {/* REPORTS CARD */}

        <div className="bg-white rounded-2xl border shadow-xl overflow-hidden">

          {/* TOOLBAR */}

          <div className="p-6 border-b">

            <div className="flex flex-col lg:flex-row gap-4 justify-between">

              <div className="flex items-center gap-3 border rounded-xl px-4 py-3 flex-1 max-w-xl focus-within:ring-2 focus-within:ring-green-500">

                <Search
                  size={19}
                  className="text-gray-400 flex-shrink-0"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search property, location or ID..."
                  className="outline-none w-full text-gray-700 bg-transparent"
                />

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={17} />
                  </button>
                )}

              </div>

              <select
                value={riskFilter}
                onChange={(e) =>
                  setRiskFilter(e.target.value)
                }
                className="border rounded-xl px-4 py-3 outline-none text-gray-700 bg-white focus:ring-2 focus:ring-green-500"
              >
                <option value="All">
                  All Risk Levels
                </option>

                <option value="Low">
                  Low Risk
                </option>

                <option value="Medium">
                  Medium Risk
                </option>

                <option value="High">
                  High Risk
                </option>
              </select>

            </div>

            <div className="mt-4 text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredReports.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {reports.length}
              </span>{" "}
              reports
            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Property
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Risk
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Score
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Ownership
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Documents
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Date
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredReports.map((report) => (

                  <tr
                    key={report.id}
                    className="border-t hover:bg-gray-50 transition"
                  >

                    <td className="px-6 py-5">

                      <p className="font-semibold text-gray-800">
                        {report.property}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {report.location}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {report.propertyId}
                      </p>

                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-full text-xs font-medium ${getRiskStyle(
                          report.risk
                        )}`}
                      >
                        {getRiskIcon(report.risk)}
                        {report.risk}
                      </span>

                    </td>

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">

                          <div
                            className={`h-full rounded-full ${getScoreColor(
                              report.score
                            )}`}
                            style={{
                              width: `${report.score}%`,
                            }}
                          />

                        </div>

                        <span className="text-sm font-semibold text-gray-700">
                          {report.score}
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={
                          report.owner === "Verified"
                            ? "inline-flex items-center gap-1 text-green-600 text-sm font-medium"
                            : "inline-flex items-center gap-1 text-orange-600 text-sm font-medium"
                        }
                      >

                        {report.owner === "Verified" ? (
                          <CheckCircle size={15} />
                        ) : (
                          <AlertTriangle size={15} />
                        )}

                        {report.owner}

                      </span>

                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {report.documents}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-500 whitespace-nowrap">
                      {report.date}
                    </td>

                    <td className="px-6 py-5">

                      <div className="flex items-center justify-end gap-2">

                        <button
                          onClick={() =>
                            setSelectedReport(report)
                          }
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                          title="View Report"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() =>
                            generateReport(report)
                          }
                          disabled={generatingReport}
                          className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition disabled:opacity-50"
                          title="Generate Report"
                        >
                          <RefreshCw
                            size={18}
                            className={
                              generatingReport
                                ? "animate-spin"
                                : ""
                            }
                          />
                        </button>

                        <button
                          onClick={() =>
                            handleDownload(report)
                          }
                          className="p-2 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600 transition"
                          title="Download Report"
                        >
                          <Download size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* NO RESULTS */}

          {filteredReports.length === 0 && (

            <div className="p-12 text-center">

              <FileText
                size={40}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 font-semibold text-gray-700">
                No reports found
              </h3>

              <p className="text-sm text-gray-400 mt-1">
                Try changing your search or risk filter.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setRiskFilter("All");
                }}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
              >
                Clear Filters
              </button>

            </div>

          )}

        </div>

        {/* GENERATED REPORT MESSAGE */}

        {generatedReports.length > 0 && (

          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">

            <div className="flex items-center gap-3">

              <CheckCircle
                size={20}
                className="text-green-600"
              />

              <div>

                <p className="font-semibold text-green-800">
                  Report generated successfully
                </p>

                <p className="text-sm text-green-700 mt-1">
                  The selected property report is ready for review
                  and download.
                </p>

              </div>

            </div>

          </div>

        )}

        {/* REPORT MODAL */}

        {selectedReport && (

          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedReport(null)}
          >

            <div
              className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl max-h-[94vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >

              {/* MODAL HEADER */}

              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                    <FileText
                      size={23}
                      className="text-green-600"
                    />
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-gray-800">
                      Property Due Diligence Report
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      REDDA AI Property Intelligence System
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setSelectedReport(null)
                  }
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>

              </div>

              <div className="p-6 space-y-6">

                {/* PROPERTY INFORMATION */}

                <section className="border rounded-2xl overflow-hidden">

                  <div className="bg-slate-900 text-white p-5">

                    <div className="flex items-center gap-3">
                      <Building2 size={21} />

                      <div>
                        <h3 className="font-semibold">
                          Property Information
                        </h3>

                        <p className="text-xs text-slate-400 mt-1">
                          Basic property identification details
                        </p>
                      </div>
                    </div>

                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div>
                      <p className="text-xs text-gray-500">
                        Property ID
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedReport.propertyId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Property
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedReport.property}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Property Type
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedReport.type}
                      </p>
                    </div>

                    <div className="md:col-span-3">
                      <p className="text-xs text-gray-500">
                        Address
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedReport.address}
                      </p>
                    </div>

                  </div>

                </section>

                {/* OWNERSHIP + DOCUMENTS */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <section className="border rounded-2xl p-5">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <UserCheck
                          size={20}
                          className="text-green-600"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Ownership Verification
                        </h3>

                        <p className="text-xs text-gray-500">
                          Current ownership assessment
                        </p>
                      </div>

                    </div>

                    <div className="mt-5">

                      <p className="text-sm text-gray-500">
                        Status
                      </p>

                      <p
                        className={`font-bold text-lg mt-1 ${
                          selectedReport.owner === "Verified"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {selectedReport.owner}
                      </p>

                      <p className="text-sm text-gray-600 mt-2">
                        {selectedReport.ownerName}
                      </p>

                    </div>

                  </section>

                  <section className="border rounded-2xl p-5">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileCheck
                          size={20}
                          className="text-blue-600"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Document Verification
                        </h3>

                        <p className="text-xs text-gray-500">
                          Available property documents
                        </p>
                      </div>

                    </div>

                    <div className="mt-5">

                      <p className="text-sm text-gray-500">
                        Documents Verified
                      </p>

                      <p className="font-bold text-lg text-gray-800 mt-1">
                        {selectedReport.documents}
                      </p>

                      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              (parseInt(
                                selectedReport.documents
                              ) /
                                parseInt(
                                  selectedReport.documents.split(
                                    "/"
                                  )[1]
                                )) *
                              100
                            }%`,
                          }}
                        />

                      </div>

                    </div>

                  </section>

                </div>

                {/* DUE DILIGENCE */}

                <section className="border rounded-2xl overflow-hidden">

                  <div className="p-5 border-b">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <ClipboardCheck
                          size={20}
                          className="text-purple-600"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Due Diligence Checks
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          Property verification checks
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

                    {[
                      {
                        name: "Ownership",
                        value: selectedReport.checks.ownership,
                        icon: UserCheck,
                      },
                      {
                        name: "Documents",
                        value: selectedReport.checks.documents,
                        icon: FileCheck,
                      },
                      {
                        name: "Legal",
                        value: selectedReport.checks.legal,
                        icon: Scale,
                      },
                      {
                        name: "Tax",
                        value: selectedReport.checks.tax,
                        icon: ShieldCheck,
                      },
                      {
                        name: "Zoning",
                        value: selectedReport.checks.zoning,
                        icon: Map,
                      },
                    ].map((check) => {

                      const style = getCheckStyle(
                        check.value
                      );

                      const Icon = check.icon;

                      return (
                        <div
                          key={check.name}
                          className={`border rounded-xl p-4 ${style.box}`}
                        >

                          <div className="flex items-center justify-between">

                            <Icon
                              size={19}
                              className={style.icon}
                            />

                            {style.iconElement}

                          </div>

                          <p className="font-semibold text-gray-800 mt-4">
                            {check.name}
                          </p>

                          <p
                            className={`text-xs font-semibold mt-1 ${style.text}`}
                          >
                            {check.value}
                          </p>

                        </div>
                      );
                    })}

                  </div>

                </section>

                {/* RISK ASSESSMENT */}

                <section className="border rounded-2xl p-5">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertTriangle
                        size={20}
                        className="text-red-600"
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Risk Assessment
                      </h3>

                      <p className="text-xs text-gray-500">
                        Overall property risk analysis
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">

                    <div>

                      <p className="text-sm text-gray-500">
                        Risk Level
                      </p>

                      <span
                        className={`mt-2 inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-full text-sm font-semibold ${getRiskStyle(
                          selectedReport.risk
                        )}`}
                      >
                        {getRiskIcon(
                          selectedReport.risk
                        )}

                        {selectedReport.risk}
                      </span>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">
                        Risk Score
                      </p>

                      <div className="flex items-center gap-3 mt-3">

                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">

                          <div
                            className={`h-full rounded-full ${getScoreColor(
                              selectedReport.score
                            )}`}
                            style={{
                              width: `${selectedReport.score}%`,
                            }}
                          />

                        </div>

                        <span className="font-bold text-gray-800">
                          {selectedReport.score}/100
                        </span>

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">
                        Report Status
                      </p>

                      <p className="font-semibold text-green-600 mt-2">
                        {selectedReport.status}
                      </p>

                    </div>

                  </div>

                </section>

                {/* MONITORING */}

                <section className="border rounded-2xl p-5">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Activity
                        size={20}
                        className="text-blue-600"
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Property Monitoring
                      </h3>

                      <p className="text-xs text-gray-500">
                        Monitoring and alert information
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="bg-gray-50 border rounded-xl p-4">

                      <p className="text-sm text-gray-500">
                        Monitoring Status
                      </p>

                      <div className="flex items-center gap-2 mt-2">

                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />

                        <p className="font-semibold text-green-600">
                          {selectedReport.monitoring}
                        </p>

                      </div>

                    </div>

                    <div className="bg-gray-50 border rounded-xl p-4">

                      <p className="text-sm text-gray-500">
                        Active Alerts
                      </p>

                      <p
                        className={`font-bold text-lg mt-1 ${
                          selectedReport.alerts > 0
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {selectedReport.alerts}
                      </p>

                    </div>

                  </div>

                </section>

                {/* KEY FINDINGS */}

                <section className="border rounded-2xl p-5">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <AlertTriangle
                        size={20}
                        className="text-orange-600"
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Key Findings
                      </h3>

                      <p className="text-xs text-gray-500">
                        Important observations from the analysis
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 space-y-3">

                    {selectedReport.findings.map(
                      (finding, index) => (

                        <div
                          key={index}
                          className="flex items-start gap-3 bg-gray-50 border rounded-xl p-4"
                        >

                          <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>

                          <p className="text-sm text-gray-700 leading-6">
                            {finding}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                </section>

                {/* AI ANALYSIS */}

                <section className="bg-green-50 border border-green-200 rounded-2xl p-5">

                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles
                        size={21}
                        className="text-green-600"
                      />
                    </div>

                    <div>

                      <h3 className="font-semibold text-green-800">
                        REDDA AI Analysis
                      </h3>

                      <p className="text-sm text-green-700 mt-3 leading-6">
                        REDDA analyzed the available property,
                        ownership, document, legal, tax, zoning,
                        monitoring and risk information.
                      </p>

                      <p className="text-sm text-green-700 mt-2 leading-6">
                        The current assessment indicates a{" "}
                        <strong>
                          {selectedReport.risk.toLowerCase()}
                        </strong>{" "}
                        risk level with a risk score of{" "}
                        <strong>
                          {selectedReport.score}/100
                        </strong>
                        .
                      </p>

                    </div>

                  </div>

                </section>

                {/* RECOMMENDATION */}

                <section className="bg-gray-50 border rounded-2xl p-5">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                      <ShieldCheck
                        size={20}
                        className="text-slate-700"
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Recommendation
                      </h3>

                      <p className="text-xs text-gray-500">
                        Based on the current available information
                      </p>
                    </div>

                  </div>

                  <p className="text-sm text-gray-600 mt-4 leading-6">

                    {selectedReport.risk === "High"
                      ? "Additional ownership, legal and document verification is recommended before proceeding with this property."
                      : selectedReport.risk === "Medium"
                      ? "Additional document, tax and property verification is recommended before final approval."
                      : "The available information indicates relatively low risk. Standard property verification should still be completed before final approval."}

                  </p>

                </section>

              </div>

              {/* MODAL FOOTER */}

              <div className="sticky bottom-0 bg-white flex flex-col sm:flex-row justify-end gap-3 p-6 border-t">

                <button
                  onClick={() =>
                    setSelectedReport(null)
                  }
                  className="px-5 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  Close
                </button>

                <button
                  onClick={() =>
                    handleDownload(selectedReport)
                  }
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition"
                >
                  <Download size={18} />
                  Download Report
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

export default Reports;