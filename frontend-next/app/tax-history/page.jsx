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
    TrendingUp,
} from "lucide-react";

const DEFAULT_PROPERTY = {
    formattedAddress: "",
    city: "",
    state: "",
    postalCode: "",
    propertyId: "",
};

function normalizeTaxData(response) {
    const payload = response?.data ?? response?.property ?? response ?? {};

    const rawRecords =
        payload.taxHistory ??
        payload.taxRecords ??
        payload.tax_history ??
        payload.tax_records ??
        [];

    const records = Array.isArray(rawRecords)
        ? rawRecords
            .map((record) => ({
                year: String(
                    record.year ??
                    record.taxYear ??
                    record.tax_year ??
                    ""
                ),
                assessedValue: Number(
                    record.assessedValue ??
                    record.assessed_value ??
                    0
                ),
                marketValue: Number(
                    record.marketValue ??
                    record.market_value ??
                    0
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
                    "Not available",
                status:
                    record.status ??
                    record.paymentStatus ??
                    record.payment_status ??
                    "Unknown",
            }))
            .filter((record) => record.year || record.taxAmount > 0)
        : [];

    records.sort((a, b) => Number(b.year) - Number(a.year));

    const latest = records[0] ?? {};

    return {
        records,
        currentTaxYear:
            payload.currentTaxYear ??
            payload.current_tax_year ??
            latest.year ??
            "Not available",
        currentTaxAmount: Number(
            payload.currentTaxAmount ??
            payload.current_tax_amount ??
            latest.taxAmount ??
            0
        ),
        currentAssessedValue: Number(
            payload.currentAssessedValue ??
            payload.current_assessed_value ??
            latest.assessedValue ??
            0
        ),
        currentMarketValue: Number(
            payload.currentMarketValue ??
            payload.current_market_value ??
            latest.marketValue ??
            0
        ),
        taxStatus:
            payload.taxStatus ??
            payload.tax_status ??
            latest.status ??
            "Not available",
        lastPaymentDate:
            payload.lastPaymentDate ??
            payload.last_payment_date ??
            latest.paymentDate ??
            "Not available",
        nextDueDate:
            payload.nextDueDate ??
            payload.next_due_date ??
            "Not available",
        county:
            payload.county ??
            payload.countyName ??
            payload.county_name ??
            "Not available",
        taxAuthority:
            payload.taxAuthority ??
            payload.tax_authority ??
            "Not available",
    };
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

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
            <p className={`mt-4 text-lg font-light ${valueClassName}`}>
                {value ?? "Not available"}
            </p>
        </div>
    );
}

