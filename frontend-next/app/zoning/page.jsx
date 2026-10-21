'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    MapPin,
    Ruler,
    Users,
} from 'lucide-react'

const API_URL = 'http://localhost:8080/api'
const DISPLAY_FONT = "'Syne', 'Arial Black', system-ui, sans-serif"
const BODY_FONT =
    "'Red Hat Display', system-ui, -apple-system, 'Segoe UI', sans-serif"

const DEFAULT_PROPERTY = {
    formattedAddress: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    propertyId: '',
    latitude: null,
    longitude: null,
}

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
}

function hasValue(value) {
    if (value === null || value === undefined) return false

    if (typeof value === 'string') {
        const cleaned = value.trim().toLowerCase()

        if (
            cleaned === '' ||
            cleaned === 'not available' ||
            cleaned === 'n/a' ||
            cleaned === 'na' ||
            cleaned === 'null' ||
            cleaned === 'undefined'
        ) {
            return false
        }
    }

    return true
}

function cleanValue(value) {
    return hasValue(value) ? value : null
}

function normalizeZoningData(response) {
    const payload =
        response?.data ??
        response?.property ??
        response ??
        {}

    const zoning =
        payload.zoning ??
        payload.zoningInformation ??
        payload.zoning_information ??
        payload.zoningDetails ??
        payload.zoning_details ??
        payload

    const property =
        zoning.property ??
        payload.property ??
        payload

    const rules =
        zoning.developmentRules ??
        zoning.development_rules ??
        zoning.rules ??
        {}

    const permittedActivities =
        zoning.permittedActivities ??
        zoning.permitted_activities ??
        zoning.permittedUses ??
        zoning.permitted_uses ??
        []

    const restrictions =
        zoning.restrictions ??
        zoning.zoningRestrictions ??
        zoning.zoning_restrictions ??
        []

    const normalizedPermittedActivities = Array.isArray(permittedActivities)
        ? permittedActivities
            .map((item) => {
                if (typeof item === 'string') {
                    return cleanValue(item)
                }

                if (!item || typeof item !== 'object') {
                    return null
                }

                return cleanValue(
                    item.name ??
                    item.description ??
                    item.value
                )
            })
            .filter(hasValue)
        : []

    const normalizedRestrictions = Array.isArray(restrictions)
        ? restrictions
            .map((item) => {
                if (typeof item === 'string') {
                    return cleanValue(item)
                }

                if (!item || typeof item !== 'object') {
                    return null
                }

                return cleanValue(
                    item.description ??
                    item.name ??
                    item.value
                )
            })
            .filter(hasValue)
        : []

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
            typeof zoning.compliant === 'boolean'
                ? zoning.compliant
                    ? 'Compliant'
                    : 'Non-Compliant'
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
        permittedActivities: normalizedPermittedActivities,
        restrictions: normalizedRestrictions,
    }
}

function DetailCard({ label, value }) {
    if (!hasValue(value)) return null

    return (
        <div className="bg-[#341D47] p-6">
            <p className="text-sm text-white/65">{label}</p>
            <p className="mt-3 break-words text-base font-semibold text-white">
                {String(value)}
            </p>
        </div>
    )
}

function InfoItem({ label, value }) {
    if (!hasValue(value)) return null

    return (
        <div>
            <p className="text-sm font-medium text-white/65">{label}</p>
            <p className="mt-3 break-words text-lg font-semibold text-white">
                {String(value)}
            </p>
        </div>
    )
}

function RuleCard({ icon, label, value }) {
    if (!hasValue(value)) return null

    return (
        <div className="bg-[#341D47] p-6 transition-colors hover:bg-[#3b2452]">
            <div className="flex items-center gap-3 text-[#D174D2]">
                {icon}
                <p className="text-sm font-semibold text-[#D174D2]">
                    {label}
                </p>
            </div>
            <p className="mt-4 break-words text-lg font-semibold text-white">
                {String(value)}
            </p>
        </div>
    )
}

