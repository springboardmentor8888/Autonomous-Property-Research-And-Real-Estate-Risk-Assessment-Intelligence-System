'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import { propertyApi, type ReportResponse } from '@/lib/api';

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

function tierClass(tier?: string) {
  switch (tier) {
    case 'LOW':
      return 'bg-emerald-50 text-emerald-700';
    case 'MODERATE':
      return 'bg-blue-50 text-blue-700';
    case 'ELEVATED':
      return 'bg-amber-50 text-amber-700';
    case 'HIGH':
      return 'bg-rose-50 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export default function Reports() {
  const router = useRouter();
  const authReady = useAuthGuard({ loginPath: '/' });

  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    setLoading(true);
    propertyApi
      .getMyReports()
      .then((data) => {
        setReports(data ?? []);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Failed to load reports.'))
      .finally(() => setLoading(false));
  }, [authReady]);

  const [pdfBusyId, setPdfBusyId] = useState<number | null>(null);
  const [excelBusyId, setExcelBusyId] = useState<number | null>(null);

  async function download(
    propertyId: number,
    kind: 'pdf' | 'excel',
    setBusy: (id: number | null) => void,
  ) {
    const blob = kind === 'pdf'
      ? await propertyApi.downloadReportPdf(propertyId)
      : await propertyApi.downloadReportExcel(propertyId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `due-diligence-report-${propertyId}.${kind === 'pdf' ? 'pdf' : 'xlsx'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setBusy(null);
  }

  function downloadPdf(propertyId: number) {
    if (pdfBusyId !== null) return;
    setPdfBusyId(propertyId);
    download(propertyId, 'pdf', setPdfBusyId).catch(() => {
      // Non-blocking: the full download flow lives on the property page.
      setPdfBusyId(null);
    });
  }

  function downloadExcel(propertyId: number) {
    if (excelBusyId !== null) return;
    setExcelBusyId(propertyId);
    download(propertyId, 'excel', setExcelBusyId).catch(() => {
      // Non-blocking: the full download flow lives on the property page.
      setExcelBusyId(null);
    });
  }

  if (!authReady) return null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="page-header">
        <div>
          <nav className="text-xs font-medium text-slate-500">
            <button onClick={() => router.push('/dashboard')} className="hover:text-slate-900">
              Dashboard
            </button>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-700">Due Diligence Reports</span>
          </nav>
          <h1 className="page-title mt-2">Due Diligence Reports</h1>
          <p className="page-subtitle">
            Reports you have generated from stored property records — risk assessment,
            executive summary and data coverage.
          </p>
        </div>
      </header>

      {loading ? (
        <section className="card p-8">
          <p className="text-sm text-slate-500">Loading your reports…</p>
        </section>
      ) : error ? (
        <section className="card p-8">
          <p className="text-sm font-medium text-rose-600">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary mt-4">
            Retry
          </button>
        </section>
      ) : reports.length === 0 ? (
        <section className="card flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">No reports yet</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Open a searched property and generate a due-diligence report from its stored records.
          </p>
          <button onClick={() => router.push('/history')} className="btn-primary mt-6">
            View search history
          </button>
        </section>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li key={report.reportId}>
              <div className="card p-6 transition hover:border-slate-300 hover:shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    onClick={() => router.push(`/property-details?propertyId=${report.propertyId}`)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {report.propertyAddress ?? `Property #${report.propertyId}`}
                    </p>
                    <p className="mt-1 line-clamp-2 max-w-xl text-xs text-slate-500">
                      {report.executiveSummary}
                    </p>
                  </button>
                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tierClass(report.riskTier)}`}
                    >
                      {report.riskTier === 'INSUFFICIENT_DATA'
                        ? 'INSUFFICIENT DATA'
                        : `${report.riskTier} RISK`}
                    </span>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDateTime(report.generatedAt)}
                    </p>
                    <button
                      onClick={() => downloadPdf(report.propertyId)}
                      disabled={pdfBusyId === report.propertyId}
                      className="btn-secondary mt-2 px-3 py-1 text-xs"
                    >
                      {pdfBusyId === report.propertyId ? 'Preparing…' : '⬇ PDF'}
                    </button>
                    <button
                      onClick={() => downloadExcel(report.propertyId)}
                      disabled={excelBusyId === report.propertyId}
                      className="btn-secondary mt-2 ml-1 px-3 py-1 text-xs"
                    >
                      {excelBusyId === report.propertyId ? 'Preparing…' : '⬇ Excel'}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
