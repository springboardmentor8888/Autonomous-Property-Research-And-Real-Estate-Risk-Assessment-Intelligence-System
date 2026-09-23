'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import { propertyApi, type PropertyDetailsResponse } from '@/lib/api';

function PropertyDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [details, setDetails] = useState<PropertyDetailsResponse | null>(null);
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
