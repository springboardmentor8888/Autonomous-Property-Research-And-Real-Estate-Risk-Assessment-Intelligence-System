'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAuthenticated } from '@/lib/session';

export default function Reports() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  if (!isAuthenticated()) return null;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-lg mb-8">
          <h1 className="text-2xl font-bold">
            Due Diligence Reports
          </h1>
        </div>

        {/* Reports Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-3xl font-bold text-slate-900">
            Due Diligence Reports
          </h2>

          <p className="mt-4 text-gray-600">
            Your property due diligence reports will appear here.
          </p>

          <div className="mt-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-200 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
