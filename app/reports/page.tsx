"use client";

import Link from "next/link";

export default function ReportsPage() {
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

      {/* Main */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/dashboard"
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-lg mt-6 p-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Due Diligence Reports
          </h2>

          <p className="mt-2 text-gray-600">
            View and review property due diligence reports.
          </p>

          {/* Report Card */}
          <div className="border border-gray-300 rounded-xl p-6 mt-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Property Due Diligence Report
                </h3>

                <p className="text-gray-700 mt-2">
                  Seshadri Rao Gudlavalleru Engineering College
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Location: Krishna District, Andhra Pradesh
                </p>
              </div>

              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold w-fit">
                Available
              </span>
            </div>

            {/* Report Categories */}
            <div className="grid md:grid-cols-3 gap-4 mt-7">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Ownership
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  Available
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Legal Review
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  Available
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Financial Review
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  Available
                </p>
              </div>
            </div>

            {/* Report Information */}
            <div className="mt-6 border-t pt-6">
              <h4 className="font-bold text-slate-900">
                Report Summary
              </h4>

              <p className="text-gray-600 mt-2">
                This report contains the available due diligence
                information for the selected property, including
                ownership, legal, financial, and historical information.
              </p>
            </div>

            {/* Button */}
            <div className="mt-6">
              <Link
                href="/property-details"
                className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
              >
                View Report Details
              </Link>
            </div>
          </div>

          {/* Additional Reports */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-900">
              Report Sections
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mt-5">
              <div className="border border-gray-300 rounded-xl p-5">
                <h4 className="font-bold text-slate-900">
                  Ownership Report
                </h4>

                <p className="text-gray-600 mt-2">
                  Review available ownership and title information.
                </p>
              </div>

              <div className="border border-gray-300 rounded-xl p-5">
                <h4 className="font-bold text-slate-900">
                  Legal Report
                </h4>

                <p className="text-gray-600 mt-2">
                  Review available legal and registration information.
                </p>
              </div>

              <div className="border border-gray-300 rounded-xl p-5">
                <h4 className="font-bold text-slate-900">
                  Financial Report
                </h4>

                <p className="text-gray-600 mt-2">
                  Review available financial and valuation information.
                </p>
              </div>

              <div className="border border-gray-300 rounded-xl p-5">
                <h4 className="font-bold text-slate-900">
                  Property History Report
                </h4>

                <p className="text-gray-600 mt-2">
                  Review historical information associated with the
                  property.
                </p>

                <Link
                  href="/history"
                  className="inline-block mt-4 text-blue-600 font-semibold hover:underline"
                >
                  View History →
                </Link>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="text-blue-600 font-semibold hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}