"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PropertySearch() {
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleSearch = () => {
    const trimmedAddress = address.trim();

    // Empty check
    if (!trimmedAddress) {
      setError("Please enter a property address.");
      return;
    }

    // Clear error
    setError("");

    // Send the entered address to Property Details page
    router.push(
      `/property-details?property=${encodeURIComponent(trimmedAddress)}`
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold">
            Real Estate Due Diligence Agent
          </h1>
        </div>

        {/* Search Card */}
        <div className="bg-white mt-8 rounded-2xl shadow-lg p-8">

          <h2 className="text-3xl font-bold text-slate-900">
            Search Property
          </h2>

          <p className="mt-2 text-gray-600">
            Enter the property address to search for due diligence information.
          </p>

          {/* Input */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Address
            </label>

            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError("");
              }}
              placeholder="Enter property address"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
            />

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">

            <button
              type="button"
              onClick={handleSearch}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
            >
              Search Property
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="bg-gray-200 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Back to Dashboard
            </button>

          </div>

        </div>
      </div>
    </main>
  );
}