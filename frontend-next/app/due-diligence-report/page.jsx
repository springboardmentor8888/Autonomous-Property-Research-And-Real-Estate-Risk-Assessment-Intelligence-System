"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

function getStoredToken() {
    if (typeof window === "undefined") {
        return null;
    }

    const tokenKeys = ["token", "accessToken", "authToken"];

    for (const key of tokenKeys) {
        const token = localStorage.getItem(key);
        if (token && token.trim()) {
            return token.trim();
        }
    }

    for (const key of tokenKeys) {
        const token = sessionStorage.getItem(key);
        if (token && token.trim()) {
            return token.trim();
        }
    }

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);

            if (user?.token) {
                localStorage.setItem("token", user.token);
                return user.token;
            }

            if (user?.accessToken) {
                localStorage.setItem("token", user.accessToken);
                return user.accessToken;
            }
        } catch (error) {
            console.error("Unable to parse stored user:", error);
        }
    }

    return null;
}

/*
 * OWNERSHIP FIELD HELPERS
 *
 * The backend returns ownershipHistory as an array of
 * OwnershipRecord objects. These helpers support the
 * field names returned by the backend.
 */

function getOwnerName(record) {
    return (
        record?.ownerName ??
        record?.owner_name ??
        record?.owner ??
        record?.fullName ??
        record?.full_name ??
        null
    );
}

function getAcquiredDate(record) {
    return (
        record?.acquiredDate ??
        record?.acquisitionDate ??
        record?.acquired_date ??
        record?.acquisition_date ??
        null
    );
}

function getTransferDate(record) {
    return (
        record?.transferDate ??
        record?.transferredDate ??
        record?.transfer_date ??
        record?.transferred_date ??
        null
    );
}

function isAvailable(value) {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === "string") {
        const cleaned = value.trim().toLowerCase();

        if (
            cleaned === "" ||
            cleaned === "not available" ||
            cleaned === "n/a" ||
            cleaned === "na" ||
            cleaned === "null" ||
            cleaned === "undefined"
        ) {
            return false;
        }
    }

    return true;
}

