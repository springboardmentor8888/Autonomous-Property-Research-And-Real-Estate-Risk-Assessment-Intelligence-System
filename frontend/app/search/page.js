"use client";

import { useState } from "react";

export default function PropertySearch() {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleValidate = () => {
    if (address.trim() === "") {
      setMessage("Please enter a property address.");
    } else {
      setMessage("Address is ready for validation.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-blue-600">
            EstateHub
          </h1>

          <a
            href="/"
            className="text-gray-600 hover:text-blue-600"
          >
            ← Home
          </a>
        </div>
      </header>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">

          <p className="font-medium text-blue-600">
            PROPERTY SEARCH
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            Find a Property
          </h2>

          <p className="mt-3 text-gray-600">
            Search for a property using its address.
          </p>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
            <label className="mb-2 block font-medium">
              Property Address
            </label>

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter property address"
              className="w-full rounded-lg border px-4 py-3"
            />

            <div className="mt-5 flex gap-4">
              <button
                type="button"
                onClick={handleValidate}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Validate Address
              </button>

              <button
                type="button"
                onClick={() => setMessage("Property search completed.")}
                className="rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 hover:bg-blue-50"
              >
                Search Property
              </button>
            </div>

            {message && (
              <p className="mt-4 text-blue-600">
                {message}
              </p>
            )}
          </div>

          <div className="mt-10">
            <h3 className="text-2xl font-bold">
              Search Results
            </h3>

            <div className="mt-5 rounded-2xl bg-white p-6 shadow-md">
              <p className="text-sm text-gray-500">
                Chennai, Tamil Nadu
              </p>

              <h4 className="mt-2 text-xl font-semibold">
                Modern Family Villa
              </h4>

              <p className="mt-2 text-gray-600">
                Residential • 3 Beds • 2 Baths
              </p>

              <a
                href="/property/1"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                View Details
              </a>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}