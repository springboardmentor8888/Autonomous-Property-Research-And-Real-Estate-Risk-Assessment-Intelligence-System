'use client';

import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/useAuth';

export default function Reports() {
  const router = useRouter();
  const authReady = useAuthGuard({ loginPath: '/' });

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
            <span className="text-slate-700">Due Diligence Reports</span>
          </nav>
          <h1 className="page-title mt-2">Due Diligence Reports</h1>
          <p className="page-subtitle">
            Generated reports on ownership, permits, environmental and zoning risk.
          </p>
        </div>
      </header>

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
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-900">
          No reports yet
        </h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Generate a due diligence report from any validated property record.
        </p>
        <button
          onClick={() => router.push('/property-search')}
          className="btn-primary mt-6"
        >
          Search a property
        </button>
      </section>
    </main>
  );
}
