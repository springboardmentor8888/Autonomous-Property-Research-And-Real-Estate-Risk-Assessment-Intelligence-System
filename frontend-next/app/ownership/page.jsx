
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  UserRound,
  FileText,
  Clock3,
} from "lucide-react";

const API_URL = "http://localhost:8080/api";

export default function OwnershipPage() {
  const [property, setProperty] = useState(null);
  const [ownershipHistory, setOwnershipHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOwnership() {
      try {
        setLoading(true);
        setError("");

        const savedProperty = sessionStorage.getItem("selectedProperty");

        if (!savedProperty) {
          throw new Error(
            "No property selected. Please search for a property first."
          );
        }

        const selected = JSON.parse(savedProperty);
        setProperty(selected);

        const rawId =
          selected.propertyDbId ??
          selected.id ??
          selected.propertyId;

        if (
          rawId === null ||
          rawId === undefined ||
          !/^\d+$/.test(String(rawId))
        ) {
          throw new Error(
            "A valid numeric property database ID was not found. Please select a property from Property Search."
          );
        }

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found. Please log in again."
          );
        }

        const response = await fetch(
          `${API_URL}/properties/${rawId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "401 Unauthorized. Your login token may be invalid or expired. Please log in again."
            );
          }

          if (response.status === 403) {
            throw new Error(
              "403 Forbidden. You do not have permission to view these records."
            );
          }

          throw new Error(
            data?.message ||
            data?.error?.message ||
            `Unable to load ownership records. Server returned ${response.status}.`
          );
        }

        const details = data?.data ?? data;

        let history = [];

        if (Array.isArray(details?.ownershipHistory)) {
          history = details.ownershipHistory;
        } else if (Array.isArray(details?.ownership)) {
          history = details.ownership;
        } else if (
          details?.ownership &&
          typeof details.ownership === "object"
        ) {
          history = [details.ownership];
        }

        history.sort((a, b) => {
          const dateA = a?.acquiredDate || "";
          const dateB = b?.acquiredDate || "";
          return dateA.localeCompare(dateB);
        });

        setOwnershipHistory(history);
      } catch (err) {
        console.error("Ownership loading error:", err);
        setError(err.message || "Unable to load ownership records.");
      } finally {
        setLoading(false);
      }
    }

    loadOwnership();
  }, []);

  const address =
    property?.formattedAddress ||
    property?.address ||
    "Property Address";

  const mapUrl =
    property?.latitude != null && property?.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=17/${property.latitude}/${property.longitude}`
      : `https://www.openstreetmap.org/search?query=${encodeURIComponent(
        address
      )}`;

  // Sort ownership records by acquisition date.
  const sortedOwnershipHistory = [...ownershipHistory].sort((a, b) =>
    (a?.acquiredDate || "").localeCompare(b?.acquiredDate || "")
  );

  // Identify the current owner.
  const recordsWithoutTransferDate = sortedOwnershipHistory.filter(
    (record) => record?.transferDate == null
  );

  const currentOwner =
    recordsWithoutTransferDate.length > 1
      ? recordsWithoutTransferDate[
      recordsWithoutTransferDate.length - 1
      ]
      : recordsWithoutTransferDate[0] ||
      sortedOwnershipHistory[sortedOwnershipHistory.length - 1];

  // Use transfer dates when available.
  // If all transfer dates are missing, use acquisition dates as a fallback.
  const hasTransferDates = sortedOwnershipHistory.some(
    (record) => record?.transferDate != null
  );

  const previousOwners = hasTransferDates
    ? sortedOwnershipHistory.filter(
      (record) =>
        record?.transferDate != null && record !== currentOwner
    )
    : sortedOwnershipHistory.filter(
      (record) => record !== currentOwner
    );

  const inferredPreviousOwners =
    !hasTransferDates && previousOwners.length > 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-4 text-white/50">
            <div className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />
            <span>Loading ownership records...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-200px] top-[5%] h-[550px] w-[550px] rounded-full bg-orange-500/[0.06] blur-[150px]" />
        <div className="absolute right-[-200px] top-[35%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />
      </div>

      {/* Header */}
      <section className="border-b border-white/10 px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href="/property-search"
            className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Property Search
          </Link>

          <p className="mb-7 mt-16 text-xs font-semibold tracking-[0.35em] text-white/35">
            OWNERSHIP / LAND REGISTRY
          </p>

          <h1 className="max-w-6xl text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.05em]">
            Verify
            <br />
            <span className="text-white/35">ownership.</span>
          </h1>

          <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/45 md:text-xl">
            Review current and previous ownership information
            and available registry records for the selected
            property.
          </p>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1400px] rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-8">
            <h2 className="text-2xl font-medium text-red-300">
              Ownership records unavailable
            </h2>

            <p className="mt-4 text-sm leading-7 text-red-200/70">
              {error}
            </p>

            <Link
              href="/property-search"
              className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm transition hover:bg-white hover:text-black"
            >
              <ArrowLeft size={16} />
              Go to Property Search
            </Link>
          </div>
        </section>
      )}

      {/* Property overview */}
      {!error && property && (
        <>
          <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
            <div className="mx-auto max-w-[1400px]">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-emerald-400" />
                <span className="text-xs font-semibold tracking-[0.3em] text-emerald-400/70">
                  SELECTED PROPERTY
                </span>
              </div>

              <h2 className="mt-6 max-w-5xl text-4xl font-light leading-tight tracking-tight md:text-6xl">
                {address}
              </h2>

              <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                <DetailCard label="City" value={property.city} />

                <DetailCard label="State" value={property.state} />

                <DetailCard
                  label="Postal Code"
                  value={property.postalCode ?? property.zipCode}
                />

                <DetailCard
                  label="Property ID"
                  value={
                    property.propertyDbId ??
                    property.id ??
                    property.propertyId
                  }
                />
              </div>
            </div>
          </section>

          {/* Ownership records */}
          <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
            <div className="mx-auto max-w-[1400px]">
              <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                OWNERSHIP RECORDS
              </p>

              {ownershipHistory.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                  <ShieldCheck
                    size={28}
                    className="text-white/40"
                  />

                  <h3 className="mt-5 text-2xl font-light text-white/80">
                    No ownership data available
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/40">
                    The backend did not return ownership
                    information for this property.
                  </p>
                </div>
              ) : (
                <>
                  {/* Current owner */}
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-8 md:p-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <UserRound
                          size={20}
                          className="text-emerald-400"
                        />

                        <p className="text-xs tracking-[0.25em] text-emerald-400/70">
                          CURRENT OWNER
                        </p>
                      </div>

                      <span className="rounded-full border border-emerald-400/30 px-4 py-2 text-xs text-emerald-300">
                        Current
                      </span>
                    </div>

                    <h3 className="mt-5 break-words text-3xl font-light text-white/90 md:text-4xl">
                      {currentOwner?.ownerName ||
                        currentOwner?.owner ||
                        currentOwner?.name ||
                        "Not available"}
                    </h3>

                    <p className="mt-4 text-sm text-white/40">
                      Current ownership information returned by
                      the backend.
                    </p>

                    <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                      <DetailCard
                        label="Acquired Date"
                        value={currentOwner?.acquiredDate}
                      />

                      <DetailCard
                        label="Transfer Date"
                        value={
                          currentOwner?.transferDate ??
                          "Current owner"
                        }
                      />

                      <DetailCard
                        label="Record ID"
                        value={currentOwner?.id}
                      />
                    </div>
                  </div>

                  {/* Ownership timeline */}
                  <div className="mt-16">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                          OWNERSHIP TIMELINE
                        </p>

                        <h2 className="mt-4 text-3xl font-light text-white/85 md:text-4xl">
                          Previous owners
                        </h2>
                      </div>

                      <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/50">
                        {previousOwners.length}{" "}
                        {previousOwners.length === 1
                          ? "Previous owner"
                          : "Previous owners"}
                      </span>
                    </div>

                    {inferredPreviousOwners && (
                      <p className="mt-6 text-sm leading-6 text-amber-200/70">
                        Transfer dates were not provided. Previous owners are
                        shown based on acquisition dates and should be verified
                        with the backend records.
                      </p>
                    )}

                    {previousOwners.length === 0 ? (
                      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
                        <p className="text-lg text-white/65">
                          No previous ownership records found.
                        </p>

                        <p className="mt-3 text-sm leading-7 text-white/40">
                          No earlier ownership records could be identified.
                          The backend did not provide transfer dates.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-8 space-y-5">
                        {previousOwners.map((owner, index) => (
                          <div
                            key={
                              owner.id ??
                              `${owner.ownerName}-${owner.acquiredDate}-${index}`
                            }
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition hover:border-white/20 md:p-9"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                                  <UserRound
                                    size={18}
                                    className="text-white/50"
                                  />
                                </div>

                                <span className="text-xs tracking-[0.2em] text-white/35">
                                  PREVIOUS OWNER {index + 1}
                                </span>
                              </div>

                              <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/45">
                                Ownership ended
                              </span>
                            </div>

                            <h3 className="mt-6 break-words text-2xl font-light text-white/85 md:text-3xl">
                              {owner.ownerName ||
                                owner.owner ||
                                owner.name ||
                                "Not available"}
                            </h3>

                            <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                              <DetailCard
                                label="Acquired Date"
                                value={owner.acquiredDate}
                              />

                              <DetailCard
                                label="Transfer Date"
                                value={owner.transferDate}
                              />

                              <DetailCard
                                label="Record ID"
                                value={owner.id}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Record summary */}
                  <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-7 md:p-9">
                    <div className="flex items-center gap-3">
                      <Clock3
                        size={20}
                        className="text-white/50"
                      />

                      <p className="text-xs tracking-[0.25em] text-white/35">
                        RECORD SUMMARY
                      </p>
                    </div>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-white/35">
                          Total ownership records
                        </p>

                        <p className="mt-3 text-4xl font-light text-white/85">
                          {ownershipHistory.length}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-white/35">
                          Previous owners
                        </p>

                        <p className="mt-3 text-4xl font-light text-white/85">
                          {previousOwners.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Property location */}
          <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
            <div className="mx-auto max-w-[1400px]">
              <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                PROPERTY LOCATION
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                <p className="text-lg text-white/65">
                  {address}
                </p>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3 text-sm text-white/65 transition hover:border-white/30 hover:bg-white hover:text-black"
                >
                  Open Map ↗
                </a>
              </div>
            </div>
          </section>

          {/* Next stage */}
          <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
            <div className="mx-auto max-w-[1400px] rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
              <div className="flex items-center gap-3">
                <FileText
                  size={18}
                  className="text-white/40"
                />

                <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                  NEXT RESEARCH STAGE
                </p>
              </div>

              <h2 className="mt-5 text-3xl font-light text-white/80">
                Tax History &amp; Property Records
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/40">
                Review historical property tax assessments, tax
                amounts, payment status, and changes across
                previous tax years.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/tax-history"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm transition hover:bg-white hover:text-black"
                >
                  Go to Tax History →
                </Link>

                <Link
                  href="/property-search"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 px-7 py-4 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Property Search
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">
          <span>PROP DUE</span>
          <span>OWNERSHIP &amp; LAND REGISTRY</span>
        </div>
      </footer>
    </main>
  );
}

function DetailCard({ label, value }) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "Not available"
      : String(value);

  return (
    <div className="bg-[#101010] p-6">
      <p className="text-xs tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p className="mt-4 break-words text-base font-medium text-white/80">
        {displayValue}
      </p>
    </div>
  );
}