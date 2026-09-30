'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAuthEmail, clearSession, isAdmin, ensureAuthInitialized } from '@/lib/session';
import { authApi, profileApi, notificationApi, type ProfileResponse, type NotificationResponse } from '@/lib/api';

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unread, setUnread] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);

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
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load the unread count when logged in; poll every 60s for the badge.
  useEffect(() => {
    if (!mounted || email === null || isAuthPage) return;
    const refreshUnread = () =>
      notificationApi
        .unreadCount()
        .then((data) => setUnread(data?.unread ?? 0))
        .catch(() => setUnread(0));
    refreshUnread();
    const timer = setInterval(refreshUnread, 60000);
    return () => clearInterval(timer);
  }, [mounted, email, isAuthPage, pathname]);

  // Load the notification list when the panel is opened.
  useEffect(() => {
    if (!notificationsOpen) return;
    notificationApi
      .list()
      .then((data) => setNotifications(data ?? []))
      .catch(() => setNotifications([]));
  }, [notificationsOpen]);

  const handleBellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationsOpen(!notificationsOpen);
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    try {
      if (notification.status !== 'READ') {
        await notificationApi.markRead(notification.notificationId);
        setUnread((n) => Math.max(0, n - 1));
      }
    } catch {
      // Non-blocking: the notification stays unread.
    }
    setNotificationsOpen(false);
    if (notification.propertyId) {
      router.push(`/property-details?propertyId=${notification.propertyId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setUnread(0);
      setNotifications((current) =>
        current.map((n) => ({ ...n, status: 'READ' })),
      );
    } catch {
      // Non-blocking: the badge refreshes on the next poll.
    }
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

              {!admin && (
                <div className="ml-3 relative" ref={bellRef}>
                  <button
                    onClick={handleBellClick}
                    className="relative rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    aria-expanded={notificationsOpen}
                    aria-haspopup="true"
                    aria-label="Notifications"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1h6z"
                      />
                    </svg>
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-slate-200 animate-in fade-in-0 zoom-in-95 duration-100">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                        <p className="text-sm font-semibold text-slate-900">Notifications</p>
                        {unread > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-medium text-slate-500 hover:text-slate-900"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <p className="px-3 py-6 text-center text-xs text-slate-500">
                            No notifications yet.
                          </p>
                        ) : (
                          notifications.map((notification) => {
                            const isUnread = notification.status !== 'READ';
                            return (
                              <button
                                key={notification.notificationId}
                                onClick={() => handleNotificationClick(notification)}
                                className={`flex w-full flex-col items-start gap-1 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50 ${
                                  isUnread ? 'bg-slate-50/60' : ''
                                }`}
                              >
                                <span className="flex w-full items-center justify-between gap-2">
                                  <span
                                    className={`text-xs font-semibold ${
                                      isUnread ? 'text-slate-900' : 'text-slate-600'
                                    }`}
                                  >
                                    {notification.notificationType === 'REPORT_READY'
                                      ? 'Report ready'
                                      : 'Monitoring update'}
                                  </span>
                                  {isUnread && (
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-600" />
                                  )}
                                </span>
                                <span className="line-clamp-2 text-xs text-slate-600">
                                  {notification.message}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {formatNotificationTime(notification.createdAt)}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
