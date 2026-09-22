"use client";

import { useEffect, useState } from "react";

const BASE_URL = "/api";

const DEMO_PROPERTY = {
    formattedAddress:
        "1428 Magnolia Ridge Drive, Austin, TX 78704, USA",
    originalAddress:
        "1428 Magnolia Ridge Drive, Austin, TX 78704, USA",
    city: "Austin",
    state: "Texas",
    postalCode: "78704",
    country: "USA",
    latitude: 30.267153,
    longitude: -97.743057,
    propertyId: "DEMO-PROP-001",
};

const DEMO_PERMITS = [
    {
        permitNumber: "BP-2025-1234",
        permitType: "Building",
        description: "Residential renovation",
        issueDate: "10-Feb-2025",
        status: "Completed",
    },
    {
        permitNumber: "EP-2024-0842",
        permitType: "Electrical",
        description: "Electrical system modification",
        issueDate: "18-Nov-2024",
        status: "Completed",
    },
    {
        permitNumber: "PP-2024-0519",
        permitType: "Plumbing",
        description: "Plumbing alteration",
        issueDate: "03-Aug-2024",
        status: "Completed",
    },
];

const DEMO_ENVIRONMENTAL_RECORDS = [
    {
        category: "Flood Risk",
        value: "Moderate",
        status: "Review",
    },
    {
        category: "Contamination",
        value: "No records found",
        status: "Clear",
    },
    {
        category: "Pollution Events",
        value: "None found",
        status: "Clear",
    },
    {
        category: "Nearby Environmental Sites",
        value: "2 sites identified",
        status: "Review",
    },
];

