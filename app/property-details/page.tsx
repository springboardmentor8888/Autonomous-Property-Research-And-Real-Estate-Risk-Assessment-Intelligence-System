'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import {
  propertyApi,
  type DiligenceData,
  type MarketAnalysis,
  type MonitoringStatus,
  type PropertyDetailsResponse,
  type ReportResponse,
  type RiskAssessment,
} from '@/lib/api';

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPrice(value?: number) {
  if (value === null || value === undefined) return '—';
  return '₹' + value.toLocaleString('en-IN');
}

/** Status badge colors per record status family. */
function statusClass(status?: string) {
  switch (status) {
    case 'PAID':
    case 'APPROVED':
    case 'COMPLETED':
    case 'COMPLIANT':
    case 'LOW':
    case 'CLEAR':
    case 'AVAILABLE':
    case 'FREEHOLD':
      return 'bg-emerald-50 text-emerald-700';
    case 'PARTIALLY_PAID':
    case 'PENDING':
    case 'MEDIUM':
    case 'JOINT_OWNERSHIP':
      return 'bg-amber-50 text-amber-700';
    case 'OVERDUE':
    case 'EXPIRED':
    case 'NON_COMPLIANT':
    case 'HIGH':
    case 'FLAGGED':
    case 'NOT_VERIFIED':
      return 'bg-rose-50 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span>—</span>;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(status)}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}

function tierClass(tier?: string) {
  switch (tier) {
    case 'LOW':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'MODERATE':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ELEVATED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'HIGH':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      // INSUFFICIENT_DATA and anything unknown: neutral gray
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

/** Hex colors matching the risk tiers (0–100, higher = riskier). */
function scoreHex(v: number): string {
  if (v >= 55) return '#e11d48'; // rose-600 HIGH
  if (v >= 20) return '#f59e0b'; // amber-500 ELEVATED
  return '#10b981'; // emerald-500 LOW/MODERATE
}

function scoreChipClass(v: number): string {
  if (v >= 55) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (v >= 20) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

/**
 * Circular overall-risk gauge. A null score (insufficient data) renders
 * a neutral gray ring with "N/A".
 */
function RiskGauge({ score, tier }: { score?: number; tier?: string }) {
  const R = 54;
  const CIRC = 2 * Math.PI * R;
  const hasScore = score !== null && score !== undefined;
  const v = hasScore ? Math.min(100, Math.max(0, score!)) : 0;
  const color = hasScore ? scoreHex(v) : '#94a3b8';
  const tierLabel = tier === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT DATA' : `${tier ?? 'UNKNOWN'} RISK`;

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="#e2e8f0" strokeWidth="11" />
          {hasScore && (
            <circle
              cx="64"
              cy="64"
              r={R}
              fill="none"
              stroke={color}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC - (CIRC * v) / 100}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hasScore ? (
            <>
              <span className="text-3xl font-bold tracking-tight" style={{ color }}>
                {score!.toFixed(0)}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                / 100
              </span>
            </>
          ) : (
            <span className="text-xl font-semibold text-slate-400">N/A</span>
          )}
        </div>
      </div>
      <div>
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${tierClass(tier)}`}
        >
          {tierLabel}
        </span>
        <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-slate-500">
          {hasScore
            ? 'Overall weighted risk across all verified diligence domains. Higher means riskier.'
            : 'No diligence records are on file — risk could not be assessed.'}
        </p>
      </div>
    </div>
  );
}

/** One risk-domain card: icon, score chip, colored progress bar. */
function RiskDomainCard({
  label,
  value,
  icon,
}: {
  label: string;
  value?: number;
  icon: string;
}) {
  const hasScore = value !== null && value !== undefined;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span aria-hidden>{icon}</span>
          {label}
        </span>
        {hasScore ? (
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-bold ${scoreChipClass(value!)}`}
          >
            {value!.toFixed(0)}
          </span>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-400">
            No records
          </span>
        )}
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        {hasScore && (
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${Math.min(100, value!)}%`,
              backgroundColor: scoreHex(value!),
            }}
          />
        )}
      </div>
      {hasScore && (
        <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {value! >= 55 ? 'High risk' : value! >= 20 ? 'Elevated risk' : 'Low risk'}
        </p>
      )}
    </div>
  );
}

function RecordCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      <div className="mt-2 space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="flex items-center justify-between gap-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-900">{value}</span>
    </p>
  );
}

function PropertyDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [details, setDetails] = useState<PropertyDetailsResponse | null>(null);
  const [diligence, setDiligence] = useState<DiligenceData | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [monitoring, setMonitoring] = useState<MonitoringStatus | null>(null);
  const [riskStage, setRiskStage] = useState<RiskAssessment | null>(null);
  const [marketStage, setMarketStage] = useState<MarketAnalysis | null>(null);
  const [done, setDone] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [riskBusy, setRiskBusy] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [marketBusy, setMarketBusy] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [monitorBusy, setMonitorBusy] = useState(false);

  const authReady = useAuthGuard({ loginPath: '/' });

  useEffect(() => {
    if (!authReady) return;
    if (!propertyId) {
      setDone(true);
      return;
    }

    propertyApi.getById(propertyId)
      .then((data) => setDetails(data))
      .catch(() => setDetails(null))
      .finally(() => setDone(true));
  }, [propertyId, authReady]);

  useEffect(() => {
    if (!authReady || !propertyId) return;
    const id = Number(propertyId);
    Promise.all([
      propertyApi.getDiligence(id).catch(() => null),
      propertyApi.getReport(id).catch(() => undefined),
      propertyApi.getMonitoring(id).catch(() => null),
      propertyApi.getRiskAssessment(id).catch(() => undefined),
    ]).then(([diligenceData, latestReport, monitoringStatus, latestRisk]) => {
      setDiligence(diligenceData);
      setReport(latestReport ?? null);
      setMonitoring(monitoringStatus);
      // A stored assessment means stage 1 already ran — unlock stages 2 and 3.
      setRiskStage(latestRisk ?? null);
    });
  }, [propertyId, authReady]);

  /** Stage 1: aggregation pipeline + risk scoring. */
  async function runRiskAssessment() {
    if (!details || riskBusy) return;
    setRiskBusy(true);
    setRiskError(null);
    try {
      const result = await propertyApi.runRiskAssessment(details.propertyId);
      setRiskStage(result);
      const refreshed = await propertyApi.getDiligence(details.propertyId).catch(() => null);
      if (refreshed) setDiligence(refreshed);
    } catch (err) {
      setRiskError(err instanceof Error ? err.message : 'Failed to run the risk assessment.');
    } finally {
      setRiskBusy(false);
    }
  }

  /** Stage 2: market-trends and comparable-property analysis. */
  async function runMarketAnalysis() {
    if (!details || marketBusy) return;
    setMarketBusy(true);
    setMarketError(null);
    try {
      const result = await propertyApi.runMarketAnalysis(details.propertyId);
      setMarketStage(result);
    } catch (err) {
      setMarketError(err instanceof Error ? err.message : 'Failed to run the market analysis.');
    } finally {
      setMarketBusy(false);
    }
  }

  async function generateReport() {
    if (!details || generating) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const generated = await propertyApi.generateReport(details.propertyId);
      setReport(generated);
      const refreshed = await propertyApi.getDiligence(details.propertyId).catch(() => null);
      if (refreshed) setDiligence(refreshed);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate the report.');
    } finally {
      setGenerating(false);
    }
  }

  async function downloadPdf() {
    if (!details || downloading) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await propertyApi.downloadReportPdf(details.propertyId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `due-diligence-report-${details.propertyId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Failed to download the report.');
    } finally {
      setDownloading(false);
    }
  }

  async function toggleMonitoring() {
    if (!details || !monitoring || monitorBusy) return;
    setMonitorBusy(true);
    try {
      const next = monitoring.enabled
        ? await propertyApi.disableMonitoring(details.propertyId)
        : await propertyApi.enableMonitoring(details.propertyId);
      setMonitoring(next);
    } finally {
      setMonitorBusy(false);
    }
  }

  if (!authReady) return null;

  const fmt = (v: number | string | null | undefined) =>
    v === null || v === undefined || v === '' ? '—' : String(v);

  const addressFields: Array<[string, string | null | undefined]> = details
    ? [
        ['Address', details.address],
        ['City', details.city],
        ['State', details.state],
        ['Locality', details.locality],
        ['Postal Code', details.postalCode],
        ['Property Type', details.propertyType],
        ['Validation Granularity', details.validationGranularity],
        ['Geocode Granularity', details.geocodeGranularity],
        ['Address Complete', details.addressComplete === undefined ? undefined : details.addressComplete ? 'Yes' : 'No'],
        ['Plus Code', details.plusCode],
      ]
    : [];

  const listingFields: Array<[string, string | null | undefined]> = details
    ? [
        ['Listing Title', details.title],
        ['Listing ID', details.externalListingId],
        ['Subtype', details.propertySubtype],
        ['Bedrooms', details.bedrooms === undefined ? undefined : String(details.bedrooms)],
        ['Bathrooms', details.bathrooms === undefined ? undefined : String(details.bathrooms)],
        ['Carpet Area (sqft)', details.carpetAreaSqft === undefined ? undefined : String(details.carpetAreaSqft)],
        ['Super Area (sqft)', details.superAreaSqft === undefined ? undefined : String(details.superAreaSqft)],
        ['Price (INR)', details.price === undefined ? undefined : details.price.toLocaleString('en-IN')],
        ['Furnishing', details.furnishing],
        ['Floor', details.floor],
        ['Age', details.age],
        ['RERA ID', details.reraId],
        ['Source', details.source],
      ]
    : [];

  const hasListingData = listingFields.some(([, v]) => v !== undefined && v !== null);
  const hasDiligenceRecords = !!(
    diligence &&
    (diligence.ownership ||
      diligence.tax ||
      (diligence.permits && diligence.permits.length > 0) ||
      diligence.zoning ||
      diligence.flood ||
      diligence.environmental ||
      (diligence.utilities && diligence.utilities.length > 0))
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="page-header">
        <div>
          <nav className="text-xs font-medium text-slate-500">
            <button onClick={() => router.push('/dashboard')} className="hover:text-slate-900">
              Dashboard
            </button>
            <span className="mx-2 text-slate-300">/</span>
            <button onClick={() => router.push('/history')} className="hover:text-slate-900">
              History
            </button>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-700">Details</span>
          </nav>
          <h1 className="page-title mt-2">Property Details</h1>
          <p className="page-subtitle">
            {details
              ? 'Validated property record with stored due-diligence data.'
              : 'No record to display.'}
          </p>
        </div>
      </header>

      <section className="card p-8">
        {!done ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : details ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Validated Address</h2>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                {addressFields.map(([k, v]) => (
                  <div key={k} className="border-b border-slate-100 pb-3 last:border-b-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{k}</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{fmt(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {hasListingData && (
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Listing Data</h2>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {listingFields.map(([k, v]) => (
                    <div key={k} className="border-b border-slate-100 pb-3 last:border-b-0">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{k}</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">{fmt(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {details.amenities && details.amenities.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {details.amenities.map((a) => (
                    <span key={a} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {details.description && (
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Description</h2>
                <p className="text-sm text-slate-700 whitespace-pre-line">{details.description}</p>
              </div>
            )}

            {details.listingUrl && (
              <a
                href={details.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View original listing →
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm font-medium text-rose-600">Invalid address</p>
        )}
      </section>

      {details && (
        <section className="card mt-6 p-8">
          <h2 className="text-sm font-semibold text-slate-700">Due Diligence Records</h2>
          <p className="mt-1 text-xs text-slate-500">
            The records stored for this property. Absent sections have not been sourced yet.
          </p>

          {!hasDiligenceRecords ? (
            <p className="mt-4 text-sm text-slate-500">
              No due-diligence records are stored for this property yet.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {diligence?.ownership && (
                <RecordCard title="Ownership">
                  <Field label="Owner" value={diligence.ownership.ownerName ?? '—'} />
                  <Field label="Type" value={<StatusBadge status={diligence.ownership.ownershipType} />} />
                  <Field label="Recorded" value={formatDate(diligence.ownership.recordDate)} />
                </RecordCard>
              )}
              {diligence?.tax && (
                <RecordCard title="Property Tax">
                  <Field label="Status" value={<StatusBadge status={diligence.tax.paymentStatus} />} />
                  <Field label="Amount" value={formatPrice(diligence.tax.taxAmount)} />
                  <Field label="Due" value={formatPrice(diligence.tax.taxDue)} />
                  <Field label="Paid on" value={formatDate(diligence.tax.taxPayDate)} />
                </RecordCard>
              )}
              {diligence?.permits && diligence.permits.length > 0 && (
                <RecordCard title="Building Permits">
                  {diligence.permits.map((p, i) => (
                    <div key={i} className="space-y-1 border-b border-slate-100 pb-1.5 last:border-b-0">
                      <Field label={p.permitNumber ?? 'Permit'} value={<StatusBadge status={p.permitStatus} />} />
                      <Field label="Issued" value={formatDate(p.issueDate)} />
                    </div>
                  ))}
                </RecordCard>
              )}
              {diligence?.zoning && (
                <RecordCard title="Zoning">
                  <Field label="Code" value={diligence.zoning.zoningCode ?? '—'} />
                  <Field label="Status" value={<StatusBadge status={diligence.zoning.zoningStatus} />} />
                  <Field label="Allowed use" value={diligence.zoning.allowedUse ?? '—'} />
                </RecordCard>
              )}
              {diligence?.flood && (
                <RecordCard title="Flood Zone">
                  <Field label="Zone" value={diligence.flood.zone ?? '—'} />
                  <Field label="Risk" value={<StatusBadge status={diligence.flood.riskLevel} />} />
                  <Field label="Effective" value={formatDate(diligence.flood.effectiveDate)} />
                </RecordCard>
              )}
              {diligence?.environmental && (
                <RecordCard title="Environmental">
                  <Field label="Type" value={diligence.environmental.recordType ?? '—'} />
                  <Field label="Status" value={<StatusBadge status={diligence.environmental.status} />} />
                  <Field label="Risk" value={<StatusBadge status={diligence.environmental.riskLevel} />} />
                </RecordCard>
              )}
              {diligence?.utilities && diligence.utilities.length > 0 && (
                <RecordCard title="Utilities">
                  {diligence.utilities.map((u, i) => (
                    <Field
                      key={i}
                      label={u.utilityType ?? 'Utility'}
                      value={<StatusBadge status={u.availabilityStatus} />}
                    />
                  ))}
                </RecordCard>
              )}
            </div>
          )}

          {diligence?.comparables && diligence.comparables.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-700">Comparable Properties</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-4 font-medium">Locality</th>
                      <th className="py-2 pr-4 font-medium">Type</th>
                      <th className="py-2 pr-4 font-medium">BHK</th>
                      <th className="py-2 pr-4 font-medium">Area (sqft)</th>
                      <th className="py-2 pr-4 font-medium">Price</th>
                      <th className="py-2 pr-4 font-medium">₹/sqft</th>
                      <th className="py-2 font-medium">Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diligence.comparables.map((c, i) => (
                      <tr key={i} className="border-b border-slate-100 text-slate-700">
                        <td className="py-2 pr-4">{c.locality ?? '—'}</td>
                        <td className="py-2 pr-4">{c.propertyType ?? '—'}</td>
                        <td className="py-2 pr-4">{c.bhk ?? '—'}</td>
                        <td className="py-2 pr-4">{c.areaSqft ?? '—'}</td>
                        <td className="py-2 pr-4">{formatPrice(c.price)}</td>
                        <td className="py-2 pr-4">{c.pricePerSqft ?? '—'}</td>
                        <td className="py-2">{c.verified ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {diligence?.marketTrends && diligence.marketTrends.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-700">Market Trends</h3>
              <div className="mt-3 space-y-2">
                {diligence.marketTrends.map((t, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-xs"
                  >
                    <span className="font-medium text-slate-700">
                      {t.locality ?? 'City'} · {t.period}
                    </span>
                    <span className="text-slate-600">
                      Avg {t.avgPricePerSqft ? `₹${t.avgPricePerSqft.toLocaleString('en-IN')}/sqft` : '—'}
                      {t.supplyCount !== undefined && ` · ${t.supplyCount} listings`}
                      {t.demandPulse !== undefined && ` · demand ${t.demandPulse}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {details && (
        <section className="card mt-6 p-8">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Due Diligence Workflow</h2>
            <p className="mt-1 text-xs text-slate-500">
              Run the stages in order: the risk assessment executes the aggregation pipeline
              and scores the stored records; the market analysis positions the property against
              its comparables; the report assembles everything into a downloadable document.
            </p>
          </div>

          {/* Stepper */}
          <ol className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium">
            <li className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${
              riskStage ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-300 bg-white text-slate-700'}`}>
              <span className={riskStage ? 'text-emerald-600' : 'text-slate-400'}>{riskStage ? '✓' : '①'}</span>
              Risk Assessment
            </li>
            <span className="text-slate-300">→</span>
            <li className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${
              marketStage ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : riskStage ? 'border-slate-300 bg-white text-slate-700'
                             : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
              <span className={marketStage ? 'text-emerald-600' : 'text-slate-400'}>{marketStage ? '✓' : '②'}</span>
              Market & Comparables
            </li>
            <span className="text-slate-300">→</span>
            <li className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${
              report ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : riskStage ? 'border-slate-300 bg-white text-slate-700'
                             : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
              <span className={report ? 'text-emerald-600' : 'text-slate-400'}>{report ? '✓' : '③'}</span>
              Report
            </li>
          </ol>

          {/* Stage 1: Risk Assessment */}
          <div className="mt-6 rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Stage 1 · Risk Assessment
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Executes the aggregation pipeline over the stored records and calculates the
                  risk scores.
                </p>
              </div>
              <button onClick={runRiskAssessment} disabled={riskBusy} className="btn-primary">
                {riskBusy ? 'Assessing…' : riskStage ? 'Re-run Risk Assessment' : 'Run Risk Assessment'}
              </button>
            </div>
            {riskError && <p className="mt-3 text-xs font-medium text-rose-600">{riskError}</p>}
            {riskStage && (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tierClass(riskStage.riskTier)}`}>
                    {riskStage.riskTier === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT DATA' : `${riskStage.riskTier} RISK`}
                  </span>
                  {riskStage.overallScore !== null && riskStage.overallScore !== undefined && (
                    <span className="text-xs font-semibold text-slate-700">
                      Overall {riskStage.overallScore}/100
                    </span>
                  )}
                  {riskStage.aggregationRunId && (
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                      Pipeline run #{riskStage.aggregationRunId}
                      {riskStage.aggregationStatus && (
                        <span className={riskStage.aggregationStatus === 'COMPLETED' ? ' text-emerald-600' : ' text-amber-600'}>
                          {' '}· {riskStage.aggregationStatus.replaceAll('_', ' ')}
                        </span>
                      )}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    Assessed {formatDateTime(riskStage.assessedAt)}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <RiskDomainCard label="Property Tax" icon="🧾" value={riskStage.taxRisk ?? undefined} />
                  <RiskDomainCard label="Flood Zone" icon="🌊" value={riskStage.floodRisk ?? undefined} />
                  <RiskDomainCard label="Building Permits" icon="🏗️" value={riskStage.permitCompliance ?? undefined} />
                  <RiskDomainCard label="Zoning" icon="🗺️" value={riskStage.zoningCompliance ?? undefined} />
                  <RiskDomainCard label="Legal / Environmental" icon="⚖️" value={riskStage.legalRisk ?? undefined} />
                  <RiskDomainCard label="Ownership Verification" icon="🔑" value={riskStage.ownershipVerification ?? undefined} />
                </div>
              </div>
            )}
          </div>

          {/* Stage 2: Market & Comparable Analysis — unlocked after stage 1 */}
          {riskStage && (
            <div className="mt-4 rounded-xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Stage 2 · Market & Comparable Analysis
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Positions the property against its stored comparables and the latest
                    market-trend data.
                  </p>
                </div>
                <button onClick={runMarketAnalysis} disabled={marketBusy} className="btn-primary">
                  {marketBusy ? 'Analyzing…' : marketStage ? 'Re-run Analysis' : 'Analyze Market & Comparables'}
                </button>
              </div>
              {marketError && <p className="mt-3 text-xs font-medium text-rose-600">{marketError}</p>}
              {marketStage && (
                <div className="mt-4 space-y-3">
                  {marketStage.summary && (
                    <p className="text-sm leading-relaxed text-slate-700">{marketStage.summary}</p>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {marketStage.positioning && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Market Position</p>
                        <p className={`mt-1 text-sm font-semibold ${
                          marketStage.positioning.verdict === 'BELOW_MARKET' ? 'text-emerald-600'
                          : marketStage.positioning.verdict === 'ABOVE_MARKET' ? 'text-rose-600'
                          : 'text-slate-700'}`}>
                          {marketStage.positioning.verdict === 'BELOW_MARKET' && marketStage.positioning.deltaPercent !== undefined
                            ? `${Math.abs(marketStage.positioning.deltaPercent)}% below market`
                            : marketStage.positioning.verdict === 'ABOVE_MARKET' && marketStage.positioning.deltaPercent !== undefined
                              ? `${marketStage.positioning.deltaPercent}% above market`
                              : marketStage.positioning.verdict.replaceAll('_', ' ')}
                        </p>
                        {marketStage.positioning.note && (
                          <p className="mt-1 text-[11px] text-slate-400">{marketStage.positioning.note}</p>
                        )}
                      </div>
                    )}
                    {marketStage.comparables && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Comparables</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {marketStage.comparables.count} listings
                        </p>
                        {marketStage.comparables.averagePrice !== undefined && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            avg ₹{marketStage.comparables.averagePrice.toLocaleString('en-IN')}
                          </p>
                        )}
                        {marketStage.comparables.averagePricePerSqft !== undefined && (
                          <p className="text-[11px] text-slate-500">
                            avg ₹{marketStage.comparables.averagePricePerSqft.toLocaleString('en-IN')}/sqft
                          </p>
                        )}
                      </div>
                    )}
                    {marketStage.trend && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Market Trend</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {marketStage.trend.locality ?? 'City'} · {marketStage.trend.period}
                        </p>
                        {marketStage.trend.avgPricePerSqft !== undefined && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            ₹{marketStage.trend.avgPricePerSqft.toLocaleString('en-IN')}/sqft
                            {marketStage.trend.supplyCount !== undefined && ` · ${marketStage.trend.supplyCount} listings`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage 3: Report — unlocked after stage 1 */}
          {riskStage && (
            <div className="mt-4 rounded-xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Stage 3 · Generate Report
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Assembles the risk assessment{marketStage ? ', market analysis' : ''} and record
                    statuses into the final due-diligence report.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {report && (
                    <button onClick={downloadPdf} disabled={downloading} className="btn-secondary">
                      {downloading ? 'Preparing…' : '⬇ Download PDF'}
                    </button>
                  )}
                  <button onClick={generateReport} disabled={generating} className="btn-primary">
                    {generating ? 'Generating…' : report ? 'Regenerate Report' : 'Generate Report'}
                  </button>
                </div>
              </div>
              {!report && !generating && (
                <p className="mt-3 text-xs text-slate-500">
                  No report generated yet — run stages 1 and 2, then generate the final report.
                </p>
              )}
            </div>
          )}

          {generateError && (
            <p className="mt-3 text-xs font-medium text-rose-600">{generateError}</p>
          )}
          {downloadError && (
            <p className="mt-3 text-xs font-medium text-rose-600">{downloadError}</p>
          )}

          {report ? (
            <div className="mt-6 space-y-6">
              {/* Risk overview hero: gauge + report meta */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <RiskGauge score={report.risk?.overallScore ?? undefined} tier={report.riskTier} />
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Report #{report.reportId}
                    </p>
                    {report.aggregationRunId && (
                      <p className="mt-1 inline-block rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                        Pipeline run #{report.aggregationRunId}
                        {report.aggregationStatus && (
                          <span className={report.aggregationStatus === 'COMPLETED' ? ' text-emerald-600' : ' text-amber-600'}>
                            {' '}· {report.aggregationStatus.replaceAll('_', ' ')}
                          </span>
                        )}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      Generated {formatDateTime(report.generatedAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Status: {report.status}</p>
                  </div>
                </div>
              </div>

              {/* Executive summary */}
              <div className="rounded-xl border-l-4 border-slate-800 bg-slate-50 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Executive Summary
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {report.executiveSummary}
                </p>
                {report.marketPosition && report.marketPosition.verdict !== 'NO_COMPARABLES'
                  && report.marketPosition.verdict !== 'UNKNOWN' && (
                  <p className="mt-3 inline-block rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                    Market position: {report.marketPosition.verdict.replaceAll('_', ' ').toLowerCase()}
                    {report.marketPosition.deltaPercent !== undefined && (
                      <span className="text-slate-400">
                        {' '}({report.marketPosition.deltaPercent > 0 ? '+' : ''}
                        {report.marketPosition.deltaPercent}% vs comparables)
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Domain risk cards */}
              {report.risk && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Risk Analysis by Domain
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-400">
                    0–100 scale — higher means riskier. Green below 20 · Amber 20–54 · Red 55 and above
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <RiskDomainCard label="Property Tax" icon="🧾"
                      value={report.risk.taxRisk ?? undefined} />
                    <RiskDomainCard label="Flood Zone" icon="🌊"
                      value={report.risk.floodRisk ?? undefined} />
                    <RiskDomainCard label="Building Permits" icon="🏗️"
                      value={report.risk.permitCompliance ?? undefined} />
                    <RiskDomainCard label="Zoning" icon="🗺️"
                      value={report.risk.zoningCompliance ?? undefined} />
                    <RiskDomainCard label="Legal / Environmental" icon="⚖️"
                      value={report.risk.legalRisk ?? undefined} />
                    <RiskDomainCard label="Ownership Verification" icon="🔑"
                      value={report.risk.ownershipVerification ?? undefined} />
                  </div>
                </div>
              )}

              {/* Record statuses */}
              {report.records && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Record Statuses
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {report.records.taxStatus && (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.taxStatus)}`}>
                        Tax: {report.records.taxStatus.replaceAll('_', ' ')}
                      </span>
                    )}
                    {report.records.permitStatus && (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.permitStatus)}`}>
                        Permit: {report.records.permitStatus}
                      </span>
                    )}
                    {report.records.zoningStatus && (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.zoningStatus)}`}>
                        Zoning: {report.records.zoningStatus.replaceAll('_', ' ')}
                      </span>
                    )}
                    {report.records.floodRiskLevel && (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.floodRiskLevel)}`}>
                        Flood: {report.records.floodRiskLevel}
                      </span>
                    )}
                    {report.records.environmentalStatus && (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.environmentalStatus)}`}>
                        Environmental: {report.records.environmentalStatus}
                      </span>
                    )}
                    {report.records.ownershipType && (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.ownershipType)}`}>
                        Ownership: {report.records.ownershipType.replaceAll('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Data coverage */}
              {report.coverage && (
                <div className="rounded-xl border border-slate-200 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Data Coverage
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {report.coverage.comparablesCount ?? 0}
                    </span>{' '}
                    comparable listings ·{' '}
                    <span className="font-semibold text-slate-800">
                      {report.coverage.marketTrendsCount ?? 0}
                    </span>{' '}
                    market trend periods
                  </p>
                  {report.coverage.missingSections && report.coverage.missingSections.length > 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      ⚠ Not yet sourced: {report.coverage.missingSections.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </section>
      )}

      {details && (
        <section className="card mt-6 p-8">
          <h2 className="text-sm font-semibold text-slate-700">Property Monitoring</h2>
          <p className="mt-1 text-xs text-slate-500">
            Monitor this property for changes in its records — ownership, tax, permits,
            listings and market data.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={toggleMonitoring}
              disabled={!monitoring || monitorBusy}
              className={monitoring?.enabled ? 'btn-secondary' : 'btn-primary'}
            >
              {monitorBusy
                ? 'Updating…'
                : monitoring?.enabled
                  ? 'Stop monitoring'
                  : 'Monitor this property'}
            </button>
            {monitoring?.enabled ? (
              <p className="text-xs text-slate-500">
                Monitoring active since {formatDateTime(monitoring.monitoredSince)} · last checked{' '}
                {formatDateTime(monitoring.lastCheckedAt)} · next check{' '}
                {formatDateTime(monitoring.nextCheckAt)}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Not monitoring. Enable to track record changes for this property.
              </p>
            )}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button onClick={() => router.push('/property-search')} className="btn-secondary">
          Search another property
        </button>
        <button onClick={() => router.push('/reports')} className="btn-secondary">
          View my reports
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          Back to dashboard
        </button>
      </div>
    </main>
  );
}

export default function PropertyDetails() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500 px-6 py-10">Loading…</p>}>
      <PropertyDetailsContent />
    </Suspense>
  );
}
