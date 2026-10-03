'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import {
  propertyApi,
  documentApi,
  type AggregationResponse,
  type DiligenceData,
  type MarketAnalysis,
  type MonitoringStatus,
  type PropertyDetailsResponse,
  type ReportResponse,
  type RiskAssessment,
  type SupportingDocResponse,
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
}: {
  label: string;
  value?: number;
}) {
  const hasScore = value !== null && value !== undefined;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700">
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

/**
 * Connected workflow stepper: numbered circles joined by lines, labels
 * underneath. Completed stages fill emerald with a check, the next stage
 * fills slate, locked stages stay outlined. Clicking a step scrolls to it.
 */
function WorkflowStepper({
  steps,
  onStepClick,
}: {
  steps: Array<{ label: string; hint: string; state: 'done' | 'active' | 'locked' }>;
  onStepClick?: (index: number) => void;
}) {
  return (
    <ol className="mt-6 flex">
      {steps.map((step, i) => (
        <li key={step.label} className="flex-1 last:flex-none">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onStepClick?.(i)}
              aria-label={`${step.label} — ${step.state}`}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition ${
                step.state === 'done'
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : step.state === 'active'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-400'
              }`}
            >
              {step.state === 'done' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </button>
            {i < steps.length - 1 && (
              <span
                className={`h-0.5 flex-1 ${step.state === 'done' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                aria-hidden
              />
            )}
          </div>
          <p
            className={`mt-2 text-xs font-semibold ${
              step.state === 'locked' ? 'text-slate-400' : 'text-slate-700'
            }`}
          >
            {step.label}
          </p>
          <p className="text-[11px] text-slate-400">{step.hint}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * Per-period market trend bars: price/sqft as vertical bars with value
 * labels, period labels and a demand pulse indicator underneath.
 */
function MarketTrendChart({
  trends,
}: {
  trends: Array<{
    period?: string | null;
    avgPricePerSqft?: number | null;
    demandPulse?: number | null;
  }>;
}) {
  const points = trends.filter((t) => t.avgPricePerSqft != null);
  if (points.length === 0) return null;
  const max = Math.max(...points.map((t) => t.avgPricePerSqft!));
  return (
    <div className="mt-2 flex items-end gap-4 overflow-x-auto pb-1">
      {points.map((t, i) => (
        <div key={i} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
          <span className="whitespace-nowrap text-[11px] font-semibold text-slate-700">
            ₹{t.avgPricePerSqft!.toLocaleString('en-IN')}
          </span>
          <div className="flex h-28 w-full items-end rounded-t-md bg-slate-100">
            <div
              className="w-full rounded-t-md bg-slate-900 transition-all"
              style={{ height: `${(t.avgPricePerSqft! / max) * 100}%` }}
              aria-hidden
            />
          </div>
          <span className="whitespace-nowrap text-[10px] font-medium text-slate-500">
            {t.period ?? '—'}
          </span>
          {t.demandPulse != null && (
            <span
              className={`whitespace-nowrap text-[10px] font-semibold ${
                t.demandPulse >= 0.5 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              demand {t.demandPulse}
            </span>
          )}
        </div>
      ))}
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
  const [aggregationStage, setAggregationStage] = useState<AggregationResponse | null>(null);
  const [riskStage, setRiskStage] = useState<RiskAssessment | null>(null);
  const [marketStage, setMarketStage] = useState<MarketAnalysis | null>(null);
  const [done, setDone] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [aggregationBusy, setAggregationBusy] = useState(false);
  const [aggregationError, setAggregationError] = useState<string | null>(null);
  const [riskBusy, setRiskBusy] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [marketBusy, setMarketBusy] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [monitorBusy, setMonitorBusy] = useState(false);
  const [docs, setDocs] = useState<SupportingDocResponse[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setDocsLoading(true);
    documentApi.listForProperty(propertyId)
      .then((data) => setDocs(data))
      .catch(() => setDocs([]))
      .finally(() => setDocsLoading(false));
  }, [propertyId, authReady]);

  useEffect(() => {
    if (!authReady || !propertyId) return;
    const id = Number(propertyId);
    Promise.all([
      propertyApi.getDiligence(id).catch(() => null),
      propertyApi.getReport(id).catch(() => undefined),
      propertyApi.getMonitoring(id).catch(() => null),
      propertyApi.getRiskAssessment(id).catch(() => undefined),
      propertyApi.getAggregationRuns(id).catch(() => []),
    ]).then(([diligenceData, latestReport, monitoringStatus, latestRisk, runs]) => {
      setDiligence(diligenceData);
      setReport(latestReport ?? null);
      setMonitoring(monitoringStatus);
      // A stored assessment means the risk stage already ran.
      setRiskStage(latestRisk ?? null);
      // A past pipeline run means the aggregation stage already ran.
      if (runs && runs.length > 0) {
        const latest = runs[0];
        setAggregationStage({
          aggregationRunId: latest.aggregationRunId,
          propertyId: latest.propertyId,
          status: latest.status,
          startedAt: latest.startedAt,
          completedAt: latest.completedAt,
        });
      }
    });
  }, [propertyId, authReady]);

  /** Stage A: runs the stored-data aggregation pipeline. */
  async function runAggregationPipeline() {
    if (!details || aggregationBusy) return;
    setAggregationBusy(true);
    setAggregationError(null);
    try {
      const result = await propertyApi.runAggregation(details.propertyId);
      setAggregationStage(result);
    } catch (err) {
      setAggregationError(err instanceof Error ? err.message : 'Failed to run the aggregation pipeline.');
    } finally {
      setAggregationBusy(false);
    }
  }

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

  async function downloadExcel() {
    if (!details || downloadingExcel) return;
    setDownloadingExcel(true);
    setDownloadError(null);
    try {
      const blob = await propertyApi.downloadReportExcel(details.propertyId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `due-diligence-report-${details.propertyId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Failed to export the report.');
    } finally {
      setDownloadingExcel(false);
    }
  }

  /** Uploads a selected document against the property's latest report. */
  async function handleDocUpload(file: File) {
    if (!details) return;
    setUploadingDoc(true);
    setDocError(null);
    try {
      const doc = await documentApi.upload(
        details.propertyId,
        file,
        report?.reportId
      );
      setDocs((prev) => [doc, ...prev]);
    } catch (err) {
      setDocError(err instanceof Error ? err.message : 'Failed to upload the document.');
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDocDownload(doc: SupportingDocResponse) {
    setDocError(null);
    try {
      const blob = await documentApi.download(doc.documentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDocError(err instanceof Error ? err.message : 'Failed to download the document.');
    }
  }

  async function handleDocDelete(docId: number) {
    if (!confirm('Delete this document? This action cannot be undone.')) {
      return;
    }
    setDeletingDocId(docId);
    setDocError(null);
    try {
      await documentApi.delete(docId);
      setDocs((prev) => prev.filter((d) => d.documentId !== docId));
    } catch (err) {
      setDocError(err instanceof Error ? err.message : 'Failed to delete the document.');
    } finally {
      setDeletingDocId(null);
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

        </section>
      )}

      {details && (
        <section className="card mt-6 p-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Due Diligence Workflow</h2>
            <p className="mt-1 text-xs text-slate-500">
              Run the stages in order — each stage unlocks the next. Research inventories
              the stored records and scores them, the market analysis positions the
              property against its comparables, and the report assembles everything
              into a downloadable document.
            </p>
          </div>

          <WorkflowStepper
            steps={[
              {
                label: 'Research',
                hint: 'Inventory + scoring',
                state: aggregationStage ? 'done' : 'active',
              },
              {
                label: 'Risk Assessment',
                hint: 'Domain scores',
                state: riskStage ? 'done' : aggregationStage ? 'active' : 'locked',
              },
              {
                label: 'Market & Comparables',
                hint: 'Positioning',
                state: (marketStage || report) ? 'done' : riskStage ? 'active' : 'locked',
              },
              {
                label: 'Report',
                hint: 'Download',
                state: report ? 'done' : (marketStage || riskStage) ? 'active' : 'locked',
              },
            ]}
            onStepClick={(i) => {
              const ids = ['stage-research', 'stage-risk', 'stage-market', 'stage-report'];
              document
                .getElementById(ids[i])
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </section>
      )}

      {/* Stage 1: Research — own top-level card */}
      {details && (
        <section id="stage-research" className="card mt-6 p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Research</h2>
              <p className="mt-1 text-sm text-slate-500">
                Inventories the property's stored diligence records — which sections are
                available and which are still missing.
              </p>
            </div>
            <button onClick={runAggregationPipeline} disabled={aggregationBusy} className="btn-primary">
              {aggregationBusy ? 'Running…' : aggregationStage ? 'Re-run Research' : 'Run Research'}
            </button>
          </div>
            {aggregationError && (
              <p className="mt-3 text-xs font-medium text-rose-600">{aggregationError}</p>
            )}
            {aggregationStage && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                    Run #{aggregationStage.aggregationRunId}
                    <span className={aggregationStage.status === 'COMPLETED' ? ' text-emerald-600' : ' text-amber-600'}>
                      {' '}· {aggregationStage.status.replaceAll('_', ' ')}
                    </span>
                  </span>
                  {aggregationStage.completedAt && (
                    <span className="text-xs text-slate-400">
                      Completed {formatDateTime(aggregationStage.completedAt)}
                    </span>
                  )}
                </div>
                {aggregationStage.observations && aggregationStage.observations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {aggregationStage.observations.map((o, i) => (
                      <span
                        key={i}
                        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          o.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'}`}
                        title={o.operation}
                      >
                        {o.operation.replaceAll('_', ' ')}: {o.status}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Section details are shown when the research run completes. Re-run to refresh them.
                  </p>
                )}

                {/* Risk scoring parameters — visible once the scoring has run */}
                {riskStage && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Risk Scoring Parameters
                      </p>
                      <span
                        className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                          riskStage.overallScore != null
                            ? scoreChipClass(riskStage.overallScore)
                            : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        Overall {riskStage.overallScore != null ? `${riskStage.overallScore.toFixed(0)}/100` : 'N/A'}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {([
                        ['Property Tax', riskStage.taxRisk],
                        ['Flood Zone', riskStage.floodRisk],
                        ['Building Permits', riskStage.permitCompliance],
                        ['Zoning', riskStage.zoningCompliance],
                        ['Legal / Environmental', riskStage.legalRisk],
                        ['Ownership Verification', riskStage.ownershipVerification],
                      ] as Array<[string, number | null | undefined]>).map(([label, score]) => (
                        <span
                          key={label}
                          className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                            score != null
                              ? scoreChipClass(score)
                              : 'border-slate-200 bg-white text-slate-400'
                          }`}
                        >
                          {label}: {score != null ? score.toFixed(0) : 'no records'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Risk assessment action — enabled only after the research execution */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={runRiskAssessment}
                  disabled={!aggregationStage || riskBusy}
                  className="btn-primary"
                >
                  {riskBusy ? 'Assessing…' : riskStage ? 'Re-run Risk Assessment' : 'Run Risk Assessment'}
                </button>
                {!aggregationStage && (
                  <span className="text-xs text-slate-400">
                    Run Research first to enable the risk assessment.
                  </span>
                )}
              </div>
              {riskError && (
                <p className="mt-3 text-xs font-medium text-rose-600">{riskError}</p>
              )}
            </div>
        </section>
      )}

      {/* Stage 2: Risk Assessment — own top-level card */}
      {riskStage && (
        <section id="stage-risk" className="card mt-6 p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Risk Assessment</h2>
            <span className="text-xs text-slate-400">
              Assessed {formatDateTime(riskStage.assessedAt)}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <RiskGauge score={riskStage.overallScore ?? undefined} tier={riskStage.riskTier} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <RiskDomainCard label="Property Tax" value={riskStage.taxRisk ?? undefined} />
            <RiskDomainCard label="Flood Zone" value={riskStage.floodRisk ?? undefined} />
            <RiskDomainCard label="Building Permits" value={riskStage.permitCompliance ?? undefined} />
            <RiskDomainCard label="Zoning" value={riskStage.zoningCompliance ?? undefined} />
            <RiskDomainCard label="Legal / Environmental" value={riskStage.legalRisk ?? undefined} />
            <RiskDomainCard label="Ownership Verification" value={riskStage.ownershipVerification ?? undefined} />
          </div>
        </section>
      )}

      {/* Stage 3: Market & Comparables — own top-level card */}
      {(marketStage || report) && (
        <section id="stage-market" className="card mt-6 p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Market & Comparables</h2>
              <p className="mt-1 text-sm text-slate-500">
                Positions the property against nearby listings and market trends.
              </p>
            </div>
            <button onClick={runMarketAnalysis} disabled={marketBusy} className="btn-primary">
              {marketBusy ? 'Analyzing…' : marketStage ? 'Re-run Analysis' : 'Analyze Market'}
            </button>
          </div>
          {marketError && (
            <p className="mt-3 text-xs font-medium text-rose-600">{marketError}</p>
          )}

          {marketStage?.summary && (
            <p className="mt-4 text-sm leading-relaxed text-slate-700">{marketStage.summary}</p>
          )}

          {marketStage && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {marketStage.positioning && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
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
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
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
                    <p className="mt-1 text-[11px] text-slate-500">
                      avg ₹{marketStage.comparables.averagePricePerSqft.toLocaleString('en-IN')}/sqft
                    </p>
                  )}
                </div>
              )}
              {marketStage.trend && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
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
          )}

          {diligence?.comparables && diligence.comparables.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Comparable Properties</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-4 font-semibold">Locality</th>
                      <th className="py-2 pr-4 font-semibold">Type</th>
                      <th className="py-2 pr-4 font-semibold">BHK</th>
                      <th className="py-2 pr-4 font-semibold">Area (sqft)</th>
                      <th className="py-2 pr-4 font-semibold">Price</th>
                      <th className="py-2 pr-4 font-semibold">₹/sqft</th>
                      <th className="py-2 font-semibold">Verified</th>
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
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Price Trend by Period
              </h3>
              <MarketTrendChart trends={diligence.marketTrends} />
            </div>
          )}
        </section>
      )}

      {/* Stage 4: Report — own top-level card */}
      {details && (
        <section id="stage-report" className="card mt-6 p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Report</h2>
              <p className="mt-1 text-sm text-slate-500">
                Assembles the research, risk and market analysis into a downloadable document.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={generateReport} disabled={generating} className="btn-primary">
                {generating ? 'Generating…' : report ? 'Regenerate Report' : 'Generate Report'}
              </button>
              {report && (
                <button onClick={downloadPdf} disabled={downloading} className="btn-secondary">
                  {downloading ? 'Preparing…' : 'Download PDF'}
                </button>
              )}
              {report && (
                <button onClick={downloadExcel} disabled={downloadingExcel} className="btn-secondary">
                  {downloadingExcel ? 'Preparing…' : 'Download Excel'}
                </button>
              )}
            </div>
          </div>
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
                        Research run #{report.aggregationRunId}
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
                    <RiskDomainCard label="Property Tax"
                      value={report.risk.taxRisk ?? undefined} />
                    <RiskDomainCard label="Flood Zone"
                      value={report.risk.floodRisk ?? undefined} />
                    <RiskDomainCard label="Building Permits"
                      value={report.risk.permitCompliance ?? undefined} />
                    <RiskDomainCard label="Zoning"
                      value={report.risk.zoningCompliance ?? undefined} />
                    <RiskDomainCard label="Legal / Environmental"
                      value={report.risk.legalRisk ?? undefined} />
                    <RiskDomainCard label="Ownership Verification"
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
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.taxStatus)}`}>
                        Tax: {report.records.taxStatus.replaceAll('_', ' ')}
                      </span>
                    )}
                    {report.records.permitStatus && (
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.permitStatus)}`}>
                        Permit: {report.records.permitStatus}
                      </span>
                    )}
                    {report.records.zoningStatus && (
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.zoningStatus)}`}>
                        Zoning: {report.records.zoningStatus.replaceAll('_', ' ')}
                      </span>
                    )}
                    {report.records.floodRiskLevel && (
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.floodRiskLevel)}`}>
                        Flood: {report.records.floodRiskLevel}
                      </span>
                    )}
                    {report.records.environmentalStatus && (
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.environmentalStatus)}`}>
                        Environmental: {report.records.environmentalStatus}
                      </span>
                    )}
                    {report.records.ownershipType && (
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(report.records.ownershipType)}`}>
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
                      Not yet sourced: {report.coverage.missingSections.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {/* Property monitoring — its own block inside the Report card footer */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={toggleMonitoring}
                disabled={!monitoring || monitorBusy}
                className="btn-secondary"
              >
                {monitorBusy
                  ? 'Updating…'
                  : monitoring?.enabled
                    ? 'Stop Monitoring'
                    : 'Monitor Property'}
              </button>
            </div>
            {monitoring?.enabled ? (
              <p className="mt-2 text-xs text-slate-500">
                Monitoring active since {formatDateTime(monitoring.monitoredSince)} · last checked{' '}
                {formatDateTime(monitoring.lastCheckedAt)} · next check{' '}
                {formatDateTime(monitoring.nextCheckAt)}
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Enable monitoring to track changes in this property's records.
              </p>
            )}
          </div>
        </section>
      )}
      {/* Supporting documents — upload, download and delete evidence files */}
        {details && (
          <section className="card mt-6 p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Supporting Documents
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload evidence files against this property's due-diligence
                  report{report ? ` (#${report.reportId})` : ''}.
                </p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDocUpload(file);
                  }}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingDoc}
                  className="btn-primary"
                >
                  {uploadingDoc ? 'Uploading…' : 'Upload Document'}
                </button>
              </div>
            </div>

            {docError && (
              <p className="mt-3 text-xs font-medium text-rose-600">{docError}</p>
            )}

            {docs.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                {docsLoading ? 'Loading…' : 'No documents uploaded yet.'}
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {docs.map((doc) => (
                  <div
                    key={doc.documentId}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {doc.fileName}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {doc.fileType ?? 'file'} · uploaded{' '}
                        {formatDateTime(doc.uploadedAt)} · report #{doc.reportId}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDocDownload(doc)}
                        className="btn-secondary"
                      >
                        Download
                      </button>

                      <button
                        onClick={() => handleDocDelete(doc.documentId)}
                        disabled={deletingDocId === doc.documentId}
                        className="btn-ghost text-red-600 hover:bg-red-50"
                      >
                        {deletingDocId === doc.documentId ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