export default function TaxHistoryPage() {
    const [property, setProperty] = useState(DEFAULT_PROPERTY);
    const [taxData, setTaxData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadTaxHistory() {
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
                        `Unable to load tax history (HTTP ${response.status}).`
                    );
                }

                if (!cancelled) {
                    setTaxData(normalizeTaxData(responseData));
                }
            } catch (err) {
                console.error("Tax history loading error:", err);

                if (!cancelled) {
                    setError(
                        err.message || "Unable to load tax history."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadTaxHistory();

        return () => {
            cancelled = true;
        };
    }, []);

    const records = taxData?.records ?? [];

    const totalTax = useMemo(
        () =>
            records.reduce(
                (total, record) => total + record.taxAmount,
                0
            ),
        [records]
    );

    const averageTax = useMemo(() => {
        if (records.length === 0) return 0;
        return Math.round(totalTax / records.length);
    }, [records, totalTax]);

    const taxChange = useMemo(() => {
        if (records.length < 2 || records[1].taxAmount === 0) {
            return 0;
        }

        return Math.round(
            ((records[0].taxAmount - records[1].taxAmount) /
                records[1].taxAmount) *
            100
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
                        Review historical property tax assessments, tax
                        amounts, payment status, and changes across previous
                        tax years.
                    </p>

                    <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.04] px-4 py-2 text-xs text-sky-300/70">
                        <span className="h-2 w-2 rounded-full bg-sky-400" />
                        BACKEND DATA
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
                            value={property.propertyDbId ?? property.id ?? property.propertyId}
                        />
                    </div>
                </div>
            </section>

            {/* Error */}
            {error && (
                <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                    <div className="mx-auto max-w-[1400px] rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-8">
                        <p className="text-xs font-semibold tracking-[0.25em] text-red-300/80">
                            TAX HISTORY COULD NOT BE LOADED
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

            {/* Current Tax Overview */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        CURRENT TAX OVERVIEW
                    </p>

                    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={<CircleDollarSign size={19} />}
                            label="CURRENT TAX"
                            value={formatCurrency(
                                taxData?.currentTaxAmount ?? 0
                            )}
                        />
                        <StatCard
                            icon={<FileText size={19} />}
                            label="ASSESSED VALUE"
                            value={formatCurrency(
                                taxData?.currentAssessedValue ?? 0
                            )}
                        />
                        <StatCard
                            icon={<TrendingUp size={19} />}
                            label="MARKET VALUE"
                            value={formatCurrency(
                                taxData?.currentMarketValue ?? 0
                            )}
                        />
                        <StatCard
                            icon={<CheckCircle2 size={19} />}
                            label="TAX STATUS"
                            value={taxData?.taxStatus ?? "Not available"}
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
                                value={taxData?.currentTaxYear}
                            />
                            <InfoItem
                                label="COUNTY"
                                value={taxData?.county}
                            />
                            <InfoItem
                                label="TAX AUTHORITY"
                                value={taxData?.taxAuthority}
                            />
                            <InfoItem
                                label="LAST PAYMENT"
                                value={taxData?.lastPaymentDate}
                            />
                            <InfoItem
                                label="NEXT DUE DATE"
                                value={taxData?.nextDueDate}
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
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        TAX TREND
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                        {records.length === 0 ? (
                            <p className="text-sm text-white/40">
                                No tax trend data is available.
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {records.map((record) => {
                                    const maxTax = Math.max(
                                        ...records.map((item) => item.taxAmount),
                                        1
                                    );

                                    return (
                                        <div key={record.year}>
                                            <div className="mb-3 flex justify-between gap-4 text-sm">
                                                <span className="text-white/50">
                                                    {record.year}
                                                </span>
                                                <span className="text-white/80">
                                                    {formatCurrency(record.taxAmount)}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                                <div
                                                    className="h-full rounded-full bg-orange-400"
                                                    style={{
                                                        width: `${(record.taxAmount / maxTax) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Historical Tax Records */}
            <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
                <div className="mx-auto max-w-[1400px]">
                    <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                        HISTORICAL TAX RECORDS
                    </p>

                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left">
                                <thead className="border-b border-white/10 bg-white/[0.02]">
                                    <tr>
                                        {[
                                            "Tax Year",
                                            "Assessed Value",
                                            "Market Value",
                                            "Tax Amount",
                                            "Payment Date",
                                            "Status",
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="px-6 py-5 text-xs font-medium tracking-wider text-white/30 md:px-8"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {records.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-8 text-sm text-white/40 md:px-8"
                                            >
                                                No tax history records were
                                                returned by the backend for this
                                                property.
                                            </td>
                                        </tr>
                                    ) : (
                                        records.map((record) => (
                                            <tr
                                                key={record.year}
                                                className="border-b border-white/[0.06] last:border-b-0"
                                            >
                                                <td className="px-6 py-6 text-sm text-white/70 md:px-8">
                                                    {record.year}
                                                </td>
                                                <td className="px-6 py-6 text-sm text-white/55 md:px-8">
                                                    {formatCurrency(record.assessedValue)}
                                                </td>
                                                <td className="px-6 py-6 text-sm text-white/55 md:px-8">
                                                    {formatCurrency(record.marketValue)}
                                                </td>
                                                <td className="px-6 py-6 text-sm font-medium text-white/80 md:px-8">
                                                    {formatCurrency(record.taxAmount)}
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
                                        ))
                                    )}
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
                                {taxData?.lastPaymentDate ?? "Not available"}
                            </p>
                            <p className="mt-3 text-sm leading-7 text-white/35">
                                Payment information is displayed from the
                                backend property record.
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
                                {taxData?.nextDueDate ?? "Not available"}
                            </p>
                            <p className="mt-3 text-sm leading-7 text-white/35">
                                The next due date is displayed when provided
                                by the backend.
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
                            Review the property&apos;s zoning classification,
                            permitted use, development rules, and zoning
                            authority information.
                        </p>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                            <Link
                                href="/zoning"
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-black"
                            >
                                View Zoning Information
                                <ArrowRight size={16} />
                            </Link>

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