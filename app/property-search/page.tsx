'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import { propertyApi } from '@/lib/api';
import { toastError } from '@/lib/useToast';

export default function PropertySearch() {
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const authReady = useAuthGuard({ loginPath: '/' });

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      toastError('Please enter a property address.');
      return;
    }

    setLoading(true);
    setInvalid(false);

    try {
      const res = await propertyApi.searchByAddress(trimmedAddress);

      if (res.data?.status === 'VALID') {
        const firstResult = res.data?.results?.[0];
        const propertyId = firstResult?.propertyId;
        router.push(propertyId ? `/property-details?propertyId=${propertyId}` : '/property-details');
      } else if (res.data?.status === 'INVALID') {
        // Genuinely invalid address (e.g. ZERO_RESULTS from Google)
        setInvalid(true);
      } else {
        // ERROR state (e.g. Google API key invalid, service unavailable)
        toastError(res.message || 'Address validation service is currently unavailable. Please try again later.');
      }
    } catch (err: any) {
      toastError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!authReady) return null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
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
            <span className="text-slate-700">Search Property</span>
          </nav>
          <h1 className="page-title mt-2">Search Property</h1>
          <p className="page-subtitle">
            Validate an Indian address with the Mappls geocoder and load property details.
          </p>
        </div>
      </header>

      <section className="card p-8">
        <form onSubmit={handleSearch} className="space-y-5">
          <div>
            <label htmlFor="address" className="label-base">Property address</label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (invalid) setInvalid(false);
              }}
              placeholder="e.g. 237 Okhla Industrial Estate Phase 3, New Delhi 110020"
              className="input-base"
              disabled={loading}
              autoFocus
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Include city, state, and PIN code for the most accurate match.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Searching…' : 'Search Property'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>

          {invalid && (
            <p className="text-sm font-medium text-rose-600">Invalid address</p>
          )}
        </form>
      </section>
    </main>
  );
}
