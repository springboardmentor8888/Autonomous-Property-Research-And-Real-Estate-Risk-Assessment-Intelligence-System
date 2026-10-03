"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Droplets,
    MapPin,
    ShieldCheck,
    Waves,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| DEFAULT PROPERTY
|--------------------------------------------------------------------------
*/

const DEFAULT_PROPERTY = {
    formattedAddress: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    propertyId: "",
    latitude: null,
    longitude: null,
};

/*
|--------------------------------------------------------------------------
| DEFAULT FLOOD DATA
|--------------------------------------------------------------------------
|
| Important:
| Do NOT use "Not available" as a UI value.
| Missing backend values are represented by empty strings.
|--------------------------------------------------------------------------
*/

const DEFAULT_FLOOD_DATA = {
    floodZone: "",
    zoneDescription: "",
    riskLevel: "",
    verificationStatus: "",
    specialFloodHazardArea: "",
    baseFloodElevation: "",
    floodInsuranceRequired: "",
    mapSource: "",
    mapPanel: "",
    lastUpdated: "",
    waterBody: "",
    nearestWaterBodyDistance: "",
    verificationSummary: "",
    recommendations: [],
};

/*
|--------------------------------------------------------------------------
| VALUE HELPERS
|--------------------------------------------------------------------------
*/

function cleanValue(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    if (typeof value === "string") {
        const cleaned = value.trim();

        if (
            !cleaned ||
            cleaned.toLowerCase() === "not available" ||
            cleaned.toLowerCase() === "n/a" ||
            cleaned.toLowerCase() === "na" ||
            cleaned.toLowerCase() === "null" ||
            cleaned.toLowerCase() === "undefined"
        ) {
            return "";
        }

        return cleaned;
    }

    return value;
}

function hasValue(value) {
    return cleanValue(value) !== "";
}

/*
|--------------------------------------------------------------------------
| NORMALIZE FLOOD ZONE DATA
|--------------------------------------------------------------------------
*/

function normalizeFloodData(response) {
    const payload =
        response?.data ??
        response?.property ??
        response ??
        {};

    const flood =
        payload.floodZone ??
        payload.flood_zone ??
        payload;

    const rawRisk = cleanValue(
        flood.riskLevel ??
        flood.risk_level
    );

    const rawZone = cleanValue(
        flood.zone ??
        flood.floodZone ??
        flood.flood_zone
    );

    const risk = String(rawRisk || "");
    const zone = String(rawZone || "");

    const riskLower = risk.toLowerCase();

    let riskDescription = "";

    if (riskLower === "low") {
        riskDescription = "Low Flood Risk";
    } else if (riskLower === "medium") {
        riskDescription = "Medium Flood Risk";
    } else if (riskLower === "high") {
        riskDescription = "High Flood Risk";
    } else if (riskLower === "very high") {
        riskDescription = "Very High Flood Risk";
    } else if (risk) {
        riskDescription = `${risk} Flood Risk`;
    }

    const recommendations = Array.isArray(
        flood.recommendations
    )
        ? flood.recommendations
            .map(cleanValue)
            .filter(Boolean)
        : [];

    return {
        floodZone: zone,

        zoneDescription: cleanValue(
            flood.zoneDescription ??
            flood.zone_description
        ),

        riskLevel: risk,

        verificationStatus: cleanValue(
            flood.verificationStatus ??
            flood.verification_status
        ),

        specialFloodHazardArea: cleanValue(
            flood.specialFloodHazardArea ??
            flood.special_flood_hazard_area
        ),

        baseFloodElevation: cleanValue(
            flood.baseFloodElevation ??
            flood.base_flood_elevation
        ),

        floodInsuranceRequired: cleanValue(
            flood.floodInsuranceRequired ??
            flood.flood_insurance_required
        ),

        mapSource: cleanValue(
            flood.mapSource ??
            flood.map_source
        ),

        mapPanel: cleanValue(
            flood.mapPanel ??
            flood.map_panel
        ),

        lastUpdated: cleanValue(
            flood.lastUpdated ??
            flood.last_updated
        ),

        waterBody: cleanValue(
            flood.waterBody ??
            flood.water_body
        ),

        nearestWaterBodyDistance: cleanValue(
            flood.nearestWaterBodyDistance ??
            flood.nearest_water_body_distance
        ),

        verificationSummary: cleanValue(
            flood.verificationSummary ??
            flood.verification_summary
        ),

        recommendations,

        riskDescription,
    };
}

