'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import { propertyApi, savedPropertiesApi, type PropertyDetailsResponse } from '@/lib/api';

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

function formatPrice(price?: number) {
  if (price === null || price === undefined) return null;
  return '₹' + price.toLocaleString('en-IN');
}

export default function History() {
  const router = useRouter();
  const authReady = useAuthGuard({ loginPath: '/' });

  const [properties, setProperties] = useState<PropertyDetailsResponse[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    setLoading(true);
    propertyApi
      .getSearchHistory()
      .then((data) => {
        setProperties(data ?? []);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Failed to load search history.'))
      .finally(() => setLoading(false));
  }, [authReady]);

  // Saved state for the per-card hearts: fetched once on mount.
  useEffect(() => {
    if (!authReady) return;
    savedPropertiesApi
      .list()
      .then((data) => {
        setSavedIds(new Set((data ?? []).map((s) => s.propertyId)));
      })
      .catch(() => {
        // Non-blocking: hearts stay unsaved if the list can't load.
      });
  }, [authReady]);

  const toggleSaved = (propertyId: number) => {
    const isSaved = savedIds.has(propertyId);
    setSavedIds((current) => {
      const next = new Set(current);
      if (isSaved) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
    const call = isSaved
      ? savedPropertiesApi.remove(propertyId)
      : savedPropertiesApi.save(propertyId);
    call.catch(() => {
      // Revert on failure so the heart reflects the server state.
      setSavedIds((current) => {
        const next = new Set(current);
        if (isSaved) {
          next.add(propertyId);
        } else {
          next.delete(propertyId);
        }
        return next;
      });
    });
  };

  if (!authReady) return null;

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
            <span className="text-slate-700">Property History</span>
          </nav>
          <h1 className="page-title mt-2">Property History</h1>
          <p className="page-subtitle">
            Properties you have searched, newest first. Open one to generate a
            diligence report or monitor it for record changes.
          </p>
        </div>
      </header>

      {loading ? (
        <section className="card p-8">
          <p className="text-sm text-slate-500">Loading your searched properties…</p>
        </section>
      ) : error ? (
        <section className="card p-8">
          <p className="text-sm font-medium text-rose-600">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary mt-4">
            Retry
          </button>
        </section>
      ) : properties.length === 0 ? (
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
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            No history yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Search for a property and your results will be tracked here for future reference.
          </p>
          <button
            onClick={() => router.push('/property-search')}
            className="btn-primary mt-6"
          >
            Search a property
          </button>
        </section>
      ) : (
        <ul className="space-y-4">
          {properties.map((property) => {
            const price = formatPrice(property.price);
            return (
              <li key={property.propertyId}>
                <button
                  onClick={() =>
                    router.push(`/property-details?propertyId=${property.propertyId}`)
                  }
                  className="card block w-full p-6 text-left transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {property.address}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {[property.locality, property.city, property.state, property.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {property.propertyType && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {property.propertyType}
                          </span>
                        )}
                        {property.validationGranularity && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            {property.validationGranularity}
                          </span>
                        )}
                        {property.addressComplete !== undefined && (
                          <span
                            className={
                              'rounded-full px-2.5 py-1 text-xs font-medium ' +
                              (property.addressComplete
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700')
                            }
                          >
                            {property.addressComplete ? 'Address complete' : 'Incomplete address'}
                          </span>
                        )}
                        {property.verified !== undefined && property.verified && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            Verified listing
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2 self-start">
                      <button
                        type="button"
                        aria-label={
                          savedIds.has(property.propertyId)
                            ? 'Remove from saved'
                            : 'Save property'
                        }
                        aria-pressed={savedIds.has(property.propertyId)}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaved(property.propertyId);
                        }}
                        className={`grid h-9 w-9 place-items-center rounded-full border transition ${
                          savedIds.has(property.propertyId)
                            ? 'border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100'
                            : 'border-slate-200 bg-white text-slate-300 hover:border-rose-200 hover:text-rose-400'
                        }`}
                      >
                        {savedIds.has(property.propertyId) ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4"
                            aria-hidden
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-4 w-4"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                            />
                          </svg>
                        )}
                      </button>
                      {price && (
                        <p className="text-sm font-semibold text-slate-900">{price}</p>
                      )}
                      {property.pricePerSqft !== undefined && property.pricePerSqft !== null && (
                        <p className="text-xs text-slate-500">
                          ₹{property.pricePerSqft.toLocaleString('en-IN')}/sqft
                        </p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        Searched {formatDateTime(property.searchedAt)}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
