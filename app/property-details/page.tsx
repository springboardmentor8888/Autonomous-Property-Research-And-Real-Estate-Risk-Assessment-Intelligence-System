'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/session';
import { propertyApi } from '@/lib/api';

export default function PropertyDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [details, setDetails] = useState<any>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    if (!propertyId) {
      setDone(true);
      return;
    }

    propertyApi.getById(propertyId)
      .then((data) => setDetails(data))
      .catch(() => setDetails(null))
      .finally(() => setDone(true));
  }, [propertyId, router]);

  if (!isAuthenticated()) return null;

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
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-slate-900 text-white p-6 rounded-lg mb-8">
          <h1 className="text-2xl font-bold">Property Details</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">

          {!done ? (
            <p className="mt-2 text-gray-500">Loading...</p>
          ) : details ? (
            <dl className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm font-medium text-gray-500">{k}</dt>
                  <dd className="text-lg text-slate-900">{v ?? '—'}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-lg text-slate-900">Invalid address</p>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-200 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push('/property-search')}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
            >
              Search Another Property
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