export default function DueDiligenceReportPage() {
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [riskAssessment, setRiskAssessment] = useState(null);
    const [comparables, setComparables] = useState([]);
    const [milestone3Loading, setMilestone3Loading] = useState(false);
    const [milestone3Error, setMilestone3Error] = useState("");
    const [downloading, setDownloading] = useState("");

    /*
     * LOAD PROPERTY REPORT
     */

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
                    selected.propertyId;

                if (!propertyId) {
                    throw new Error(
                        "Property ID is missing. Please select a property again."
                    );
                }

                const token = getStoredToken();

                if (!token) {
                    throw new Error("Please log in first.");
                }

                const response = await fetch(
                    `${API_URL}/properties/${propertyId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                        cache: "no-store",
                    }
                );

                const result = await response
                    .json()
                    .catch(() => null);

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
                    console.error("Property loading error:", err);

                    setError(
                        err?.message ||
                        "Unable to load the report."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadReport();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * LOAD RISK ASSESSMENT AND COMPARABLE PROPERTIES
     */

    useEffect(() => {
        if (!property) {
            return;
        }

        const propertyId =
            property.id ||
            property.propertyDbId ||
            property.propertyId;

        if (propertyId) {
            loadMilestone3(propertyId);
        }
    }, [property]);

    async function loadMilestone3(propertyId) {
        const token = getStoredToken();

        if (!token) {
            setMilestone3Error("Please log in first.");
            return;
        }

        if (!propertyId) {
            setMilestone3Error("Property ID is missing.");
            return;
        }

        setMilestone3Loading(true);
        setMilestone3Error("");

        try {
            const headers = {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            };

            const [riskResponse, comparablesResponse] =
                await Promise.all([
                    fetch(
                        `${API_URL}/properties/${propertyId}/risk-assessment`,
                        {
                            method: "GET",
                            headers,
                            cache: "no-store",
                        }
                    ),

                    fetch(
                        `${API_URL}/properties/${propertyId}/comparables`,
                        {
                            method: "GET",
                            headers,
                            cache: "no-store",
                        }
                    ),
                ]);

            const riskData = await riskResponse
                .json()
                .catch(() => null);

            const comparableData = await comparablesResponse
                .json()
                .catch(() => null);

            if (!riskResponse.ok) {
                throw new Error(
                    riskData?.message ||
                    riskData?.error?.message ||
                    `Risk assessment failed (${riskResponse.status})`
                );
            }

            if (!comparablesResponse.ok) {
                throw new Error(
                    comparableData?.message ||
                    comparableData?.error?.message ||
                    `Comparables failed (${comparablesResponse.status})`
                );
            }

            setRiskAssessment(riskData?.data || riskData);

            setComparables(
                Array.isArray(comparableData)
                    ? comparableData
                    : comparableData?.data || []
            );
        } catch (err) {
            console.error("Milestone 3 error:", err);

            setMilestone3Error(
                err?.message ||
                "Unable to load Milestone 3 data."
            );
        } finally {
            setMilestone3Loading(false);
        }
    }

    /*
     * DOWNLOAD PDF OR EXCEL REPORT
     */

    async function downloadReport(type) {
        console.log("====================================");
        console.log("REPORT BUTTON CLICKED");
        console.log("TYPE:", type);

        const propertyId =
            property?.id ||
            property?.propertyDbId ||
            property?.propertyId;

        console.log("PROPERTY ID:", propertyId);

        if (!propertyId) {
            const message = "Property ID is missing.";
            setMilestone3Error(message);
            console.error(message);
            return;
        }

        if (type !== "pdf" && type !== "excel") {
            const message = "Invalid report type.";
            setMilestone3Error(message);
            console.error(message);
            return;
        }

        let token = getStoredToken();

        console.log("TOKEN EXISTS:", Boolean(token));

        if (!token) {
            const message =
                "Authentication required. Please log in again.";

            setMilestone3Error(message);
            console.error(message);
            return;
        }

        setDownloading(type);
        setMilestone3Error("");

        const endpoint =
            `${API_URL}/properties/${propertyId}/report/${type}`;

        console.log("REQUEST URL:", endpoint);

        try {
            let response = await fetch(endpoint, {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`,

                    Accept:
                        type === "pdf"
                            ? "application/pdf"
                            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },

                cache: "no-store",
            });

            console.log("HTTP STATUS:", response.status);

            /*
             * Retry with the latest token if the server returns 401.
             */

            if (response.status === 401) {
                console.log("401 received. Trying latest token...");

                const latestToken = getStoredToken();

                if (latestToken && latestToken !== token) {
                    token = latestToken;

                    response = await fetch(endpoint, {
                        method: "GET",

                        headers: {
                            Authorization: `Bearer ${token}`,

                            Accept:
                                type === "pdf"
                                    ? "application/pdf"
                                    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        },

                        cache: "no-store",
                    });

                    console.log("RETRY STATUS:", response.status);
                }
            }

            const contentType =
                response.headers.get("content-type") || "";

            console.log("CONTENT TYPE:", contentType);

            if (!response.ok) {
                let message =
                    `Report download failed (HTTP ${response.status})`;

                if (
                    contentType
                        .toLowerCase()
                        .includes("application/json")
                ) {
                    const data = await response
                        .json()
                        .catch(() => null);

                    message =
                        data?.message ||
                        data?.error?.message ||
                        data?.error ||
                        message;
                } else {
                    const responseText = await response
                        .text()
                        .catch(() => "");

                    if (responseText.trim()) {
                        message = responseText.trim().slice(0, 500);
                    }
                }

                if (response.status === 401) {
                    message =
                        "Authentication failed. Please log out and log in again.";
                }

                throw new Error(message);
            }

            const blob = await response.blob();

            console.log("BLOB SIZE:", blob.size);
            console.log("BLOB TYPE:", blob.type);

            if (!blob || blob.size === 0) {
                throw new Error(
                    "The backend returned an empty report file."
                );
            }

            if (
                type === "pdf" &&
                contentType &&
                !contentType
                    .toLowerCase()
                    .includes("application/pdf") &&
                !contentType
                    .toLowerCase()
                    .includes("application/octet-stream")
            ) {
                throw new Error(
                    `The backend did not return a PDF. Received: ${contentType}`
                );
            }

            /*
             * Read the filename from the response when available.
             */

            const disposition =
                response.headers.get("content-disposition") || "";

            let backendFilename = "";

            const utf8Match = disposition.match(
                /filename\*=UTF-8''([^;]+)/i
            );

            const normalMatch = disposition.match(
                /filename=["']?([^;"']+)["']?/i
            );

            if (utf8Match?.[1]) {
                backendFilename =
                    decodeURIComponent(utf8Match[1]);
            } else if (normalMatch?.[1]) {
                backendFilename = normalMatch[1];
            }

            const filename =
                backendFilename ||
                (
                    type === "pdf"
                        ? `property-due-diligence-${propertyId}.pdf`
                        : `property-due-diligence-${propertyId}.xlsx`
                );

            console.log("FILENAME:", filename);

            const blobUrl =
                window.URL.createObjectURL(blob);

            console.log("BLOB URL CREATED");

            const link = document.createElement("a");

            link.href = blobUrl;
            link.download = filename;
            link.rel = "noopener";
            link.target = "_self";

            link.style.position = "fixed";
            link.style.left = "-9999px";
            link.style.top = "0";
            link.style.width = "1px";
            link.style.height = "1px";
            link.style.opacity = "0";
            link.style.pointerEvents = "none";

            document.body.appendChild(link);

            console.log("TRIGGERING DOWNLOAD...");

            link.click();

            /*
             * Delay cleanup so Chrome can start the download.
             */

            setTimeout(() => {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }

                window.URL.revokeObjectURL(blobUrl);

                console.log("DOWNLOAD CLEANUP COMPLETE");
            }, 3000);

            console.log("DOWNLOAD STARTED:", filename);
        } catch (err) {
            console.error("====================================");
            console.error("REPORT DOWNLOAD FAILED");
            console.error(err);
            console.error("====================================");

            setMilestone3Error(
                err?.message ||
                "Unable to download the report."
            );
        } finally {
            setDownloading("");
        }
    }

    /*
     * OWNERSHIP HISTORY
     *
     * The backend DTO returns ownershipHistory (an array).
     * Do not use property.ownership, which is not the field
     * returned by the API.
     */

    const ownershipHistory = Array.isArray(property?.ownershipHistory)
        ? property.ownershipHistory
        : Array.isArray(property?.ownership_history)
            ? property.ownership_history
            : [];

    const sortedOwnershipHistory = [...ownershipHistory].sort((a, b) => {
        const dateA = getAcquiredDate(a) || "";
        const dateB = getAcquiredDate(b) || "";

        return String(dateA).localeCompare(String(dateB));
    });

    /*
     * A record without a transfer date is considered current.
     * If there are several such records, select the most recently
     * acquired one as current owner.
     */

    const currentOwnerCandidates = sortedOwnershipHistory.filter(
        (record) => {
            const transferDate = getTransferDate(record);

            return (
                transferDate === null ||
                transferDate === undefined ||
                transferDate === ""
            );
        }
    );

    const currentOwner =
        currentOwnerCandidates.length > 0
            ? currentOwnerCandidates[
            currentOwnerCandidates.length - 1
            ]
            : sortedOwnershipHistory.length > 0
                ? sortedOwnershipHistory[
                sortedOwnershipHistory.length - 1
                ]
                : null;

    /*
     * IMPORTANT FIX:
     * All ownership records other than the selected current owner
     * are shown as previous owners. A missing transfer date does
     * not exclude a record from the ownership history.
     */

    const previousOwners = currentOwner
        ? sortedOwnershipHistory.filter(
            (record) => record !== currentOwner
        )
        : [];

    const tax = property?.taxHistory;
    const zoning = property?.zoning || {};
    const flood = property?.floodZone || {};
    const environmental = property?.environmental || {};
    const utility = property?.utility || {};

    const taxRecords = Array.isArray(tax)
        ? tax
        : tax
            ? [tax]
            : [];

    const permits = Array.isArray(property?.permits)
        ? property.permits
        : [];

    const riskLevel =
        riskAssessment?.overallRiskLevel || "UNKNOWN";

    const riskConfig = {
        LOW: {
            label: "LOW RISK",
            className:
                "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300",
            scoreClass: "text-emerald-400",
        },

        MEDIUM: {
            label: "MEDIUM RISK",
            className:
                "border-yellow-400/30 bg-yellow-400/[0.08] text-yellow-300",
            scoreClass: "text-yellow-400",
        },

        HIGH: {
            label: "HIGH RISK",
            className:
                "border-red-400/30 bg-red-400/[0.08] text-red-300",
            scoreClass: "text-red-400",
        },

        UNKNOWN: {
            label: "RISK UNAVAILABLE",
            className:
                "border-white/10 bg-white/[0.03] text-white/50",
            scoreClass: "text-white/70",
        },
    };

    const currentRisk =
        riskConfig[riskLevel] || riskConfig.UNKNOWN;

    const sections = [
        {
            number: "01",
            title: "Ownership Records",
            description:
                "Property ownership and acquisition details.",
            href: "/ownership",

            fields: [
                [
                    "Current Owner",
                    getOwnerName(currentOwner),
                ],

                [
                    "Acquired Date",
                    formatDate(getAcquiredDate(currentOwner)),
                ],

                [
                    "Transfer Date",
                    currentOwner
                        ? (
                            getTransferDate(currentOwner)
                                ? formatDate(getTransferDate(currentOwner))
                                : "Current owner"
                        )
                        : null,
                ],

                [
                    "Property ID",
                    property?.id ??
                    property?.propertyDbId ??
                    property?.propertyId,
                ],
            ],

            records: previousOwners,
            recordType: "ownership",
        },

        {
            number: "02",
            title: "Property Tax History",
            description:
                "Tax amounts, years, and payment status.",
            href: "/tax-history",

            fields: taxRecords.length > 0
                ? taxRecords.flatMap((record, index) => [
                    [
                        taxRecords.length > 1
                            ? `Tax Year ${index + 1}`
                            : "Tax Year",
                        record.year,
                    ],

                    [
                        "Amount Paid",
                        formatCurrency(record.amountPaid),
                    ],

                    [
                        "Payment Status",
                        record.status,
                    ],
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
            description:
                "Building, electrical, plumbing, and other permits.",
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
            description:
                "Land-use classification and compliance.",
            href: "/zoning",

            fields: [
                ["Zone Type", zoning.zoneType],

                [
                    "Compliance",
                    formatBoolean(zoning.compliant),
                ],

                ["Property Type", property?.propertyType],
            ],
        },

        {
            number: "05",
            title: "Flood Zone Verification",
            description:
                "Flood-zone classification and risk level.",
            href: "/flood-zone",

            fields: [
                ["Flood Zone", flood.zone],
                ["Risk Level", flood.riskLevel],
            ],
        },

        {
            number: "06",
            title: "Environmental Records",
            description:
                "Environmental hazards and assessment details.",
            href: "/permit-environmental#environmental-records",

            fields: [
                [
                    "Hazard Found",
                    formatBoolean(environmental.hazardFound),
                ],

                ["Hazard Type", environmental.hazardType],

                [
                    "Assessment Date",
                    formatDate(environmental.assessmentDate),
                ],
            ],
        },

        {
            number: "07",
            title: "Utility Information",
            description:
                "Electricity, gas, water, and service provider.",
            href: "#utility-information",

            fields: [
                [
                    "Electricity Connected",
                    formatBoolean(utility.electricityConnected),
                ],

                [
                    "Gas Connected",
                    formatBoolean(utility.gasConnected),
                ],

                [
                    "Water Connected",
                    formatBoolean(utility.waterConnected),
                ],

                ["Provider", utility.provider],
            ],
        },
    ];

    /*
     * LOADING STATE
     */

    if (loading) {
        return (
            <main className="min-h-screen bg-black px-6 py-32 text-white">
                <div className="mx-auto max-w-[1400px]">
                    <p className="text-white/50">
                        Loading property report...
                    </p>
                </div>
            </main>
        );
    }

    /*
     * ERROR STATE
     */

    if (error) {
        return (
            <main className="min-h-screen bg-black px-6 py-32 text-white">
                <div className="mx-auto max-w-[1400px]">
                    <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-8">
                        <p className="text-sm tracking-[0.2em] text-red-300">
                            REPORT ERROR
                        </p>

                        <p className="mt-4 text-white/70">
                            {error}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (!property) {
        return (
            <main className="min-h-screen bg-black px-6 py-32 text-white">
                <div className="mx-auto max-w-[1400px]">
                    <p className="text-white/50">
                        Property information is unavailable.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <>
            <main className="report-print min-h-screen bg-black text-white">
                {/* REPORT HEADER */}

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
                                        Due Diligence
                                        Report.
                                    </span>
                                </h1>

                                <p className="mt-8 max-w-2xl text-base leading-8 text-white/45 md:text-lg">
                                    A consolidated
                                    overview of
                                    ownership, taxes,
                                    permits, zoning,
                                    flood risk,
                                    environmental
                                    findings, and
                                    utility
                                    information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="no-print inline-flex w-fit items-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm text-white/70 transition hover:bg-white hover:text-black"
                            >
                                Print Report

                                <span className="text-lg">
                                    ↗
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* PROPERTY INFORMATION */}

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

                {/* REPORT OVERVIEW */}

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
                                label="Tax Records"
                                value={taxRecords.length}
                                description="Tax history records available"
                            />

                            <OverviewCard
                                label="Permits"
                                value={permits.length}
                                description="Permit records available"
                            />
                        </div>
                    </div>
                </section>

                {/* DUE DILIGENCE SECTIONS */}

                <section className="px-6 pb-20 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
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

                {/* MILESTONE 3 */}

                <section className="px-6 pb-20 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <div className="mb-10">
                            <p className="text-xs tracking-[0.3em] text-white/30">
                                MILESTONE 3
                            </p>

                            <h2 className="mt-5 text-4xl font-light md:text-5xl">
                                Risk, Comparables
                                &amp; Reports
                            </h2>

                            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/40">
                                Actionable risk
                                assessment, nearby
                                comparable
                                properties, and
                                downloadable
                                reports.
                            </p>
                        </div>

                        {milestone3Loading && (
                            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-7 text-white/50">
                                Loading risk
                                assessment and
                                comparable
                                properties...
                            </div>
                        )}

                        {milestone3Error && (
                            <div className="no-print mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-6">
                                <p className="text-xs tracking-[0.2em] text-red-300">
                                    MILESTONE 3 ERROR
                                </p>

                                <p className="mt-3 text-sm leading-6 text-red-200/80">
                                    {milestone3Error}
                                </p>
                            </div>
                        )}

                        {/* RISK ASSESSMENT */}

                        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-7 md:p-9">
                            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-xs tracking-[0.3em] text-white/30">
                                        RISK ASSESSMENT
                                    </p>

                                    <h3 className="mt-5 text-3xl font-light">
                                        Overall Property Risk
                                    </h3>

                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
                                        Backend-generated
                                        risk assessment
                                        based on the
                                        property's
                                        due-diligence
                                        records.
                                    </p>
                                </div>

                                <div
                                    className={`w-fit rounded-2xl border px-7 py-6 ${currentRisk.className}`}
                                >
                                    <p className="text-xs tracking-[0.25em]">
                                        {currentRisk.label}
                                    </p>

                                    <p
                                        className={`mt-3 text-5xl font-light ${currentRisk.scoreClass}`}
                                    >
                                        {riskAssessment?.riskScore ?? "—"}
                                    </p>

                                    <p className="mt-2 text-xs text-white/40">
                                        Risk Score
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
                                <RiskNote
                                    label="TAX RISK"
                                    value={riskAssessment?.taxRiskNote}
                                />

                                <RiskNote
                                    label="FLOOD RISK"
                                    value={riskAssessment?.floodRiskNote}
                                />

                                <RiskNote
                                    label="ZONING RISK"
                                    value={riskAssessment?.zoningRiskNote}
                                />

                                <RiskNote
                                    label="PERMIT RISK"
                                    value={riskAssessment?.permitRiskNote}
                                />

                                <RiskNote
                                    label="ENVIRONMENTAL RISK"
                                    value={riskAssessment?.environmentalRiskNote}
                                />
                            </div>
                        </div>

                        {/* COMPARABLE PROPERTIES */}

                        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-7 md:p-9">
                            <p className="text-xs tracking-[0.3em] text-white/30">
                                COMPARABLE PROPERTIES
                            </p>

                            <h3 className="mt-5 text-3xl font-light">
                                Nearby Comparable Properties
                            </h3>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
                                Comparable property
                                information
                                returned by the
                                backend.
                            </p>

                            {comparables.length > 0 ? (
                                <div className="mt-8 space-y-3">
                                    {comparables.map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            className="rounded-2xl border border-white/10 bg-black/20 p-6"
                                        >
                                            <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-center">
                                                <div>
                                                    <p className="text-xs tracking-[0.15em] text-white/30">
                                                        ADDRESS
                                                    </p>

                                                    <p className="mt-2 text-base text-white/75">
                                                        {item.address}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs tracking-[0.15em] text-white/30">
                                                        PRICE
                                                    </p>

                                                    <p className="mt-2 text-base text-white/75">
                                                        {formatCurrency(item.price)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs tracking-[0.15em] text-white/30">
                                                        DISTANCE
                                                    </p>

                                                    <p className="mt-2 text-base text-white/75">
                                                        {item.distanceKm != null
                                                            ? `${item.distanceKm} km`
                                                            : "Not available"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !milestone3Loading && (
                                    <div className="mt-8 rounded-2xl border border-white/10 p-7 text-sm text-white/40">
                                        No comparable
                                        properties
                                        were returned.
                                    </div>
                                )
                            )}
                        </div>

                        {/* DOWNLOADABLE REPORTS */}

                        <div className="relative z-20 mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-7 md:p-9">
                            <p className="text-xs tracking-[0.3em] text-white/30">
                                DOWNLOADABLE REPORTS
                            </p>

                            <h3 className="mt-5 text-3xl font-light">
                                Export this property report
                            </h3>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
                                Download the complete
                                due-diligence report
                                in PDF or Excel
                                format.
                            </p>

                            <div className="no-print relative z-30 mt-8 flex flex-col gap-4 sm:flex-row">
                                <button
                                    type="button"
                                    disabled={Boolean(downloading)}
                                    onPointerDown={() => {
                                        console.log("PDF BUTTON POINTER DOWN");
                                    }}
                                    onMouseDown={() => {
                                        console.log("PDF BUTTON MOUSE DOWN");
                                    }}
                                    onClick={() => {
                                        console.log("PDF BUTTON ONCLICK");
                                        downloadReport("pdf");
                                    }}
                                    className="relative z-40 inline-flex cursor-pointer items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm text-white/75 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {downloading === "pdf"
                                        ? "Generating PDF..."
                                        : "Download PDF Report"}

                                    <span>↓</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={Boolean(downloading)}
                                    onPointerDown={() => {
                                        console.log("EXCEL BUTTON POINTER DOWN");
                                    }}
                                    onMouseDown={() => {
                                        console.log("EXCEL BUTTON MOUSE DOWN");
                                    }}
                                    onClick={() => {
                                        console.log("EXCEL BUTTON ONCLICK");
                                        downloadReport("excel");
                                    }}
                                    className="relative z-40 inline-flex cursor-pointer items-center justify-center gap-3 rounded-full border border-white/10 px-7 py-4 text-sm text-white/55 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {downloading === "excel"
                                        ? "Generating Excel..."
                                        : "Download Excel Report"}

                                    <span>↓</span>
                                </button>
                            </div>

                            <p className="mt-5 text-xs leading-6 text-white/25">
                                Generating a report may also trigger the
                                confirmation email configured by the backend.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FINAL REVIEW */}

                <section className="px-6 pb-24 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <div className="border-t border-white/10 pt-12">
                            <p className="text-xs tracking-[0.3em] text-white/30">
                                FINAL REVIEW
                            </p>

                            <h2 className="mt-5 text-4xl font-light md:text-5xl">
                                Due diligence complete.
                            </h2>

                            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/40">
                                Review the property
                                records above and
                                download the generated
                                report when ready.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* PRINT STYLES */}

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }

                    html,
                    body {
                        background: #ffffff !important;
                        color: #111111 !important;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .report-print {
                        background: #ffffff !important;
                        color: #111111 !important;
                    }

                    .report-print section {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    .report-print .space-y-5 > div {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    .report-print .bg-white\\/\\[0\\.025\\] {
                        background-color: #ffffff !important;
                    }

                    .report-print .bg-white\\/\\[0\\.02\\] {
                        background-color: #ffffff !important;
                    }

                    .report-print .bg-white\\/10 {
                        background-color: #e5e7eb !important;
                    }

                    .report-print .border-white\\/10,
                    .report-print .border-white\\/20 {
                        border-color: #d1d5db !important;
                    }

                    .report-print .text-white\\/30 {
                        color: #555555 !important;
                    }

                    .report-print .text-white\\/35 {
                        color: #555555 !important;
                    }

                    .report-print .text-white\\/40 {
                        color: #555555 !important;
                    }

                    .report-print .text-white\\/45 {
                        color: #555555 !important;
                    }

                    .report-print .text-white\\/50 {
                        color: #444444 !important;
                    }

                    .report-print .text-white\\/70,
                    .report-print .text-white\\/75,
                    .report-print .text-white\\/80,
                    .report-print .text-white\\/90 {
                        color: #111111 !important;
                    }
                }
            `}</style>
        </>
    );
}

/*
 * RISK NOTE
 */

function RiskNote({ label, value }) {
    return (
        <div className="bg-[#101010] p-7">
            <p className="text-xs tracking-[0.2em] text-white/30">
                {label}
            </p>

            <p className="mt-4 text-sm leading-7 text-white/70">
                {displayValue(value)}
            </p>
        </div>
    );
}

/*
 * DETAIL CARD
 */

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

/*
 * OVERVIEW CARD
 */

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

/*
 * REPORT SECTION
 */

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

            {/* OWNERSHIP HISTORY */}

            {section.recordType === "ownership" && (
                <div className="border-t border-white/10 p-7 md:p-9">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs tracking-[0.2em] text-white/30">
                                OWNERSHIP HISTORY
                            </p>

                            <h4 className="mt-3 text-xl font-light text-white/85">
                                Previous Owners
                            </h4>
                        </div>

                        <span className="w-fit rounded-full border border-white/10 px-4 py-2 text-xs text-white/45">
                            {section.records?.length || 0}{" "}
                            {(section.records?.length || 0) === 1
                                ? "previous owner"
                                : "previous owners"}
                        </span>
                    </div>

                    {section.records?.length > 0 ? (
                        <div className="mt-6 space-y-3">
                            {section.records.map((record, index) => (
                                <div
                                    key={
                                        record.id ??
                                        record.ownershipId ??
                                        `${getOwnerName(record) || "owner"}-${index}`
                                    }
                                    className="rounded-xl border border-white/10 bg-black/20 p-5"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-xs tracking-[0.15em] text-white/30">
                                                PREVIOUS OWNER {index + 1}
                                            </p>

                                            <p className="mt-2 text-lg text-white/85">
                                                {displayValue(getOwnerName(record))}
                                            </p>
                                        </div>

                                        <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                                            Ownership ended
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <Detail
                                            label="Acquired Date"
                                            value={formatDate(getAcquiredDate(record))}
                                        />

                                        {isAvailable(getTransferDate(record)) && (
                                            <Detail
                                                label="Transfer Date"
                                                value={formatDate(getTransferDate(record))}
                                            />
                                        )}

                                        <Detail
                                            label="Record ID"
                                            value={record.id ?? record.ownershipId}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-6 text-sm leading-7 text-white/40">
                            No previous ownership records were returned
                            by the backend for this property.
                        </p>
                    )}
                </div>
            )}

            {/* PERMIT DETAILS */}

            {section.recordType !== "ownership" &&
                section.records?.length > 0 && (
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

/*
 * DISPLAY VALUE
 */

function displayValue(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Not available";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    return String(value);
}

/*
 * FORMAT BOOLEAN
 */

function formatBoolean(value) {
    if (value === true) {
        return "Yes";
    }

    if (value === false) {
        return "No";
    }

    return null;
}

/*
 * FORMAT DATE
 */

function formatDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/*
 * FORMAT CURRENCY
 */

function formatCurrency(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return String(value);
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
}