"use client";

import { useState } from "react";

const BASE_URL = "http://localhost:8080/api";

export default function PropertySearchPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSearch(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    const cleanAddress = address.trim();

    if (!cleanAddress) {
      setError("Please enter a property address.");
      return;
    }

    if (cleanAddress.length < 3) {
      setError("Please enter a valid property address.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/properties/search?address=${encodeURIComponent(
          cleanAddress
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error?.message ||
          `Search failed (${response.status})`
        );
      }

      const properties = Array.isArray(data) ? data : data?.data || [];

      if (!Array.isArray(properties) || properties.length === 0) {
        throw new Error("No matching property found");
      }

      const property = properties[0];

      const propertyResult = {
        formattedAddress: property.address || cleanAddress,

        city: property.city || "Not available",

        state: property.state || "Not available",

        postalCode:
          property.zipCode ||
          property.zip_code ||
          "Not available",

        latitude:
          property.latitude ??
          property.lat ??
          null,

        longitude:
          property.longitude ??
          property.lng ??
          null,

        propertyId: property.id ?? null,

        propertyType:
          property.propertyType ||
          property.property_type ||
          "Not available",
      };

      setResult(propertyResult);

      sessionStorage.setItem(
        "selectedProperty",
        JSON.stringify(propertyResult)
      );
    } catch (searchError) {
      console.error("Property search error:", searchError);

      setError(
        searchError.message ||
        "Unable to search for this property."
      );
    } finally {
      setLoading(false);
    }
  }

  // Map URL:
  // Use coordinates when available.
  // Otherwise search the address on OpenStreetMap.
  const mapUrl =
    result?.latitude != null &&
      result?.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=17/${result.latitude}/${result.longitude}`
      : result
        ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(
          result.formattedAddress
        )}`
        : "#";

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-200px] top-[5%] h-[550px] w-[550px] rounded-full bg-orange-500/[0.06] blur-[150px]" />

        <div className="absolute right-[-200px] top-[35%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />
      </div>

      {/* HEADER */}
      <section className="border-b border-white/10 px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-7 text-xs font-semibold tracking-[0.35em] text-white/35">
            PROPERTY SEARCH
          </p>

          <h1 className="max-w-6xl text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.05em]">
            Start with
            <br />
            <span className="text-white/35">the address.</span>
          </h1>

          <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/45 md:text-xl">
            Enter a property address to find matching records in your
            database and begin the due-diligence journey.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <form
            onSubmit={handleSearch}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-xl md:p-8"
          >
            <label
              htmlFor="property-address"
              className="mb-5 block text-xs font-semibold tracking-[0.3em] text-white/40"
            >
              PROPERTY ADDRESS
            </label>

            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                id="property-address"
                type="text"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  setError("");
                  setResult(null);
                }}
                placeholder="Enter a property address"
                autoComplete="street-address"
                className="min-h-[62px] flex-1 rounded-xl border border-white/10 bg-black/30 px-5 text-base text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-black/50"
              />

              <button
                type="submit"
                disabled={loading}
                className="min-h-[62px] rounded-xl border border-white/20 px-8 text-sm font-medium transition duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border border-white/20 border-t-white" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    Search Property
                    <span className="text-lg">→</span>
                  </span>
                )}
              </button>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mt-6 flex items-center gap-4 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-6 py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-400/40 text-lg font-semibold text-red-400">
                  !
                </span>

                <p className="text-lg font-semibold leading-7 text-red-300 md:text-xl">
                  {error}
                </p>
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {result && (
              <div className="mt-6 flex items-center gap-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] px-6 py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 text-lg font-semibold text-emerald-400">
                  ✓
                </span>

                <p className="text-lg font-medium leading-7 text-emerald-400 md:text-xl">
                  Property found
                </p>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* EMPTY STATE */}
      {!result && !loading && (
        <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto grid max-w-[1400px] gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
            <InfoBlock
              number="01"
              title="Enter an address"
              text="Enter the address of a property stored in your database."
            />

            <InfoBlock
              number="02"
              title="Search database"
              text="The backend searches your existing property records for matching addresses."
            />

            <InfoBlock
              number="03"
              title="Begin due diligence"
              text="View the matching property details and continue to the next research stage."
            />
          </div>
        </section>
      )}

      {/* LOADING */}
      {loading && (
        <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1400px] border-t border-white/10 pt-16">
            <div className="flex items-center gap-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10">
                <div className="h-4 w-4 animate-spin rounded-full border border-white/20 border-t-white" />
              </div>

              <div>
                <p className="text-lg font-light text-white/70">
                  Searching property records...
                </p>

                <p className="mt-1 text-sm text-white/30">
                  Retrieving matching records from your database.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PROPERTY DETAILS */}
      {result && (
        <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="border-t border-white/10 pt-16">
              <h2 className="mt-6 max-w-5xl text-4xl font-light leading-tight tracking-tight md:text-6xl">
                {result.formattedAddress}
              </h2>
            </div>

            {/* PROPERTY DETAILS */}
            <div className="mt-16">
              <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                PROPERTY DETAILS
              </p>

              <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                <DetailCard
                  label="Property ID"
                  value={result.propertyId ?? "Not available"}
                />

                <DetailCard
                  label="Property Type"
                  value={result.propertyType}
                />

                <DetailCard
                  label="City"
                  value={result.city}
                />

                <DetailCard
                  label="State"
                  value={result.state}
                />

                <DetailCard
                  label="Postal Code"
                  value={result.postalCode}
                />
              </div>
            </div>

            {/* PROPERTY LOCATION */}
            <div className="mt-16">
              <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                PROPERTY LOCATION
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                <div>
                  {/* MAP LOCATION */}
                  <p className="text-xs tracking-[0.25em] text-white/40">
                    MAP LOCATION
                  </p>

                  <p className="mt-4 break-words text-lg text-white/80">
                    {result.formattedAddress}
                  </p>

                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3 text-sm text-white/65 transition hover:border-white/30 hover:bg-white hover:text-black"
                  >
                    Open Map
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </div>
            {/* END PROPERTY LOCATION */}
          </div>
        </section>
      )}

      {/* OWNERSHIP SECTION */}
      <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 lg:p-14">
            <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
              NEXT RESEARCH STAGE
            </p>

            <h2 className="mt-6 text-4xl font-light tracking-tight text-white md:text-5xl">
              Land Registry &amp; Ownership Records
            </h2>

            <p className="mt-5 max-w-4xl text-base leading-8 text-white/40 md:text-lg">
              Review public land registry information, ownership records,
              property ownership details, and available registry information
              associated with the property.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/ownership"
                className="inline-flex items-center justify-center gap-4 rounded-full border border-white/20 px-9 py-5 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-black"
              >
                View Ownership Records
                <span className="text-xl">→</span>
              </a>

              <a
                href="/property-search"
                className="inline-flex items-center justify-center gap-4 rounded-full border border-white/10 px-9 py-5 text-sm font-medium text-white/50 transition duration-300 hover:border-white/20 hover:bg-white/[0.03] hover:text-white"
              >
                Property Search
                <span className="text-xl">←</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">
          <span>PROP DUE</span>
          <span>PROPERTY DUE DILIGENCE PLATFORM</span>
        </div>
      </footer>
    </main>
  );
}

/* INFO BLOCK */
function InfoBlock({ number, title, text }) {
  return (
    <div className="bg-[#101010] p-8 md:p-10">
      <p className="text-xs tracking-[0.25em] text-white/25">
        {number}
      </p>

      <h3 className="mt-12 text-2xl font-medium">
        {title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-white/40">
        {text}
      </p>
    </div>
  );
}

/* DETAIL CARD */
function DetailCard({ label, value }) {
  return (
    <div className="bg-[#101010] p-6">
      <p className="text-xs tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p className="mt-4 break-words text-base font-medium text-white/80">
        {value}
      </p>
    </div>
  );
}