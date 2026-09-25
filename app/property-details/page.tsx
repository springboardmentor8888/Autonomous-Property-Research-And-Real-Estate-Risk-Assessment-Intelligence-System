'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import {
  propertyApi,
  type DiligenceData,
  type MonitoringStatus,
  type PropertyDetailsResponse,
  type ReportResponse,
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

/** 0-100 risk bar — higher means riskier. Null value = no records. */
function RiskBar({ label, value }: { label: string; value?: number }) {
  if (value === null || value === undefined) {
    return (
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">{label}</span>
          <span className="font-medium text-slate-400">No records</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100" />
      </div>
    );
  }
  const v = value;
  const color = v >= 55 ? 'bg-rose-500' : v >= 20 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{v.toFixed(0)}</span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(100, v)}%` }} />
      </div>
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
  const [done, setDone] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
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
    ]).then(([diligenceData, latestReport, monitoringStatus]) => {
      setDiligence(diligenceData);
      setReport(latestReport ?? null);
      setMonitoring(monitoringStatus);
    });
  }, [propertyId, authReady]);

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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Diligence Report</h2>
              <p className="mt-1 text-xs text-slate-500">
                Generates a report from the stored records: risk assessment, executive summary
                and data coverage.
              </p>
            </div>
            <button onClick={generateReport} disabled={generating} className="btn-primary">
              {generating ? 'Generating…' : report ? 'Regenerate Report' : 'Generate Diligence Report'}
            </button>
          </div>

          {generateError && (
            <p className="mt-3 text-xs font-medium text-rose-600">{generateError}</p>
          )}

          {report ? (
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tierClass(report.riskTier)}`}>
                  {report.riskTier === 'INSUFFICIENT_DATA'
                    ? 'INSUFFICIENT DATA'
                    : `${report.riskTier} RISK`}
                </span>
                <span className="text-xs text-slate-500">
                  Report #{report.reportId} · Generated {formatDateTime(report.generatedAt)}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-slate-700">{report.executiveSummary}</p>

              {report.risk && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Risk Assessment (0–100, higher = riskier)
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                    <RiskBar label="Overall" value={report.risk.overallScore ?? undefined} />
                    <RiskBar label="Property Tax" value={report.risk.taxRisk ?? undefined} />
                    <RiskBar label="Flood" value={report.risk.floodRisk ?? undefined} />
                    <RiskBar label="Building Permits" value={report.risk.permitCompliance ?? undefined} />
                    <RiskBar label="Zoning" value={report.risk.zoningCompliance ?? undefined} />
                    <RiskBar label="Legal / Environmental" value={report.risk.legalRisk ?? undefined} />
                    <RiskBar label="Ownership Verification" value={report.risk.ownershipVerification ?? undefined} />
                  </div>
                </div>
              )}

              {report.records && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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

              {report.coverage && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Data Coverage
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    {report.coverage.comparablesCount ?? 0} comparable listings ·{' '}
                    {report.coverage.marketTrendsCount ?? 0} market trend periods
                    {report.coverage.missingSections && report.coverage.missingSections.length > 0 && (
                      <> · Not yet sourced: {report.coverage.missingSections.join(', ')}</>
                    )}
                  </p>
                </div>
              )}
            </div>
          ) : !generating ? (
            <p className="mt-4 text-xs text-slate-500">
              No report generated yet for this property.
            </p>
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
