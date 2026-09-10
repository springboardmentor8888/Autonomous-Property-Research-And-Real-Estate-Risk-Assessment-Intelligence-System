'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import { propertyApi } from '@/lib/api';

function PropertyDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [details, setDetails] = useState<any>(null);
  const [done, setDone] = useState(false);

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

  if (!authReady) return null;

  const fields: Array<[string, string | null | undefined]> = details
    ? [
        ['Address', details.address],
        ['City', details.city],
        ['State', details.state],
        ['Postal Code', details.postalCode],
        ['Property Type', details.propertyType],
      ]
    : [];

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
              ? 'Validated property record from the database.'
              : 'No record to display.'}
          </p>
        </div>
      </header>

      <section className="card p-8">
        {!done ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : details ? (
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            {fields.map(([k, v]) => (
              <div key={k} className="border-b border-slate-100 pb-3 last:border-b-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {k}
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {v ?? '—'}
                </dd>
              </div>
            ))}
          </dl>
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
