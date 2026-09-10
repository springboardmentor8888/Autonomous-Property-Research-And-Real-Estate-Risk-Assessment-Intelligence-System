'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAuthEmail, clearSession, isAdmin, ensureAuthInitialized } from '@/lib/session';
import { authApi } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Auth pages where navbar should not show user menu
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/admin/login';

  // Render the same shell on server and first client paint to avoid
  // hydration mismatches; populate auth state after mount.
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Initialize auth by calling refresh endpoint to restore access token from HttpOnly cookie
      await ensureAuthInitialized();
      setMounted(true);
      setEmail(getAuthEmail());
      setAdmin(isAdmin());
      setAuthLoading(false);
    };
    initAuth();
  }, []);

  // Re-sync displayed auth state on every client-side navigation
  // (Navbar lives in the root layout and does not remount on push()).
  useEffect(() => {
    setEmail(getAuthEmail());
    setAdmin(isAdmin());
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors
    }
    clearSession();
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/property-search', label: 'Search Property' },
    { href: '/history', label: 'History' },
    { href: '/reports', label: 'Reports' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Admin Dashboard' },
  ];

  const isLoggedIn = mounted && email !== null && !isAuthPage;

  // Don't render user menu on auth pages
  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              R
            </span>
            <span className="text-base font-semibold tracking-tight text-slate-900">
              Due Diligence Agent
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md px-3 py-1.5 text-sm font-medium bg-slate-900 text-white transition-colors hover:bg-slate-800"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href={admin ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            R
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Due Diligence Agent
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {isLoggedIn ? (
            <>
              {admin ? (
                adminLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-purple-100 text-purple-900'
                          : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })
              ) : (
                navLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })
              )}

              <div className="ml-3 flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className="hidden max-w-[180px] truncate text-sm text-slate-600 sm:block">
                  {email}
                  {admin && (
                    <span className="ml-2 pill bg-purple-100 text-purple-700 text-xs">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : authLoading ? null : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md px-3 py-1.5 text-sm font-medium bg-slate-900 text-white transition-colors hover:bg-slate-800"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