export default function ZoningPage() {
    const [property, setProperty] = useState(DEFAULT_PROPERTY)
    const [zoningData, setZoningData] = useState(DEFAULT_ZONING_DATA)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadZoningInformation() {
            try {
                setLoading(true)
                setError('')

                const savedProperty =
                    sessionStorage.getItem('selectedProperty')

                if (!savedProperty) {
                    throw new Error(
                        'No property is selected. Please select a property from Property Search.'
                    )
                }

                const parsedProperty = JSON.parse(savedProperty)

                if (!cancelled) {
                    setProperty({
                        ...DEFAULT_PROPERTY,
                        ...parsedProperty,
                        postalCode:
                            parsedProperty.postalCode ??
                            parsedProperty.zipCode ??
                            '',
                    })
                }

                const rawId =
                    parsedProperty.propertyDbId ??
                    parsedProperty.id ??
                    parsedProperty.propertyId

                if (
                    rawId === null ||
                    rawId === undefined ||
                    !/^\d+$/.test(String(rawId))
                ) {
                    throw new Error(
                        'A valid numeric property database ID was not found. Please select a property saved by the backend.'
                    )
                }

                const token = localStorage.getItem('token')

                const response = await fetch(
                    `${API_URL}/properties/${encodeURIComponent(rawId)}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token
                                ? { Authorization: `Bearer ${token}` }
                                : {}),
                        },
                    }
                )

                const responseData = await response
                    .json()
                    .catch(() => null)

                if (!response.ok) {
                    throw new Error(
                        responseData?.message ||
                        responseData?.error?.message ||
                        `Unable to load zoning information (HTTP ${response.status}).`
                    )
                }

                if (!cancelled) {
                    const payload =
                        responseData?.data ??
                        responseData?.property ??
                        responseData ??
                        {}

                    const zoningProperty =
                        payload.zoning?.property ??
                        payload.property ??
                        {}

                    setProperty((previous) => ({
                        ...previous,
                        ...parsedProperty,
                        ...payload,
                        address:
                            payload.address ??
                            zoningProperty.address ??
                            parsedProperty.address ??
                            '',
                        formattedAddress:
                            parsedProperty.formattedAddress ??
                            payload.formattedAddress ??
                            payload.address ??
                            zoningProperty.address ??
                            '',
                        city:
                            payload.city ??
                            zoningProperty.city ??
                            parsedProperty.city ??
                            '',
                        state:
                            payload.state ??
                            zoningProperty.state ??
                            parsedProperty.state ??
                            '',
                        postalCode:
                            payload.postalCode ??
                            payload.zipCode ??
                            zoningProperty.zipCode ??
                            zoningProperty.postalCode ??
                            parsedProperty.postalCode ??
                            parsedProperty.zipCode ??
                            '',
                        propertyId:
                            payload.id ??
                            parsedProperty.propertyDbId ??
                            parsedProperty.id ??
                            parsedProperty.propertyId ??
                            '',
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
                    }))

                    setZoningData(normalizeZoningData(responseData))
                }
            } catch (err) {
                console.error('Zoning information loading error:', err)

                if (!cancelled) {
                    setError(
                        err.message || 'Unable to load zoning information.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadZoningInformation()

        return () => {
            cancelled = true
        }
    }, [])

    const permittedCount = zoningData.permittedActivities.length
    const restrictionCount = zoningData.restrictions.length

    const zoningSummary = useMemo(() => {
        const parts = []

        if (hasValue(zoningData.zoningCode)) {
            parts.push(zoningData.zoningCode)
        }

        if (hasValue(zoningData.zoningName)) {
            parts.push(zoningData.zoningName)
        }

        return parts.join(' — ')
    }, [zoningData.zoningCode, zoningData.zoningName])

    const hasCoordinates =
        hasValue(property.latitude) &&
        hasValue(property.longitude)

    const mapUrl = hasCoordinates
        ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=17/${property.latitude}/${property.longitude}`
        : null

    const propertyId =
        property.propertyDbId ??
        property.id ??
        property.propertyId

    const hasSelectedPropertyDetails = [
        property.city,
        property.state,
        property.postalCode,
        propertyId,
    ].some(hasValue)

    const hasZoningOverview = [
        zoningData.zoningCode,
        zoningData.zoningName,
        zoningData.zoningStatus,
        zoningData.propertyType,
    ].some(hasValue)

    const hasZoningClassification =
        hasValue(zoningData.zoningCode) ||
        hasValue(zoningData.zoningName) ||
        hasValue(zoningData.permittedUse)

    const hasPlanningAuthority = [
        zoningData.planningAuthority,
        zoningData.zoningSource,
        zoningData.lastUpdated,
    ].some(hasValue)

    const hasDevelopmentRules = [
        zoningData.developmentRules.maxBuildingHeight,
        zoningData.developmentRules.frontSetback,
        zoningData.developmentRules.sideSetback,
        zoningData.developmentRules.rearSetback,
        zoningData.developmentRules.maximumLotCoverage,
        zoningData.developmentRules.minimumLotSize,
    ].some(hasValue)

    if (loading) {
        return (
            <main
                className="min-h-screen text-white"
                style={{ fontFamily: BODY_FONT }}
            >
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(135deg,#3F567F_0%,#412653_50%,#2B1740_100%)]" />
                <div className="flex min-h-screen items-center justify-center">
                    <div className="flex items-center gap-4 text-white/70">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-[#D174D2]" />
                        <span>Loading zoning information...</span>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main
            className="min-h-screen text-white selection:bg-[#D174D2]/40"
            style={{ fontFamily: BODY_FONT }}
        >
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

            {/* Background */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(135deg,#3F567F_0%,#412653_50%,#2B1740_100%)]">
                <div className="absolute -left-40 bottom-[-10%] h-[600px] w-[600px] rounded-full bg-[#E0563F]/25 blur-[160px]" />
            </div>

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-white/15 px-6 pb-24 pt-32 sm:px-10 md:px-16 lg:px-24">
                <div className="relative mx-auto max-w-[1400px]">
                    <Link
                        href="/property-search"
                        className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Back to Property Search
                    </Link>

                    <p className="mb-8 mt-16 block w-fit rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#D174D2]" />
                        Property zoning
                    </p>

                    <h1
                        className="max-w-5xl text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-white"
                        style={{ fontFamily: DISPLAY_FONT }}
                    >
                        Understand
                        <br />
                        <span className="text-[#D174D2]">zoning rules.</span>
                    </h1>

                    <p className="mt-10 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
                        Review zoning classification, permitted uses, development
                        rules, and planning information for the selected property.
                    </p>
                </div>
            </section>

            {/* Error */}
            {error && (
                <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px] rounded-2xl border border-[#E0563F]/60 bg-[#E0563F]/15 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                        <h2
                            className="text-2xl font-bold text-white"
                            style={{ fontFamily: DISPLAY_FONT }}
                        >
                            Zoning information unavailable
                        </h2>
                        <p className="mt-4 text-base leading-7 text-white/80">
                            {error}
                        </p>
                        <Link
                            href="/property-search"
                            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#E0563F] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#c94a34] focus-visible:ring-4 focus-visible:ring-white/40"
                        >
                            <ArrowLeft size={16} />
                            Go to Property Search
                        </Link>
                    </div>
                </section>
            )}

            {!error && (
                <>
                    {/* Property overview */}
                    <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
                        <div className="mx-auto max-w-[1400px]">
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-[#D174D2]" />
                                <span className="text-sm font-semibold text-[#D174D2]">
                                    Selected property
                                </span>
                            </div>

                            <h2
                                className="mt-6 max-w-5xl text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl"
                                style={{ fontFamily: DISPLAY_FONT }}
                            >
                                {property.formattedAddress ||
                                    property.address ||
                                    'Selected Property'}
                            </h2>

                            {hasSelectedPropertyDetails && (
                                <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-4">
                                    <DetailCard label="City" value={property.city} />
                                    <DetailCard label="State" value={property.state} />
                                    <DetailCard
                                        label="Postal code"
                                        value={property.postalCode}
                                    />
                                    <DetailCard label="Property ID" value={propertyId} />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Zoning overview: three columns leave no unused fourth box. */}
                    {hasZoningOverview && (
                        <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                            <div className="mx-auto max-w-[1400px]">
                                <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                                    Zoning overview
                                </p>
                                <div className="grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-3">
                                    <DetailCard
                                        label="Zoning code"
                                        value={zoningData.zoningCode}
                                    />
                                    <DetailCard
                                        label="Zone name"
                                        value={zoningData.zoningName}
                                    />
                                    <DetailCard
                                        label="Zoning status"
                                        value={zoningData.zoningStatus}
                                    />
                                    <DetailCard
                                        label="Property type"
                                        value={zoningData.propertyType}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Zoning classification */}
                    {hasZoningClassification && (
                        <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                            <div className="mx-auto max-w-[1400px]">
                                <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                                    Zoning classification
                                </p>

                                <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                                    <div className="grid gap-10 md:grid-cols-2">
                                        {(hasValue(zoningData.zoningCode) ||
                                            hasValue(zoningData.zoningName)) && (
                                                <div>
                                                    <p className="text-sm font-semibold text-[#D174D2]">
                                                        Zoning designation
                                                    </p>
                                                    {hasValue(zoningData.zoningCode) && (
                                                        <h3
                                                            className="mt-5 text-3xl font-bold text-white"
                                                            style={{ fontFamily: DISPLAY_FONT }}
                                                        >
                                                            {zoningData.zoningCode}
                                                        </h3>
                                                    )}
                                                    {hasValue(zoningData.zoningName) && (
                                                        <p className="mt-3 text-lg text-white/80">
                                                            {zoningData.zoningName}
                                                        </p>
                                                    )}
                                                    {hasValue(zoningSummary) && (
                                                        <p className="mt-4 text-sm text-white/65">
                                                            {zoningSummary}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                        {hasValue(zoningData.permittedUse) && (
                                            <div>
                                                <p className="text-sm font-semibold text-[#D174D2]">
                                                    Primary permitted use
                                                </p>
                                                <p
                                                    className="mt-5 text-2xl font-bold text-white"
                                                    style={{ fontFamily: DISPLAY_FONT }}
                                                >
                                                    {zoningData.permittedUse}
                                                </p>
                                                <p className="mt-3 text-sm leading-7 text-white/70">
                                                    The property&apos;s primary permitted use according
                                                    to the zoning information returned by the backend.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Planning authority */}
                    {hasPlanningAuthority && (
                        <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                            <div className="mx-auto max-w-[1400px]">
                                <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                                    Planning authority
                                </p>
                                <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                                        <InfoItem
                                            label="Authority"
                                            value={zoningData.planningAuthority}
                                        />
                                        <InfoItem
                                            label="Zoning source"
                                            value={zoningData.zoningSource}
                                        />
                                        <InfoItem
                                            label="Last updated"
                                            value={zoningData.lastUpdated}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Development rules */}
                    {hasDevelopmentRules && (
                        <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                            <div className="mx-auto max-w-[1400px]">
                                <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                                    Development rules
                                </p>
                                <div className="grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-3">
                                    <RuleCard
                                        icon={<Ruler size={18} />}
                                        label="Max building height"
                                        value={zoningData.developmentRules.maxBuildingHeight}
                                    />
                                    <RuleCard
                                        icon={<Ruler size={18} />}
                                        label="Front setback"
                                        value={zoningData.developmentRules.frontSetback}
                                    />
                                    <RuleCard
                                        icon={<Ruler size={18} />}
                                        label="Side setback"
                                        value={zoningData.developmentRules.sideSetback}
                                    />
                                    <RuleCard
                                        icon={<Ruler size={18} />}
                                        label="Rear setback"
                                        value={zoningData.developmentRules.rearSetback}
                                    />
                                    <RuleCard
                                        icon={<Ruler size={18} />}
                                        label="Max lot coverage"
                                        value={zoningData.developmentRules.maximumLotCoverage}
                                    />
                                    <RuleCard
                                        icon={<Ruler size={18} />}
                                        label="Minimum lot size"
                                        value={zoningData.developmentRules.minimumLotSize}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Permitted activities */}
                    {permittedCount > 0 && (
                        <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                            <div className="mx-auto max-w-[1400px]">
                                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                                    <div>
                                        <p className="text-sm font-semibold text-[#D174D2]">
                                            Permitted activities
                                        </p>
                                        <h2
                                            className="mt-4 text-3xl font-extrabold text-white md:text-4xl"
                                            style={{ fontFamily: DISPLAY_FONT }}
                                        >
                                            Allowed property uses
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/75">
                                        <Users size={16} className="text-[#D174D2]" />
                                        {permittedCount} permitted uses
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {zoningData.permittedActivities.map(
                                            (activity, index) => (
                                                <div
                                                    key={`${activity}-${index}`}
                                                    className="flex items-center gap-4 rounded-xl border border-white/20 bg-[#341D47] p-5 transition-colors hover:bg-[#3b2452]"
                                                >
                                                    <CheckCircle2
                                                        size={18}
                                                        className="shrink-0 text-[#D174D2]"
                                                    />
                                                    <span className="text-sm font-medium text-white">
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

                    {/* Restrictions */}
                    {restrictionCount > 0 && (
                        <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                            <div className="mx-auto max-w-[1400px]">
                                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                                    <div>
                                        <p className="text-sm font-semibold text-[#D174D2]">
                                            Zoning restrictions
                                        </p>
                                        <h2
                                            className="mt-4 text-3xl font-extrabold text-white md:text-4xl"
                                            style={{ fontFamily: DISPLAY_FONT }}
                                        >
                                            Development considerations
                                        </h2>
                                    </div>
                                    <div className="text-sm text-white/75">
                                        {restrictionCount} restrictions
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                                    <div className="space-y-4">
                                        {zoningData.restrictions.map(
                                            (restriction, index) => (
                                                <div
                                                    key={`${restriction}-${index}`}
                                                    className="flex items-start gap-4 border-b border-white/15 pb-5 last:border-b-0 last:pb-0"
                                                >
                                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#D174D2]/50 text-xs text-[#D174D2]">
                                                        {index + 1}
                                                    </span>
                                                    <p className="text-sm leading-7 text-white/85">
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

                    {/* Property location */}
                    {(hasValue(property.formattedAddress) ||
                        hasValue(property.address) ||
                        hasCoordinates) && (
                            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                                <div className="mx-auto max-w-[1400px]">
                                    <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                                        Property location
                                    </p>

                                    <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                                        <p className="text-sm font-medium text-white/70">
                                            Map location
                                        </p>
                                        <p className="mt-4 break-words text-lg text-white">
                                            {property.formattedAddress ||
                                                property.address ||
                                                `${property.latitude}, ${property.longitude}`}
                                        </p>

                                        {mapUrl && (
                                            <a
                                                href={mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#412653] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D174D2]/50"
                                            >
                                                Open map <span>↗</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                    {/* Next research stage */}
                    <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
                        <div className="mx-auto max-w-[1400px]">
                            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#3F567F]/80 via-[#412653]/80 to-[#2B1740]/90 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-12 lg:p-14">
                                <p className="text-sm font-semibold text-[#D174D2]">
                                    Next research stage
                                </p>
                                <h2
                                    className="mt-4 text-3xl font-extrabold text-white md:text-5xl"
                                    style={{ fontFamily: DISPLAY_FONT }}
                                >
                                    Flood zone verification
                                </h2>
                                <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
                                    Verify flood zone classification, flood hazard status,
                                    FEMA map information, and related flood risk indicators.
                                </p>

                                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                                    <Link
                                        href="/flood-zone"
                                        className="inline-flex items-center justify-center gap-3 rounded-full bg-[#E0563F] px-8 py-4 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(224,86,63,0.7)] transition duration-200 hover:bg-[#c94a34] focus-visible:ring-4 focus-visible:ring-white/40"
                                    >
                                        View Flood Zone Verification
                                        <ArrowRight size={16} />
                                    </Link>
                                    <Link
                                        href="/tax-history"
                                        className="inline-flex items-center justify-center gap-3 rounded-full border border-white/50 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition duration-200 hover:bg-white hover:text-[#412653] focus-visible:ring-4 focus-visible:ring-[#D174D2]/50"
                                    >
                                        Tax History
                                        <ArrowLeft size={16} />
                                    </Link>
                                    <Link
                                        href="/property-search"
                                        className="inline-flex items-center justify-center gap-3 rounded-full border border-white/50 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition duration-200 hover:bg-white hover:text-[#412653] focus-visible:ring-4 focus-visible:ring-[#D174D2]/50"
                                    >
                                        Property Search
                                        <ArrowLeft size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* Footer */}
            <footer className="border-t border-white/15 bg-[#2B1740]/60 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs font-medium text-white/60 md:flex-row">
                    <span>PROP DUE</span>
                    <span>Property zoning information</span>
                </div>
            </footer>
        </main>
    )
}