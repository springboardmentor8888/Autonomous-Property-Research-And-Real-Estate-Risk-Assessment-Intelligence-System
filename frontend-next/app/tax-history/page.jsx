'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
} from 'lucide-react'

const API_URL = 'http://localhost:8080/api'
const DISPLAY_FONT = "'Syne', 'Arial Black', system-ui, sans-serif"
const BODY_FONT =
    "'Red Hat Display', system-ui, -apple-system, 'Segoe UI', sans-serif"

const DEFAULT_PROPERTY = {
    formattedAddress: '',
    city: '',
    state: '',
    postalCode: '',
    propertyId: '',
}

function isAvailable(value) {
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

function normalizeTaxData(response) {
    const payload =
        response?.data ?? response?.property ?? response ?? {}

    const rawRecords =
        payload.taxHistory ??
        payload.taxRecords ??
        payload.tax_history ??
        payload.tax_records ??
        []

    const records = Array.isArray(rawRecords)
        ? rawRecords
            .map((record) => ({
                year: String(
                    record.year ??
                    record.taxYear ??
                    record.tax_year ??
                    ''
                ),
                taxAmount: Number(
                    record.taxAmount ??
                    record.amountPaid ??
                    record.amount ??
                    record.tax_amount ??
                    record.amount_paid ??
                    0
                ),
                paymentDate:
                    record.paymentDate ??
                    record.lastPaymentDate ??
                    record.payment_date ??
                    record.last_payment_date ??
                    null,
                status:
                    record.status ??
                    record.paymentStatus ??
                    record.payment_status ??
                    null,
            }))
            .filter((record) => record.year || record.taxAmount > 0)
        : []

    records.sort((a, b) => Number(b.year) - Number(a.year))

    const latest = records[0] ?? {}

    return {
        records,
        currentTaxYear:
            payload.currentTaxYear ??
            payload.current_tax_year ??
            latest.year ??
            null,
        currentTaxAmount:
            payload.currentTaxAmount ??
            payload.current_tax_amount ??
            latest.taxAmount ??
            null,
        taxStatus:
            payload.taxStatus ??
            payload.tax_status ??
            latest.status ??
            null,
        lastPaymentDate:
            payload.lastPaymentDate ??
            payload.last_payment_date ??
            latest.paymentDate ??
            null,
        nextDueDate:
            payload.nextDueDate ??
            payload.next_due_date ??
            null,
        county:
            payload.county ??
            payload.countyName ??
            payload.county_name ??
            null,
        taxAuthority:
            payload.taxAuthority ??
            payload.tax_authority ??
            null,
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0)
}

function DetailCard({ label, value }) {
    if (!isAvailable(value)) return null

    return (
        <div className="bg-[#341D47] p-6">
            <p className="text-sm text-white/65">{label}</p>
            <p className="mt-3 break-words text-base font-semibold text-white">
                {value}
            </p>
        </div>
    )
}

function StatCard({ icon, label, value }) {
    if (!isAvailable(value)) return null

    return (
        <div className="bg-[#341D47] p-6">
            <div className="flex items-center gap-3 text-[#D174D2]">
                {icon}
                <p className="text-sm font-semibold text-[#D174D2]">{label}</p>
            </div>
            <p className="mt-5 text-2xl font-bold text-white">{value}</p>
        </div>
    )
}

function InfoItem({
    label,
    value,
    valueClassName = 'text-white',
}) {
    if (!isAvailable(value)) return null

    return (
        <div>
            <p className="text-sm font-medium text-white/65">{label}</p>
            <p className={`mt-3 break-words text-lg font-semibold ${valueClassName}`}>
                {value}
            </p>
        </div>
    )
}

export default function TaxHistoryPage() {
    const [property, setProperty] = useState(DEFAULT_PROPERTY)
    const [taxData, setTaxData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadTaxHistory() {
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
                        `Unable to load tax history (HTTP ${response.status}).`
                    )
                }

                if (!cancelled) {
                    setTaxData(normalizeTaxData(responseData))
                }
            } catch (err) {
                console.error('Tax history loading error:', err)

                if (!cancelled) {
                    setError(err.message || 'Unable to load tax history.')
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadTaxHistory()

        return () => {
            cancelled = true
        }
    }, [])

    const records = taxData?.records ?? []

    const totalTax = useMemo(
        () =>
            records.reduce(
                (total, record) => total + record.taxAmount,
                0
            ),
        [records]
    )

    const averageTax = useMemo(() => {
        if (records.length === 0) return 0
        return Math.round(totalTax / records.length)
    }, [records, totalTax])

    const taxChange = useMemo(() => {
        if (records.length < 2 || records[1].taxAmount === 0) {
            return 0
        }

        return Math.round(
            ((records[0].taxAmount - records[1].taxAmount) /
                records[1].taxAmount) *
            100
        )
    }, [records])

    const hasStatus = records.some((record) =>
        isAvailable(record.status)
    )

    const hasLastPayment = isAvailable(taxData?.lastPaymentDate)
    const hasNextDueDate = isAvailable(taxData?.nextDueDate)
    const hasCounty = isAvailable(taxData?.county)
    const hasTaxAuthority = isAvailable(taxData?.taxAuthority)

    const currentOverviewCount = [
        isAvailable(taxData?.currentTaxAmount),
        isAvailable(taxData?.taxStatus),
    ].filter(Boolean).length

    const paymentInformationCount = [
        hasLastPayment,
        hasNextDueDate,
    ].filter(Boolean).length

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
                        <span>Loading tax history...</span>
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
                        Property tax / history
                    </p>

                    <h1
                        className="max-w-5xl text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-white"
                        style={{ fontFamily: DISPLAY_FONT }}
                    >
                        Review
                        <br />
                        <span className="text-[#D174D2]">tax history.</span>
                    </h1>

                    <p className="mt-10 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
                        Review historical property tax assessments, tax amounts,
                        payment status, and changes across previous tax years.
                    </p>
                </div>
            </section>

            {/* Property details */}
            <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-[#D174D2]" />
                        <span className="text-sm font-semibold text-[#D174D2]">
                            Property selected
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

                    <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailCard label="City" value={property.city} />
                        <DetailCard label="State" value={property.state} />
                        <DetailCard
                            label="Postal code"
                            value={property.postalCode ?? property.zipCode}
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

            {/* Error */}
            {error && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px] rounded-2xl border border-[#E0563F]/60 bg-[#E0563F]/15 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                        <p className="text-sm font-semibold text-white">
                            Tax history could not be loaded
                        </p>
                        <p className="mt-4 text-base leading-7 text-white/80">
                            {error}
                        </p>
                        <Link
                            href="/property-search"
                            className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#E0563F] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#c94a34] focus-visible:ring-4 focus-visible:ring-white/40"
                        >
                            <ArrowLeft size={16} />
                            Return to Property Search
                        </Link>
                    </div>
                </section>
            )}

            {/* Current tax overview */}
            {currentOverviewCount > 0 && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                            Current tax overview
                        </p>

                        <div
                            className={`grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 ${currentOverviewCount === 2
                                    ? 'lg:grid-cols-2'
                                    : 'lg:grid-cols-1'
                                }`}
                        >
                            <StatCard
                                icon={<CircleDollarSign size={19} />}
                                label="Current tax"
                                value={
                                    isAvailable(taxData?.currentTaxAmount)
                                        ? formatCurrency(taxData.currentTaxAmount)
                                        : null
                                }
                            />
                            <StatCard
                                icon={<CheckCircle2 size={19} />}
                                label="Tax status"
                                value={taxData?.taxStatus}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Tax details */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                        Tax details
                    </p>

                    <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            <InfoItem
                                label="Tax year"
                                value={taxData?.currentTaxYear}
                            />
                            <InfoItem
                                label="County"
                                value={hasCounty ? taxData.county : null}
                            />
                            <InfoItem
                                label="Tax authority"
                                value={hasTaxAuthority ? taxData.taxAuthority : null}
                            />
                            <InfoItem
                                label="Last payment"
                                value={
                                    hasLastPayment ? taxData.lastPaymentDate : null
                                }
                            />
                            <InfoItem
                                label="Next due date"
                                value={hasNextDueDate ? taxData.nextDueDate : null}
                            />
                            <InfoItem
                                label="Total historical tax"
                                value={
                                    records.length > 0
                                        ? formatCurrency(totalTax)
                                        : null
                                }
                            />
                            <InfoItem
                                label="Average annual tax"
                                value={
                                    records.length > 0
                                        ? formatCurrency(averageTax)
                                        : null
                                }
                            />
                            <InfoItem
                                label="Current change"
                                value={
                                    records.length > 0
                                        ? `${taxChange >= 0 ? '+' : ''}${taxChange}%`
                                        : null
                                }
                                valueClassName={
                                    taxChange >= 0
                                        ? 'text-[#E0563F]'
                                        : 'text-emerald-300'
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Tax trend */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                        Tax trend
                    </p>

                    <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                        {records.length === 0 ? (
                            <p className="text-sm text-white/70">
                                No tax trend data is available.
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {records.map((record) => {
                                    const maxTax = Math.max(
                                        ...records.map((item) => item.taxAmount),
                                        1
                                    )

                                    return (
                                        <div key={record.year}>
                                            <div className="mb-3 flex justify-between gap-4 text-sm">
                                                <span className="text-white/70">
                                                    {record.year}
                                                </span>
                                                <span className="font-semibold text-white">
                                                    {formatCurrency(record.taxAmount)}
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-white/15">
                                                <div
                                                    className="h-full rounded-full bg-[#E0563F]"
                                                    style={{
                                                        width: `${(record.taxAmount / maxTax) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Historical tax records */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                        Historical tax records
                    </p>

                    <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/[0.09] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)]">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px] text-left">
                                <thead className="border-b border-white/20 bg-white/[0.05]">
                                    <tr>
                                        <th className="px-6 py-5 text-sm font-semibold text-white/75 md:px-8">
                                            Tax year
                                        </th>
                                        <th className="px-6 py-5 text-sm font-semibold text-white/75 md:px-8">
                                            Tax amount
                                        </th>
                                        {hasStatus && (
                                            <th className="px-6 py-5 text-sm font-semibold text-white/75 md:px-8">
                                                Status
                                            </th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {records.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={hasStatus ? 3 : 2}
                                                className="px-6 py-8 text-sm text-white/70 md:px-8"
                                            >
                                                No tax history records were returned by the
                                                backend for this property.
                                            </td>
                                        </tr>
                                    ) : (
                                        records.map((record) => (
                                            <tr
                                                key={record.year}
                                                className="border-b border-white/10 last:border-b-0"
                                            >
                                                <td className="px-6 py-6 text-sm text-white md:px-8">
                                                    {record.year}
                                                </td>
                                                <td className="px-6 py-6 text-sm font-semibold text-white md:px-8">
                                                    {formatCurrency(record.taxAmount)}
                                                </td>
                                                {hasStatus && (
                                                    <td className="px-6 py-6 md:px-8">
                                                        {isAvailable(record.status) ? (
                                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#D174D2]/40 bg-[#D174D2]/10 px-3 py-1.5 text-xs text-white">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-[#D174D2]" />
                                                                {record.status}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-white/50">
                                                                Not available
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Payment information */}
            {paymentInformationCount > 0 && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px]">
                        <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                            Payment information
                        </p>

                        <div
                            className={`grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 ${paymentInformationCount === 2
                                    ? 'md:grid-cols-2'
                                    : 'md:grid-cols-1'
                                }`}
                        >
                            {hasLastPayment && (
                                <div className="bg-[#341D47] p-8 md:p-10">
                                    <div className="flex items-center gap-3">
                                        <CalendarDays
                                            size={20}
                                            className="text-[#D174D2]"
                                        />
                                        <p className="text-sm font-semibold text-[#D174D2]">
                                            Last payment
                                        </p>
                                    </div>
                                    <p className="mt-5 text-2xl font-bold text-white">
                                        {taxData.lastPaymentDate}
                                    </p>
                                    <p className="mt-3 text-sm leading-7 text-white/70">
                                        Payment information is displayed from the backend
                                        property record.
                                    </p>
                                </div>
                            )}

                            {hasNextDueDate && (
                                <div className="bg-[#341D47] p-8 md:p-10">
                                    <div className="flex items-center gap-3">
                                        <CalendarDays
                                            size={20}
                                            className="text-[#D174D2]"
                                        />
                                        <p className="text-sm font-semibold text-[#D174D2]">
                                            Next due date
                                        </p>
                                    </div>
                                    <p className="mt-5 text-2xl font-bold text-white">
                                        {taxData.nextDueDate}
                                    </p>
                                    <p className="mt-3 text-sm leading-7 text-white/70">
                                        The next due date is displayed when provided by
                                        the backend.
                                    </p>
                                </div>
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
                            Zoning information
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
                            Review the property&apos;s zoning classification,
                            permitted use, development rules, and zoning authority
                            information.
                        </p>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                            <Link
                                href="/zoning"
                                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#E0563F] px-8 py-4 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(224,86,63,0.7)] transition duration-200 hover:bg-[#c94a34] focus-visible:ring-4 focus-visible:ring-white/40"
                            >
                                View Zoning Information
                                <ArrowRight size={16} />
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

            {/* Footer */}
            <footer className="border-t border-white/15 bg-[#2B1740]/60 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs font-medium text-white/60 md:flex-row">
                    <span>PROP DUE</span>
                    <span>Property tax history</span>
                </div>
            </footer>
        </main>
    )
}