
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Droplets,
    MapPin,
    ShieldCheck,
    Waves,
} from 'lucide-react'

const API_URL = 'http://localhost:8080/api'
const DISPLAY_FONT = "'Syne', 'Arial Black', system-ui, sans-serif"
const BODY_FONT = "'Red Hat Display', system-ui, -apple-system, 'Segoe UI', sans-serif"

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

const DEFAULT_FLOOD_DATA = {
    floodZone: '',
    zoneDescription: '',
    riskLevel: '',
    verificationStatus: '',
    specialFloodHazardArea: '',
    baseFloodElevation: '',
    floodInsuranceRequired: '',
    mapSource: '',
    mapPanel: '',
    lastUpdated: '',
    waterBody: '',
    nearestWaterBodyDistance: '',
    verificationSummary: '',
    recommendations: [],
    riskDescription: '',
}

function cleanValue(value) {
    if (value === null || value === undefined || value === '') return ''

    if (typeof value === 'string') {
        const cleaned = value.trim()
        const lower = cleaned.toLowerCase()

        if (
            !cleaned ||
            lower === 'not available' ||
            lower === 'n/a' ||
            lower === 'na' ||
            lower === 'null' ||
            lower === 'undefined'
        ) {
            return ''
        }

        return cleaned
    }

    return value
}

function hasValue(value) {
    return cleanValue(value) !== ''
}

function normalizeFloodData(response) {
    const payload = response?.data ?? response?.property ?? response ?? {}
    const flood = payload.floodZone ?? payload.flood_zone ?? payload

    const rawRisk = cleanValue(flood.riskLevel ?? flood.risk_level)
    const rawZone = cleanValue(
        flood.zone ?? flood.floodZone ?? flood.flood_zone
    )

    const risk = String(rawRisk || '')
    const zone = String(rawZone || '')
    const riskLower = risk.toLowerCase()

    let riskDescription = ''

    if (riskLower === 'low') {
        riskDescription = 'Low Flood Risk'
    } else if (riskLower === 'medium' || riskLower === 'moderate') {
        riskDescription = 'Medium Flood Risk'
    } else if (riskLower === 'high') {
        riskDescription = 'High Flood Risk'
    } else if (riskLower === 'very high' || riskLower === 'severe') {
        riskDescription = 'Very High Flood Risk'
    } else if (risk) {
        riskDescription = `${risk} Flood Risk`
    }

    const recommendations = Array.isArray(flood.recommendations)
        ? flood.recommendations.map(cleanValue).filter(Boolean)
        : []

    return {
        floodZone: zone,
        zoneDescription: cleanValue(
            flood.zoneDescription ?? flood.zone_description
        ),
        riskLevel: risk,
        verificationStatus: cleanValue(
            flood.verificationStatus ?? flood.verification_status
        ),
        specialFloodHazardArea: cleanValue(
            flood.specialFloodHazardArea ?? flood.special_flood_hazard_area
        ),
        baseFloodElevation: cleanValue(
            flood.baseFloodElevation ?? flood.base_flood_elevation
        ),
        floodInsuranceRequired: cleanValue(
            flood.floodInsuranceRequired ?? flood.flood_insurance_required
        ),
        mapSource: cleanValue(flood.mapSource ?? flood.map_source),
        mapPanel: cleanValue(flood.mapPanel ?? flood.map_panel),
        lastUpdated: cleanValue(flood.lastUpdated ?? flood.last_updated),
        waterBody: cleanValue(flood.waterBody ?? flood.water_body),
        nearestWaterBodyDistance: cleanValue(
            flood.nearestWaterBodyDistance ??
            flood.nearest_water_body_distance
        ),
        verificationSummary: cleanValue(
            flood.verificationSummary ?? flood.verification_summary
        ),
        recommendations,
        riskDescription,
    }
}

function SectionEyebrow({ children }) {
    return (
        <p className="text-sm font-semibold tracking-[0.12em] text-[#D174D2]">
            {children}
        </p>
    )
}

function DetailCard({ label, value }) {
    if (!hasValue(value)) return null

    return (
        <div className="min-w-0 bg-[#341D47] p-6 transition-colors duration-200 hover:bg-[#3b2452]">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
                {label}
            </p>

            <p className="mt-3 break-words text-base font-semibold text-white">
                {String(cleanValue(value))}
            </p>
        </div>
    )
}

