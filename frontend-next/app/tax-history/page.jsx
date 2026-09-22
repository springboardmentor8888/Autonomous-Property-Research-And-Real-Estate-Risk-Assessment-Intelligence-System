"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    FileText,
    Search,
    TrendingUp,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| DEFAULT PROPERTY
|--------------------------------------------------------------------------
| Used when the page is opened directly without a selected property.
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
| DEMO PROPERTY TAX DATA
|--------------------------------------------------------------------------
| Temporary frontend data.
| Later this will come from the backend tax-history API.
|--------------------------------------------------------------------------
*/
const DEMO_TAX_DATA = {
    currentTaxYear: "2026",
    currentTaxAmount: 4280,
    currentAssessedValue: 285000,
    currentMarketValue: 312000,

    taxStatus: "Paid",
    lastPaymentDate: "September 12, 2026",
    nextDueDate: "November 30, 2026",

    county: "Sangamon County",
    taxAuthority: "Sangamon County Treasurer",

    records: [
        {
            year: "2026",
            assessedValue: 285000,
            marketValue: 312000,
            taxAmount: 4280,
            paymentDate: "September 12, 2026",
            status: "Paid",
        },
        {
            year: "2025",
            assessedValue: 272000,
            marketValue: 298000,
            taxAmount: 4095,
            paymentDate: "November 18, 2025",
            status: "Paid",
        },
        {
            year: "2024",
            assessedValue: 260000,
            marketValue: 286000,
            taxAmount: 3910,
            paymentDate: "November 21, 2024",
            status: "Paid",
        },
        {
            year: "2023",
            assessedValue: 248000,
            marketValue: 273000,
            taxAmount: 3725,
            paymentDate: "November 20, 2023",
            status: "Paid",
        },
        {
            year: "2022",
            assessedValue: 235000,
            marketValue: 259000,
            taxAmount: 3540,
            paymentDate: "November 22, 2022",
            status: "Paid",
        },
    ],
};