/*
|--------------------------------------------------------------------------
| DETAIL CARD
|--------------------------------------------------------------------------
|
| If the backend value is missing, null, empty, N/A or "Not available",
| the complete card is removed.
|--------------------------------------------------------------------------
*/

function DetailCard({ label, value }) {
    if (!hasValue(value)) {
        return null;
    }

    return (
        <div className="bg-[#101010] p-6">
            <p className="text-xs tracking-[0.2em] text-white/25">
                {label}
            </p>

            <p className="mt-4 break-words text-base font-medium text-white/80">
                {cleanValue(value)}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({ icon, label, value }) {
    if (!hasValue(value)) {
        return null;
    }

    return (
        <div className="bg-[#101010] p-6">
            <div className="flex items-center gap-3 text-white/40">
                {icon}

                <p className="text-xs tracking-[0.2em] text-white/25">
                    {label}
                </p>
            </div>

            <p className="mt-5 text-2xl font-light text-white/80">
                {cleanValue(value)}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| FLOOD ZONE PAGE
|--------------------------------------------------------------------------
*/

export default function FloodZonePage() {
    const [property, setProperty] =
        useState(DEFAULT_PROPERTY);

    const [floodData, setFloodData] = useState(
        DEFAULT_FLOOD_DATA
    );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | FETCH FLOOD ZONE DATA
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let cancelled = false;

        async function loadFloodData() {
            try {
                setLoading(true);
                setError("");

                const savedProperty =
                    sessionStorage.getItem(
                        "selectedProperty"
                    );

                if (!savedProperty) {
                    throw new Error(
                        "No property is selected. Please select a property from Property Search."
                    );
                }

                const parsedProperty =
                    JSON.parse(savedProperty);

                const rawId =
                    parsedProperty.propertyDbId ??
                    parsedProperty.id ??
                    parsedProperty.propertyId;

                if (
                    rawId === null ||
                    rawId === undefined ||
                    !/^\d+$/.test(String(rawId))
                ) {
                    throw new Error(
                        "A valid numeric property database ID was not found. Please select a property saved by the backend."
                    );
                }

                if (!cancelled) {
                    setProperty({
                        ...DEFAULT_PROPERTY,
                        ...parsedProperty,

                        postalCode:
                            parsedProperty.postalCode ??
                            parsedProperty.zipCode ??
                            "",

                        propertyId:
                            String(rawId),
                    });
                }

                const token =
                    localStorage.getItem("token");

                const response = await fetch(
                    `http://localhost:8080/api/properties/${encodeURIComponent(
                        rawId
                    )}`,
                    {
                        method: "GET",

                        headers: {
                            "Content-Type":
                                "application/json",

                            ...(token
                                ? {
                                    Authorization: `Bearer ${token}`,
                                }
                                : {}),
                        },
                    }
                );

                const responseData =
                    await response
                        .json()
                        .catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        responseData?.message ||
                        responseData?.error
                            ?.message ||
                        `Unable to load flood zone information (HTTP ${response.status}).`
                    );
                }

                if (cancelled) {
                    return;
                }

                const payload =
                    responseData?.data ??
                    responseData?.property ??
                    responseData ??
                    {};

                const floodProperty =
                    payload.floodZone?.property ??
                    payload.flood_zone?.property ??
                    {};

                setProperty((previous) => ({
                    ...previous,

                    ...parsedProperty,

                    address:
                        cleanValue(
                            payload.address
                        ) ||
                        cleanValue(
                            floodProperty.address
                        ) ||
                        cleanValue(
                            parsedProperty.address
                        ),

                    formattedAddress:
                        cleanValue(
                            parsedProperty.formattedAddress
                        ) ||
                        cleanValue(
                            payload.address
                        ) ||
                        cleanValue(
                            floodProperty.address
                        ),

                    city:
                        cleanValue(
                            payload.city
                        ) ||
                        cleanValue(
                            floodProperty.city
                        ) ||
                        cleanValue(
                            parsedProperty.city
                        ),

                    state:
                        cleanValue(
                            payload.state
                        ) ||
                        cleanValue(
                            floodProperty.state
                        ) ||
                        cleanValue(
                            parsedProperty.state
                        ),

                    postalCode:
                        cleanValue(
                            payload.postalCode
                        ) ||
                        cleanValue(
                            payload.zipCode
                        ) ||
                        cleanValue(
                            floodProperty.zipCode
                        ) ||
                        cleanValue(
                            floodProperty.postalCode
                        ) ||
                        cleanValue(
                            parsedProperty.postalCode
                        ) ||
                        cleanValue(
                            parsedProperty.zipCode
                        ),

                    propertyId:
                        cleanValue(
                            payload.id
                        ) ||
                        cleanValue(
                            parsedProperty.propertyDbId
                        ) ||
                        cleanValue(
                            parsedProperty.id
                        ) ||
                        cleanValue(
                            parsedProperty.propertyId
                        ),

                    latitude:
                        payload.latitude ??
                        floodProperty.latitude ??
                        parsedProperty.latitude ??
                        null,

                    longitude:
                        payload.longitude ??
                        floodProperty.longitude ??
                        parsedProperty.longitude ??
                        null,
                }));

                setFloodData(
                    normalizeFloodData(
                        responseData
                    )
                );
            } catch (err) {
                console.error(
                    "Flood zone loading error:",
                    err
                );

                if (!cancelled) {
                    setError(
                        err?.message ||
                        "Unable to load flood zone information."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadFloodData();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | DERIVED VALUES
    |--------------------------------------------------------------------------
    */

    const riskLevel =
        cleanValue(
            floodData.riskLevel
        );

    const riskIsLow =
        riskLevel.toLowerCase() ===
        "low";

    const riskIsHigh = [
        "high",
        "very high",
        "severe",
    ].includes(
        riskLevel.toLowerCase()
    );

    const verificationText =
        useMemo(() => {
            if (error) {
                return "Flood zone information could not be loaded.";
            }

            if (!hasValue(floodData.riskLevel)) {
                return "";
            }

            return "Flood zone information was received from the backend.";
        }, [
            error,
            floodData.riskLevel,
        ]);

    /*
    |--------------------------------------------------------------------------
    | PROPERTY LOCATION / MAP
    |--------------------------------------------------------------------------
    |
    | Coordinates are preferred.
    | If coordinates are missing but an address exists,
    | Open Map still works using the address.
    |--------------------------------------------------------------------------
    */

    const hasCoordinates =
        property.latitude !== null &&
        property.latitude !== undefined &&
        property.longitude !== null &&
        property.longitude !== undefined &&
        property.latitude !== "" &&
        property.longitude !== "";

    const propertyAddress =
        cleanValue(
            property.formattedAddress
        ) ||
        cleanValue(
            property.address
        );

    const mapUrl = hasCoordinates
        ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=17/${property.latitude}/${property.longitude}`
        : propertyAddress
            ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(
                propertyAddress
            )}`
            : null;

    /*
    |--------------------------------------------------------------------------
    | AVAILABLE DATA CHECKS
    |--------------------------------------------------------------------------
    */

    const propertyDetails = [
        {
            label: "City",
            value: property.city,
        },
        {
            label: "State",
            value: property.state,
        },
        {
            label: "Postal Code",
            value: property.postalCode,
        },
        {
            label: "Property ID",
            value: property.propertyId,
        },
    ].filter((item) =>
        hasValue(item.value)
    );

    const floodOverview = [
        {
            label: "FLOOD ZONE",
            value: floodData.floodZone,
            icon: <Waves size={19} />,
        },
        {
            label: "RISK LEVEL",
            value: floodData.riskLevel,
            icon: <ShieldCheck size={19} />,
        },
        {
            label: "VERIFICATION",
            value:
                floodData.verificationStatus,
            icon: <CheckCircle2 size={19} />,
        },
        {
            label: "SFHA",
            value:
                floodData.specialFloodHazardArea,
            icon: <Droplets size={19} />,
        },
    ].filter((item) =>
        hasValue(item.value)
    );

    const floodDetailFields = [
        {
            label: "SPECIAL FLOOD HAZARD AREA",
            value:
                floodData.specialFloodHazardArea,
        },
        {
            label: "BASE FLOOD ELEVATION",
            value:
                floodData.baseFloodElevation,
        },
        {
            label: "FLOOD INSURANCE REQUIRED",
            value:
                floodData.floodInsuranceRequired,
        },
        {
            label: "MAP PANEL",
            value: floodData.mapPanel,
        },
        {
            label: "MAP SOURCE",
            value: floodData.mapSource,
        },
        {
            label: "LAST UPDATED",
            value: floodData.lastUpdated,
        },
    ].filter((item) =>
        hasValue(item.value)
    );

    const hasNearbyWater =
        hasValue(floodData.waterBody) ||
        hasValue(
            floodData.nearestWaterBodyDistance
        );

    /*
    |--------------------------------------------------------------------------
    | LOADING STATE
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0b0b0b] text-white">
                <div className="flex min-h-screen items-center justify-center">
                    <div className="flex items-center gap-4 text-white/50">
                        <div className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />

                        <span>
                            Loading flood zone information...
                        </span>
                    </div>
                </div>
            </main>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (
        <main className="min-h-screen bg-[#0b0b0b] text-white">
            {/* Background */}

            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[-200px] top-[5%] h-[550px] w-[550px] rounded-full bg-cyan-500/[0.05] blur-[150px]" />

                <div className="absolute right-[-220px] top-[30%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />
            </div>

            {/* Hero */}

            <section className="border-b border-white/10 px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <Link
                        href="/zoning"
                        className="inline-flex items-center gap-2 text-sm text-white/35 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />

                        Back to Zoning Information
                    </Link>

                    <p className="mb-7 mt-16 text-xs font-semibold tracking-[0.35em] text-white/35">
                        PROPERTY / FLOOD ZONE
                    </p>

                    <h1 className="max-w-6xl text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.05em]">
                        Verify
                        <br />

                        <span className="text-white/35">
                            flood risk.
                        </span>
                    </h1>

                    <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/45 md:text-xl">
                        Review flood zone classification,
                        hazard status, flood map
                        information, and other
                        flood-related property
                        indicators.
                    </p>

                    <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.04] px-4 py-2 text-xs text-sky-300/70">
                        <span className="h-2 w-2 rounded-full bg-sky-400" />

                        BACKEND DATA
                    </div>
                </div>
            </section>

            {/* Selected Property */}

            <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="flex items-center gap-3">
                        <CheckCircle2
                            size={18}
                            className="text-emerald-400"
                        />

                        <span className="text-xs font-semibold tracking-[0.3em] text-emerald-400/70">
                            PROPERTY SELECTED
                        </span>
                    </div>

                    {hasValue(propertyAddress) && (
                        <h2 className="mt-6 max-w-5xl text-4xl font-light leading-tight tracking-tight md:text-6xl">
                            {propertyAddress}
                        </h2>
                    )}

                    {propertyDetails.length > 0 && (
                        <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                            {propertyDetails.map(
                                (item) => (
                                    <DetailCard
                                        key={item.label}
                                        label={item.label}
                                        value={item.value}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Error Message */}

            {error && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px] rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-8">
                        <p className="text-xs font-semibold tracking-[0.25em] text-red-300/80">
                            FLOOD ZONE INFORMATION COULD NOT BE LOADED
                        </p>

                        <p className="mt-4 text-sm leading-7 text-white/60">
                            {error}
                        </p>

                        <Link
                            href="/property-search"
                            className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm text-white/70 transition hover:bg-white hover:text-black"
                        >
                            <ArrowLeft size={15} />

                            Return to Property Search
                        </Link>
                    </div>
                </section>
            )}

            {/* Flood Zone Overview */}

            {floodOverview.length > 0 && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                            FLOOD ZONE OVERVIEW
                        </p>

                        <div
                            className={`grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 ${floodOverview.length >= 4
                                    ? "lg:grid-cols-4"
                                    : floodOverview.length === 3
                                        ? "lg:grid-cols-3"
                                        : "lg:grid-cols-2"
                                }`}
                        >
                            {floodOverview.map(
                                (item) => (
                                    <StatCard
                                        key={item.label}
                                        icon={item.icon}
                                        label={item.label}
                                        value={item.value}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Verification Status */}

            {(hasValue(
                floodData.verificationStatus
            ) ||
                hasValue(
                    floodData.zoneDescription
                )) && (
                    <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                        <div className="mx-auto max-w-[1400px]">
                            <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                                FLOOD ZONE VERIFICATION
                            </p>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                                    {hasValue(
                                        floodData.verificationStatus
                                    ) && (
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                                                    <ShieldCheck
                                                        size={22}
                                                        className="text-white/50"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-xs tracking-[0.25em] text-white/25">
                                                        VERIFICATION STATUS
                                                    </p>

                                                    <h3 className="mt-3 text-2xl font-light text-white/80">
                                                        {
                                                            floodData.verificationStatus
                                                        }
                                                    </h3>

                                                    {hasValue(
                                                        verificationText
                                                    ) && (
                                                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
                                                                {
                                                                    verificationText
                                                                }
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        )}

                                    {hasValue(
                                        floodData.zoneDescription
                                    ) && (
                                            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-5">
                                                <p className="text-xs tracking-[0.2em] text-white/30">
                                                    FLOOD HAZARD
                                                </p>

                                                <p className="mt-3 text-lg text-white/70">
                                                    {
                                                        floodData.zoneDescription
                                                    }
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

            {/* Flood Zone Classification */}

            {(hasValue(
                floodData.floodZone
            ) ||
                hasValue(
                    floodData.riskDescription
                ) ||
                hasValue(
                    floodData.verificationSummary
                )) && (
                    <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                        <div className="mx-auto max-w-[1400px]">
                            <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                                FLOOD ZONE CLASSIFICATION
                            </p>

                            <div className="grid gap-6 md:grid-cols-2">
                                {hasValue(
                                    floodData.floodZone
                                ) && (
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                                            <p className="text-xs tracking-[0.25em] text-white/25">
                                                ZONE CODE
                                            </p>

                                            <p className="mt-5 text-6xl font-light text-white/80">
                                                {
                                                    floodData.floodZone
                                                }
                                            </p>

                                            {hasValue(
                                                floodData.zoneDescription
                                            ) && (
                                                    <p className="mt-4 text-lg text-white/60">
                                                        {
                                                            floodData.zoneDescription
                                                        }
                                                    </p>
                                                )}
                                        </div>
                                    )}

                                {(hasValue(
                                    floodData.riskDescription
                                ) ||
                                    hasValue(
                                        floodData.verificationSummary
                                    )) && (
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                                            <div className="flex items-start gap-4">
                                                {riskIsLow ? (
                                                    <CheckCircle2
                                                        size={21}
                                                        className="mt-1 text-emerald-400"
                                                    />
                                                ) : (
                                                    <AlertTriangle
                                                        size={21}
                                                        className={`mt-1 ${riskIsHigh
                                                                ? "text-red-400"
                                                                : "text-orange-400"
                                                            }`}
                                                    />
                                                )}

                                                <div>
                                                    <p className="text-xs tracking-[0.25em] text-white/25">
                                                        RISK ASSESSMENT
                                                    </p>

                                                    {hasValue(
                                                        floodData.riskDescription
                                                    ) && (
                                                            <p className="mt-4 text-2xl font-light text-white/75">
                                                                {
                                                                    floodData.riskDescription
                                                                }
                                                            </p>
                                                        )}

                                                    {hasValue(
                                                        floodData.verificationSummary
                                                    ) && (
                                                            <p className="mt-4 text-sm leading-7 text-white/35">
                                                                {
                                                                    floodData.verificationSummary
                                                                }
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </section>
                )}

            {/* Flood Details */}

            {floodDetailFields.length > 0 && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                            FLOOD DETAILS
                        </p>

                        <div
                            className={`grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 ${floodDetailFields.length >= 6
                                    ? "lg:grid-cols-3"
                                    : floodDetailFields.length >= 3
                                        ? "lg:grid-cols-3"
                                        : "lg:grid-cols-2"
                                }`}
                        >
                            {floodDetailFields.map(
                                (item) => (
                                    <DetailCard
                                        key={item.label}
                                        label={item.label}
                                        value={item.value}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Nearby Water */}

            {hasNearbyWater && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                            NEARBY WATER INFORMATION
                        </p>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                            <div className="grid gap-10 md:grid-cols-2">
                                {hasValue(
                                    floodData.waterBody
                                ) && (
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <Droplets
                                                    size={20}
                                                    className="text-white/40"
                                                />

                                                <p className="text-xs tracking-[0.25em] text-white/25">
                                                    NEAREST WATER BODY
                                                </p>
                                            </div>

                                            <p className="mt-5 text-2xl font-light text-white/75">
                                                {
                                                    floodData.waterBody
                                                }
                                            </p>
                                        </div>
                                    )}

                                {hasValue(
                                    floodData.nearestWaterBodyDistance
                                ) && (
                                        <div>
                                            <p className="text-xs tracking-[0.25em] text-white/25">
                                                DISTANCE
                                            </p>

                                            <p className="mt-5 text-2xl font-light text-white/75">
                                                {
                                                    floodData.nearestWaterBodyDistance
                                                }
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Recommendations */}

            {floodData.recommendations
                .length > 0 && (
                    <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                        <div className="mx-auto max-w-[1400px]">
                            <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                                DUE DILIGENCE NOTES
                            </p>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                                <div className="space-y-5">
                                    {floodData.recommendations.map(
                                        (
                                            recommendation,
                                            index
                                        ) => (
                                            <div
                                                key={`${recommendation}-${index}`}
                                                className="flex items-start gap-4 border-b border-white/[0.06] pb-5 last:border-b-0 last:pb-0"
                                            >
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs text-white/40">
                                                    {index + 1}
                                                </span>

                                                <p className="text-sm leading-7 text-white/50">
                                                    {
                                                        recommendation
                                                    }
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

            {/* Property Location */}

            {hasValue(propertyAddress) && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                            PROPERTY LOCATION
                        </p>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                            <div className="grid gap-10 md:grid-cols-2">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <MapPin
                                            size={20}
                                            className="text-white/40"
                                        />

                                        <p className="text-xs tracking-[0.25em] text-white/25">
                                            ADDRESS
                                        </p>
                                    </div>

                                    <p className="mt-5 text-lg text-white/70">
                                        {
                                            propertyAddress
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs tracking-[0.25em] text-white/25">
                                        MAP LOCATION
                                    </p>

                                    {hasCoordinates ? (
                                        <p className="mt-5 text-sm text-white/40">
                                            Coordinates:{" "}
                                            {
                                                property.latitude
                                            }
                                            ,{" "}
                                            {
                                                property.longitude
                                            }
                                        </p>
                                    ) : (
                                        <p className="mt-5 text-sm text-white/40">
                                            Map available for this property address.
                                        </p>
                                    )}

                                    {mapUrl && (
                                        <a
                                            href={mapUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3 text-sm text-white/65 transition hover:border-white/30 hover:bg-white hover:text-black"
                                        >
                                            Open Map

                                            <span>
                                                ↗
                                            </span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Next Stage */}

            <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <p className="text-xs font-semibold tracking-[0.3em] text-white/25">
                            NEXT RESEARCH STAGE
                        </p>

                        <h2 className="mt-4 text-3xl font-light text-white/80">
                            Permits & Environmental Records
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/35">
                            Review historical permits,
                            active development work,
                            and environmental records
                            associated with the property.
                        </p>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                            <Link
                                href="/permit-environmental"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-black"
                            >
                                View Permit & Environmental Records

                                <ArrowRight size={16} />
                            </Link>

                            <Link
                                href="/zoning"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 px-7 py-4 text-sm font-medium text-white/50 transition duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                            >
                                Back to Zoning

                                <ArrowLeft size={16} />
                            </Link>

                            <Link
                                href="/property-search"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 px-7 py-4 text-sm font-medium text-white/50 transition duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                            >
                                Property Search

                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}

            <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">
                    <span>
                        PROP DUE
                    </span>

                    <span>
                        FLOOD ZONE VERIFICATION
                    </span>
                </div>
            </footer>
        </main>
    );
}