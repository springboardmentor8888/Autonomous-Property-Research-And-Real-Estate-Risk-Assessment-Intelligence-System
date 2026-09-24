'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import { propertyApi, type PropertyDetailsResponse } from '@/lib/api';

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
                    <div className="shrink-0 text-right">
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
