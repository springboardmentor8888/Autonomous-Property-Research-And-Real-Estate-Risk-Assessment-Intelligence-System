"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PropertyDetails() {
  const searchParams = useSearchParams();

  // Get property address from URL
  const property = searchParams.get("property");

  // Use entered property, otherwise show default property
  const propertyName =
    property?.trim() || "Seshadri Rao Gudlavalleru Engineering College";

  const propertyData = {
    address: propertyName,
    city: "Krishna District",
    state: "Andhra Pradesh",
    type: "Educational / Institutional Property",
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      {/* Header */}
      <header className="bg-slate-900 text-white px-8 py-6">
        <h1 className="text-2xl font-bold">
          Real Estate Due Diligence Agent
        </h1>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto mt-8">

        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900">
            Property Details
          </h1>

          <p className="mt-2 text-gray-600">
            Property information retrieved for due diligence review.
          </p>

          {/* Property Information */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <div>
              <p className="text-sm text-gray-500">
                Property Address
              </p>

              <p className="font-semibold text-slate-900 mt-1">
                {propertyData.address}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                City
              </p>

              <p className="font-semibold text-slate-900 mt-1">
                {propertyData.city}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                State
              </p>

              <p className="font-semibold text-slate-900 mt-1">
                {propertyData.state}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Property Type
              </p>

              <p className="font-semibold text-slate-900 mt-1">
                {propertyData.type}
              </p>
            </div>

          </div>

          {/* Due Diligence */}
          <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4">
            Due Diligence Information
          </h2>

          <div className="space-y-4">

            {/* Ownership */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-slate-900">
                Ownership Information
              </h3>

              <p className="text-gray-600 mt-2">
                Ownership and title information will be displayed here.
              </p>
            </div>

            {/* Legal */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-slate-900">
                Legal Information
              </h3>

              <p className="text-gray-600 mt-2">
                Legal and registration information will be displayed here.
              </p>
            </div>

            {/* Financial */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-slate-900">
                Financial Information
              </h3>

              <p className="text-gray-600 mt-2">
                Financial and valuation information will be displayed here.
              </p>
            </div>

            {/* History */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-slate-900">
                Property History
              </h3>

              <p className="text-gray-600 mt-2">
                Historical property information will be displayed here.
              </p>
            </div>

          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">

            <Link
              href="/property-search"
              className="bg-gray-200 text-slate-900 px-5 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              ← Back to Search
            </Link>

            <Link
              href="/dashboard"
              className="bg-slate-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-slate-800"
            >
              Dashboard
            </Link>

          </div>

        </div>
      </div>
    </main>
  );
}