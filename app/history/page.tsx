'use client';

import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/useAuth';

export default function History() {
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
            <span className="text-slate-700">Property History</span>
          </nav>
          <h1 className="page-title mt-2">Property History</h1>
          <p className="page-subtitle">
            Previously searched properties will appear here.
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
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-900">
          No history yet
        </h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Search for a property and your results will be tracked here for future reference.
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
