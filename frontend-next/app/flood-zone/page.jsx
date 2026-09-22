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
    formattedAddress: "742 Evergreen Terrace, Springfield, IL 62704",
    address: "742 Evergreen Terrace, Springfield, IL 62704",
    city: "Springfield",
    state: "Illinois",
    postalCode: "62704",
    propertyId: "PROP-742-001",
    latitude: 39.7817,
    longitude: -89.6501,
};

/*
|--------------------------------------------------------------------------
| DEMO FLOOD ZONE DATA
|--------------------------------------------------------------------------
*/
const DEMO_FLOOD_DATA = {
    floodZone: "X",
    zoneDescription: "Minimal Flood Hazard Area",

    riskLevel: "Low",
    verificationStatus: "Verified",

    specialFloodHazardArea: "No",
    baseFloodElevation: "Not Applicable",
    floodInsuranceRequired: "No",

    mapSource: "FEMA Flood Map Service",
    mapPanel: "17167C0210",
    lastUpdated: "September 15, 2026",

    waterBody: "Clear Creek",
    nearestWaterBodyDistance: "1.8 miles",

    verificationSummary:
        "The demo property is outside the Special Flood Hazard Area and is classified in Flood Zone X.",

    recommendations: [
        "Review the latest official flood map before making a final property decision.",
        "Confirm whether local drainage or stormwater requirements apply.",
        "Check for any property-specific flood history or insurance requirements.",
    ],
};

