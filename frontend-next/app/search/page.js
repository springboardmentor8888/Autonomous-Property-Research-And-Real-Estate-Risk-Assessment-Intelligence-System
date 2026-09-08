"use client";

import { useState } from "react";

export default function PropertySearch() {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState("");

  const handleValidate = () => {
    const trimmedAddress = address.trim();

    if (trimmedAddress === "") {
      setMessage("Please enter a property address.");
      setMessageType("error");
      return;
    }

    if (trimmedAddress.length < 3) {
      setMessage("Please enter a valid property address.");
      setMessageType("error");
      return;
    }

    setMessage("Address is ready for validation.");
    setMessageType("success");
  };

  const handleSearch = async () => {
    const trimmedAddress = address.trim();

    if (trimmedAddress === "") {
      setMessage("Please enter a property address before searching.");
      setMessageType("error");
      setProperties([]);
      return;
    }

    if (trimmedAddress.length < 3) {
      setMessage("Please enter a valid property address.");
      setMessageType("error");
      setProperties([]);
      return;
    }

    setMessage("");
    setMessageType("");
    setProperties([]);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("address", trimmedAddress);

      const response = await fetch(
        `http://localhost:8080/api/properties/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to search properties.");
      }

      const result = await response.json();

      if (result.success) {
        const results = result.data || [];
        setProperties(results);

        if (results.length > 0) {
          setMessage(
            result.message || `${results.length} property found.`
          );
          setMessageType("success");
        } else {
          setMessage("No properties found for this address.");
          setMessageType("info");
        }
      } else {
        setProperties([]);
        setMessage(result.message || "No properties found.");
        setMessageType("info");
      }
    } catch (error) {
      console.error("Property search error:", error);
      setProperties([]);
      setMessage(
        "Unable to connect to the backend. Make sure the Spring Boot server is running."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
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
            Search for a property using its address and validate
            the property information.
          </p>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
            <label className="mb-2 block font-medium">
              Property Address
            </label>

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Enter property address"
              disabled={loading}
              className="w-full rounded-lg border px-4 py-3 disabled:bg-gray-100"
            />

            <div className="mt-5 flex gap-4">
              <button
                type="button"
                onClick={handleValidate}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Validate Address
              </button>

              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Search Property"}
              </button>
            </div>

            {message && (
              <p
                className={`mt-4 font-medium ${
                  messageType === "error"
                    ? "text-red-600"
                    : messageType === "success"
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {message}
              </p>
            )}
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
            <h3 className="text-xl font-semibold">
              Search Filters
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Property Type
                </label>

                <select className="w-full rounded-lg border px-4 py-3">
                  <option>All Types</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  City
                </label>

                <input
                  type="text"
                  placeholder="Enter city"
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  State
                </label>

                <input
                  type="text"
                  placeholder="Enter state"
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-2xl font-bold">
              Search Results
            </h3>

            {loading && (
              <div className="mt-5 rounded-2xl bg-white p-6 shadow-md">
                <p className="text-gray-600">
                  Searching for properties...
                </p>
              </div>
            )}

            {!loading && properties.length === 0 && (
              <div className="mt-5 rounded-2xl bg-white p-6 shadow-md">
                <p className="text-gray-500">
                  No properties found. Enter an address and click
                  "Search Property".
                </p>
              </div>
            )}

            {!loading && properties.length > 0 && (
              <div className="mt-5 space-y-5">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-md"
                  >
                    <img
                      src="/images/villa.jpg"
                      alt="Property"
                      className="h-56 w-full object-cover"
                    />

                    <div className="p-6">
                      <p className="text-sm text-gray-500">
                        {property.address}
                        {property.city && `, ${property.city}`}
                        {property.state && `, ${property.state}`}
                        {property.zipCode && ` ${property.zipCode}`}
                      </p>

                      <h4 className="mt-2 text-xl font-semibold">
                        {property.title}
                      </h4>

                      <p className="mt-2 text-gray-600">
                        {property.propertyType &&
                          `${property.propertyType} • `}
                        {property.bedrooms != null &&
                          `${property.bedrooms} Beds • `}
                        {property.bathrooms != null &&
                          `${property.bathrooms} Baths`}
                      </p>

                      <p className="mt-2 text-lg font-semibold text-blue-600">
                        {property.price != null
                          ? `$${property.price.toLocaleString()}`
                          : "Price unavailable"}
                      </p>

                      {property.squareFeet && (
                        <p className="mt-2 text-gray-600">
                          {property.squareFeet} sq ft
                        </p>
                      )}

                      <a
                        href={`/property/${property.id}`}
                        className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}