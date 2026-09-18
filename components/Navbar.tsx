'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAuthEmail, clearSession, isAdmin, ensureAuthInitialized } from '@/lib/session';
import { authApi, profileApi, type ProfileResponse } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/admin/login';

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await ensureAuthInitialized();
      setMounted(true);
      setEmail(getAuthEmail());
      setAdmin(isAdmin());
      setAuthLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    setEmail(getAuthEmail());
    setAdmin(isAdmin());
  }, [pathname]);

  // Load profile when user logs in - but NOT on auth pages
  useEffect(() => {
    if (isAuthPage) return; // Don't load profile on login/register pages
    if (mounted && email && !profile && !profileLoading) {
      const loadProfile = async () => {
        setProfileLoading(true);
        try {
          const data = await profileApi.getProfile();
          setProfile(data);
        } catch {
          // Ignore profile load errors
        } finally {
          setProfileLoading(false);
        }
      };
      loadProfile();
    }
  }, [mounted, email, profile, profileLoading, isAuthPage]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors
    }
    clearSession();
    setProfile(null);
    router.push('/');
    router.refresh();
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownItemClick = (href: string) => {
    setDropdownOpen(false);
    router.push(href);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const initials = profile?.firstName && profile?.lastName
    ? (profile.firstName[0] + profile.lastName[0]).toUpperCase()
    : email?.charAt(0).toUpperCase() || 'U';
  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : email || 'User';

  if (isAuthPage) {
    const isAdminLoginPage = pathname === '/admin/login';
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
            {!isAdminLoginPage && (
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

              <div className="ml-3 relative" ref={dropdownRef}>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 border-l border-slate-200 pl-3 pr-2.5 py-1.5 rounded-md text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {initials}
                  </div>
                  <span className="hidden max-w-[180px] truncate sm:block">
                    {displayName}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-slate-200 animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{email}</p>
                        {admin && (
                          <span className="mt-1 inline-block pill bg-purple-100 text-purple-700 text-xs">Admin</span>
                        )}
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => handleDropdownItemClick('/profile')}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>

                      {!admin && (
                        <Link
                          href="/property-search"
                          onClick={() => handleDropdownItemClick('/property-search')}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Search Property
                        </Link>
                      )}

                      <hr className="my-2 border-slate-100" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
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
