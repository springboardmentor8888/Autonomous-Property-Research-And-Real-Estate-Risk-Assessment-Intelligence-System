'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/lib/session';
import { propertyApi } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/useToast';

export default function PropertySearch() {
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  const handleSearch = async () => {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      toastError('Please enter a property address.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await propertyApi.searchByAddress(trimmedAddress);
      setResult(res);

      if (res.data?.status === 'VALID') {
        toastSuccess('Property found! Redirecting to details...');
        const firstResult = res.data?.results?.[0];
        const propertyId = firstResult?.propertyId;
        const formattedAddress = firstResult?.formattedAddress ?? trimmedAddress;
        const target = propertyId
          ? `/property-details?propertyId=${propertyId}&property=${encodeURIComponent(formattedAddress)}`
          : `/property-details?property=${encodeURIComponent(trimmedAddress)}`;
        setTimeout(() => {
          router.push(target);
        }, 1500);
      } else if (res.data?.status === 'INVALID') {
        toastError(res.message || 'Invalid address. Please check and try again.');
      } else {
        toastError(res.message || 'Search failed. Please try again.');
      }
    } catch (err: any) {
      toastError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold">
            Real Estate Due Diligence Agent
          </h1>
        </div>

        {/* Search Card */}
        <div className="bg-white mt-8 rounded-2xl shadow-lg p-8">

          <h2 className="text-3xl font-bold text-slate-900">
            Search Property
          </h2>

          <p className="mt-2 text-gray-600">
            Enter the property address to search for due diligence information.
            The address will be validated using Mappls API.
          </p>

          {/* Input */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Address
            </label>

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter property address (e.g., 123 Main St, Mumbai, Maharashtra)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search Property'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="bg-gray-200 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Back to Dashboard
            </button>

          </div>

          {/* Result Display */}
          {result && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-slate-900 mb-2">Search Result</h3>
              <pre className="text-sm text-gray-700 overflow-auto max-h-64">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