export default function PermitEnvironmentalPage() {
    const [property, setProperty] = useState(DEMO_PROPERTY);

    const [permitRecords, setPermitRecords] =
        useState(DEMO_PERMITS);

    const [environmentalRecords, setEnvironmentalRecords] =
        useState(DEMO_ENVIRONMENTAL_RECORDS);

    const [permitLoading, setPermitLoading] = useState(false);

    const [environmentalLoading, setEnvironmentalLoading] =
        useState(false);

    const [permitError, setPermitError] = useState("");

    const [environmentalError, setEnvironmentalError] =
        useState("");

    const [usingDemoData, setUsingDemoData] = useState(true);

    /*
     * Load the property selected from Property Search.
     *
     * If no property has been selected, the page continues
     * displaying the demo property so the UI remains complete.
     */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const savedProperty =
            sessionStorage.getItem("selectedProperty");

        if (!savedProperty) {
            return;
        }

        try {
            const parsedProperty = JSON.parse(savedProperty);

            if (parsedProperty) {
                setProperty(parsedProperty);
                setUsingDemoData(false);
            }
        } catch (error) {
            console.error(
                "Unable to load selected property:",
                error
            );
        }
    }, []);

    /*
     * Retrieve actual permit and environmental records
     * when a property from Property Search is available.
     */
    useEffect(() => {
        if (!property || usingDemoData) return;

        loadPermitRecords();
        loadEnvironmentalRecords();
    }, [property, usingDemoData]);

    async function loadPermitRecords() {
        if (!property) return;

        setPermitLoading(true);
        setPermitError("");

        try {
            const token = localStorage.getItem("token");

            const address =
                property.formattedAddress ||
                property.originalAddress ||
                "";

            const response = await fetch(
                `${BASE_URL}/permits?address=${encodeURIComponent(
                    address
                )}`,
                {
                    method: "GET",
                    headers: {
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.error?.message ||
                    data?.message ||
                    `Permit request failed (${response.status})`
                );
            }

            const records =
                data?.data ||
                data?.records ||
                data ||
                [];

            setPermitRecords(
                Array.isArray(records) ? records : [records]
            );
        } catch (error) {
            console.error("Permit records error:", error);

            setPermitError(
                error.message ||
                "Unable to retrieve permit records."
            );
        } finally {
            setPermitLoading(false);
        }
    }

    async function loadEnvironmentalRecords() {
        if (!property) return;

        setEnvironmentalLoading(true);
        setEnvironmentalError("");

        try {
            const token = localStorage.getItem("token");

            const address =
                property.formattedAddress ||
                property.originalAddress ||
                "";

            const response = await fetch(
                `${BASE_URL}/environmental-records?address=${encodeURIComponent(
                    address
                )}`,
                {
                    method: "GET",
                    headers: {
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.error?.message ||
                    data?.message ||
                    `Environmental request failed (${response.status})`
                );
            }

            const records =
                data?.data ||
                data?.records ||
                data ||
                [];

            setEnvironmentalRecords(
                Array.isArray(records) ? records : [records]
            );
        } catch (error) {
            console.error(
                "Environmental records error:",
                error
            );

            setEnvironmentalError(
                error.message ||
                "Unable to retrieve environmental records."
            );
        } finally {
            setEnvironmentalLoading(false);
        }
    }

    const hasProperty = Boolean(property);

    return (
        <main className="min-h-screen bg-[#0b0b0b] text-white">
            {/* =====================================================
          BACKGROUND
      ====================================================== */}

            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[-200px] top-[5%] h-[550px] w-[550px] rounded-full bg-orange-500/[0.06] blur-[150px]" />

                <div className="absolute right-[-200px] top-[35%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />
            </div>

            {/* =====================================================
          HEADER
      ====================================================== */}

            <section className="border-b border-white/10 px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-7 text-xs font-semibold tracking-[0.35em] text-white/35">
                        PERMIT & ENVIRONMENTAL RECORDS
                    </p>

                    <h1 className="max-w-6xl text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.05em]">
                        Review the
                        <br />
                        <span className="text-white/35">
                            property records.
                        </span>
                    </h1>

                    <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/45 md:text-xl">
                        Review available permit and environmental
                        information and combine it with the findings
                        collected during the earlier due-diligence stages.
                    </p>
                </div>
            </section>

            {/* =====================================================
          SELECTED PROPERTY
      ====================================================== */}

            <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                            SELECTED PROPERTY
                        </p>

                        {usingDemoData && (
                            <span className="rounded-full border border-yellow-400/20 px-4 py-2 text-xs text-yellow-400/60">
                                Demo Preview
                            </span>
                        )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 backdrop-blur-xl md:p-9">
                        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    PROPERTY ADDRESS
                                </p>

                                <h2 className="mt-4 max-w-4xl text-2xl font-light leading-8 text-white/90 md:text-4xl">
                                    {property.formattedAddress}
                                </h2>

                                {usingDemoData && (
                                    <p className="mt-4 text-xs text-white/25">
                                        Sample property used for platform preview
                                    </p>
                                )}
                            </div>

                            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 px-4 py-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                                <span className="text-xs text-emerald-400/70">
                                    Property Selected
                                </span>
                            </div>
                        </div>

                        <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                            <DetailCard
                                label="City"
                                value={property.city}
                            />

                            <DetailCard
                                label="State"
                                value={property.state}
                            />

                            <DetailCard
                                label="Postal Code"
                                value={property.postalCode}
                            />

                            <DetailCard
                                label="Country"
                                value={property.country}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================
          PERMIT RECORDS
      ====================================================== */}

            <section
                id="permit-records"
                className="px-6 pb-24 sm:px-10 md:px-16 lg:px-24"
            >
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                                01 / PERMIT RECORDS
                            </p>

                            <h2 className="mt-4 text-4xl font-light tracking-tight md:text-5xl">
                                Building & Construction
                            </h2>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/40">
                                Review building, electrical, plumbing,
                                renovation, and construction permit activity
                                associated with the property.
                            </p>
                        </div>

                        <div className="rounded-full border border-white/10 px-5 py-3 text-xs text-white/40">
                            {usingDemoData
                                ? "3 Sample Records"
                                : permitLoading
                                    ? "Retrieving..."
                                    : `${permitRecords.length} Records`}
                        </div>
                    </div>

                    {usingDemoData && (
                        <div className="mb-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
                            <span className="h-2 w-2 rounded-full bg-yellow-400" />

                            <p className="text-xs text-white/35">
                                Sample permit records shown for demonstration.
                                Actual records will be retrieved when a property
                                is selected from Property Search.
                            </p>
                        </div>
                    )}

                    {permitLoading && (
                        <LoadingBox text="Retrieving permit records..." />
                    )}

                    {permitError && (
                        <ErrorBox message={permitError} />
                    )}

                    {!permitLoading &&
                        !permitError &&
                        permitRecords.length > 0 && (
                            <PermitTable records={permitRecords} />
                        )}

                    {!permitLoading &&
                        !permitError &&
                        permitRecords.length === 0 && (
                            <EmptyBox text="No permit records were found for this property." />
                        )}
                </div>
            </section>

            {/* =====================================================
          ENVIRONMENTAL RECORDS
      ====================================================== */}

            <section
                id="environmental-records"
                className="px-6 pb-24 sm:px-10 md:px-16 lg:px-24"
            >
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                                02 / ENVIRONMENTAL RECORDS
                            </p>

                            <h2 className="mt-4 text-4xl font-light tracking-tight md:text-5xl">
                                Environmental Review
                            </h2>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/40">
                                Review flood information, contamination
                                records, pollution events, nearby sites, and
                                other available environmental findings.
                            </p>
                        </div>

                        <div className="rounded-full border border-white/10 px-5 py-3 text-xs text-white/40">
                            {usingDemoData
                                ? "4 Sample Checks"
                                : environmentalLoading
                                    ? "Retrieving..."
                                    : `${environmentalRecords.length} Checks`}
                        </div>
                    </div>

                    {usingDemoData && (
                        <div className="mb-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
                            <span className="h-2 w-2 rounded-full bg-yellow-400" />

                            <p className="text-xs text-white/35">
                                Sample environmental information shown for
                                demonstration. Actual results will be retrieved
                                for the selected property.
                            </p>
                        </div>
                    )}

                    {environmentalLoading && (
                        <LoadingBox text="Retrieving environmental records..." />
                    )}

                    {environmentalError && (
                        <ErrorBox message={environmentalError} />
                    )}

                    {!environmentalLoading &&
                        !environmentalError &&
                        environmentalRecords.length > 0 && (
                            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
                                {environmentalRecords.map(
                                    (record, index) => (
                                        <EnvironmentalCard
                                            key={index}
                                            record={record}
                                        />
                                    )
                                )}
                            </div>
                        )}

                    {!environmentalLoading &&
                        !environmentalError &&
                        environmentalRecords.length === 0 && (
                            <EmptyBox text="No environmental records were found for this property." />
                        )}
                </div>
            </section>

            {/* =====================================================
          DUE DILIGENCE SUMMARY
      ====================================================== */}

            <section className="px-6 pb-24 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-8">
                        <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                            DUE DILIGENCE SUMMARY
                        </p>

                        <h2 className="mt-4 text-4xl font-light tracking-tight md:text-5xl">
                            Everything collected so far.
                        </h2>

                        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/40">
                            Review the information collected across each
                            property due-diligence stage before deciding
                            whether you want to proceed with the property.
                        </p>
                    </div>

                    <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2">
                        <SummaryCard
                            number="01"
                            title="Property Search"
                            description="Property address and location information."
                            status="Completed"
                            href="/property-search"
                        />

                        <SummaryCard
                            number="02"
                            title="Ownership Records"
                            description="Ownership and land registry information."
                            status="Reviewed"
                            href="/ownership"
                        />

                        <SummaryCard
                            number="03"
                            title="Property Tax History"
                            description="Available property tax history and records."
                            status="Reviewed"
                            href="/tax-history"
                        />

                        <SummaryCard
                            number="04"
                            title="Zoning Information"
                            description="Property zoning and land-use information."
                            status="Reviewed"
                            href="/zoning"
                        />

                        <SummaryCard
                            number="05"
                            title="Flood Zone Verification"
                            description="Flood-zone and related property risk information."
                            status="Reviewed"
                            href="/flood-zone"
                        />

                        <SummaryCard
                            number="06"
                            title="Permit Records"
                            description="Building and construction permit information."
                            status={
                                usingDemoData
                                    ? "Records Available"
                                    : permitLoading
                                        ? "Loading"
                                        : permitRecords.length > 0
                                            ? "Records Available"
                                            : "No Records"
                            }
                            href="#permit-records"
                        />

                        <SummaryCard
                            number="07"
                            title="Environmental Records"
                            description="Environmental findings and nearby site information."
                            status={
                                usingDemoData
                                    ? "Records Available"
                                    : environmentalLoading
                                        ? "Loading"
                                        : environmentalRecords.length > 0
                                            ? "Records Available"
                                            : "No Records"
                            }
                            href="#environmental-records"
                        />
                    </div>
                </div>
            </section>

            {/* =====================================================
          FINAL REVIEW
      ====================================================== */}

            <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 lg:p-14">
                        <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
                            FINAL REVIEW
                        </p>

                        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h2 className="text-4xl font-light tracking-tight md:text-5xl">
                                    Make your decision.
                                </h2>

                                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/40">
                                    The platform presents the information
                                    collected during the due-diligence process.
                                    Review the available findings and decide how
                                    you want to proceed with the property.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 px-8 py-7 text-center">
                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    PROPERTY STATUS
                                </p>

                                <p className="mt-4 text-2xl font-light text-white/80">
                                    Ready for Review
                                </p>

                                <p className="mt-2 text-xs text-white/30">
                                    Information available
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <a
                                href="/due-diligence-report"
                                className="inline-flex items-center justify-center gap-4 rounded-full border border-white/20 px-9 py-5 text-sm font-medium transition duration-300 hover:bg-white hover:text-black"
                            >
                                Review Due Diligence Report

                                <span className="text-xl">
                                    →
                                </span>
                            </a>

                            <a
                                href="/flood-zone"
                                className="inline-flex items-center justify-center gap-4 rounded-full border border-white/10 px-9 py-5 text-sm text-white/50 transition duration-300 hover:border-white/20 hover:bg-white/[0.03] hover:text-white"
                            >
                                Previous Stage

                                <span className="text-xl">
                                    ←
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================
          FOOTER
      ====================================================== */}

            <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">
                    <span>PROP DUE</span>

                    <span>
                        PROPERTY DUE DILIGENCE PLATFORM
                    </span>
                </div>
            </footer>
        </main>
    );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({ label, value }) {
    return (
        <div className="bg-[#101010] p-6">
            <p className="text-xs tracking-[0.2em] text-white/25">
                {label}
            </p>

            <p className="mt-4 break-words text-base font-medium text-white/80">
                {value || "Not available"}
            </p>
        </div>
    );
}

/* =========================================================
   PERMIT TABLE
========================================================= */

function PermitTable({ records }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="hidden grid-cols-5 border-b border-white/10 bg-white/[0.025] px-6 py-4 text-xs tracking-[0.2em] text-white/25 md:grid">
                <span>PERMIT NUMBER</span>

                <span>TYPE</span>

                <span>DESCRIPTION</span>

                <span>ISSUE DATE</span>

                <span>STATUS</span>
            </div>

            {records.map((record, index) => (
                <PermitRow
                    key={`${record.permitNumber || "permit"}-${index}`}
                    record={record}
                />
            ))}
        </div>
    );
}

