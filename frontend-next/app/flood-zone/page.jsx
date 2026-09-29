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
*/
const DEFAULT_FLOOD_DATA = {
    floodZone: "Not available",
    zoneDescription: "Not available",
    riskLevel: "Not available",
    verificationStatus: "Not verified",
    specialFloodHazardArea: "Not available",
    baseFloodElevation: "Not available",
    floodInsuranceRequired: "Not available",
    mapSource: "Not available",
    mapPanel: "Not available",
    lastUpdated: "Not available",
    waterBody: "Not available",
    nearestWaterBodyDistance: "Not available",
    verificationSummary:
        "No flood assessment summary was provided by the backend.",
    recommendations: [
        "Review the latest official flood map before making a property decision.",
        "Confirm whether local drainage or stormwater requirements apply.",
        "Check for property-specific flood history and insurance requirements.",
    ],
};

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

    const risk = String(
        flood.riskLevel ??
        flood.risk_level ??
        "Not available"
    );

    const zone = String(
        flood.zone ??
        flood.floodZone ??
        flood.flood_zone ??
        "Not available"
    );

    const riskLower = risk.toLowerCase();

    const riskDescription =
        riskLower === "low"
            ? "Low Flood Risk"
            : riskLower === "medium"
                ? "Medium Flood Risk"
                : riskLower === "high"
                    ? "High Flood Risk"
                    : riskLower === "very high"
                        ? "Very High Flood Risk"
                        : risk === "Not available"
                            ? "Not available"
                            : `${risk} Flood Risk`;

    return {
        floodZone: zone,

        zoneDescription:
            flood.zoneDescription ??
            flood.zone_description ??
            "Flood zone classification returned by the backend.",

        riskLevel: risk,

        verificationStatus:
            flood.verificationStatus ??
            flood.verification_status ??
            "Data received",

        specialFloodHazardArea:
            flood.specialFloodHazardArea ??
            flood.special_flood_hazard_area ??
            "Not available",

        baseFloodElevation:
            flood.baseFloodElevation ??
            flood.base_flood_elevation ??
            "Not available",

        floodInsuranceRequired:
            flood.floodInsuranceRequired ??
            flood.flood_insurance_required ??
            "Not available",

        mapSource:
            flood.mapSource ??
            flood.map_source ??
            "Not available",

        mapPanel:
            flood.mapPanel ??
            flood.map_panel ??
            "Not available",

        lastUpdated:
            flood.lastUpdated ??
            flood.last_updated ??
            "Not available",

        waterBody:
            flood.waterBody ??
            flood.water_body ??
            "Not available",

        nearestWaterBodyDistance:
            flood.nearestWaterBodyDistance ??
            flood.nearest_water_body_distance ??
            "Not available",

        verificationSummary:
            flood.verificationSummary ??
            flood.verification_summary ??
            `The backend reports ${zone} with a risk level of ${risk}.`,

        recommendations: Array.isArray(flood.recommendations)
            ? flood.recommendations
            : DEFAULT_FLOOD_DATA.recommendations,

        riskDescription,
    };
}

