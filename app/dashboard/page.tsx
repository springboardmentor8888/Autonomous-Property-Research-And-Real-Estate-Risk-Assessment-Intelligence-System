'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAuthenticated, getAuthEmail, clearSession } from '@/lib/session';
import { toastError } from '@/lib/useToast';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push('/');
    router.refresh();
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Dashboard Content */}
      <section className="max-w-7xl mx-auto mt-12 px-6 pb-12">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-slate-900">
              Dashboard
            </h2>
            <p className="mt-2 text-lg text-slate-600">
              Welcome to your property due diligence workspace.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-medium text-slate-900">{getAuthEmail()}</p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">

          {/* Search Property */}
          <div className="bg-white rounded-2xl shadow-sm border p-7">
            <h3 className="text-2xl font-bold text-slate-900">
              Search Property
            </h3>

            <p className="mt-5 text-lg text-slate-600">
              Search for a property using its address with Mappls validation.
            </p>

            <button
              onClick={() => router.push('/property-search')}
              className="mt-7 bg-slate-900 text-white px-6 py-4 rounded-lg font-semibold hover:bg-slate-800 transition w-full"
            >
              Search Property
            </button>
          </div>

          {/* Due Diligence Reports */}
          <div className="bg-white rounded-2xl shadow-sm border p-7">
            <h3 className="text-2xl font-bold text-slate-900">
              Due Diligence Reports
            </h3>

            <p className="mt-5 text-lg text-slate-600">
              View property due diligence reports.
            </p>

            <button
              onClick={() => router.push('/reports')}
              className="mt-7 bg-slate-900 text-white px-6 py-4 rounded-lg font-semibold hover:bg-slate-800 transition w-full"
            >
              View Reports
            </button>
          </div>

          {/* Property History */}
          <div className="bg-white rounded-2xl shadow-sm border p-7">
            <h3 className="text-2xl font-bold text-slate-900">
              Property History
            </h3>

            <p className="mt-5 text-lg text-slate-600">
              Review historical property information.
            </p>

            <button
              onClick={() => router.push('/history')}
              className="mt-7 bg-slate-900 text-white px-6 py-4 rounded-lg font-semibold hover:bg-slate-800 transition w-full"
            >
              View History
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
