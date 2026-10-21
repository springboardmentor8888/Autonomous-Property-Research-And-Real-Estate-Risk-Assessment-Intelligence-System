'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    ArrowRight,
} from 'lucide-react'

const BASE_URL = 'http://localhost:8080/api'
const DISPLAY_FONT = "'Syne', 'Arial Black', system-ui, sans-serif"
const BODY_FONT =
    "'Red Hat Display', system-ui, -apple-system, 'Segoe UI', sans-serif"

function hasValue(value) {
    if (value === null || value === undefined) return false

    const text = String(value).trim()
    if (!text) return false

    const invalidValues = [
        'n/a',
        'na',
        'not available',
        'not provided',
        'null',
        'undefined',
        '-',
    ]

    return !invalidValues.includes(text.toLowerCase())
}

function firstValid(...values) {
    for (const value of values) {
        if (hasValue(value)) return value
    }

    return null
}

function removeEmptyFields(record) {
    const cleaned = {}

    Object.entries(record).forEach(([key, value]) => {
        if (hasValue(value)) cleaned[key] = value
    })

    return cleaned
}

function formatDate(value) {
    if (!hasValue(value)) return null

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function getRiskStatus(riskLevel) {
    const risk = String(riskLevel).toLowerCase()

    if (risk === 'low') return 'Low'
    if (risk === 'medium' || risk === 'moderate') return 'Review'
    if (risk === 'high' || risk === 'very high') return 'Review'

    return 'Review'
}

function DetailCard({ label, value, className = '' }) {
    if (!hasValue(value)) return null

    return (
        <div className={`bg-[#341D47] p-6 ${className}`}>
            <p className="text-sm text-white/65">{label}</p>
            <p className="mt-3 break-words text-base font-semibold text-white">
                {String(value)}
            </p>
        </div>
    )
}

function LoadingBox({ text }) {
    return (
        <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-[#D174D2]" />
                <p className="text-sm text-white/75">{text}</p>
            </div>
        </div>
    )
}

function ErrorBox({ message }) {
    return (
        <div className="rounded-2xl border border-[#E0563F]/60 bg-[#E0563F]/15 p-7">
            <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E0563F] text-sm font-bold text-white">
                    !
                </span>
                <p className="text-sm leading-6 text-white/85">{message}</p>
            </div>
        </div>
    )
}

function EmptyBox({ text }) {
    return (
        <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8">
            <p className="text-sm text-white/75">{text}</p>
        </div>
    )
}

function PermitTable({ records }) {
    const columns = [
        { key: 'permitNumber', label: 'Permit number' },
        { key: 'permitType', label: 'Type' },
        { key: 'description', label: 'Description' },
        { key: 'issueDate', label: 'Issue date' },
        { key: 'status', label: 'Status' },
    ]

    const availableColumns = columns.filter((column) =>
        records.some((record) => hasValue(record?.[column.key]))
    )

    if (availableColumns.length === 0) return null

    return (
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/[0.09] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)]">
            <div
                className="hidden border-b border-white/20 bg-white/[0.05] px-6 py-4 text-sm font-semibold text-white/75 md:grid"
                style={{
                    gridTemplateColumns: `repeat(${availableColumns.length}, minmax(0, 1fr))`,
                }}
            >
                {availableColumns.map((column) => (
                    <span key={column.key}>{column.label}</span>
                ))}
            </div>

            {records.map((record, index) => (
                <div
                    key={`${record.permitNumber || 'permit'}-${index}`}
                    className="grid gap-5 border-b border-white/15 px-6 py-7 last:border-b-0 md:items-center"
                    style={{
                        gridTemplateColumns: `repeat(${availableColumns.length}, minmax(0, 1fr))`,
                    }}
                >
                    {availableColumns.map((column) => {
                        const value = record?.[column.key]

                        if (!hasValue(value)) {
                            return (
                                <div
                                    key={column.key}
                                    className="hidden md:block"
                                />
                            )
                        }

                        return (
                            <div key={column.key}>
                                <p className="text-xs font-semibold text-[#D174D2] md:hidden">
                                    {column.label}
                                </p>

                                {column.key === 'status' ? (
                                    <span className="mt-2 inline-flex rounded-full border border-[#D174D2]/40 bg-[#D174D2]/10 px-3 py-1 text-xs text-white md:mt-0">
                                        {value}
                                    </span>
                                ) : (
                                    <p className="mt-2 break-words text-sm text-white md:mt-0">
                                        {value}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

function EnvironmentalCard({ record }) {
    if (!record) return null

    const category = firstValid(
        record?.category,
        record?.type,
        record?.name
    )
    const value = firstValid(
        record?.value,
        record?.description,
        record?.details
    )
    const status = firstValid(record?.status)

    if (!hasValue(category) || !hasValue(value)) return null

    const review = String(status || '').toLowerCase() === 'review'

    return (
        <div className="bg-[#341D47] p-7 transition-colors hover:bg-[#3b2452] md:p-9">
            <div className="flex items-start justify-between gap-5">
                <div>
                    <p className="text-sm font-semibold text-[#D174D2]">
                        {category}
                    </p>
                    <p className="mt-5 text-xl font-semibold text-white">
                        {value}
                    </p>
                </div>

                {hasValue(status) && (
                    <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs ${review
                            ? 'border-[#E0563F]/50 bg-[#E0563F]/10 text-white'
                            : 'border-emerald-300/40 bg-emerald-300/10 text-white'
                            }`}
                    >
                        {status}
                    </span>
                )}
            </div>
        </div>
    )
}

function SummaryCard({
    number,
    title,
    description,
    status,
    href,
    className = '',
}) {
    return (
        <Link
            href={href}
            className={`group bg-[#341D47] p-7 transition-colors hover:bg-[#3b2452] md:p-9 ${className}`}
        >
            <div className="flex items-start justify-between gap-6">
                <div className="flex gap-6">
                    <span className="text-sm font-semibold text-[#D174D2]">
                        {number}
                    </span>
                    <div>
                        <h3
                            className="text-xl font-bold text-white transition group-hover:text-[#D174D2]"
                            style={{ fontFamily: DISPLAY_FONT }}
                        >
                            {title}
                        </h3>
                        <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
                            {description}
                        </p>
                    </div>
                </div>

                <span className="shrink-0 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white/80">
                    {status}
                </span>
            </div>

            <div className="mt-7 flex items-center justify-end text-sm font-semibold text-white/70 transition group-hover:text-white">
                Review <span className="ml-2 text-lg">→</span>
            </div>
        </Link>
    )
}

export default function PermitEnvironmentalPage() {
    const [property, setProperty] = useState(null)
    const [permitRecords, setPermitRecords] = useState([])
    const [environmentalRecords, setEnvironmentalRecords] = useState([])
    const [permitLoading, setPermitLoading] = useState(false)
    const [environmentalLoading, setEnvironmentalLoading] = useState(false)
    const [permitError, setPermitError] = useState('')
    const [environmentalError, setEnvironmentalError] = useState('')

    useEffect(() => {
        if (typeof window === 'undefined') return

        const savedProperty =
            sessionStorage.getItem('selectedProperty')

        if (!savedProperty) return

        try {
            const parsedProperty = JSON.parse(savedProperty)
            if (parsedProperty) setProperty(parsedProperty)
        } catch (error) {
            console.error('Unable to load selected property:', error)
        }
    }, [])

    const propertyId =
        property?.propertyDbId ??
        property?.id ??
        (property?.propertyId != null &&
            /^\d+$/.test(String(property.propertyId))
            ? property.propertyId
            : null)

    useEffect(() => {
        if (!propertyId) return

        let cancelled = false

        async function loadPropertyRecords() {
            setPermitLoading(true)
            setEnvironmentalLoading(true)
            setPermitError('')
            setEnvironmentalError('')

            try {
                const token = localStorage.getItem('token')

                const response = await fetch(
                    `${BASE_URL}/properties/${propertyId}`,
                    {
                        method: 'GET',
                        headers: {
                            ...(token
                                ? { Authorization: `Bearer ${token}` }
                                : {}),
                        },
                    }
                )

                const data = await response.json().catch(() => null)

                if (!response.ok) {
                    throw new Error(
                        data?.error?.message ||
                        data?.message ||
                        `Backend request failed (HTTP ${response.status})`
                    )
                }

                const backendProperty = data?.data || data
                if (cancelled) return

                setProperty((previous) => ({
                    ...previous,
                    ...backendProperty,
                    formattedAddress:
                        backendProperty.formattedAddress ||
                        backendProperty.address ||
                        previous?.formattedAddress ||
                        previous?.address ||
                        '',
                    city: backendProperty.city || previous?.city || '',
                    state: backendProperty.state || previous?.state || '',
                    postalCode:
                        backendProperty.postalCode ||
                        backendProperty.zipCode ||
                        previous?.postalCode ||
                        previous?.zipCode ||
                        '',
                    country:
                        backendProperty.country ||
                        previous?.country ||
                        '',
                }))

                const backendPermits = Array.isArray(
                    backendProperty.permits
                )
                    ? backendProperty.permits
                    : []

                const cleanedPermits = backendPermits
                    .map((permit) => ({
                        permitNumber: firstValid(
                            permit?.permitNumber,
                            permit?.permitNo,
                            permit?.number,
                            permit?.id
                        ),
                        permitType: firstValid(
                            permit?.permitType,
                            permit?.type
                        ),
                        description: firstValid(
                            permit?.description,
                            permit?.details
                        ),
                        issueDate: formatDate(
                            firstValid(
                                permit?.issueDate,
                                permit?.issuedDate,
                                permit?.date
                            )
                        ),
                        status: firstValid(permit?.status),
                    }))
                    .map(removeEmptyFields)
                    .filter((permit) => Object.keys(permit).length > 0)

                setPermitRecords(cleanedPermits)

                const backendEnvironmental =
                    backendProperty.environmental || {}
                const backendFloodZone =
                    backendProperty.floodZone || {}
                const records = []

                const floodRisk = backendFloodZone.riskLevel

                if (hasValue(floodRisk)) {
                    records.push({
                        category: 'Flood Risk',
                        value: String(floodRisk),
                        status: getRiskStatus(floodRisk),
                    })
                }

                const hazardFound = backendEnvironmental.hazardFound
                const hazardType = backendEnvironmental.hazardType
                const assessmentDate =
                    backendEnvironmental.assessmentDate

                if (hazardFound === true || hazardFound === false) {
                    let contaminationValue =
                        hazardFound === true
                            ? firstValid(
                                hazardType,
                                'Environmental hazard detected'
                            )
                            : 'No hazard found'

                    if (hasValue(assessmentDate)) {
                        contaminationValue += ` (Assessment: ${formatDate(
                            assessmentDate
                        )})`
                    }

                    records.push({
                        category: 'Contamination',
                        value: contaminationValue,
                        status: hazardFound === true ? 'Review' : 'Clear',
                    })
                }

                const pollutionEvents =
                    backendEnvironmental.pollutionEvents

                if (
                    Array.isArray(pollutionEvents) &&
                    pollutionEvents.length > 0
                ) {
                    records.push({
                        category: 'Pollution Events',
                        value: `${pollutionEvents.length} event${pollutionEvents.length === 1 ? '' : 's'
                            }`,
                        status: 'Review',
                    })
                }

                const nearbySites = backendEnvironmental.nearbySites

                if (
                    Array.isArray(nearbySites) &&
                    nearbySites.length > 0
                ) {
                    records.push({
                        category: 'Nearby Environmental Sites',
                        value: `${nearbySites.length} site${nearbySites.length === 1 ? '' : 's'
                            }`,
                        status: 'Review',
                    })
                }

                setEnvironmentalRecords(records)
            } catch (error) {
                if (cancelled) return

                console.error('Property records error:', error)
                setPermitRecords([])
                setEnvironmentalRecords([])
                setPermitError(
                    error.message || 'Unable to retrieve permit records.'
                )
                setEnvironmentalError(
                    error.message ||
                    'Unable to retrieve environmental records.'
                )
            } finally {
                if (!cancelled) {
                    setPermitLoading(false)
                    setEnvironmentalLoading(false)
                }
            }
        }

        loadPropertyRecords()

        return () => {
            cancelled = true
        }
    }, [propertyId])

    const propertyAddress =
        property?.formattedAddress || property?.address || ''

    const propertyDetails = [
        { label: 'City', value: property?.city },
        { label: 'State', value: property?.state },
        {
            label: 'Postal code',
            value: property?.postalCode || property?.zipCode,
        },
        { label: 'Country', value: property?.country },
    ].filter((item) => hasValue(item.value))

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
                    <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                        <span className="h-2 w-2 rounded-full bg-[#D174D2]" />
                        Permit &amp; environmental records
                    </p>

                    <h1
                        className="max-w-5xl text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-white"
                        style={{ fontFamily: DISPLAY_FONT }}
                    >
                        Review the
                        <br />
                        <span className="text-[#D174D2]">
                            property records.
                        </span>
                    </h1>

                    <p className="mt-10 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
                        Review available permit and environmental information
                        alongside the findings collected during earlier
                        due-diligence stages.
                    </p>
                </div>
            </section>

            {/* Selected property */}
            {property && (
                <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                            Selected property
                        </p>

                        <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-9">
                            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white/70">
                                        Property address
                                    </p>
                                    {hasValue(propertyAddress) && (
                                        <h2
                                            className="mt-4 max-w-4xl text-2xl font-bold leading-8 text-white md:text-4xl"
                                            style={{ fontFamily: DISPLAY_FONT }}
                                        >
                                            {propertyAddress}
                                        </h2>
                                    )}
                                </div>

                                <div className="flex w-fit items-center gap-2 rounded-full border border-[#D174D2]/40 bg-[#D174D2]/10 px-4 py-2">
                                    <span className="h-2 w-2 rounded-full bg-[#D174D2]" />
                                    <span className="text-xs font-semibold text-white">
                                        Property selected
                                    </span>
                                </div>
                            </div>

                            {propertyDetails.length > 0 && (
                                <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-4">
                                    {propertyDetails.map((item, index) => (
                                        <DetailCard
                                            key={item.label}
                                            label={item.label}
                                            value={item.value}
                                            className={
                                                item.label === 'Postal code' &&
                                                    propertyDetails.length === 3
                                                    ? 'lg:col-span-2'
                                                    : ''
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Permit records */}
            <section
                id="permit-records"
                className="px-6 pb-24 sm:px-10 md:px-16 lg:px-24"
            >
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#D174D2]">
                                01 / Permit records
                            </p>
                            <h2
                                className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl"
                                style={{ fontFamily: DISPLAY_FONT }}
                            >
                                Building &amp; construction
                            </h2>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                                Review building, electrical, plumbing, renovation, and
                                construction permit activity associated with the property.
                            </p>
                        </div>

                        <div className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm text-white/80">
                            {permitLoading
                                ? 'Retrieving...'
                                : `${permitRecords.length} Records`}
                        </div>
                    </div>

                    {permitLoading && (
                        <LoadingBox text="Retrieving permit records..." />
                    )}
                    {permitError && <ErrorBox message={permitError} />}

                    {!permitLoading &&
                        !permitError &&
                        permitRecords.length > 0 && (
                            <PermitTable records={permitRecords} />
                        )}

                    {!permitLoading &&
                        !permitError &&
                        permitRecords.length === 0 && (
                            <EmptyBox text="No permit records were returned by the backend." />
                        )}
                </div>
            </section>

            {/* Environmental records */}
            <section
                id="environmental-records"
                className="px-6 pb-24 sm:px-10 md:px-16 lg:px-24"
            >
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#D174D2]">
                                02 / Environmental records
                            </p>
                            <h2
                                className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl"
                                style={{ fontFamily: DISPLAY_FONT }}
                            >
                                Environmental review
                            </h2>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                                Review flood information, contamination records,
                                pollution events, nearby sites, and other available
                                environmental findings.
                            </p>
                        </div>

                        <div className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm text-white/80">
                            {environmentalLoading
                                ? 'Retrieving...'
                                : `${environmentalRecords.length} Checks`}
                        </div>
                    </div>

                    {environmentalLoading && (
                        <LoadingBox text="Retrieving environmental records..." />
                    )}
                    {environmentalError && (
                        <ErrorBox message={environmentalError} />
                    )}

                    {!environmentalLoading &&
                        !environmentalError &&
                        environmentalRecords.length > 0 && (
                            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2">
                                {environmentalRecords.map((record, index) => (
                                    <EnvironmentalCard
                                        key={`${record.category}-${index}`}
                                        record={record}
                                    />
                                ))}
                            </div>
                        )}

                    {!environmentalLoading &&
                        !environmentalError &&
                        environmentalRecords.length === 0 && (
                            <EmptyBox text="No environmental records were returned by the backend." />
                        )}
                </div>
            </section>

            {/* Due diligence summary */}
            <section className="px-6 pb-24 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-8">
                        <p className="text-sm font-semibold text-[#D174D2]">
                            Due diligence summary
                        </p>
                        <h2
                            className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl"
                            style={{ fontFamily: DISPLAY_FONT }}
                        >
                            Everything collected so far.
                        </h2>
                        <p className="mt-5 max-w-3xl text-base leading-7 text-white/75">
                            Review the information collected across each property
                            due-diligence stage before deciding whether to proceed
                            with the property.
                        </p>
                    </div>

                    <div className="grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 md:grid-cols-2">
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
                                    ? 'Loading'
                                    : permitRecords.length > 0
                                        ? 'Records Available'
                                        : 'No Records'
                            }
                            href="#permit-records"
                        />
                        <SummaryCard
                            number="07"
                            title="Environmental Records"
                            description="Environmental findings and nearby site information."
                            status={
                                environmentalLoading
                                    ? 'Loading'
                                    : environmentalRecords.length > 0
                                        ? 'Records Available'
                                        : 'No Records'
                            }
                            href="#environmental-records"
                            className="md:col-span-2"
                        />
                    </div>
                </div>
            </section>

            {/* Final review */}
            <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#3F567F]/80 via-[#412653]/80 to-[#2B1740]/90 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-12 lg:p-14">
                        <p className="text-sm font-semibold text-[#D174D2]">
                            Final review
                        </p>

                        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h2
                                    className="text-3xl font-extrabold tracking-tight text-white md:text-5xl"
                                    style={{ fontFamily: DISPLAY_FONT }}
                                >
                                    Make your decision.
                                </h2>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-white/80">
                                    Review the available findings from the due-diligence
                                    process and decide how you want to proceed with the
                                    property.
                                </p>
                            </div>

                            {property && (
                                <div className="rounded-2xl border border-white/25 bg-white/10 px-8 py-7 text-center">
                                    <p className="text-sm font-semibold text-[#D174D2]">
                                        Property status
                                    </p>
                                    <p
                                        className="mt-4 text-2xl font-bold text-white"
                                        style={{ fontFamily: DISPLAY_FONT }}
                                    >
                                        Ready for Review
                                    </p>
                                    <p className="mt-2 text-xs text-white/70">
                                        Information available
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <Link
                                href="/due-diligence-report"
                                className="inline-flex items-center justify-center gap-4 rounded-full bg-[#E0563F] px-9 py-5 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(224,86,63,0.7)] transition duration-200 hover:bg-[#c94a34] focus-visible:ring-4 focus-visible:ring-white/40"
                            >
                                Review Due Diligence Report
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                href="/flood-zone"
                                className="inline-flex items-center justify-center gap-4 rounded-full border border-white/50 bg-white/10 px-9 py-5 text-sm font-semibold text-white transition duration-200 hover:bg-white hover:text-[#412653] focus-visible:ring-4 focus-visible:ring-[#D174D2]/50"
                            >
                                Previous Stage
                                <ArrowLeft size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/15 bg-[#2B1740]/60 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs font-medium text-white/60 md:flex-row">
                    <span>PROP DUE</span>
                    <span>Property due diligence platform</span>
                </div>
            </footer>
        </main>
    )
}