/* =========================================================
   PERMIT ROW
========================================================= */

function PermitRow({ record }) {
    const permitNumber =
        record?.permitNumber ||
        record?.permitNo ||
        record?.number ||
        record?.id ||
        "Not available";

    const permitType =
        record?.permitType ||
        record?.type ||
        "Permit";

    const description =
        record?.description ||
        record?.details ||
        "No description available";

    const issueDate =
        record?.issueDate ||
        record?.date ||
        "Not available";

    const status =
        record?.status ||
        "Available";

    return (
        <div className="grid gap-5 border-b border-white/10 px-6 py-7 last:border-b-0 md:grid-cols-5 md:items-center">
            <div>
                <p className="text-xs tracking-[0.15em] text-white/25 md:hidden">
                    PERMIT NUMBER
                </p>

                <p className="mt-2 text-sm font-medium text-white/80 md:mt-0">
                    {permitNumber}
                </p>
            </div>

            <div>
                <p className="text-xs tracking-[0.15em] text-white/25 md:hidden">
                    TYPE
                </p>

                <p className="mt-2 text-sm text-white/60 md:mt-0">
                    {permitType}
                </p>
            </div>

            <div>
                <p className="text-xs tracking-[0.15em] text-white/25 md:hidden">
                    DESCRIPTION
                </p>

                <p className="mt-2 text-sm text-white/50 md:mt-0">
                    {description}
                </p>
            </div>

            <div>
                <p className="text-xs tracking-[0.15em] text-white/25 md:hidden">
                    ISSUE DATE
                </p>

                <p className="mt-2 text-sm text-white/50 md:mt-0">
                    {issueDate}
                </p>
            </div>

            <div>
                <p className="text-xs tracking-[0.15em] text-white/25 md:hidden">
                    STATUS
                </p>

                <span className="mt-2 inline-flex rounded-full border border-emerald-400/20 px-3 py-1 text-xs text-emerald-400/70 md:mt-0">
                    {status}
                </span>
            </div>
        </div>
    );
}

