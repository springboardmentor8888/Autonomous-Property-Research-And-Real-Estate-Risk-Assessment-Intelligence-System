"use client";

import Link from "next/link";

export default function HistoryPage() {
  const history = [
    {
      year: "2026",
      date: "01 September 2026",
      event: "Due Diligence Review",
      details:
        "Property due diligence information reviewed for ownership, legal, financial, and historical records.",
      status: "Completed",
    },
    {
      year: "2025",
      date: "15 December 2025",
      event: "Property Information Updated",
      details:
        "Property information was updated for the latest due diligence review.",
      status: "Completed",
    },
    {
      year: "2024",
      date: "20 June 2024",
      event: "Property Record Created",
      details:
        "Initial property record was added to the due diligence system.",
      status: "Completed",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Real Estate Due Diligence Agent
          </h1>

          <Link
            href="/dashboard"
            className="bg-white text-slate-900 px-5 py-2 rounded-lg font-semibold hover:bg-slate-200"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/dashboard"
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-lg mt-6 p-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Property History
          </h2>

          <p className="mt-2 text-gray-600">
            Review historical property information and due diligence activity.
          </p>

          {/* Property Information */}
          <div className="mt-8 border border-gray-300 rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-900">
              Property Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mt-5">
              <div>
                <p className="text-sm text-gray-500">Property Address</p>
                <p className="font-semibold text-slate-900 mt-1">
                  Seshadri Rao Gudlavalleru Engineering College
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">City / District</p>
                <p className="font-semibold text-slate-900 mt-1">
                  Krishna District
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="font-semibold text-slate-900 mt-1">
                  Andhra Pradesh
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="font-semibold text-slate-900 mt-1">
                  Educational / Institutional Property
                </p>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-5">
              Historical Records
            </h3>

            <div className="space-y-5">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-xl p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">{item.date}</p>

                      <h4 className="text-lg font-bold text-slate-900 mt-1">
                        {item.event}
                      </h4>

                      <p className="text-gray-600 mt-2">
                        {item.details}
                      </p>
                    </div>

                    <span className="inline-block w-fit bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/property-details"
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
            >
              View Property Details
            </Link>

            <Link
              href="/reports"
              className="bg-gray-200 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}