export default function FloodZonePage() {
    const [property, setProperty] =
        useState(DEFAULT_PROPERTY);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const savedProperty =
                sessionStorage.getItem("selectedProperty");

            if (savedProperty) {
                const parsedProperty = JSON.parse(savedProperty);

                setProperty({
                    ...DEFAULT_PROPERTY,
                    ...parsedProperty,
                });
            }
        } catch (error) {
            console.error(
                "Unable to load selected property. Using demo property.",
                error
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const riskIsLow =
        DEMO_FLOOD_DATA.riskLevel.toLowerCase() ===
        "low";

    const verificationText = useMemo(() => {
        if (
            DEMO_FLOOD_DATA.verificationStatus ===
            "Verified"
        ) {
            return "Flood zone verification completed";
        }

        return "Flood zone verification pending";
    }, []);

    const mapUrl = `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=17/${property.latitude}/${property.longitude}`;

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

                    <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.04] px-4 py-2 text-xs text-yellow-300/70">
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />

                        DEMO DATA — BACKEND INTEGRATION PENDING
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
                        {property.formattedAddress}
                    </h2>

                    <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailCard
                            label="City"
                            value={property.city || "Springfield"}
                        />

                        <DetailCard
                            label="State"
                            value={property.state || "Illinois"}
                        />

                        <DetailCard
                            label="Postal Code"
                            value={property.postalCode || "62704"}
                        />

                        <DetailCard
                            label="Property ID"
                            value={
                                property.propertyId ||
                                "PROP-742-001"
                            }
                        />
                    </div>
                </div>
            </section>

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
                            value={DEMO_FLOOD_DATA.floodZone}
                        />

                        <StatCard
                            icon={<ShieldCheck size={19} />}
                            label="RISK LEVEL"
                            value={DEMO_FLOOD_DATA.riskLevel}
                        />

                        <StatCard
                            icon={<CheckCircle2 size={19} />}
                            label="VERIFICATION"
                            value={
                                DEMO_FLOOD_DATA.verificationStatus
                            }
                        />

                        <StatCard
                            icon={<Droplets size={19} />}
                            label="SFHA"
                            value={
                                DEMO_FLOOD_DATA.specialFloodHazardArea
                            }
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
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.04]">
                                    <ShieldCheck
                                        size={22}
                                        className="text-emerald-400"
                                    />
                                </div>

                                <div>
                                    <p className="text-xs tracking-[0.25em] text-white/25">
                                        VERIFICATION STATUS
                                    </p>

                                    <h3 className="mt-3 text-2xl font-light text-emerald-400/80">
                                        {DEMO_FLOOD_DATA.verificationStatus}
                                    </h3>

                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
                                        {verificationText}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.03] px-6 py-5">
                                <p className="text-xs tracking-[0.2em] text-white/30">
                                    FLOOD HAZARD
                                </p>

                                <p className="mt-3 text-lg text-emerald-300/80">
                                    {DEMO_FLOOD_DATA.zoneDescription}
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
                                {DEMO_FLOOD_DATA.floodZone}
                            </p>

                            <p className="mt-4 text-lg text-white/60">
                                {DEMO_FLOOD_DATA.zoneDescription}
                            </p>

                            <p className="mt-5 text-sm leading-7 text-white/35">
                                The demonstration record places this property outside the
                                Special Flood Hazard Area.
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
                                        className="mt-1 text-orange-400"
                                    />
                                )}

                                <div>
                                    <p className="text-xs tracking-[0.25em] text-white/25">
                                        RISK ASSESSMENT
                                    </p>

                                    <p className="mt-4 text-2xl font-light text-white/75">
                                        {DEMO_FLOOD_DATA.riskLevel} Flood Risk
                                    </p>

                                    <p className="mt-4 text-sm leading-7 text-white/35">
                                        {DEMO_FLOOD_DATA.verificationSummary}
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
                            value={
                                DEMO_FLOOD_DATA.specialFloodHazardArea
                            }
                        />

                        <DetailCard
                            label="BASE FLOOD ELEVATION"
                            value={
                                DEMO_FLOOD_DATA.baseFloodElevation
                            }
                        />

                        <DetailCard
                            label="FLOOD INSURANCE REQUIRED"
                            value={
                                DEMO_FLOOD_DATA.floodInsuranceRequired
                            }
                        />

                        <DetailCard
                            label="MAP PANEL"
                            value={DEMO_FLOOD_DATA.mapPanel}
                        />

                        <DetailCard
                            label="MAP SOURCE"
                            value={DEMO_FLOOD_DATA.mapSource}
                        />

                        <DetailCard
                            label="LAST UPDATED"
                            value={DEMO_FLOOD_DATA.lastUpdated}
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
                                    {DEMO_FLOOD_DATA.waterBody}
                                </p>

                                <p className="mt-3 text-sm leading-7 text-white/35">
                                    Water body identified in the demonstration flood
                                    assessment.
                                </p>
                            </div>

                            <div>
                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    DISTANCE
                                </p>

                                <p className="mt-5 text-2xl font-light text-white/75">
                                    {DEMO_FLOOD_DATA.nearestWaterBodyDistance}
                                </p>

                                <p className="mt-3 text-sm leading-7 text-white/35">
                                    Approximate distance shown using demo data.
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
                            {DEMO_FLOOD_DATA.recommendations.map(
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
                                    {property.formattedAddress}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    MAP LOCATION
                                </p>

                                <p className="mt-5 text-sm text-white/40">
                                    Coordinates: {property.latitude},{" "}
                                    {property.longitude}
                                </p>

                                <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3 text-sm text-white/65 transition hover:border-white/30 hover:bg-white hover:text-black"
                                >
                                    Open Map
                                    <span>↗</span>
                                </a>
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
                            Review historical permits, active development work, and
                            environmental records associated with the property.
                        </p>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                            {/* Main button */}
                            <Link
                                href="/permits-environmental"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-black"
                            >
                                View Permit & Environmental Records
                                <ArrowRight size={16} />
                            </Link>

                            {/* Back to Zoning */}
                            <Link
                                href="/zoning"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 px-7 py-4 text-sm font-medium text-white/50 transition duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                            >
                                Back to Zoning
                                <ArrowLeft size={16} />
                            </Link>

                            {/* Property Search */}
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
                {value}
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
                {value}
            </p>
        </div>
    );
}