export default function TaxHistoryPage() {
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

    const records = DEMO_TAX_DATA.records;

    const totalTax = useMemo(() => {
        return records.reduce(
            (total, record) => total + record.taxAmount,
            0
        );
    }, [records]);

    const averageTax = useMemo(() => {
        if (records.length === 0) {
            return 0;
        }

        return Math.round(totalTax / records.length);
    }, [records, totalTax]);

    const taxChange = useMemo(() => {
        if (records.length < 2) {
            return 0;
        }

        const current = records[0].taxAmount;
        const previous = records[1].taxAmount;

        return Math.round(
            ((current - previous) / previous) * 100
        );
    }, [records]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0b0b0b] text-white">
                <div className="flex min-h-screen items-center justify-center">
                    <div className="flex items-center gap-4 text-white/50">
                        <div className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />

                        <span>Loading tax history...</span>
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

                <div className="absolute right-[-200px] top-[30%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />
            </div>

            {/* Hero */}
            <section className="border-b border-white/10 px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <Link
                        href="/property-search"
                        className="inline-flex items-center gap-2 text-sm text-white/35 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Back to Property Search
                    </Link>

                    <p className="mb-7 mt-16 text-xs font-semibold tracking-[0.35em] text-white/35">
                        PROPERTY TAX / HISTORY
                    </p>

                    <h1 className="max-w-6xl text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.05em]">
                        Review
                        <br />

                        <span className="text-white/35">
                            tax history.
                        </span>
                    </h1>

                    <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/45 md:text-xl">
                        Review historical property tax assessments, tax amounts,
                        payment status, and changes across previous tax years.
                    </p>

                    {/* Demo indicator */}
                    <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.04] px-4 py-2 text-xs text-yellow-300/70">
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />

                        DEMO DATA — BACKEND INTEGRATION PENDING
                    </div>
                </div>
            </section>

            {/* Property */}
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

            {/* Current Tax Overview */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        CURRENT TAX OVERVIEW
                    </p>

                    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={
                                <CircleDollarSign
                                    size={19}
                                />
                            }
                            label="CURRENT TAX"
                            value={formatCurrency(
                                DEMO_TAX_DATA.currentTaxAmount
                            )}
                        />

                        <StatCard
                            icon={<FileText size={19} />}
                            label="ASSESSED VALUE"
                            value={formatCurrency(
                                DEMO_TAX_DATA.currentAssessedValue
                            )}
                        />

                        <StatCard
                            icon={<TrendingUp size={19} />}
                            label="MARKET VALUE"
                            value={formatCurrency(
                                DEMO_TAX_DATA.currentMarketValue
                            )}
                        />

                        <StatCard
                            icon={
                                <CheckCircle2 size={19} />
                            }
                            label="TAX STATUS"
                            value={DEMO_TAX_DATA.taxStatus}
                        />
                    </div>
                </div>
            </section>

            {/* Tax Details */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        TAX DETAILS
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            <InfoItem
                                label="TAX YEAR"
                                value={DEMO_TAX_DATA.currentTaxYear}
                            />

                            <InfoItem
                                label="COUNTY"
                                value={DEMO_TAX_DATA.county}
                            />

                            <InfoItem
                                label="TAX AUTHORITY"
                                value={DEMO_TAX_DATA.taxAuthority}
                            />

                            <InfoItem
                                label="LAST PAYMENT"
                                value={DEMO_TAX_DATA.lastPaymentDate}
                            />

                            <InfoItem
                                label="NEXT DUE DATE"
                                value={DEMO_TAX_DATA.nextDueDate}
                            />

                            <InfoItem
                                label="TOTAL HISTORICAL TAX"
                                value={formatCurrency(totalTax)}
                            />

                            <InfoItem
                                label="AVERAGE ANNUAL TAX"
                                value={formatCurrency(averageTax)}
                            />

                            <InfoItem
                                label="CURRENT CHANGE"
                                value={`${taxChange >= 0 ? "+" : ""}${taxChange}%`}
                                valueClassName={
                                    taxChange >= 0
                                        ? "text-orange-300"
                                        : "text-emerald-300"
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Tax Trend */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                                TAX TREND
                            </p>

                            <h2 className="mt-4 text-3xl font-light text-white/80 md:text-5xl">
                                Annual tax changes
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/35">
                            <TrendingUp size={15} />
                            Based on demo records
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        <div className="space-y-8">
                            {records.map((record, index) => {
                                const maximumTax = Math.max(
                                    ...records.map(
                                        (item) => item.taxAmount
                                    )
                                );

                                const percentage =
                                    maximumTax > 0
                                        ? (record.taxAmount / maximumTax) *
                                        100
                                        : 0;

                                return (
                                    <div key={record.year}>
                                        <div className="flex items-center justify-between gap-6">
                                            <div>
                                                <p className="text-xs tracking-[0.25em] text-white/25">
                                                    TAX YEAR
                                                </p>

                                                <p className="mt-2 text-lg text-white/70">
                                                    {record.year}
                                                </p>
                                            </div>

                                            <p className="text-lg text-white/75">
                                                {formatCurrency(
                                                    record.taxAmount
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                            <div
                                                className="h-full rounded-full bg-white/30 transition-all duration-700"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>

                                        {index <
                                            records.length - 1 && (
                                                <div className="mt-8 border-b border-white/[0.06]" />
                                            )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Historical Records */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        HISTORICAL TAX RECORDS
                    </p>

                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-left">
                                        <th className="px-6 py-5 text-xs font-medium tracking-[0.2em] text-white/25 md:px-8">
                                            TAX YEAR
                                        </th>

                                        <th className="px-6 py-5 text-xs font-medium tracking-[0.2em] text-white/25 md:px-8">
                                            ASSESSED VALUE
                                        </th>

                                        <th className="px-6 py-5 text-xs font-medium tracking-[0.2em] text-white/25 md:px-8">
                                            MARKET VALUE
                                        </th>

                                        <th className="px-6 py-5 text-xs font-medium tracking-[0.2em] text-white/25 md:px-8">
                                            TAX AMOUNT
                                        </th>

                                        <th className="px-6 py-5 text-xs font-medium tracking-[0.2em] text-white/25 md:px-8">
                                            PAYMENT DATE
                                        </th>

                                        <th className="px-6 py-5 text-xs font-medium tracking-[0.2em] text-white/25 md:px-8">
                                            STATUS
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {records.map((record) => (
                                        <tr
                                            key={record.year}
                                            className="border-b border-white/[0.06] last:border-b-0"
                                        >
                                            <td className="px-6 py-6 text-sm text-white/70 md:px-8">
                                                {record.year}
                                            </td>

                                            <td className="px-6 py-6 text-sm text-white/55 md:px-8">
                                                {formatCurrency(
                                                    record.assessedValue
                                                )}
                                            </td>

                                            <td className="px-6 py-6 text-sm text-white/55 md:px-8">
                                                {formatCurrency(
                                                    record.marketValue
                                                )}
                                            </td>

                                            <td className="px-6 py-6 text-sm font-medium text-white/80 md:px-8">
                                                {formatCurrency(
                                                    record.taxAmount
                                                )}
                                            </td>

                                            <td className="px-6 py-6 text-sm text-white/55 md:px-8">
                                                {record.paymentDate}
                                            </td>

                                            <td className="px-6 py-6 md:px-8">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-1.5 text-xs text-emerald-300/75">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Payment Information */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        PAYMENT INFORMATION
                    </p>

                    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
                        <div className="bg-[#101010] p-8 md:p-10">
                            <div className="flex items-center gap-3">
                                <CalendarDays
                                    size={20}
                                    className="text-white/40"
                                />

                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    LAST PAYMENT
                                </p>
                            </div>

                            <p className="mt-5 text-2xl font-light text-white/80">
                                {DEMO_TAX_DATA.lastPaymentDate}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-white/35">
                                The latest demo tax payment is marked as paid.
                            </p>
                        </div>

                        <div className="bg-[#101010] p-8 md:p-10">
                            <div className="flex items-center gap-3">
                                <CalendarDays
                                    size={20}
                                    className="text-white/40"
                                />

                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    NEXT DUE DATE
                                </p>
                            </div>

                            <p className="mt-5 text-2xl font-light text-white/80">
                                {DEMO_TAX_DATA.nextDueDate}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-white/35">
                                The next tax deadline shown here is demo data.
                            </p>
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
                            Zoning Information
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/35">
                            Review the property's zoning classification, permitted use,
                            development rules, and zoning authority information.
                        </p>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                            {/* Zoning Button */}
                            <Link
                                href="/zoning"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-black"
                            >
                                View Zoning Information
                                <ArrowRight size={16} />
                            </Link>

                            {/* Property Search */}
                            <Link
                                href="/property-search"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 px-7 py-4 text-sm font-medium text-white/50 transition duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                            >
                                Property Search
                                <ArrowLeft size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">
                    <span>PROP DUE</span>

                    <span>PROPERTY TAX HISTORY</span>
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
function InfoItem({
    label,
    value,
    valueClassName = "text-white/70",
}) {
    return (
        <div>
            <p className="text-xs tracking-[0.22em] text-white/25">
                {label}
            </p>

            <p
                className={`mt-4 text-lg font-light ${valueClassName}`}
            >
                {value}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Currency Formatter
|--------------------------------------------------------------------------
*/
function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}