function StatCard({ icon, label, value }) {
    if (!hasValue(value)) return null

    return (
        <div className="min-w-0 bg-[#341D47] p-6 transition-colors duration-200 hover:bg-[#3b2452] md:p-7">
            <div className="flex items-center gap-3 text-[#D174D2]">
                {icon}

                <p className="text-sm font-semibold text-white/75">
                    {label}
                </p>
            </div>

            <p
                className="mt-5 break-words text-2xl font-bold text-white"
                style={{ fontFamily: DISPLAY_FONT }}
            >
                {String(cleanValue(value))}
            </p>
        </div>
    )
}

function StatusPill({ children, variant = 'neutral' }) {
    const styles = {
        neutral: 'border-white/25 bg-white/10 text-white/85',
        good: 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100',
        warning: 'border-[#E0563F]/50 bg-[#E0563F]/10 text-white',
        accent: 'border-[#D174D2]/40 bg-[#D174D2]/10 text-white',
    }

    return (
        <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${styles[variant] || styles.neutral
                }`}
        >
            {children}
        </span>
    )
}

function EmptyState({ title, description }) {
    return (
        <div className="rounded-2xl border border-white/20 bg-white/[0.07] p-8 md:p-10">
            <p
                className="text-lg font-bold text-white"
                style={{ fontFamily: DISPLAY_FONT }}
            >
                {title}
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                {description}
            </p>
        </div>
    )
}

export default function FloodZonePage() {
    const [property, setProperty] = useState(DEFAULT_PROPERTY)
    const [floodData, setFloodData] = useState(DEFAULT_FLOOD_DATA)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadFloodData() {
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

                if (!cancelled) {
                    setProperty({
                        ...DEFAULT_PROPERTY,
                        ...parsedProperty,
                        postalCode:
                            parsedProperty.postalCode ??
                            parsedProperty.zipCode ??
                            '',
                        propertyId: String(rawId),
                    })
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
                        `Unable to load flood zone information (HTTP ${response.status}).`
                    )
                }

                if (cancelled) return

                const payload =
                    responseData?.data ??
                    responseData?.property ??
                    responseData ??
                    {}

                const floodProperty =
                    payload.floodZone?.property ??
                    payload.flood_zone?.property ??
                    {}

                setProperty((previous) => ({
                    ...previous,
                    ...parsedProperty,

                    address:
                        cleanValue(payload.address) ||
                        cleanValue(floodProperty.address) ||
                        cleanValue(parsedProperty.address),

                    formattedAddress:
                        cleanValue(parsedProperty.formattedAddress) ||
                        cleanValue(payload.address) ||
                        cleanValue(floodProperty.address),

                    city:
                        cleanValue(payload.city) ||
                        cleanValue(floodProperty.city) ||
                        cleanValue(parsedProperty.city),

                    state:
                        cleanValue(payload.state) ||
                        cleanValue(floodProperty.state) ||
                        cleanValue(parsedProperty.state),

                    postalCode:
                        cleanValue(payload.postalCode) ||
                        cleanValue(payload.zipCode) ||
                        cleanValue(floodProperty.zipCode) ||
                        cleanValue(floodProperty.postalCode) ||
                        cleanValue(parsedProperty.postalCode) ||
                        cleanValue(parsedProperty.zipCode),

                    propertyId:
                        cleanValue(payload.id) ||
                        cleanValue(parsedProperty.propertyDbId) ||
                        cleanValue(parsedProperty.id) ||
                        cleanValue(parsedProperty.propertyId),

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
                }))

                setFloodData(normalizeFloodData(responseData))
            } catch (err) {
                console.error('Flood zone loading error:', err)

                if (!cancelled) {
                    setError(
                        err?.message ||
                        'Unable to load flood zone information.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadFloodData()

        return () => {
            cancelled = true
        }
    }, [])

    const riskLevel = String(cleanValue(floodData.riskLevel) || '').toLowerCase()

    const riskIsLow = riskLevel === 'low'

    const riskIsHigh = [
        'high',
        'very high',
        'severe',
    ].includes(riskLevel)

    const verificationText = error
        ? 'Flood zone information could not be loaded.'
        : hasValue(floodData.riskLevel)
            ? 'Flood zone information was received from the backend.'
            : ''

    const hasCoordinates =
        property.latitude !== null &&
        property.latitude !== undefined &&
        property.longitude !== null &&
        property.longitude !== undefined &&
        property.latitude !== '' &&
        property.longitude !== ''

    const propertyAddress =
        cleanValue(property.formattedAddress) ||
        cleanValue(property.address)

    const mapUrl = hasCoordinates
        ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=17/${property.latitude}/${property.longitude}`
        : propertyAddress
            ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(propertyAddress)}`
            : null

    const propertyDetails = [
        { label: 'City', value: property.city },
        { label: 'State', value: property.state },
        { label: 'Postal code', value: property.postalCode },
        { label: 'Property ID', value: property.propertyId },
    ].filter((item) => hasValue(item.value))

    const floodOverview = [
        {
            label: 'Flood zone',
            value: floodData.floodZone,
            icon: <Waves size={19} />,
        },
        {
            label: 'Risk level',
            value: floodData.riskLevel,
            icon: <ShieldCheck size={19} />,
        },
        {
            label: 'Verification',
            value: floodData.verificationStatus,
            icon: <CheckCircle2 size={19} />,
        },
        {
            label: 'SFHA',
            value: floodData.specialFloodHazardArea,
            icon: <Droplets size={19} />,
        },
    ].filter((item) => hasValue(item.value))

    const floodDetailFields = [
        {
            label: 'Special flood hazard area',
            value: floodData.specialFloodHazardArea,
        },
        {
            label: 'Base flood elevation',
            value: floodData.baseFloodElevation,
        },
        {
            label: 'Flood insurance required',
            value: floodData.floodInsuranceRequired,
        },
        { label: 'Map panel', value: floodData.mapPanel },
        { label: 'Map source', value: floodData.mapSource },
        { label: 'Last updated', value: floodData.lastUpdated },
    ].filter((item) => hasValue(item.value))

    const hasNearbyWater =
        hasValue(floodData.waterBody) ||
        hasValue(floodData.nearestWaterBodyDistance)

    const hasFloodInformation =
        floodOverview.length > 0 ||
        hasValue(floodData.zoneDescription) ||
        hasValue(floodData.riskDescription) ||
        hasValue(floodData.verificationSummary) ||
        floodDetailFields.length > 0 ||
        hasNearbyWater ||
        floodData.recommendations.length > 0

    if (loading) {
        return (
            <main
                className="min-h-screen text-white selection:bg-[#D174D2]/40"
                style={{ fontFamily: BODY_FONT }}
            >
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(135deg,#3F567F_0%,#412653_50%,#2B1740_100%)]">
                    <div className="absolute -left-40 bottom-[-10%] h-[600px] w-[600px] rounded-full bg-[#E0563F]/20 blur-[160px]" />
                </div>

                <div className="flex min-h-screen items-center justify-center px-6">
                    <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/[0.09] px-8 py-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-[#D174D2]" />
                        <span className="text-white/80">
                            Loading flood zone information...
                        </span>
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
                <div className="absolute -right-40 top-[20%] h-[600px] w-[600px] rounded-full bg-[#D174D2]/10 blur-[170px]" />
            </div>

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-white/15 px-6 pb-24 pt-32 sm:px-10 md:px-16 lg:px-24">
                <div className="relative mx-auto max-w-[1400px]">
                    <Link
                        href="/zoning"
                        className="mb-9 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Back to Zoning Information
                    </Link>

                    <p className="mb-8 flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                        <span className="h-2 w-2 rounded-full bg-[#D174D2]" />
                        Property / Flood zone verification
                    </p>

                    <h1
                        className="max-w-5xl text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-white"
                        style={{ fontFamily: DISPLAY_FONT }}
                    >
                        Verify the
                        <br />
                        <span className="text-[#D174D2]">flood risk.</span>
                    </h1>

                    <p className="mt-10 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
                        Review flood zone classification, hazard status, flood map
                        information, and other flood-related property indicators
                        as part of your due-diligence review.
                    </p>

                    <div className="mt-9 flex flex-wrap gap-3 text-sm text-white/75">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2">
                            <Waves size={16} className="text-[#D174D2]" />
                            Flood classification
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2">
                            <ShieldCheck size={16} className="text-[#D174D2]" />
                            Risk verification
                        </span>
                    </div>
                </div>
            </section>

            {/* Selected property */}
            <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <SectionEyebrow>Selected property</SectionEyebrow>

                    <div className="mt-6 rounded-2xl border border-white/20 bg-white/[0.09] p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-9">
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-white/70">
                                    Property address
                                </p>

                                <h2
                                    className="mt-4 break-words text-2xl font-bold leading-tight text-white md:text-4xl"
                                    style={{ fontFamily: DISPLAY_FONT }}
                                >
                                    {propertyAddress || 'Selected property'}
                                </h2>
                            </div>

                            <StatusPill variant="accent">
                                <span className="h-2 w-2 rounded-full bg-[#D174D2]" />
                                Property selected
                            </StatusPill>
                        </div>

                        {propertyDetails.length > 0 ? (
                            <div className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-4">
                                {propertyDetails.map((item) => (
                                    <DetailCard
                                        key={item.label}
                                        label={item.label}
                                        value={item.value}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="mt-6 text-sm text-white/65">
                                Additional property details were not returned.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Error */}
            {error && (
                <section className="px-6 pb-12 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px] rounded-2xl border border-[#E0563F]/60 bg-[#E0563F]/15 p-7 md:p-9">
                        <div className="flex items-start gap-4">
                            <AlertTriangle
                                className="mt-0.5 shrink-0 text-[#ffb4a8]"
                                size={22}
                            />

                            <div>
                                <h2
                                    className="text-lg font-bold text-white"
                                    style={{ fontFamily: DISPLAY_FONT }}
                                >
                                    Flood zone information could not be loaded
                                </h2>

                                <p className="mt-3 text-sm leading-7 text-white/85">
                                    {error}
                                </p>

                                <Link
                                    href="/property-search"
                                    className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#E0563F] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c94a34] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                                >
                                    Return to Property Search
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Flood overview */}
            <section className="px-6 pb-20 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <SectionEyebrow>01 / Flood assessment</SectionEyebrow>

                            <h2
                                className="mt-4 text-3xl font-extrabold text-white md:text-5xl"
                                style={{ fontFamily: DISPLAY_FONT }}
                            >
                                Flood zone overview
                            </h2>

                            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                                A summary of flood-zone classification and risk
                                indicators available for this property.
                            </p>
                        </div>

                        {hasValue(floodData.verificationStatus) && (
                            <StatusPill
                                variant={
                                    riskIsLow
                                        ? 'good'
                                        : riskIsHigh
                                            ? 'warning'
                                            : 'accent'
                                }
                            >
                                {floodData.verificationStatus}
                            </StatusPill>
                        )}
                    </div>

                    {floodOverview.length > 0 ? (
                        <div
                            className={`grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 ${floodOverview.length >= 4
                                ? 'lg:grid-cols-4'
                                : floodOverview.length === 3
                                    ? 'lg:grid-cols-3'
                                    : 'lg:grid-cols-2'
                                }`}
                        >
                            {floodOverview.map((item) => (
                                <StatCard
                                    key={item.label}
                                    icon={item.icon}
                                    label={item.label}
                                    value={item.value}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No flood summary is available"
                            description="The backend did not return flood-zone summary fields for this property. Other property information is shown below when available."
                        />
                    )}
                </div>
            </section>

            {/* Classification and risk */}
            {(hasValue(floodData.floodZone) ||
                hasValue(floodData.riskDescription) ||
                hasValue(floodData.verificationSummary) ||
                hasValue(floodData.zoneDescription) ||
                hasValue(floodData.verificationStatus)) && (
                    <section className="px-6 pb-20 sm:px-10 md:px-16 lg:px-24">
                        <div className="mx-auto max-w-[1400px]">
                            <div className="mb-8">
                                <SectionEyebrow>
                                    02 / Classification &amp; risk
                                </SectionEyebrow>

                                <h2
                                    className="mt-4 text-3xl font-extrabold text-white md:text-5xl"
                                    style={{ fontFamily: DISPLAY_FONT }}
                                >
                                    Understand the findings
                                </h2>

                                <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                                    Review the returned zone designation and risk
                                    summary. These details reflect the data
                                    received from the backend.
                                </p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                {hasValue(floodData.floodZone) && (
                                    <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-10">
                                        <p className="text-sm font-semibold text-[#D174D2]">
                                            Flood zone designation
                                        </p>

                                        <p
                                            className="mt-5 break-words text-6xl font-extrabold text-white"
                                            style={{ fontFamily: DISPLAY_FONT }}
                                        >
                                            {String(floodData.floodZone)}
                                        </p>

                                        {hasValue(floodData.zoneDescription) && (
                                            <p className="mt-4 text-lg leading-7 text-white/80">
                                                {String(floodData.zoneDescription)}
                                            </p>
                                        )}

                                        {hasValue(floodData.specialFloodHazardArea) && (
                                            <div className="mt-6">
                                                <StatusPill variant="accent">
                                                    Special flood hazard area:{' '}
                                                    {String(floodData.specialFloodHazardArea)}
                                                </StatusPill>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(hasValue(floodData.riskDescription) ||
                                    hasValue(floodData.verificationSummary) ||
                                    hasValue(floodData.verificationStatus)) && (
                                        <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-10">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${riskIsLow
                                                        ? 'border-emerald-300/40 bg-emerald-300/10'
                                                        : riskIsHigh
                                                            ? 'border-[#E0563F]/50 bg-[#E0563F]/10'
                                                            : 'border-[#D174D2]/40 bg-[#D174D2]/10'
                                                        }`}
                                                >
                                                    {riskIsLow ? (
                                                        <CheckCircle2
                                                            size={22}
                                                            className="text-emerald-200"
                                                        />
                                                    ) : riskIsHigh ? (
                                                        <AlertTriangle
                                                            size={22}
                                                            className="text-[#ffb4a8]"
                                                        />
                                                    ) : (
                                                        <ShieldCheck
                                                            size={22}
                                                            className="text-[#D174D2]"
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-[#D174D2]">
                                                        Risk assessment
                                                    </p>

                                                    <h3
                                                        className="mt-3 break-words text-2xl font-bold text-white"
                                                        style={{ fontFamily: DISPLAY_FONT }}
                                                    >
                                                        {hasValue(floodData.riskDescription)
                                                            ? String(floodData.riskDescription)
                                                            : 'Flood risk summary'}
                                                    </h3>

                                                    {hasValue(floodData.verificationSummary) && (
                                                        <p className="mt-4 text-sm leading-7 text-white/80">
                                                            {String(floodData.verificationSummary)}
                                                        </p>
                                                    )}

                                                    {hasValue(verificationText) && (
                                                        <p className="mt-4 text-xs leading-6 text-white/55">
                                                            {verificationText}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {hasValue(floodData.verificationStatus) && (
                                                <div className="mt-7 border-t border-white/15 pt-5">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/55">
                                                        Verification status
                                                    </p>

                                                    <p className="mt-2 text-base font-semibold text-white">
                                                        {String(floodData.verificationStatus)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>
                    </section>
                )}

            {/* Flood detail fields */}
            {floodDetailFields.length > 0 && (
                <section className="px-6 pb-20 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <div className="mb-8">
                            <SectionEyebrow>
                                03 / Supporting details
                            </SectionEyebrow>

                            <h2
                                className="mt-4 text-3xl font-extrabold text-white md:text-5xl"
                                style={{ fontFamily: DISPLAY_FONT }}
                            >
                                Flood map &amp; insurance details
                            </h2>

                            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                                Additional map references, elevation information,
                                and insurance indicators returned for the
                                selected property.
                            </p>
                        </div>

                        <div
                            className={`grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 ${floodDetailFields.length >= 3
                                ? 'lg:grid-cols-3'
                                : 'lg:grid-cols-2'
                                }`}
                        >
                            {floodDetailFields.map((item) => (
                                <DetailCard
                                    key={item.label}
                                    label={item.label}
                                    value={item.value}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Nearby water */}
            {hasNearbyWater && (
                <section className="px-6 pb-20 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <div className="mb-8">
                            <SectionEyebrow>04 / Nearby water</SectionEyebrow>

                            <h2
                                className="mt-4 text-3xl font-extrabold text-white md:text-5xl"
                                style={{ fontFamily: DISPLAY_FONT }}
                            >
                                Water proximity
                            </h2>

                            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                                Nearby water-body details are shown when
                                supplied by the backend.
                            </p>
                        </div>

                        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2">
                            {hasValue(floodData.waterBody) && (
                                <div className="bg-[#341D47] p-7 md:p-9">
                                    <div className="flex items-center gap-3 text-[#D174D2]">
                                        <Droplets size={20} />
                                        <p className="text-sm font-semibold">
                                            Nearest water body
                                        </p>
                                    </div>

                                    <p
                                        className="mt-5 break-words text-2xl font-bold text-white"
                                        style={{ fontFamily: DISPLAY_FONT }}
                                    >
                                        {String(floodData.waterBody)}
                                    </p>
                                </div>
                            )}

                            {hasValue(floodData.nearestWaterBodyDistance) && (
                                <div className="bg-[#341D47] p-7 md:p-9">
                                    <div className="flex items-center gap-3 text-[#D174D2]">
                                        <MapPin size={20} />
                                        <p className="text-sm font-semibold">
                                            Distance
                                        </p>
                                    </div>

                                    <p
                                        className="mt-5 break-words text-2xl font-bold text-white"
                                        style={{ fontFamily: DISPLAY_FONT }}
                                    >
                                        {String(floodData.nearestWaterBodyDistance)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Recommendations */}
            {floodData.recommendations.length > 0 && (
                <section className="px-6 pb-20 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <div className="mb-8">
                            <SectionEyebrow>
                                05 / Due diligence notes
                            </SectionEyebrow>

                            <h2
                                className="mt-4 text-3xl font-extrabold text-white md:text-5xl"
                                style={{ fontFamily: DISPLAY_FONT }}
                            >
                                Recommendations
                            </h2>

                            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                                Review the recommendations returned with the
                                flood-zone information.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-10">
                            <div className="space-y-5">
                                {floodData.recommendations.map(
                                    (recommendation, index) => (
                                        <div
                                            key={`${recommendation}-${index}`}
                                            className="flex items-start gap-4 border-b border-white/15 pb-5 last:border-b-0 last:pb-0"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D174D2]/50 bg-[#D174D2]/10 text-xs font-bold text-[#D174D2]">
                                                {index + 1}
                                            </span>

                                            <p className="text-sm leading-7 text-white/85">
                                                {recommendation}
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
            {hasValue(propertyAddress) && (
                <section className="px-6 pb-20 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-9">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <SectionEyebrow>Property location</SectionEyebrow>

                                    <h2
                                        className="mt-4 break-words text-2xl font-bold text-white md:text-3xl"
                                        style={{ fontFamily: DISPLAY_FONT }}
                                    >
                                        {propertyAddress}
                                    </h2>

                                    <p className="mt-3 text-sm leading-7 text-white/70">
                                        Open the location in OpenStreetMap to
                                        review the surrounding area.
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D174D2]/40 bg-[#D174D2]/10 text-[#D174D2]">
                                    <MapPin size={22} />
                                </div>
                            </div>

                            {mapUrl && (
                                <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/10 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-[#412653] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D174D2]/50"
                                >
                                    Open map
                                    <ArrowRight size={16} />
                                </a>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Empty flood record state */}
            {!error && !hasFloodInformation && (
                <section className="px-6 pb-20 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <EmptyState
                            title="No flood assessment details returned"
                            description="The property was loaded, but the backend did not provide flood-zone fields, supporting details, or recommendations. No flood classification has been assumed."
                        />
                    </div>
                </section>
            )}

            {/* Next research stage */}
            <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#3F567F]/80 via-[#412653]/90 to-[#2B1740]/95 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-12 lg:p-14">
                        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#D174D2]/15 blur-3xl" />

                        <div className="relative">
                            <SectionEyebrow>Next research stage</SectionEyebrow>

                            <h2
                                className="mt-4 max-w-3xl text-3xl font-extrabold text-white md:text-5xl"
                                style={{ fontFamily: DISPLAY_FONT }}
                            >
                                Permits &amp; environmental records
                            </h2>

                            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
                                Continue the property review by checking permit
                                history, potential environmental hazards, and
                                nearby site information.
                            </p>

                            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                                <Link
                                    href="/permit-environmental"
                                    className="inline-flex items-center justify-center gap-3 rounded-full bg-[#E0563F] px-8 py-4 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(224,86,63,0.7)] transition duration-200 hover:bg-[#c94a34] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                                >
                                    View Permit &amp; Environmental Records
                                    <ArrowRight size={16} />
                                </Link>

                                <Link
                                    href="/zoning"
                                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/50 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition duration-200 hover:bg-white hover:text-[#412653] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D174D2]/50"
                                >
                                    <ArrowLeft size={16} />
                                    Back to Zoning
                                </Link>

                                <Link
                                    href="/property-search"
                                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/50 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition duration-200 hover:bg-white hover:text-[#412653] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D174D2]/50"
                                >
                                    <ArrowLeft size={16} />
                                    Property Search
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/15 bg-[#2B1740]/60 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs font-medium text-white/60 md:flex-row">
                    <span>PROP DUE</span>
                    <span>Flood zone verification</span>
                </div>
            </footer>
        </main>
    )
}
