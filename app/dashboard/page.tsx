'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import { getAuthRole } from '@/lib/session';
import {
  propertyApi,
  savedPropertiesApi,
  notificationApi,
  dashboardApi,
  type ReportResponse,
  type SavedPropertyResponse,
  type NotificationResponse,
  type MonitoredProperty,
  type ReviewQueueItem,
  type PortfolioRisk,
} from '@/lib/api';

/** Muted enterprise tier chips — same palette as the property-details page. */
function tierClass(tier?: string) {
  switch (tier) {
    case 'LOW':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'MODERATE':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'ELEVATED':
      return 'bg-orange-50 text-orange-800 border-orange-200';
    case 'HIGH':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

function tierLabel(tier?: string) {
  if (!tier) return 'NOT ASSESSED';
  return tier === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT DATA' : `${tier} RISK`;
}

const ROLE_WORKSPACE: Record<string, string> = {
  BUYER: 'Buyer workspace',
  REAL_ESTATE_AGENT: 'Agent workspace',
  LEGAL_REVIEWER: 'Legal review workspace',
  FINANCIAL_INSTITUTION: 'Portfolio workspace',
};

export default function Dashboard() {
  const router = useRouter();
  const authReady = useAuthGuard({ loginPath: '/' });

  const [role, setRole] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [saved, setSaved] = useState<SavedPropertyResponse[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [monitored, setMonitored] = useState<MonitoredProperty[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [portfolioRisk, setPortfolioRisk] = useState<PortfolioRisk | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return;
    setRole(getAuthRole());
    let cancelled = false;

    const load = async () => {
      try {
        // Shared core: every role sees their own reports, favorites and
        // notifications. Role widgets load on top; a failure in any
        // widget degrades gracefully to the shared core.
        const [myReports, mySaved, myNotifications] = await Promise.allSettled([
          propertyApi.getMyReports(),
          savedPropertiesApi.list(),
          notificationApi.list(),
        ]);
        if (cancelled) return;
        if (myReports.status === 'fulfilled') setReports(myReports.value);
        if (mySaved.status === 'fulfilled') setSaved(mySaved.value);
        if (myNotifications.status === 'fulfilled') setNotifications(myNotifications.value);

        const r = getAuthRole();
        if (r === 'BUYER') {
          const res = await dashboardApi.monitored().catch(() => null);
          if (!cancelled && res) setMonitored(res);
        } else if (r === 'LEGAL_REVIEWER') {
          const res = await dashboardApi.reviewQueue().catch(() => null);
          if (!cancelled && res) setReviewQueue(res);
        } else if (r === 'FINANCIAL_INSTITUTION') {
          const res = await dashboardApi.portfolioRisk().catch(() => null);
          if (!cancelled && res) setPortfolioRisk(res);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [authReady]);

  if (!authReady) return null;

  // Latest report per property — the verdict chips.
  const latestByProperty = new Map<number, ReportResponse>();
  for (const report of reports) {
    if (!latestByProperty.has(report.propertyId)) {
      latestByProperty.set(report.propertyId, report);
    }
  }
  const openActions = reports.reduce(
    (sum, r) => sum + (r.verdict?.followUpActions?.length ?? 0),
    0
  );
  const unread = notifications.filter((n) => n.status !== 'READ').length;

  const cards = [
    {
      title: 'Search Property',
      description: 'Validate any Indian address and surface property details.',
      cta: 'Search a property',
      href: '/property-search',
      pill: 'Recommended',
    },
    {
      title: 'Due Diligence Reports',
      description: 'Review generated reports on ownership, permits, environmental and zoning risk.',
      cta: 'View reports',
      href: '/reports',
    },
    {
      title: 'Property History',
      description: 'Track previously searched properties and revisit any past investigation.',
      cta: 'View history',
      href: '/history',
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {ROLE_WORKSPACE[role ?? ''] ?? 'Welcome back'}. Pick a workflow to get started.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {role && (
            <span className="pill bg-slate-100 text-slate-700">{ROLE_WORKSPACE[role] ?? role}</span>
          )}
          <span className="pill bg-emerald-50 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Signed in
          </span>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
        {cards.map((card) => (
          <article
            key={card.href}
            className="card flex h-full min-h-[220px] flex-col p-7 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {card.title}
              </h2>
              {card.pill && (
                <span className="pill bg-slate-100 text-slate-700">{card.pill}</span>
              )}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
              {card.description}
            </p>
            <button onClick={() => router.push(card.href)} className="btn-primary mt-6 w-full">
              {card.cta}
            </button>
          </article>
        ))}
      </section>

      {loading ? (
        <p className="mt-10 text-center text-sm text-slate-500">Loading your workspace…</p>
      ) : (
        <>
          {/* Shared: latest verdicts per searched property. */}
          {latestByProperty.size > 0 && (
            <section className="mt-10">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Your properties at a glance
              </h2>
              <div className="card mt-3 divide-y divide-slate-100">
                {[...latestByProperty.values()].slice(0, 6).map((report) => (
                  <button
                    key={report.reportId}
                    onClick={() =>
                      router.push(`/property-details?propertyId=${report.propertyId}`)
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-slate-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {report.propertyAddress ?? `Property #${report.propertyId}`}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {report.verdict?.headline ?? report.executiveSummary ?? ''}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${tierClass(report.riskTier)}`}
                    >
                      {tierLabel(report.riskTier)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* BUYER: change-watch list + favorites + open actions. */}
          {role === 'BUYER' && (
            <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="card p-6">
                <h2 className="text-base font-semibold text-slate-900">Monitored properties</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">{monitored.length}</p>
                <p className="mt-1 text-xs text-slate-500">
                  You are notified when their diligence records change.
                </p>
                {monitored.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {monitored.slice(0, 3).map((m) => (
                      <li key={m.propertyId} className="truncate text-xs text-slate-600">
                        {m.address}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="card p-6">
                <h2 className="text-base font-semibold text-slate-900">Saved favorites</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">{saved.length}</p>
                <button
                  onClick={() => router.push('/saved')}
                  className="mt-3 text-xs font-medium text-slate-700 underline"
                >
                  View saved properties
                </button>
              </div>
              <div className="card p-6">
                <h2 className="text-base font-semibold text-slate-900">Open follow-up actions</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">{openActions}</p>
                <p className="mt-1 text-xs text-slate-500">
                  From the verdicts of your latest reports.
                </p>
              </div>
            </section>
          )}

          {/* LEGAL_REVIEWER: verification queue. */}
          {role === 'LEGAL_REVIEWER' && (
            <section className="mt-10">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Verification queue
              </h2>
              {reviewQueue.length === 0 ? (
                <p className="card mt-3 px-5 py-4 text-sm text-slate-500">
                  No properties currently need legal verification.
                </p>
              ) : (
                <div className="card mt-3 divide-y divide-slate-100">
                  {reviewQueue.map((item) => (
                    <button
                      key={item.propertyId}
                      onClick={() =>
                        router.push(`/property-details?propertyId=${item.propertyId}`)
                      }
                      className="flex w-full flex-col gap-1.5 px-5 py-3.5 text-left hover:bg-slate-50"
                    >
                      <span className="text-sm font-medium text-slate-800">{item.address}</span>
                      <span className="flex flex-wrap gap-1.5">
                        {item.flags.map((flag) => (
                          <span
                            key={flag}
                            className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs text-orange-800"
                          >
                            {flag}
                          </span>
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* FINANCIAL_INSTITUTION: portfolio risk distribution. */}
          {role === 'FINANCIAL_INSTITUTION' && portfolioRisk && (
            <section className="mt-10">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Portfolio risk distribution
              </h2>
              <div className="card mt-3 p-6">
                {portfolioRisk.totalAssessed === 0 ? (
                  <p className="text-sm text-slate-500">
                    Search properties to build your portfolio view.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {(
                      [
                        ['Low', portfolioRisk.low, 'bg-teal-600'],
                        ['Moderate', portfolioRisk.moderate, 'bg-amber-600'],
                        ['Elevated', portfolioRisk.elevated, 'bg-orange-600'],
                        ['High', portfolioRisk.high, 'bg-rose-600'],
                        ['Insufficient data', portfolioRisk.insufficientData, 'bg-slate-400'],
                      ] as Array<[string, number, string]>
                    ).map(([label, count, color]) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 text-xs font-medium text-slate-600">
                          {label}
                        </span>
                        <div className="h-2.5 flex-1 rounded-full bg-slate-100">
                          <div
                            className={`h-2.5 rounded-full ${color}`}
                            style={{
                              width: `${Math.round((count / portfolioRisk.totalAssessed) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-700">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {portfolioRisk.highRiskProperties.length > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      High-risk properties
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {portfolioRisk.highRiskProperties.map((p) => (
                        <li
                          key={p.propertyId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate text-slate-700">{p.address}</span>
                          <span className="ml-3 shrink-0 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-800">
                            {p.overallScore ?? '—'}/100
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Shared: recent notifications strip. */}
          {notifications.length > 0 && (
            <section className="mt-10">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Recent notifications {unread > 0 && <span className="text-slate-400">({unread} unread)</span>}
              </h2>
              <div className="card mt-3 divide-y divide-slate-100">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.notificationId} className="px-5 py-3">
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
