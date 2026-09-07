'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/session';
import { propertyApi } from '@/lib/api';
import { toastError } from '@/lib/useToast';

export default function PropertyDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const fallbackAddress = searchParams.get('property');

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    if (!propertyId) return;

    setLoading(true);
    propertyApi.getById(propertyId)
      .then((data) => setDetails(data))
      .catch((err) => toastError(err.message || 'Failed to load property details.'))
      .finally(() => setLoading(false));
  }, [propertyId, router]);

  if (!isAuthenticated()) return null;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-lg mb-8">
          <h1 className="text-2xl font-bold">
            Property Details
          </h1>
        </div>

        {/* Property Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-3xl font-bold text-slate-900">
            Property Information
          </h2>

          {loading && (
            <p className="mt-6 text-gray-500">Loading property details...</p>
          )}

          {!loading && details && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Property ID" value={details.propertyId} />
              <DetailRow label="Address" value={details.address} />
              <DetailRow label="City" value={details.city} />
              <DetailRow label="State" value={details.state} />
              <DetailRow label="Postal Code" value={details.postalCode} />
              <DetailRow
                label="Coordinates"
                value={
                  details.latitude != null && details.longitude != null
                    ? `${details.latitude}, ${details.longitude}`
                    : null
                }
              />
              <DetailRow label="Property Type" value={details.propertyType} />
            </div>
          )}

          {!loading && !details && fallbackAddress && (
            <div className="mt-6">
              <p className="text-lg text-gray-700">
                <strong>Address:</strong> {fallbackAddress}
              </p>
              <p className="mt-4 text-gray-500">
                Property details could not be loaded from the server.
              </p>
            </div>
          )}

          {!loading && !details && !fallbackAddress && (
            <div className="mt-6">
              <p className="text-lg text-gray-700">
                No property address provided. Please search for a property first.
              </p>
              <button
                onClick={() => router.push('/property-search')}
                className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
              >
                Search Property
              </button>
            </div>
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

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg text-slate-900">{value ?? '—'}</p>
    </div>
  );
}
