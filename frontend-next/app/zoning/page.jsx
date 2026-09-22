"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    FileText,
    MapPin,
    Ruler,
    ShieldCheck,
    Users,
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
| DEMO ZONING DATA
|--------------------------------------------------------------------------
*/
const DEMO_ZONING_DATA = {
    zoningCode: "R-2",
    zoningName: "Residential District",
    zoningStatus: "Active",

    permittedUse: "Single-Family Residential",
    propertyType: "Residential",
    planningAuthority:
        "Springfield City Planning Department",

    zoningSource: "Municipal Zoning Records",
    lastUpdated: "September 16, 2026",

    developmentRules: {
        maxBuildingHeight: "35 ft",
        frontSetback: "25 ft",
        sideSetback: "10 ft",
        rearSetback: "20 ft",
        maximumLotCoverage: "45%",
        minimumLotSize: "6,000 sq ft",
    },

    permittedActivities: [
        "Single-family residential use",
        "Private garage",
        "Residential accessory structures",
        "Private yard and garden",
    ],

    restrictions: [
        "Commercial activity requires additional approval",
        "Building modifications must comply with setback requirements",
        "New structures may require a planning permit",
    ],
};

export default function ZoningPage() {
    const [property, setProperty] = useState(DEFAULT_PROPERTY);
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

    const permittedCount =
        DEMO_ZONING_DATA.permittedActivities.length;

    const restrictionCount =
        DEMO_ZONING_DATA.restrictions.length;

    const zoningSummary = useMemo(() => {
        return `${DEMO_ZONING_DATA.zoningCode} — ${DEMO_ZONING_DATA.zoningName}`;
    }, []);

    const mapUrl = `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=17/${property.latitude}/${property.longitude}`;

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0b0b0b] text-white">
                <div className="flex min-h-screen items-center justify-center">
                    <div className="flex items-center gap-4 text-white/50">
                        <div className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />

                        <span>Loading zoning information...</span>
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

                <div className="absolute right-[-220px] top-[30%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />
            </div>

            {/* Hero */}
            <section className="border-b border-white/10 px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <Link
                        href="/tax-history"
                        className="inline-flex items-center gap-2 text-sm text-white/35 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />

                        Back to Tax History
                    </Link>

                    <p className="mb-7 mt-16 text-xs font-semibold tracking-[0.35em] text-white/35">
                        PROPERTY / ZONING INFORMATION
                    </p>

                    <h1 className="max-w-6xl text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.05em]">
                        Understand
                        <br />

                        <span className="text-white/35">
                            zoning.
                        </span>
                    </h1>

                    <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/45 md:text-xl">
                        Review zoning classification, permitted property use,
                        development restrictions, and planning authority information.
                    </p>

                    {/* Demo indicator */}
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

            {/* Zoning Overview */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        ZONING OVERVIEW
                    </p>

                    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={<Building2 size={19} />}
                            label="ZONING CODE"
                            value={DEMO_ZONING_DATA.zoningCode}
                        />

                        <StatCard
                            icon={<FileText size={19} />}
                            label="ZONE TYPE"
                            value={DEMO_ZONING_DATA.zoningName}
                        />

                        <StatCard
                            icon={<CheckCircle2 size={19} />}
                            label="STATUS"
                            value={DEMO_ZONING_DATA.zoningStatus}
                        />

                        <StatCard
                            icon={<ShieldCheck size={19} />}
                            label="PROPERTY USE"
                            value={DEMO_ZONING_DATA.propertyType}
                        />
                    </div>
                </div>
            </section>

            {/* Zoning Classification */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        ZONING CLASSIFICATION
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <div className="grid gap-10 md:grid-cols-2">
                            <div>
                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    ZONING CODE
                                </p>

                                <p className="mt-5 text-5xl font-light text-white/80">
                                    {DEMO_ZONING_DATA.zoningCode}
                                </p>

                                <p className="mt-3 text-lg text-white/55">
                                    {DEMO_ZONING_DATA.zoningName}
                                </p>

                                <p className="mt-4 text-sm text-white/30">
                                    {zoningSummary}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    PRIMARY PERMITTED USE
                                </p>

                                <p className="mt-5 text-2xl font-light text-white/75">
                                    {DEMO_ZONING_DATA.permittedUse}
                                </p>

                                <p className="mt-3 text-sm leading-7 text-white/35">
                                    The property's primary permitted use according to the
                                    demonstration zoning record.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Planning Authority */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        PLANNING AUTHORITY
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <div className="grid gap-10 md:grid-cols-3">
                            <InfoItem
                                label="AUTHORITY"
                                value={
                                    DEMO_ZONING_DATA.planningAuthority
                                }
                            />

                            <InfoItem
                                label="ZONING SOURCE"
                                value={DEMO_ZONING_DATA.zoningSource}
                            />

                            <InfoItem
                                label="LAST UPDATED"
                                value={DEMO_ZONING_DATA.lastUpdated}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Development Rules */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        DEVELOPMENT RULES
                    </p>

                    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="MAX BUILDING HEIGHT"
                            value={
                                DEMO_ZONING_DATA.developmentRules
                                    .maxBuildingHeight
                            }
                        />

                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="FRONT SETBACK"
                            value={
                                DEMO_ZONING_DATA.developmentRules
                                    .frontSetback
                            }
                        />

                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="SIDE SETBACK"
                            value={
                                DEMO_ZONING_DATA.developmentRules
                                    .sideSetback
                            }
                        />

                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="REAR SETBACK"
                            value={
                                DEMO_ZONING_DATA.developmentRules
                                    .rearSetback
                            }
                        />

                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="MAX LOT COVERAGE"
                            value={
                                DEMO_ZONING_DATA.developmentRules
                                    .maximumLotCoverage
                            }
                        />

                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="MINIMUM LOT SIZE"
                            value={
                                DEMO_ZONING_DATA.developmentRules
                                    .minimumLotSize
                            }
                        />
                    </div>
                </div>
            </section>

            {/* Permitted Activities */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                                PERMITTED ACTIVITIES
                            </p>

                            <h2 className="mt-4 text-3xl font-light text-white/80 md:text-5xl">
                                Allowed property uses
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/35">
                            <Users size={15} />
                            {permittedCount} demo permitted uses
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <div className="grid gap-4 md:grid-cols-2">
                            {DEMO_ZONING_DATA.permittedActivities.map(
                                (activity, index) => (
                                    <div
                                        key={`${activity}-${index}`}
                                        className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5"
                                    >
                                        <CheckCircle2
                                            size={18}
                                            className="shrink-0 text-emerald-400"
                                        />

                                        <span className="text-sm text-white/65">
                                            {activity}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Restrictions */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                                ZONING RESTRICTIONS
                            </p>

                            <h2 className="mt-4 text-3xl font-light text-white/80 md:text-5xl">
                                Development considerations
                            </h2>
                        </div>

                        <div className="text-xs text-white/35">
                            {restrictionCount} demo restrictions
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <div className="space-y-4">
                            {DEMO_ZONING_DATA.restrictions.map(
                                (restriction, index) => (
                                    <div
                                        key={`${restriction}-${index}`}
                                        className="flex items-start gap-4 border-b border-white/[0.06] pb-5 last:border-b-0 last:pb-0"
                                    >
                                        <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 text-xs text-white/40">
                                            {index + 1}
                                        </span>

                                        <p className="text-sm leading-7 text-white/55">
                                            {restriction}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Location */}
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

            {/* Next Research Stage */}
            <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <p className="text-xs font-semibold tracking-[0.3em] text-white/25">
                            NEXT RESEARCH STAGE
                        </p>

                        <h2 className="mt-4 text-3xl font-light text-white/80">
                            Flood Zone Verification
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/35">
                            Verify flood zone classification, flood hazard status, FEMA
                            map information, and related flood risk indicators.
                        </p>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                            {/* Flood Zone Button */}
                            <Link
                                href="/flood-zone"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-black"
                            >
                                View Flood Zone Verification
                                <ArrowRight size={16} />
                            </Link>

                            {/* Tax History */}
                            <Link
                                href="/tax-history"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 px-7 py-4 text-sm font-medium text-white/50 transition duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                            >
                                Tax History
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

                    <span>PROPERTY ZONING INFORMATION</span>
                </div>
            </footer>
        </main>
    );
}

/*
|--------------------------------------------------------------------------
| Detail Card
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
| Stat Card
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

/*
|--------------------------------------------------------------------------
| Info Item
|--------------------------------------------------------------------------
*/
function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-xs tracking-[0.22em] text-white/25">
                {label}
            </p>

            <p className="mt-4 text-lg font-light text-white/70">
                {value}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Rule Card
|--------------------------------------------------------------------------
*/
function RuleCard({ icon, label, value }) {
    return (
        <div className="bg-[#101010] p-7">
            <div className="flex items-center gap-3 text-white/40">
                {icon}

                <p className="text-xs tracking-[0.2em] text-white/25">
                    {label}
                </p>
            </div>

            <p className="mt-5 text-xl font-light text-white/75">
                {value}
            </p>
        </div>
    );
}