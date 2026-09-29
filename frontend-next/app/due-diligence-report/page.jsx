
"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

export default function DueDiligenceReportPage() {
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadReport() {
            try {
                const saved = sessionStorage.getItem("selectedProperty");

                if (!saved) {
                    throw new Error(
                        "No property selected. Please select a property from Property Search."
                    );
                }

                const selected = JSON.parse(saved);

                const propertyId =
                    selected.propertyDbId ||
                    selected.id ||
                    (typeof selected.propertyId === "number"
                        ? selected.propertyId
                        : null);

                if (!propertyId) {
                    throw new Error(
                        "Property ID is missing. Please select a property again."
                    );
                }

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/properties/${propertyId}`,
                    {
                        headers: {
                            ...(token
                                ? {
                                    Authorization: `Bearer ${token}`,
                                }
                                : {}),
                        },
                    }
                );

                const result = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                        result?.error?.message ||
                        `Unable to load report (HTTP ${response.status})`
                    );
                }

                const data = result?.data || result;

                if (!cancelled) {
                    setProperty({
                        ...selected,
                        ...data,
                        formattedAddress:
                            data.formattedAddress ||
                            data.address ||
                            selected.formattedAddress ||
                            selected.address,
                        postalCode:
                            data.postalCode ||
                            data.zipCode ||
                            selected.postalCode ||
                            selected.zipCode,
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load the report.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadReport();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0b0b0b] text-white px-6 py-32">
                <div className="mx-auto max-w-5xl">
                    <p className="text-xs tracking-[0.3em] text-white/35">
                        PROPERTY DUE DILIGENCE
                    </p>
                    <h1 className="mt-6 text-4xl font-light">
                        Preparing your report...
                    </h1>
                    <div className="mt-10 rounded-2xl border border-white/10 p-8 text-white/50">
                        <span className="inline-block h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />
                        <span className="ml-4">Loading property records...</span>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !property) {
        return (
            <main className="min-h-screen bg-[#0b0b0b] text-white px-6 py-32">
                <div className="mx-auto max-w-5xl">
                    <p className="text-xs tracking-[0.3em] text-white/35">
                        PROPERTY DUE DILIGENCE
                    </p>
                    <h1 className="mt-6 text-4xl font-light">
                        Report unavailable
                    </h1>
                    <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-7 text-sm leading-7 text-red-300/80">
                        {error || "Property information could not be loaded."}
                    </div>
                    <a
                        href="/property-search"
                        className="mt-8 inline-flex rounded-full border border-white/20 px-7 py-4 text-sm text-white/70 hover:bg-white hover:text-black"
                    >
                        Back to Property Search →
                    </a>
                </div>
            </main>
        );
    }

    const ownership = property.ownership || {};
    const tax = property.taxHistory;
    const zoning = property.zoning || {};
    const flood = property.floodZone || {};
    const environmental = property.environmental || {};
    const utility = property.utility || {};

    const taxRecords = Array.isArray(tax)
        ? tax
        : tax
            ? [tax]
            : [];

    const permits = Array.isArray(property.permits)
        ? property.permits
        : [];

    const sections = [
        {
            number: "01",
            title: "Ownership Records",
            description: "Property ownership and acquisition details.",
            href: "/ownership",
            fields: [
                ["Owner Name", ownership.owner],
                ["Acquired Date", formatDate(ownership.acquiredDate)],
                ["Property ID", property.id],
            ],
        },
        {
            number: "02",
            title: "Property Tax History",
            description: "Tax amounts, years, and payment status.",
            href: "/tax-history",
            fields:
                taxRecords.length > 0
                    ? taxRecords.flatMap((record, index) => [
                        [
                            taxRecords.length > 1
                                ? `Tax Year ${index + 1}`
                                : "Tax Year",
                            record.year,
                        ],
                        ["Amount Paid", formatCurrency(record.amountPaid)],
                        ["Payment Status", record.status],
                    ])
                    : [
                        ["Tax Year", null],
                        ["Amount Paid", null],
                        ["Payment Status", null],
                    ],
        },
        {
            number: "03",
            title: "Building Permit Records",
            description: "Building, electrical, plumbing, and other permits.",
            href: "/permit-environmental#permit-records",
            fields: [
                ["Total Permits", permits.length],
                [
                    "Permit Types",
                    permits.length
                        ? permits
                            .map((p) => p.permitType || p.type)
                            .filter(Boolean)
                            .join(", ")
                        : null,
                ],
                [
                    "Permit Statuses",
                    permits.length
                        ? permits
                            .map((p) => p.status)
                            .filter(Boolean)
                            .join(", ")
                        : null,
                ],
            ],
            records: permits,
        },
        {
            number: "04",
            title: "Zoning Information",
            description: "Land-use classification and compliance.",
            href: "/zoning",
            fields: [
                ["Zone Type", zoning.zoneType],
                ["Compliance", formatBoolean(zoning.compliant)],
                ["Property Type", property.propertyType],
            ],
        },
        {
            number: "05",
            title: "Flood Zone Verification",
            description: "Flood-zone classification and risk level.",
            href: "/flood-zone",
            fields: [
                ["Flood Zone", flood.zone],
                ["Risk Level", flood.riskLevel],
            ],
        },
        {
            number: "06",
            title: "Environmental Records",
            description: "Environmental hazards and assessment details.",
            href: "/permit-environmental#environmental-records",
            fields: [
                ["Hazard Found", formatBoolean(environmental.hazardFound)],
                ["Hazard Type", environmental.hazardType],
                ["Assessment Date", formatDate(environmental.assessmentDate)],
            ],
        },
        {
            number: "07",
            title: "Utility Information",
            description: "Electricity, gas, water, and service provider.",
            href: "#utility-information",
            fields: [
                ["Electricity Connected", formatBoolean(utility.electricityConnected)],
                ["Gas Connected", formatBoolean(utility.gasConnected)],
                ["Water Connected", formatBoolean(utility.waterConnected)],
                ["Provider", utility.provider],
            ],
        },
    ];

    return (
        <main className="min-h-screen bg-[#0b0b0b] text-white">
            {/* HEADER */}

            <section className="border-b border-white/10 px-6 pb-16 pt-32 sm:px-10 md:px-16 lg:px-24 print:pt-8">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-7 text-xs font-semibold tracking-[0.35em] text-white/35">
                        PROP DUE / DUE DILIGENCE REPORT
                    </p>

                    <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="max-w-5xl text-[clamp(3rem,7vw,7rem)] font-light leading-[0.95] tracking-[-0.05em]">
                                Property
                                <br />
                                <span className="text-white/35">
                                    Due Diligence Report.
                                </span>
                            </h1>

                            <p className="mt-8 max-w-2xl text-base leading-8 text-white/45 md:text-lg">
                                A consolidated overview of ownership, taxes,
                                permits, zoning, flood risk, environmental
                                findings, and utility information.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="no-print inline-flex w-fit items-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm text-white/70 transition hover:bg-white hover:text-black"
                        >
                            Print Report
                            <span className="text-lg">↗</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* PROPERTY DETAILS */}

            <section className="px-6 py-12 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 md:p-10">
                        <p className="text-xs tracking-[0.3em] text-white/30">
                            PROPERTY INFORMATION
                        </p>

                        <h2 className="mt-5 text-3xl font-light text-white/90 md:text-4xl">
                            {property.formattedAddress ||
                                property.address ||
                                "Address not available"}
                        </h2>

                        <div className="mt-9 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                            <Detail
                                label="City"
                                value={property.city}
                            />
                            <Detail
                                label="State"
                                value={property.state}
                            />
                            <Detail
                                label="Postal Code"
                                value={property.postalCode}
                            />
                            <Detail
                                label="Property ID"
                                value={property.id}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* REPORT SUMMARY */}

            <section className="px-6 pb-12 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="text-xs tracking-[0.3em] text-white/30">
                        REPORT OVERVIEW
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <OverviewCard
                            label="Due Diligence Sections"
                            value="7"
                            description="Sections included in this report"
                        />
                        <OverviewCard
                            label="Permit Records"
                            value={String(permits.length)}
                            description="Records returned by the backend"
                        />
                        <OverviewCard
                            label="Tax Records"
                            value={String(taxRecords.length)}
                            description="Records returned by the backend"
                        />
                    </div>
                </div>
            </section>

            {/* ALL SECTIONS */}

            <section className="px-6 pb-20 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-10">
                        <p className="text-xs tracking-[0.3em] text-white/30">
                            CONSOLIDATED PROPERTY RECORDS
                        </p>
                        <h2 className="mt-5 text-4xl font-light md:text-5xl">
                            All Due Diligence Sections
                        </h2>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/40">
                            Review the available information from each section.
                            Fields not returned by the backend are marked as
                            not available.
                        </p>
                    </div>

                    <div className="space-y-5">
                        {sections.map((section) => (
                            <ReportSection
                                key={section.number}
                                section={section}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL REVIEW */}

            <section className="px-6 pb-24 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-8 md:p-12">
                        <p className="text-xs tracking-[0.3em] text-white/30">
                            FINAL REVIEW
                        </p>

                        <h2 className="mt-6 text-4xl font-light md:text-5xl">
                            Review before proceeding.
                        </h2>

                        <p className="mt-6 max-w-3xl text-sm leading-7 text-white/45">
                            This report consolidates the property information
                            currently returned by the backend. Review the
                            available records and any missing information
                            before making your own decision.
                        </p>

                        <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-6">
                            <p className="text-xs tracking-[0.2em] text-white/30">
                                REPORT DATA STATUS
                            </p>
                            <p className="mt-3 text-lg font-light text-white/80">
                                Property data loaded
                            </p>
                            <p className="mt-2 text-sm text-white/40">
                                Some fields may not yet be available from the
                                backend.
                            </p>
                        </div>

                        <div className="no-print mt-10 flex flex-wrap gap-4">
                            <a
                                href="/property-search"
                                className="rounded-full border border-white/20 px-7 py-4 text-sm text-white/70 transition hover:bg-white hover:text-black"
                            >
                                Back to Property Search
                            </a>

                            <a
                                href="/permit-environmental"
                                className="rounded-full border border-white/10 px-7 py-4 text-sm text-white/50 transition hover:border-white/20 hover:text-white"
                            >
                                Review Permit & Environmental Records →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}

            <footer className="border-t border-white/10 px-6 py-8 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">
                    <span>PROP DUE</span>
                    <span>PROPERTY DUE DILIGENCE REPORT</span>
                </div>
            </footer>
        </main>
    );
}

/* =========================================================
   DETAIL
========================================================= */

function Detail({ label, value }) {
    return (
        <div className="bg-[#101010] p-6">
            <p className="text-xs tracking-[0.2em] text-white/30">
                {label}
            </p>
            <p className="mt-4 break-words text-base font-medium text-white/80">
                {displayValue(value)}
            </p>
        </div>
    );
}

/* =========================================================
   OVERVIEW CARD
========================================================= */

function OverviewCard({ label, value, description }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7">
            <p className="text-xs tracking-[0.2em] text-white/30">
                {label}
            </p>
            <p className="mt-5 text-4xl font-light text-white/90">
                {value}
            </p>
            <p className="mt-3 text-sm text-white/35">
                {description}
            </p>
        </div>
    );
}

/* =========================================================
   REPORT SECTION
========================================================= */

function ReportSection({ section }) {
    return (
        <div
            id={
                section.number === "07"
                    ? "utility-information"
                    : undefined
            }
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
        >
            <div className="flex flex-col gap-5 border-b border-white/10 p-7 md:flex-row md:items-start md:justify-between md:p-9">
                <div className="flex gap-5">
                    <span className="pt-1 text-xs tracking-[0.2em] text-white/25">
                        {section.number}
                    </span>

                    <div>
                        <h3 className="text-2xl font-light text-white/90 md:text-3xl">
                            {section.title}
                        </h3>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
                            {section.description}
                        </p>
                    </div>
                </div>

                <a
                    href={section.href}
                    className="no-print w-fit shrink-0 rounded-full border border-white/10 px-5 py-3 text-xs text-white/50 transition hover:border-white/30 hover:text-white"
                >
                    View Section →
                </a>
            </div>

            <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                {section.fields.map(([label, value], index) => (
                    <Detail
                        key={`${section.number}-${label}-${index}`}
                        label={label}
                        value={value}
                    />
                ))}
            </div>

            {section.records?.length > 0 && (
                <div className="border-t border-white/10 p-7 md:p-9">
                    <p className="mb-5 text-xs tracking-[0.2em] text-white/30">
                        PERMIT DETAILS
                    </p>

                    <div className="space-y-3">
                        {section.records.map((record, index) => (
                            <div
                                key={record.id || index}
                                className="rounded-xl border border-white/10 bg-black/20 p-5"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-base text-white/80">
                                            {record.permitType ||
                                                record.type ||
                                                "Permit"}
                                        </p>
                                        <p className="mt-2 text-sm text-white/40">
                                            {record.description ||
                                                record.details ||
                                                "Description not available"}
                                        </p>
                                    </div>

                                    <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                                        {record.status || "Not available"}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Detail
                                        label="Permit Number"
                                        value={
                                            record.permitNumber ||
                                            record.permitNo ||
                                            record.id
                                        }
                                    />
                                    <Detail
                                        label="Issued Date"
                                        value={formatDate(
                                            record.issuedDate ||
                                            record.issueDate
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================================================
   VALUE HELPERS
========================================================= */

function displayValue(value) {
    if (value === null || value === undefined || value === "") {
        return "Not available";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    return String(value);
}

function formatBoolean(value) {
    if (value === true) return "Yes";
    if (value === false) return "No";
    return null;
}

function formatDate(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) return String(value);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
}