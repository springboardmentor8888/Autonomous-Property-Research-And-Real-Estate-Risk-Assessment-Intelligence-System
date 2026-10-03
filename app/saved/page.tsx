'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import {
  propertyApi,
  savedPropertiesApi,
  type PropertyDetailsResponse,
} from '@/lib/api';

function formatPrice(price?: number | null) {
  if (price === null || price === undefined) return null;
  return '₹' + price.toLocaleString('en-IN');
}

export default function Saved() {
  const router = useRouter();
  const authReady = useAuthGuard({ loginPath: '/' });

  const [properties, setProperties] = useState<PropertyDetailsResponse[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    setLoading(true);
    savedPropertiesApi
      .list()
      .then(async (data) => {
        const ids = (data ?? []).map((s) => s.propertyId);
        setSavedIds(new Set(ids));
        // Hydrate the saved ids into full property cards; a property that
        // no longer resolves (deleted dataset row) is skipped, not fatal.
        const hydrated = await Promise.all(
          ids.map((id) =>
            propertyApi.getById(id).catch(() => null),
          ),
        );
        setProperties(hydrated.filter((p): p is PropertyDetailsResponse => p !== null));
        setError(null);
      })
      .catch((err) => setError(err.message || 'Failed to load saved properties.'))
      .finally(() => setLoading(false));
  }, [authReady]);

  const unsave = (propertyId: number) => {
    const removed = properties.find((p) => p.propertyId === propertyId);
    setSavedIds((current) => {
      const next = new Set(current);
      next.delete(propertyId);
      return next;
    });
    setProperties((current) =>
      current.filter((p) => p.propertyId !== propertyId),
    );
    savedPropertiesApi.remove(propertyId).catch(() => {
      // Revert on failure so the card reflects the server state.
      setSavedIds((current) => {
        const next = new Set(current);
        next.add(propertyId);
        return next;
      });
      if (removed) {
        setProperties((current) =>
          current.some((p) => p.propertyId === propertyId)
            ? current
            : [...current, removed],
        );
      }
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
            <span className="text-slate-700">Saved Properties</span>
          </nav>
          <h1 className="page-title mt-2">Saved Properties</h1>
          <p className="page-subtitle">
            Properties you have saved, newest first. Open one to generate a
            diligence report or remove it from your list.
          </p>
        </div>
      </header>

      {loading ? (
        <section className="card p-8">
          <p className="text-sm text-slate-500">Loading your saved properties…</p>
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
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Nothing saved yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Tap the heart on any property card in your search results or history
            to keep it here for quick reference.
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
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2 self-start">
                      <button
                        type="button"
                        aria-label="Remove from saved"
                        aria-pressed
                        onClick={(e) => {
                          e.stopPropagation();
                          unsave(property.propertyId);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            unsave(property.propertyId);
                          }
                        }}
                        className="grid h-9 w-9 place-items-center rounded-full border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4"
                          aria-hidden
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                      {price && (
                        <p className="text-sm font-semibold text-slate-900">{price}</p>
                      )}
                      {property.pricePerSqft !== undefined && property.pricePerSqft !== null && (
                        <p className="text-xs text-slate-500">
                          ₹{property.pricePerSqft.toLocaleString('en-IN')}/sqft
                        </p>
                      )}
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
