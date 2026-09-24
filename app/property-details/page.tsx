'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import {
  propertyApi,
  type AggregationRunResponse,
  type AggregationRunSummary,
  type MonitoringStatus,
  type PropertyDetailsResponse,
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

function observationStatusClass(status?: string) {
  switch (status) {
    case 'SUCCESS':
      return 'text-emerald-600';
    case 'FAILED':
      return 'text-rose-600';
    default:
      return 'text-amber-600';
  }
}

function PropertyDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [details, setDetails] = useState<PropertyDetailsResponse | null>(null);
  const [done, setDone] = useState(false);

  // --- Due diligence & monitoring state ---
  const [monitoring, setMonitoring] = useState<MonitoringStatus | null>(null);
  const [runs, setRuns] = useState<AggregationRunSummary[]>([]);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [aggregating, setAggregating] = useState(false);
  const [aggregateResult, setAggregateResult] = useState<AggregationRunResponse | null>(null);
  const [aggregateError, setAggregateError] = useState<string | null>(null);
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

  // Load monitoring status, past diligence runs and risk assessment.
  useEffect(() => {
    if (!authReady || !propertyId) return;
    const id = Number(propertyId);
    Promise.all([
      propertyApi.getMonitoring(id).catch(() => null),
      propertyApi.getAggregationRuns(id).catch(() => []),
      propertyApi.getRiskAssessment(id).catch(() => undefined),
    ]).then(([monitoringStatus, aggregationRuns, riskAssessment]) => {
      setMonitoring(monitoringStatus);
      setRuns(aggregationRuns ?? []);
      setRisk(riskAssessment ?? null);
    });
  }, [propertyId, authReady]);

  async function generateReport() {
    if (!details) return;
    setAggregating(true);
    setAggregateError(null);
    setAggregateResult(null);
    try {
      const result = await propertyApi.aggregate(details.propertyId, {
        city: details.city,
        localityName: details.locality || undefined,
        propertyType: details.propertyType || undefined,
        bhk: details.bedrooms || undefined,
      });
      setAggregateResult(result);
      propertyApi.getAggregationRuns(details.propertyId)
        .then((updatedRuns) => setRuns(updatedRuns ?? []))
        .catch(() => {});
    } catch (err) {
      setAggregateError(
        err instanceof Error ? err.message : 'Failed to run the diligence pipeline.'
      );
    } finally {
      setAggregating(false);
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
        ['Balconies', details.balconies === undefined ? undefined : String(details.balconies)],
        ['Carpet Area (sqft)', details.carpetAreaSqft === undefined ? undefined : String(details.carpetAreaSqft)],
        ['Super Area (sqft)', details.superAreaSqft === undefined ? undefined : String(details.superAreaSqft)],
        ['Area', details.areaText],
        ['Price (INR)', details.price === undefined ? undefined : details.price.toLocaleString('en-IN')],
        ['Price / sqft', details.pricePerSqft === undefined ? undefined : String(details.pricePerSqft)],
        ['Deposit', details.deposit === undefined ? undefined : details.deposit.toLocaleString('en-IN')],
        ['Furnishing', details.furnishing],
        ['Facing', details.facing],
        ['Floor', details.floor],
        ['Total Floors', details.totalFloors === undefined ? undefined : String(details.totalFloors)],
        ['Age', details.age],
        ['Availability', details.availability],
        ['Transaction', details.transaction],
        ['RERA ID', details.reraId],
        ['Listed By', details.listedBy],
        ['Dealer', details.dealer],
        ['Gated Community', details.gatedCommunity === undefined ? undefined : details.gatedCommunity ? 'Yes' : 'No'],
        ['Verified', details.verified === undefined ? undefined : details.verified ? 'Yes' : 'No'],
        ['Source', details.source],
        ['Posted On', details.postingDate],
        ['Map Accuracy', details.mapAccuracy],
      ]
    : [];

  const hasListingData = listingFields.some(([, v]) => v !== undefined && v !== null);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="page-header">
        <div>
          <nav className="text-xs font-medium text-slate-500">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-slate-900"
            >
              Dashboard
            </button>
            <span className="mx-2 text-slate-300">/</span>
            <button
              onClick={() => router.push('/property-search')}
              className="hover:text-slate-900"
            >
              Search Property
            </button>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-700">Details</span>
          </nav>
          <h1 className="page-title mt-2">Property Details</h1>
          <p className="page-subtitle">
            {details
              ? 'Google-validated address record, enriched with 99acres listing data.'
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
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {k}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">
                      {fmt(v)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {hasListingData && (
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Listing Data (99acres)</h2>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {listingFields.map(([k, v]) => (
                    <div key={k} className="border-b border-slate-100 pb-3 last:border-b-0">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {k}
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">
                        {fmt(v)}
                      </dd>
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
                View original listing on 99acres →
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm font-medium text-rose-600">Invalid address</p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
          <button
            onClick={() => router.push('/property-search')}
            className="btn-secondary"
          >
            Search another property
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Back to dashboard
          </button>
        </div>
      </section>

      {details && (
        <section className="card mt-6 p-8">
          <h2 className="text-sm font-semibold text-slate-700">Due Diligence & Monitoring</h2>
          <p className="mt-1 text-xs text-slate-500">
            Actions available for this property.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Diligence report via aggregation pipeline */}
            <div className="rounded-lg border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Diligence Report</h3>
              <p className="mt-1 text-xs text-slate-500">
                Runs the aggregation pipeline — market comparables, locality trends and
                provider checks — and stores the run result.
              </p>
              <button
                onClick={generateReport}
                disabled={aggregating}
                className="btn-primary mt-4"
              >
                {aggregating ? 'Running pipeline…' : 'Generate Diligence Report'}
              </button>
              {aggregateError && (
                <p className="mt-3 text-xs font-medium text-rose-600">{aggregateError}</p>
              )}
              {aggregateResult && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-slate-600">
                    Run #{aggregateResult.aggregationRunId} — status{' '}
                    <span className="font-semibold text-slate-900">{aggregateResult.status}</span>
                  </p>
                  <ul className="space-y-1.5">
                    {aggregateResult.observations?.map((obs, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-slate-700">
                          {obs.provider}
                          {obs.operation ? ` · ${obs.operation}` : ''}
                        </span>
                        <span className={observationStatusClass(obs.status)}>
                          {obs.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {runs.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500">Past runs</p>
                  <ul className="mt-2 space-y-1">
                    {runs.slice(0, 5).map((run) => (
                      <li
                        key={run.aggregationRunId}
                        className="flex items-center justify-between gap-2 text-xs text-slate-600"
                      >
                        <span>
                          #{run.aggregationRunId} · {formatDateTime(run.startedAt)}
                        </span>
                        <span className="font-medium">{run.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Risk assessment */}
            <div className="rounded-lg border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Risk Assessment</h3>
              {risk ? (
                <>
                  <p className="mt-1 text-xs text-slate-500">
                    Assessed {formatDateTime(risk.assessedAt)} · scores 0–10.
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                    {([
                      ['Overall', risk.overallScore],
                      ['Tax Risk', risk.taxRisk],
                      ['Legal Risk', risk.legalRisk],
                      ['Flood Risk', risk.floodRisk],
                      ['Permit Compliance', risk.permitCompliance],
                      ['Zoning Compliance', risk.zoningCompliance],
                      ['Ownership Verification', risk.ownershipVerification],
                    ] as Array<[string, number | undefined]>).map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          {label}
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                          {value === undefined || value === null ? '—' : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  No risk assessment available yet. Risk scores are produced by the
                  diligence pipeline once the remaining provider contracts are finalized.
                </p>
              )}
            </div>

            {/* Property monitoring */}
            <div className="rounded-lg border border-slate-200 p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900">Property Monitoring</h3>
              <p className="mt-1 text-xs text-slate-500">
                Monitor this property for changes in its records — ownership, tax,
                permits, listings and market data.
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
                    Monitoring active since {formatDateTime(monitoring.monitoredSince)} ·
                    last checked {formatDateTime(monitoring.lastCheckedAt)} · next check{' '}
                    {formatDateTime(monitoring.nextCheckAt)}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Not monitoring. Enable to track record changes for this property.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
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