/*
|--------------------------------------------------------------------------
| DETAIL CARD
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/
function StatCard({ icon, label, value }) {
    return (
        <div className="bg-[#101010] p-6">
            <div className="flex items-center gap-3 text-white/40">
                {icon}

                <p className="text-xs tracking-[0.2em] text-white/25">
                    {label}
                </p>
            </div>

            <p className="mt-5 text-2xl font-light text-white/80">
                {value || "Not available"}
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
    const [property, setProperty] = useState(DEFAULT_PROPERTY);

    const [floodData, setFloodData] = useState(
        DEFAULT_FLOOD_DATA
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                    sessionStorage.getItem("selectedProperty");

                if (!savedProperty) {
                    throw new Error(
                        "No property is selected. Please select a property from Property Search."
                    );
                }

                const parsedProperty = JSON.parse(savedProperty);

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

                        propertyId: String(rawId),
                    });
                }

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `http://localhost:8080/api/properties/${encodeURIComponent(
                        rawId
                    )}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",

                            ...(token
                                ? {
                                    Authorization: `Bearer ${token}`,
                                }
                                : {}),
                        },
                    }
                );

                const responseData = await response
                    .json()
                    .catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        responseData?.message ||
                        responseData?.error?.message ||
                        `Unable to load flood zone information (HTTP ${response.status}).`
                    );
                }

                if (cancelled) return;

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
                        payload.address ??
                        floodProperty.address ??
                        parsedProperty.address ??
                        "",

                    formattedAddress:
                        parsedProperty.formattedAddress ??
                        payload.address ??
                        floodProperty.address ??
                        "",

                    city:
                        payload.city ??
                        floodProperty.city ??
                        parsedProperty.city ??
                        "",

                    state:
                        payload.state ??
                        floodProperty.state ??
                        parsedProperty.state ??
                        "",

                    postalCode:
                        payload.postalCode ??
                        payload.zipCode ??
                        floodProperty.zipCode ??
                        floodProperty.postalCode ??
                        parsedProperty.postalCode ??
                        parsedProperty.zipCode ??
                        "",

                    propertyId:
                        payload.id ??
                        parsedProperty.propertyDbId ??
                        parsedProperty.id ??
                        parsedProperty.propertyId ??
                        "",

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

                setFloodData(normalizeFloodData(responseData));
            } catch (err) {
                console.error(
                    "Flood zone loading error:",
                    err
                );

                if (!cancelled) {
                    setError(
                        err.message ||
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
    const riskIsLow =
        floodData.riskLevel.toLowerCase() === "low";

    const riskIsHigh = [
        "high",
        "very high",
        "severe",
    ].includes(floodData.riskLevel.toLowerCase());

    const verificationText = useMemo(() => {
        if (error) {
            return "Flood zone information could not be loaded.";
        }

        if (floodData.riskLevel === "Not available") {
            return "Flood zone risk information is not available.";
        }

        return "Flood zone information was received from the backend.";
    }, [error, floodData.riskLevel]);

    const hasCoordinates =
        property.latitude !== null &&
        property.latitude !== undefined &&
        property.longitude !== null &&
        property.longitude !== undefined;

    const mapUrl = hasCoordinates
        ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=17/${property.latitude}/${property.longitude}`
        : null;

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
                        Review flood zone classification, hazard status, flood map
                        information, and other flood-related property indicators.
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

                    <h2 className="mt-6 max-w-5xl text-4xl font-light leading-tight tracking-tight md:text-6xl">
                        {property.formattedAddress ||
                            property.address ||
                            "Selected Property"}
                    </h2>

                    <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
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
                            label="Property ID"
                            value={property.propertyId}
                        />
                    </div>
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
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        FLOOD ZONE OVERVIEW
                    </p>

                    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={<Waves size={19} />}
                            label="FLOOD ZONE"
                            value={floodData.floodZone}
                        />

                        <StatCard
                            icon={<ShieldCheck size={19} />}
                            label="RISK LEVEL"
                            value={floodData.riskLevel}
                        />

                        <StatCard
                            icon={<CheckCircle2 size={19} />}
                            label="VERIFICATION"
                            value={floodData.verificationStatus}
                        />

                        <StatCard
                            icon={<Droplets size={19} />}
                            label="SFHA"
                            value={floodData.specialFloodHazardArea}
                        />
                    </div>
                </div>
            </section>

            {/* Verification Status */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        FLOOD ZONE VERIFICATION
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
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
                                        {floodData.verificationStatus}
                                    </h3>

                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
                                        {verificationText}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-5">
                                <p className="text-xs tracking-[0.2em] text-white/30">
                                    FLOOD HAZARD
                                </p>

                                <p className="mt-3 text-lg text-white/70">
                                    {floodData.zoneDescription}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flood Zone Classification */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        FLOOD ZONE CLASSIFICATION
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                            <p className="text-xs tracking-[0.25em] text-white/25">
                                ZONE CODE
                            </p>

                            <p className="mt-5 text-6xl font-light text-white/80">
                                {floodData.floodZone}
                            </p>

                            <p className="mt-4 text-lg text-white/60">
                                {floodData.zoneDescription}
                            </p>

                            <p className="mt-5 text-sm leading-7 text-white/35">
                                Flood zone classification provided by the backend.
                                Additional official map details are not available
                                unless returned by the data source.
                            </p>
                        </div>

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

                                    <p className="mt-4 text-2xl font-light text-white/75">
                                        {floodData.riskLevel === "Not available"
                                            ? "Not available"
                                            : floodData.riskDescription}
                                    </p>

                                    <p className="mt-4 text-sm leading-7 text-white/35">
                                        {floodData.verificationSummary}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flood Details */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        FLOOD DETAILS
                    </p>

                    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailCard
                            label="SPECIAL FLOOD HAZARD AREA"
                            value={floodData.specialFloodHazardArea}
                        />

                        <DetailCard
                            label="BASE FLOOD ELEVATION"
                            value={floodData.baseFloodElevation}
                        />

                        <DetailCard
                            label="FLOOD INSURANCE REQUIRED"
                            value={floodData.floodInsuranceRequired}
                        />

                        <DetailCard
                            label="MAP PANEL"
                            value={floodData.mapPanel}
                        />

                        <DetailCard
                            label="MAP SOURCE"
                            value={floodData.mapSource}
                        />

                        <DetailCard
                            label="LAST UPDATED"
                            value={floodData.lastUpdated}
                        />
                    </div>
                </div>
            </section>

            {/* Nearby Water */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        NEARBY WATER INFORMATION
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <div className="grid gap-10 md:grid-cols-2">
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
                                    {floodData.waterBody}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    DISTANCE
                                </p>

                                <p className="mt-5 text-2xl font-light text-white/75">
                                    {floodData.nearestWaterBodyDistance}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recommendations */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        DUE DILIGENCE NOTES
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <div className="space-y-5">
                            {floodData.recommendations.map(
                                (recommendation, index) => (
                                    <div
                                        key={`${recommendation}-${index}`}
                                        className="flex items-start gap-4 border-b border-white/[0.06] pb-5 last:border-b-0 last:pb-0"
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs text-white/40">
                                            {index + 1}
                                        </span>

                                        <p className="text-sm leading-7 text-white/50">
                                            {recommendation}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Property Location */}
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
                                    {property.formattedAddress ||
                                        property.address ||
                                        "Not available"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    MAP LOCATION
                                </p>

                                <p className="mt-5 text-sm text-white/40">
                                    Coordinates:{" "}
                                    {hasCoordinates
                                        ? `${property.latitude}, ${property.longitude}`
                                        : "Not available"}
                                </p>

                                {mapUrl && (
                                    <a
                                        href={mapUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3 text-sm text-white/65 transition hover:border-white/30 hover:bg-white hover:text-black"
                                    >
                                        Open Map
                                        <span>↗</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
                            Review historical permits, active development work,
                            and environmental records associated with the property.
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
                    <span>PROP DUE</span>
                    <span>FLOOD ZONE VERIFICATION</span>
                </div>
            </footer>
        </main>
    );
}