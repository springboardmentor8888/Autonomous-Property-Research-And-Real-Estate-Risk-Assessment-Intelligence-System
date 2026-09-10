'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/useAuth';

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  const authReady = useAuthGuard({ loginPath: '/' });

  useEffect(() => {
    if (!authReady) return;
    setEmail(localStorage.getItem('auth_email'));
  }, [authReady]);

  if (!authReady || email === null) return null;

  const cards = [
    {
      title: 'Search Property',
      description: 'Validate any Indian address with the Mappls geocoder and surface property details.',
      cta: 'Search a property',
      href: '/property-search',
      pill: 'Recommended',
    },
    {
      title: 'Due Diligence Reports',
      description: 'Review generated reports on ownership, permits, environmental and zoning risk.',
      cta: 'View reports',
      href: '/reports',
    },
    {
      title: 'Property History',
      description: 'Track previously searched properties and revisit any past investigation.',
      cta: 'View history',
      href: '/history',
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back{email ? `, ${email}` : ''}. Pick a workflow to get started.
          </p>
        </div>
        <span className="pill bg-emerald-50 text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Signed in
        </span>
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
        {cards.map((card) => (
          <article
            key={card.href}
            className="card flex h-full min-h-[260px] flex-col p-7 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {card.title}
              </h2>
              {card.pill && (
                <span className="pill bg-slate-100 text-slate-700">
                  {card.pill}
                </span>
              )}
            </div>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
              {card.description}
            </p>

            <button
              onClick={() => router.push(card.href)}
              className="btn-primary mt-6 w-full"
            >
              {card.cta}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
