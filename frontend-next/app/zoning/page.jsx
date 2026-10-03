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
    zoningCode: null,
    zoningName: null,
    zoningStatus: null,
    permittedUse: null,
    propertyType: null,
    planningAuthority: null,
    zoningSource: null,
    lastUpdated: null,

    developmentRules: {
        maxBuildingHeight: null,
        frontSetback: null,
        sideSetback: null,
        rearSetback: null,
        maximumLotCoverage: null,
        minimumLotSize: null,
    },

    permittedActivities: [],
    restrictions: [],
};

/*
|--------------------------------------------------------------------------
| CHECK WHETHER A VALUE SHOULD BE DISPLAYED
|--------------------------------------------------------------------------
*/

function hasValue(value) {
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

/*
|--------------------------------------------------------------------------
| CLEAN BACKEND VALUE
|--------------------------------------------------------------------------
*/

function cleanValue(value) {
    return hasValue(value) ? value : null;
}

/*
|--------------------------------------------------------------------------
| NORMALIZE ZONING DATA
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

    const normalizedPermittedActivities =
        Array.isArray(permittedActivities)
            ? permittedActivities
                .map((item) => {
                    if (typeof item === "string") {
                        return cleanValue(item);
                    }

                    if (!item || typeof item !== "object") {
                        return null;
                    }

                    return cleanValue(
                        item.name ??
                        item.description ??
                        item.value
                    );
                })
                .filter(hasValue)
            : [];

    const normalizedRestrictions =
        Array.isArray(restrictions)
            ? restrictions
                .map((item) => {
                    if (typeof item === "string") {
                        return cleanValue(item);
                    }

                    if (!item || typeof item !== "object") {
                        return null;
                    }

                    return cleanValue(
                        item.description ??
                        item.name ??
                        item.value
                    );
                })
                .filter(hasValue)
            : [];

    return {
        zoningCode: cleanValue(
            zoning.zoningCode ??
            zoning.zoning_code ??
            zoning.zoneCode ??
            zoning.zone_code
        ),

        zoningName: cleanValue(
            zoning.zoneType ??
            zoning.zoningName ??
            zoning.zoning_name ??
            zoning.zoneName ??
            zoning.zone_name
        ),

        zoningStatus: cleanValue(
            typeof zoning.compliant === "boolean"
                ? zoning.compliant
                    ? "Compliant"
                    : "Non-Compliant"
                : zoning.zoningStatus ??
                zoning.zoning_status ??
                zoning.status
        ),

        permittedUse: cleanValue(
            zoning.permittedUse ??
            zoning.permitted_use ??
            zoning.primaryPermittedUse ??
            zoning.primary_permitted_use
        ),

        propertyType: cleanValue(
            zoning.propertyType ??
            zoning.property_type ??
            property.propertyType ??
            property.property_type ??
            payload.propertyType ??
            payload.property_type
        ),

        planningAuthority: cleanValue(
            zoning.planningAuthority ??
            zoning.planning_authority
        ),

        zoningSource: cleanValue(
            zoning.zoningSource ??
            zoning.zoning_source ??
            zoning.source
        ),

        lastUpdated: cleanValue(
            zoning.lastUpdated ??
            zoning.last_updated
        ),

        developmentRules: {
            maxBuildingHeight: cleanValue(
                rules.maxBuildingHeight ??
                rules.max_building_height
            ),

            frontSetback: cleanValue(
                rules.frontSetback ??
                rules.front_setback
            ),

            sideSetback: cleanValue(
                rules.sideSetback ??
                rules.side_setback
            ),

            rearSetback: cleanValue(
                rules.rearSetback ??
                rules.rear_setback
            ),

            maximumLotCoverage: cleanValue(
                rules.maximumLotCoverage ??
                rules.maximum_lot_coverage
            ),

            minimumLotSize: cleanValue(
                rules.minimumLotSize ??
                rules.minimum_lot_size
            ),
        },

        permittedActivities:
            normalizedPermittedActivities,

        restrictions:
            normalizedRestrictions,
    };
}

/*
|--------------------------------------------------------------------------
| DETAIL CARD
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
                {value}
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
    if (!hasValue(value)) {
        return null;
    }

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
| RULE CARD
|--------------------------------------------------------------------------
*/

function RuleCard({ icon, label, value }) {
    if (!hasValue(value)) {
        return null;
    }

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

/*
|--------------------------------------------------------------------------
| ZONING PAGE
|--------------------------------------------------------------------------
*/

export default function ZoningPage() {
    const [property, setProperty] =
        useState(DEFAULT_PROPERTY);

    const [zoningData, setZoningData] =
        useState(DEFAULT_ZONING_DATA);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | LOAD ZONING INFORMATION
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let cancelled = false;

        async function loadZoningInformation() {
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

                        latitude:
                            payload.latitude ??
                            zoningProperty.latitude ??
                            parsedProperty.latitude ??
                            null,

                        longitude:
                            payload.longitude ??
                            zoningProperty.longitude ??
                            parsedProperty.longitude ??
                            null,
                    }));

                    setZoningData(
                        normalizeZoningData(
                            responseData
                        )
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
        const parts = [];

        if (hasValue(zoningData.zoningCode)) {
            parts.push(zoningData.zoningCode);
        }

        if (hasValue(zoningData.zoningName)) {
            parts.push(zoningData.zoningName);
        }

        return parts.join(" — ");
    }, [
        zoningData.zoningCode,
        zoningData.zoningName,
    ]);

    const hasCoordinates =
        hasValue(property.latitude) &&
        hasValue(property.longitude);

    const mapUrl = hasCoordinates
        ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=17/${property.latitude}/${property.longitude}`
        : null;

    const hasSelectedPropertyDetails = [
        property.city,
        property.state,
        property.postalCode,
        property.propertyDbId ??
        property.id ??
        property.propertyId,
    ].some(hasValue);

    const hasZoningOverview = [
        zoningData.zoningCode,
        zoningData.zoningName,
        zoningData.zoningStatus,
        zoningData.propertyType,
    ].some(hasValue);

    const hasZoningClassification =
        hasValue(zoningData.zoningCode) ||
        hasValue(zoningData.zoningName) ||
        hasValue(zoningData.permittedUse);

    const hasPlanningAuthority = [
        zoningData.planningAuthority,
        zoningData.zoningSource,
        zoningData.lastUpdated,
    ].some(hasValue);

    const hasDevelopmentRules = [
        zoningData.developmentRules
            .maxBuildingHeight,

        zoningData.developmentRules
            .frontSetback,

        zoningData.developmentRules
            .sideSetback,

        zoningData.developmentRules
            .rearSetback,

        zoningData.developmentRules
            .maximumLotCoverage,

        zoningData.developmentRules
            .minimumLotSize,
    ].some(hasValue);

    /*
    |--------------------------------------------------------------------------
    | LOADING
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

            {/* BACKGROUND */}

            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

                <div className="absolute left-[-200px] top-[5%] h-[550px] w-[550px] rounded-full bg-orange-500/[0.06] blur-[150px]" />

                <div className="absolute right-[-220px] top-[30%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />

            </div>

            {/* HERO */}

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

                    <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.04] px-4 py-2 text-xs text-sky-300/70">

                        <span className="h-2 w-2 rounded-full bg-sky-400" />

                        BACKEND DATA

                    </div>

                </div>

            </section>

            {/* SELECTED PROPERTY */}

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

                    {hasSelectedPropertyDetails && (
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
                                value={
                                    property.postalCode
                                }
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
                    )}

                </div>

            </section>

            {/* ERROR */}

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

            {/* ZONING OVERVIEW */}

            {hasZoningOverview && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">

                    <div className="mx-auto max-w-[1400px]">

                        <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                            ZONING OVERVIEW
                        </p>

                        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">

                            <StatCard
                                icon={
                                    <Building2 size={19} />
                                }
                                label="ZONING CODE"
                                value={
                                    zoningData.zoningCode
                                }
                            />

                            <StatCard
                                icon={
                                    <FileText size={19} />
                                }
                                label="ZONE TYPE"
                                value={
                                    zoningData.zoningName
                                }
                            />

                            <StatCard
                                icon={
                                    <CheckCircle2 size={19} />
                                }
                                label="STATUS"
                                value={
                                    zoningData.zoningStatus
                                }
                            />

                            <StatCard
                                icon={
                                    <ShieldCheck size={19} />
                                }
                                label="PROPERTY USE"
                                value={
                                    zoningData.propertyType
                                }
                            />

                        </div>

                    </div>

                </section>
            )}

            {/* ZONING CLASSIFICATION */}

            {hasZoningClassification && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">

                    <div className="mx-auto max-w-[1400px]">

                        <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                            ZONING CLASSIFICATION
                        </p>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">

                            <div
                                className={`grid gap-10 ${hasValue(
                                    zoningData.permittedUse
                                )
                                        ? "md:grid-cols-2"
                                        : "md:grid-cols-1"
                                    }`}
                            >

                                {(hasValue(
                                    zoningData.zoningCode
                                ) ||
                                    hasValue(
                                        zoningData.zoningName
                                    )) && (
                                        <div>

                                            {hasValue(
                                                zoningData.zoningCode
                                            ) && (
                                                    <>
                                                        <p className="text-xs tracking-[0.25em] text-white/25">
                                                            ZONING CODE
                                                        </p>

                                                        <p className="mt-5 text-5xl font-light text-white/80">
                                                            {
                                                                zoningData.zoningCode
                                                            }
                                                        </p>
                                                    </>
                                                )}

                                            {hasValue(
                                                zoningData.zoningName
                                            ) && (
                                                    <p className="mt-3 text-lg text-white/55">
                                                        {
                                                            zoningData.zoningName
                                                        }
                                                    </p>
                                                )}

                                            {hasValue(
                                                zoningSummary
                                            ) && (
                                                    <p className="mt-4 text-sm text-white/30">
                                                        {
                                                            zoningSummary
                                                        }
                                                    </p>
                                                )}

                                        </div>
                                    )}

                                {hasValue(
                                    zoningData.permittedUse
                                ) && (
                                        <div>

                                            <p className="text-xs tracking-[0.25em] text-white/25">
                                                PRIMARY PERMITTED USE
                                            </p>

                                            <p className="mt-5 text-2xl font-light text-white/75">
                                                {
                                                    zoningData.permittedUse
                                                }
                                            </p>

                                            <p className="mt-3 text-sm leading-7 text-white/35">
                                                The property&apos;s primary
                                                permitted use according to
                                                the zoning information returned
                                                by the backend.
                                            </p>

                                        </div>
                                    )}

                            </div>

                        </div>

                    </div>

                </section>
            )}

            {/* PLANNING AUTHORITY */}

            {hasPlanningAuthority && (
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
                                        zoningData.planningAuthority
                                    }
                                />

                                <InfoItem
                                    label="ZONING SOURCE"
                                    value={
                                        zoningData.zoningSource
                                    }
                                />

                                <InfoItem
                                    label="LAST UPDATED"
                                    value={
                                        zoningData.lastUpdated
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </section>
            )}

            {/* DEVELOPMENT RULES */}

            {hasDevelopmentRules && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">

                    <div className="mx-auto max-w-[1400px]">

                        <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                            DEVELOPMENT RULES
                        </p>

                        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">

                            <RuleCard
                                icon={
                                    <Ruler size={18} />
                                }
                                label="MAX BUILDING HEIGHT"
                                value={
                                    zoningData
                                        .developmentRules
                                        .maxBuildingHeight
                                }
                            />

                            <RuleCard
                                icon={
                                    <Ruler size={18} />
                                }
                                label="FRONT SETBACK"
                                value={
                                    zoningData
                                        .developmentRules
                                        .frontSetback
                                }
                            />

                            <RuleCard
                                icon={
                                    <Ruler size={18} />
                                }
                                label="SIDE SETBACK"
                                value={
                                    zoningData
                                        .developmentRules
                                        .sideSetback
                                }
                            />

                            <RuleCard
                                icon={
                                    <Ruler size={18} />
                                }
                                label="REAR SETBACK"
                                value={
                                    zoningData
                                        .developmentRules
                                        .rearSetback
                                }
                            />

                            <RuleCard
                                icon={
                                    <Ruler size={18} />
                                }
                                label="MAX LOT COVERAGE"
                                value={
                                    zoningData
                                        .developmentRules
                                        .maximumLotCoverage
                                }
                            />

                            <RuleCard
                                icon={
                                    <Ruler size={18} />
                                }
                                label="MINIMUM LOT SIZE"
                                value={
                                    zoningData
                                        .developmentRules
                                        .minimumLotSize
                                }
                            />

                        </div>

                    </div>

                </section>
            )}

            {/* PERMITTED ACTIVITIES */}

            {permittedCount > 0 && (
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

                        </div>

                    </div>

                </section>
            )}

            {/* RESTRICTIONS */}

            {restrictionCount > 0 && (
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

                        </div>

                    </div>

                </section>
            )}

            {/* PROPERTY LOCATION */}

            {(hasValue(
                property.formattedAddress
            ) ||
                hasValue(property.address) ||
                hasCoordinates) && (
                    <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">

                        <div className="mx-auto max-w-[1400px]">

                            <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                                PROPERTY LOCATION
                            </p>

                            <div
                                className={`rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10 ${hasCoordinates
                                        ? "grid gap-10 md:grid-cols-2"
                                        : ""
                                    }`}
                            >

                                {(hasValue(
                                    property.formattedAddress
                                ) ||
                                    hasValue(
                                        property.address
                                    )) && (
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
                                                    property.address}
                                            </p>

                                        </div>
                                    )}

                                {hasCoordinates && (
                                    <div>

                                        <p className="text-xs tracking-[0.25em] text-white/25">
                                            MAP LOCATION
                                        </p>

                                        <p className="mt-5 text-sm text-white/40">
                                            {
                                                property.latitude
                                            }
                                            ,{" "}
                                            {
                                                property.longitude
                                            }
                                        </p>

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
                                )}

                            </div>

                        </div>

                    </section>
                )}

            {/* NEXT RESEARCH STAGE */}

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
                            Verify flood zone classification, flood hazard status,
                            FEMA map information, and related flood risk indicators.
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

            {/* FOOTER */}

            <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">

                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">

                    <span>
                        PROP DUE
                    </span>

                    <span>
                        PROPERTY ZONING INFORMATION
                    </span>

                </div>

            </footer>

        </main>
    );
}