/* =========================================================
   ENVIRONMENTAL CARD
========================================================= */

function EnvironmentalCard({ record }) {
    const category =
        record?.category ||
        record?.type ||
        record?.name ||
        "Environmental Check";

    const value =
        record?.value ||
        record?.description ||
        record?.details ||
        "Not available";

    const status =
        record?.status ||
        "Available";

    const review =
        status.toLowerCase() === "review" ||
        status.toLowerCase() === "moderate";

    return (
        <div className="bg-[#101010] p-7 md:p-9">
            <div className="flex items-start justify-between gap-5">
                <div>
                    <p className="text-xs tracking-[0.2em] text-white/25">
                        {category}
                    </p>

                    <p className="mt-5 text-xl font-light text-white/80">
                        {value}
                    </p>
                </div>

                <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs ${review
                            ? "border-yellow-400/20 text-yellow-400/70"
                            : "border-emerald-400/20 text-emerald-400/70"
                        }`}
                >
                    {status}
                </span>
            </div>
        </div>
    );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
    number,
    title,
    description,
    status,
    href,
}) {
    return (
        <a
            href={href}
            className="group bg-[#101010] p-7 transition duration-300 hover:bg-white/[0.04] md:p-9"
        >
            <div className="flex items-start justify-between gap-6">
                <div className="flex gap-6">
                    <span className="text-xs tracking-[0.2em] text-white/20">
                        {number}
                    </span>

                    <div>
                        <h3 className="text-xl font-light text-white/80 transition group-hover:text-white">
                            {title}
                        </h3>

                        <p className="mt-3 max-w-md text-sm leading-6 text-white/35">
                            {description}
                        </p>
                    </div>
                </div>

                <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
                    {status}
                </span>
            </div>

            <div className="mt-7 flex items-center justify-end text-sm text-white/20 transition group-hover:text-white/70">
                Review

                <span className="ml-2 text-lg">
                    →
                </span>
            </div>
        </a>
    );
}

/* =========================================================
   LOADING BOX
========================================================= */

function LoadingBox({ text }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="flex items-center gap-4">
                <span className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />

                <p className="text-sm text-white/50">
                    {text}
                </p>
            </div>
        </div>
    );
}

/* =========================================================
   ERROR BOX
========================================================= */

function ErrorBox({ message }) {
    return (
        <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.04] p-7">
            <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-400/40 text-xs text-red-400">
                    !
                </span>

                <p className="text-sm leading-6 text-red-300/80">
                    {message}
                </p>
            </div>
        </div>
    );
}

/* =========================================================
   EMPTY BOX
========================================================= */

function EmptyBox({ text }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <p className="text-sm text-white/40">
                {text}
            </p>
        </div>
    );
}