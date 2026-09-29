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
| DEFAULT ZONING DATA
|--------------------------------------------------------------------------
*/
const DEFAULT_ZONING_DATA = {
    zoningCode: "Not available",
    zoningName: "Not available",
    zoningStatus: "Not available",
    permittedUse: "Not available",
    propertyType: "Not available",
    planningAuthority: "Not available",
    zoningSource: "Not available",
    lastUpdated: "Not available",

    developmentRules: {
        maxBuildingHeight: "Not available",
        frontSetback: "Not available",
        sideSetback: "Not available",
        rearSetback: "Not available",
        maximumLotCoverage: "Not available",
        minimumLotSize: "Not available",
    },

    permittedActivities: [],
    restrictions: [],
};

/*
|--------------------------------------------------------------------------
| NORMALIZE BACKEND ZONING DATA
|--------------------------------------------------------------------------
*/
function normalizeZoningData(response) {
    const payload =
        response?.data ??
        response?.property ??
        response ??
        {};

    const zoning =
        payload.zoning ??
        payload.zoningInformation ??
        payload.zoning_information ??
        payload.zoningDetails ??
        payload.zoning_details ??
        payload;

    const property =
        zoning.property ??
        payload.property ??
        payload;

    const rules =
        zoning.developmentRules ??
        zoning.development_rules ??
        zoning.rules ??
        {};

    const permittedActivities =
        zoning.permittedActivities ??
        zoning.permitted_activities ??
        zoning.permittedUses ??
        zoning.permitted_uses ??
        [];

    const restrictions =
        zoning.restrictions ??
        zoning.zoningRestrictions ??
        zoning.zoning_restrictions ??
        [];

    return {
        zoningCode:
            zoning.zoningCode ??
            zoning.zoning_code ??
            zoning.zoneCode ??
            zoning.zone_code ??
            "Not available",

        zoningName:
            zoning.zoneType ??
            zoning.zoningName ??
            zoning.zoning_name ??
            zoning.zoneName ??
            zoning.zone_name ??
            "Not available",

        zoningStatus:
            typeof zoning.compliant === "boolean"
                ? zoning.compliant
                    ? "Compliant"
                    : "Non-Compliant"
                : zoning.zoningStatus ??
                zoning.zoning_status ??
                zoning.status ??
                "Not available",

        permittedUse:
            zoning.permittedUse ??
            zoning.permitted_use ??
            zoning.primaryPermittedUse ??
            zoning.primary_permitted_use ??
            "Not available",

        propertyType:
            zoning.propertyType ??
            zoning.property_type ??
            property.propertyType ??
            property.property_type ??
            payload.propertyType ??
            payload.property_type ??
            "Not available",

        planningAuthority:
            zoning.planningAuthority ??
            zoning.planning_authority ??
            "Not available",

        zoningSource:
            zoning.zoningSource ??
            zoning.zoning_source ??
            zoning.source ??
            "Not available",

        lastUpdated:
            zoning.lastUpdated ??
            zoning.last_updated ??
            "Not available",

        developmentRules: {
            maxBuildingHeight:
                rules.maxBuildingHeight ??
                rules.max_building_height ??
                "Not available",

            frontSetback:
                rules.frontSetback ??
                rules.front_setback ??
                "Not available",

            sideSetback:
                rules.sideSetback ??
                rules.side_setback ??
                "Not available",

            rearSetback:
                rules.rearSetback ??
                rules.rear_setback ??
                "Not available",

            maximumLotCoverage:
                rules.maximumLotCoverage ??
                rules.maximum_lot_coverage ??
                "Not available",

            minimumLotSize:
                rules.minimumLotSize ??
                rules.minimum_lot_size ??
                "Not available",
        },

        permittedActivities: Array.isArray(permittedActivities)
            ? permittedActivities.map((item) =>
                typeof item === "string"
                    ? item
                    : item.name ??
                    item.description ??
                    item.value ??
                    "Not available"
            )
            : [],

        restrictions: Array.isArray(restrictions)
            ? restrictions.map((item) =>
                typeof item === "string"
                    ? item
                    : item.description ??
                    item.name ??
                    item.value ??
                    "Not available"
            )
            : [],
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
| INFO ITEM
|--------------------------------------------------------------------------
*/
function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-xs tracking-[0.22em] text-white/25">
                {label}
            </p>

            <p className="mt-4 text-lg font-light text-white/70">
                {value || "Not available"}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| RULE CARD
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
                {value || "Not available"}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| ZONING PAGE
|--------------------------------------------------------------------------
*/
export default function ZoningPage() {
    const [property, setProperty] = useState(DEFAULT_PROPERTY);
    const [zoningData, setZoningData] = useState(
        DEFAULT_ZONING_DATA
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | FETCH PROPERTY AND ZONING DATA FROM BACKEND
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        let cancelled = false;

        async function loadZoningInformation() {
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

                if (!cancelled) {
                    setProperty({
                        ...DEFAULT_PROPERTY,
                        ...parsedProperty,
                        postalCode:
                            parsedProperty.postalCode ??
                            parsedProperty.zipCode ??
                            "",
                    });
                }

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
                        `Unable to load zoning information (HTTP ${response.status}).`
                    );
                }

                if (!cancelled) {
                    const payload =
                        responseData?.data ??
                        responseData?.property ??
                        responseData ??
                        {};

                    const zoningProperty =
                        payload.zoning?.property ??
                        payload.property ??
                        {};

                    setProperty((previous) => ({
                        ...previous,
                        ...parsedProperty,
                        ...payload,

                        address:
                            payload.address ??
                            zoningProperty.address ??
                            parsedProperty.address ??
                            "",

                        formattedAddress:
                            parsedProperty.formattedAddress ??
                            payload.formattedAddress ??
                            payload.address ??
                            zoningProperty.address ??
                            "",

                        city:
                            payload.city ??
                            zoningProperty.city ??
                            parsedProperty.city ??
                            "",

                        state:
                            payload.state ??
                            zoningProperty.state ??
                            parsedProperty.state ??
                            "",

                        postalCode:
                            payload.postalCode ??
                            payload.zipCode ??
                            zoningProperty.zipCode ??
                            zoningProperty.postalCode ??
                            parsedProperty.postalCode ??
                            parsedProperty.zipCode ??
                            "",

                        propertyId:
                            payload.id ??
                            parsedProperty.propertyDbId ??
                            parsedProperty.id ??
                            parsedProperty.propertyId ??
                            "",
                    }));

                    setZoningData(
                        normalizeZoningData(responseData)
                    );
                }
            } catch (err) {
                console.error(
                    "Zoning information loading error:",
                    err
                );

                if (!cancelled) {
                    setError(
                        err.message ||
                        "Unable to load zoning information."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadZoningInformation();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | DERIVED VALUES
    |--------------------------------------------------------------------------
    */
    const permittedCount =
        zoningData.permittedActivities.length;

    const restrictionCount =
        zoningData.restrictions.length;

    const zoningSummary = useMemo(() => {
        if (
            zoningData.zoningCode === "Not available" &&
            zoningData.zoningName === "Not available"
        ) {
            return "Not available";
        }

        return `${zoningData.zoningCode} — ${zoningData.zoningName}`;
    }, [zoningData.zoningCode, zoningData.zoningName]);

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
                            Loading zoning information...
                        </span>
                    </div>
                </div>
            </main>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | MAIN PAGE
    |--------------------------------------------------------------------------
    */
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

                    {/* Backend indicator */}
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
                            value={
                                property.propertyDbId ??
                                property.id ??
                                property.propertyId
                            }
                        />
                    </div>
                </div>
            </section>

            {/* Error Message */}
            {error && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px] rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-8">
                        <p className="text-xs font-semibold tracking-[0.25em] text-red-300/80">
                            ZONING INFORMATION COULD NOT BE LOADED
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
                            value={zoningData.zoningCode}
                        />

                        <StatCard
                            icon={<FileText size={19} />}
                            label="ZONE TYPE"
                            value={zoningData.zoningName}
                        />

                        <StatCard
                            icon={<CheckCircle2 size={19} />}
                            label="STATUS"
                            value={zoningData.zoningStatus}
                        />

                        <StatCard
                            icon={<ShieldCheck size={19} />}
                            label="PROPERTY USE"
                            value={zoningData.propertyType}
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
                                    {zoningData.zoningCode}
                                </p>

                                <p className="mt-3 text-lg text-white/55">
                                    {zoningData.zoningName}
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
                                    {zoningData.permittedUse}
                                </p>

                                <p className="mt-3 text-sm leading-7 text-white/35">
                                    The property's primary permitted use
                                    according to the zoning information
                                    returned by the backend.
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
                                value={zoningData.planningAuthority}
                            />

                            <InfoItem
                                label="ZONING SOURCE"
                                value={zoningData.zoningSource}
                            />

                            <InfoItem
                                label="LAST UPDATED"
                                value={zoningData.lastUpdated}
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
                            value={zoningData.developmentRules.maxBuildingHeight}
                        />

                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="FRONT SETBACK"
                            value={zoningData.developmentRules.frontSetback}
                        />

                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="SIDE SETBACK"
                            value={zoningData.developmentRules.sideSetback}
                        />

                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="REAR SETBACK"
                            value={zoningData.developmentRules.rearSetback}
                        />

                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="MAX LOT COVERAGE"
                            value={zoningData.developmentRules.maximumLotCoverage}
                        />

                        <RuleCard
                            icon={<Ruler size={18} />}
                            label="MINIMUM LOT SIZE"
                            value={zoningData.developmentRules.minimumLotSize}
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
                            {permittedCount} permitted uses
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        {permittedCount === 0 ? (
                            <p className="text-sm text-white/40">
                                No permitted activities were returned by
                                the backend.
                            </p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {zoningData.permittedActivities.map(
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
                        )}
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
                            {restrictionCount} restrictions
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        {restrictionCount === 0 ? (
                            <p className="text-sm text-white/40">
                                No zoning restrictions were returned by
                                the backend.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {zoningData.restrictions.map(
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
                        )}
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
                            <Link
                                href="/flood-zone"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-black"
                            >
                                View Flood Zone Verification
                                <ArrowRight size={16} />
                            </Link>

                            <Link
                                href="/tax-history"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 px-7 py-4 text-sm font-medium text-white/50 transition duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                            >
                                Tax History
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
                    <span>PROPERTY ZONING INFORMATION</span>
                </div>
            </footer>
        </main>
    );
}