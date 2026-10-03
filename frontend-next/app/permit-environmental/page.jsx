"use client";

import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:8080/api";

export default function PermitEnvironmentalPage() {
    const [property, setProperty] = useState(null);

    const [permitRecords, setPermitRecords] = useState([]);
    const [environmentalRecords, setEnvironmentalRecords] = useState([]);

    const [permitLoading, setPermitLoading] = useState(false);
    const [environmentalLoading, setEnvironmentalLoading] = useState(false);

    const [permitError, setPermitError] = useState("");
    const [environmentalError, setEnvironmentalError] = useState("");

    /* =========================================================
       LOAD SELECTED PROPERTY
    ========================================================= */

    useEffect(() => {
        if (typeof window === "undefined") return;

        const savedProperty =
            sessionStorage.getItem("selectedProperty");

        if (!savedProperty) return;

        try {
            const parsedProperty = JSON.parse(savedProperty);

            if (parsedProperty) {
                setProperty(parsedProperty);
            }
        } catch (error) {
            console.error(
                "Unable to load selected property:",
                error
            );
        }
    }, []);

    /* =========================================================
       PROPERTY ID
    ========================================================= */

    const propertyId =
        property?.propertyDbId ??
        property?.id ??
        (property?.propertyId != null &&
            /^\d+$/.test(String(property.propertyId))
            ? property.propertyId
            : null);

    /* =========================================================
       LOAD BACKEND DATA
    ========================================================= */

    useEffect(() => {
        if (!propertyId) return;

        let cancelled = false;

        async function loadPropertyRecords() {
            setPermitLoading(true);
            setEnvironmentalLoading(true);

            setPermitError("");
            setEnvironmentalError("");

            try {
                const token =
                    localStorage.getItem("token");

                const response = await fetch(
                    `${BASE_URL}/properties/${propertyId}`,
                    {
                        method: "GET",
                        headers: {
                            ...(token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`,
                                }
                                : {}),
                        },
                    }
                );

                const data =
                    await response.json().catch(
                        () => null
                    );

                if (!response.ok) {
                    throw new Error(
                        data?.error?.message ||
                        data?.message ||
                        `Backend request failed (HTTP ${response.status})`
                    );
                }

                const backendProperty =
                    data?.data || data;

                if (cancelled) return;

                /* =====================================================
                   PROPERTY INFORMATION

                   Only save actual backend values.
                   Never replace missing values with N/A.
                ===================================================== */

                setProperty((previous) => ({
                    ...previous,
                    ...backendProperty,

                    formattedAddress:
                        backendProperty.formattedAddress ||
                        backendProperty.address ||
                        previous?.formattedAddress ||
                        previous?.address ||
                        "",

                    city:
                        backendProperty.city ||
                        previous?.city ||
                        "",

                    state:
                        backendProperty.state ||
                        previous?.state ||
                        "",

                    postalCode:
                        backendProperty.postalCode ||
                        backendProperty.zipCode ||
                        previous?.postalCode ||
                        "",

                    country:
                        backendProperty.country ||
                        previous?.country ||
                        "",
                }));

                /* =====================================================
                   PERMIT RECORDS
                ===================================================== */

                const backendPermits =
                    Array.isArray(
                        backendProperty.permits
                    )
                        ? backendProperty.permits
                        : [];

                const cleanedPermits =
                    backendPermits
                        .map((permit) => ({
                            permitNumber:
                                firstValid(
                                    permit?.permitNumber,
                                    permit?.permitNo,
                                    permit?.number,
                                    permit?.id
                                ),

                            permitType:
                                firstValid(
                                    permit?.permitType,
                                    permit?.type
                                ),

                            description:
                                firstValid(
                                    permit?.description,
                                    permit?.details
                                ),

                            issueDate:
                                formatDate(
                                    firstValid(
                                        permit?.issueDate,
                                        permit?.issuedDate,
                                        permit?.date
                                    )
                                ),

                            status:
                                firstValid(
                                    permit?.status
                                ),
                        }))
                        .map(removeEmptyFields)
                        .filter(
                            (permit) =>
                                Object.keys(permit).length >
                                0
                        );

                setPermitRecords(cleanedPermits);

                /* =====================================================
                   ENVIRONMENTAL RECORDS
                ===================================================== */

                const backendEnvironmental =
                    backendProperty.environmental ||
                    {};

                const backendFloodZone =
                    backendProperty.floodZone ||
                    {};

                const records = [];

                /* -------------------------
                   FLOOD RISK
                ------------------------- */

                const floodRisk =
                    backendFloodZone.riskLevel;

                if (hasValue(floodRisk)) {
                    records.push({
                        category: "Flood Risk",
                        value: String(floodRisk),
                        status:
                            getRiskStatus(floodRisk),
                    });
                }

                /* -------------------------
                   CONTAMINATION
                ------------------------- */

                const hazardFound =
                    backendEnvironmental.hazardFound;

                const hazardType =
                    backendEnvironmental.hazardType;

                const assessmentDate =
                    backendEnvironmental.assessmentDate;

                if (
                    hazardFound === true ||
                    hazardFound === false
                ) {
                    let contaminationValue = "";

                    if (hazardFound === true) {
                        contaminationValue =
                            firstValid(
                                hazardType,
                                "Environmental hazard detected"
                            );
                    } else {
                        contaminationValue =
                            "No hazard found";
                    }

                    if (hasValue(assessmentDate)) {
                        contaminationValue +=
                            ` (Assessment: ${formatDate(
                                assessmentDate
                            )})`;
                    }

                    records.push({
                        category: "Contamination",
                        value: contaminationValue,
                        status:
                            hazardFound === true
                                ? "Review"
                                : "Clear",
                    });
                }

                /* -------------------------
                   POLLUTION EVENTS

                   Only display if backend
                   actually provides them.
                ------------------------- */

                const pollutionEvents =
                    backendEnvironmental.pollutionEvents;

                if (
                    Array.isArray(pollutionEvents) &&
                    pollutionEvents.length > 0
                ) {
                    records.push({
                        category:
                            "Pollution Events",
                        value: `${pollutionEvents.length} event${pollutionEvents.length === 1
                                ? ""
                                : "s"
                            }`,
                        status: "Review",
                    });
                }

                /* -------------------------
                   NEARBY ENVIRONMENTAL SITES

                   Only display if backend
                   actually provides them.
                ------------------------- */

                const nearbySites =
                    backendEnvironmental.nearbySites;

                if (
                    Array.isArray(nearbySites) &&
                    nearbySites.length > 0
                ) {
                    records.push({
                        category:
                            "Nearby Environmental Sites",
                        value: `${nearbySites.length} site${nearbySites.length === 1
                                ? ""
                                : "s"
                            }`,
                        status: "Review",
                    });
                }

                setEnvironmentalRecords(records);
            } catch (error) {
                if (cancelled) return;

                console.error(
                    "Property records error:",
                    error
                );

                setPermitRecords([]);
                setEnvironmentalRecords([]);

                setPermitError(
                    error.message ||
                    "Unable to retrieve permit records."
                );

                setEnvironmentalError(
                    error.message ||
                    "Unable to retrieve environmental records."
                );
            } finally {
                if (!cancelled) {
                    setPermitLoading(false);
                    setEnvironmentalLoading(false);
                }
            }
        }

        loadPropertyRecords();

        return () => {
            cancelled = true;
        };
    }, [propertyId]);

    /* =========================================================
       RENDER
    ========================================================= */

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
                        Review available permit and
                        environmental information and
                        combine it with the findings
                        collected during the earlier
                        due-diligence stages.
                    </p>

                </div>
            </section>

            {/* SELECTED PROPERTY */}

            {property && (
                <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">

                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                                SELECTED PROPERTY
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 backdrop-blur-xl md:p-9">

                            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

                                <div>
                                    <p className="text-xs tracking-[0.25em] text-white/25">
                                        PROPERTY ADDRESS
                                    </p>

                                    {hasValue(
                                        property?.formattedAddress ||
                                        property?.address
                                    ) && (
                                            <h2 className="mt-4 max-w-4xl text-2xl font-light leading-8 text-white/90 md:text-4xl">
                                                {
                                                    property?.formattedAddress ||
                                                    property?.address
                                                }
                                            </h2>
                                        )}
                                </div>

                                <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2">

                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                                    <span className="text-xs text-white/50">
                                        Property Selected
                                    </span>

                                </div>

                            </div>

                            {/* ONLY SHOW REAL DATA */}

                            {[
                                {
                                    label: "City",
                                    value: property?.city,
                                },
                                {
                                    label: "State",
                                    value: property?.state,
                                },
                                {
                                    label: "Postal Code",
                                    value:
                                        property?.postalCode ||
                                        property?.zipCode,
                                },
                                {
                                    label: "Country",
                                    value: property?.country,
                                },
                            ].some((item) =>
                                hasValue(item.value)
                            ) && (
                                    <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">

                                        {[
                                            {
                                                label: "City",
                                                value:
                                                    property?.city,
                                            },
                                            {
                                                label: "State",
                                                value:
                                                    property?.state,
                                            },
                                            {
                                                label: "Postal Code",
                                                value:
                                                    property?.postalCode ||
                                                    property?.zipCode,
                                            },
                                            {
                                                label: "Country",
                                                value:
                                                    property?.country,
                                            },
                                        ]
                                            .filter((item) =>
                                                hasValue(
                                                    item.value
                                                )
                                            )
                                            .map((item) => (
                                                <DetailCard
                                                    key={item.label}
                                                    label={
                                                        item.label
                                                    }
                                                    value={
                                                        item.value
                                                    }
                                                />
                                            ))}

                                    </div>
                                )}

                        </div>
                    </div>
                </section>
            )}

            {/* PERMIT RECORDS */}

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
                                Review building, electrical,
                                plumbing, renovation, and
                                construction permit activity
                                associated with the property.
                            </p>

                        </div>

                        <div className="rounded-full border border-white/10 px-5 py-3 text-xs text-white/40">
                            {permitLoading
                                ? "Retrieving..."
                                : `${permitRecords.length} Records`}
                        </div>

                    </div>

                    {permitLoading && (
                        <LoadingBox
                            text="Retrieving permit records..."
                        />
                    )}

                    {permitError && (
                        <ErrorBox
                            message={permitError}
                        />
                    )}

                    {!permitLoading &&
                        !permitError &&
                        permitRecords.length > 0 && (
                            <PermitTable
                                records={permitRecords}
                            />
                        )}

                    {!permitLoading &&
                        !permitError &&
                        permitRecords.length === 0 && (
                            <EmptyBox
                                text="No permit records were returned by the backend."
                            />
                        )}

                </div>
            </section>

            {/* ENVIRONMENTAL RECORDS */}

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
                                Review flood information,
                                contamination records,
                                pollution events, nearby
                                sites, and other available
                                environmental findings.
                            </p>

                        </div>

                        <div className="rounded-full border border-white/10 px-5 py-3 text-xs text-white/40">
                            {environmentalLoading
                                ? "Retrieving..."
                                : `${environmentalRecords.length} Checks`}
                        </div>

                    </div>

                    {environmentalLoading && (
                        <LoadingBox
                            text="Retrieving environmental records..."
                        />
                    )}

                    {environmentalError && (
                        <ErrorBox
                            message={environmentalError}
                        />
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
                            <EmptyBox
                                text="No environmental records were returned by the backend."
                            />
                        )}

                </div>
            </section>

            {/* DUE DILIGENCE SUMMARY */}

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
                            Review the information
                            collected across each property
                            due-diligence stage before
                            deciding whether you want to
                            proceed with the property.
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
                                permitLoading
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
                                environmentalLoading
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

            {/* FINAL REVIEW */}

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
                                    The platform presents
                                    the information collected
                                    during the due-diligence
                                    process. Review the
                                    available findings and
                                    decide how you want to
                                    proceed with the property.
                                </p>

                            </div>

                            {property && (
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
                            )}

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

            {/* FOOTER */}

            <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">

                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">

                    <span>
                        PROP DUE
                    </span>

                    <span>
                        PROPERTY DUE DILIGENCE PLATFORM
                    </span>

                </div>

            </footer>

        </main>
    );
}

/* =========================================================
   HELPERS
========================================================= */

function hasValue(value) {
    if (value === null || value === undefined) {
        return false;
    }

    const text = String(value).trim();

    if (!text) return false;

    const invalidValues = [
        "n/a",
        "na",
        "not available",
        "not provided",
        "null",
        "undefined",
        "-"
    ];

    return !invalidValues.includes(
        text.toLowerCase()
    );
}

function firstValid(...values) {
    for (const value of values) {
        if (hasValue(value)) {
            return value;
        }
    }

    return null;
}

function removeEmptyFields(record) {
    const cleaned = {};

    Object.entries(record).forEach(
        ([key, value]) => {
            if (hasValue(value)) {
                cleaned[key] = value;
            }
        }
    );

    return cleaned;
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {
    if (!hasValue(value)) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

/* =========================================================
   RISK STATUS
========================================================= */

function getRiskStatus(riskLevel) {
    const risk =
        String(riskLevel).toLowerCase();

    if (risk === "low") {
        return "Low";
    }

    if (
        risk === "medium" ||
        risk === "moderate"
    ) {
        return "Review";
    }

    if (
        risk === "high" ||
        risk === "very high"
    ) {
        return "Review";
    }

    return "Review";
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
    label,
    value,
}) {
    if (!hasValue(value)) {
        return null;
    }

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

/* =========================================================
   PERMIT TABLE
========================================================= */

function PermitTable({
    records,
}) {
    const columns = [
        {
            key: "permitNumber",
            label: "PERMIT NUMBER",
        },
        {
            key: "permitType",
            label: "TYPE",
        },
        {
            key: "description",
            label: "DESCRIPTION",
        },
        {
            key: "issueDate",
            label: "ISSUE DATE",
        },
        {
            key: "status",
            label: "STATUS",
        },
    ];

    const availableColumns =
        columns.filter((column) =>
            records.some((record) =>
                hasValue(
                    record?.[column.key]
                )
            )
        );

    if (availableColumns.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10">

            <div
                className="hidden border-b border-white/10 bg-white/[0.025] px-6 py-4 text-xs tracking-[0.2em] text-white/25 md:grid"
                style={{
                    gridTemplateColumns:
                        `repeat(${availableColumns.length}, minmax(0, 1fr))`,
                }}
            >
                {availableColumns.map(
                    (column) => (
                        <span key={column.key}>
                            {column.label}
                        </span>
                    )
                )}
            </div>

            {records.map(
                (record, index) => (
                    <PermitRow
                        key={`${record.permitNumber || "permit"}-${index}`}
                        record={record}
                        columns={
                            availableColumns
                        }
                    />
                )
            )}

        </div>
    );
}

/* =========================================================
   PERMIT ROW
========================================================= */

function PermitRow({
    record,
    columns,
}) {
    return (
        <div
            className="grid gap-5 border-b border-white/10 px-6 py-7 last:border-b-0 md:items-center"
            style={{
                gridTemplateColumns:
                    `repeat(${columns.length}, minmax(0, 1fr))`,
            }}
        >
            {columns.map(
                (column) => {
                    const value =
                        record?.[
                        column.key
                        ];

                    if (!hasValue(value)) {
                        return (
                            <div
                                key={
                                    column.key
                                }
                                className="hidden md:block"
                            />
                        );
                    }

                    return (
                        <div
                            key={
                                column.key
                            }
                        >

                            <p className="text-xs tracking-[0.15em] text-white/25 md:hidden">
                                {
                                    column.label
                                }
                            </p>

                            {column.key ===
                                "status" ? (
                                <span className="mt-2 inline-flex rounded-full border border-emerald-400/20 px-3 py-1 text-xs text-emerald-400/70 md:mt-0">
                                    {value}
                                </span>
                            ) : (
                                <p className="mt-2 text-sm text-white/60 md:mt-0">
                                    {value}
                                </p>
                            )}

                        </div>
                    );
                }
            )}
        </div>
    );
}

/* =========================================================
   ENVIRONMENTAL CARD
========================================================= */

function EnvironmentalCard({
    record,
}) {
    if (!record) {
        return null;
    }

    const category =
        firstValid(
            record?.category,
            record?.type,
            record?.name
        );

    const value =
        firstValid(
            record?.value,
            record?.description,
            record?.details
        );

    const status =
        firstValid(
            record?.status
        );

    if (
        !hasValue(category) ||
        !hasValue(value)
    ) {
        return null;
    }

    const review =
        String(status || "")
            .toLowerCase() ===
        "review";

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

                {hasValue(status) && (
                    <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs ${review
                                ? "border-yellow-400/20 text-yellow-400/70"
                                : "border-emerald-400/20 text-emerald-400/70"
                            }`}
                    >
                        {status}
                    </span>
                )}

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

function LoadingBox({
    text,
}) {
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

function ErrorBox({
    message,
}) {
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

function EmptyBox({
    text,
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">

            <p className="text-sm text-white/40">
                {text}
            </p>

        </div>
    );
}