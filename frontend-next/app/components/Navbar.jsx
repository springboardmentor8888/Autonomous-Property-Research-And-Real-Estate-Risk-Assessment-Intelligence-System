'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserCircle } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'We Are', href: '/we-are' },
  {
    label: 'Solutions',
    dropdown: [
      { label: 'Property Search', href: '/property-search' },
      { label: 'Due Diligence', href: '#due-diligence' },
      { label: 'Risk Assessment', href: '#risk-assessment' },
      { label: 'Report Generation', href: '#reports' },
      { label: 'Comparable Analysis', href: '#comparables' },
    ],
  },
  {
    label: 'Clients',
    dropdown: [
      { label: 'Buyers', href: '#buyers' },
      { label: 'Real Estate Agents', href: '#agents' },
      { label: 'Legal Reviewers', href: '#legal' },
      { label: 'Financial Institutions', href: '#banks' },
      { label: 'Investors', href: '#investors' },
    ],
  },
  { label: 'Capabilities', href: '/#capabilities' },
  { label: 'Contact', href: '/#contact' },
]

function isTokenUsable(storedToken) {
  if (typeof storedToken !== 'string' || !storedToken.trim()) {
    return false
  }

  const token = storedToken.replace(/^Bearer\s+/i, '').trim()
  const parts = token.split('.')

  if (parts.length !== 3 || !parts[1]) {
    return false
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      '='
    )

    const payload = JSON.parse(atob(paddedBase64))

    return (
      typeof payload.exp === 'number' &&
      payload.exp * 1000 > Date.now()
    )
  } catch {
    return false
  }
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Restore saved user only when a usable JWT and user data exist.
  useEffect(() => {
    const clearSavedAuth = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setUserMenuOpen(false)
    }

    const loadUser = () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (!token || !savedUser || !isTokenUsable(token)) {
        clearSavedAuth()
        return
      }

      try {
        const parsedUser = JSON.parse(savedUser)

        const hasUserDetails =
          parsedUser &&
          typeof parsedUser === 'object' &&
          !Array.isArray(parsedUser) &&
          Boolean(
            parsedUser.fullName ||
            parsedUser.name ||
            parsedUser.email
          )

        if (!hasUserDetails) {
          clearSavedAuth()
          return
        }

        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse saved user data:', error)
        clearSavedAuth()
      }
    }

    loadUser()

    window.addEventListener('auth-change', loadUser)
    window.addEventListener('storage', loadUser)

    return () => {
      window.removeEventListener('auth-change', loadUser)
      window.removeEventListener('storage', loadUser)
    }
  }, [pathname])

  const userName = user?.fullName || user?.name || 'User'
  const userEmail = user?.email || ''

  const getInitials = (name) => {
    if (!name) return 'U'

    const parts = name.trim().split(/\s+/)

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase()
  }

  const initials = getInitials(userName)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)
    setUserMenuOpen(false)
    setDrawerOpen(false)

    window.dispatchEvent(new Event('auth-change'))
    router.push('/login')
  }

  const authHref =
    pathname === '/login' ? '/register' : '/login'

  const authLabel =
    pathname === '/login' ? 'Sign Up' : 'Login'

  // Add a translucent, glossy blur after the page scrolls.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    onScroll()

    window.addEventListener('scroll', onScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Prevent background scrolling while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  // Close menus when Escape is pressed.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null)
        setDrawerOpen(false)
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const closeDrawer = () => {
    setDrawerOpen(false)
    setOpenDropdown(null)
    setUserMenuOpen(false)
  }

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 h-[72px] border-b transition-all duration-300 ${scrolled
            ? 'border-white/10 bg-[rgba(20,18,30,0.48)] shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-2xl'
            : 'border-transparent bg-transparent shadow-none backdrop-blur-0'
          }`}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center gap-10 px-8">
          {/* LOGO */}
          <Link
            href="/"
            id="logo-link"
            className="flex flex-shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <span className="text-[22px] leading-none text-accent">
              ⬡
            </span>

            <span className="text-[20px] font-semibold tracking-tight text-white">
              PropDue
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav
            className="hidden flex-1 items-center gap-0.5 lg:flex"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) =>
              item.dropdown ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() =>
                    setOpenDropdown(item.label)
                  }
                  onMouseLeave={() =>
                    setOpenDropdown(null)
                  }
                >
                  <button
                    id={`btn-${item.label.toLowerCase()}`}
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md px-3.5 py-1.5 text-sm text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
                    aria-haspopup="true"
                    aria-expanded={openDropdown === item.label}
                    onFocus={() => setOpenDropdown(item.label)}
                  >
                    {item.label}

                    <span
                      className={`inline-block text-[9px] transition-transform duration-200 ${openDropdown === item.label
                          ? 'rotate-0'
                          : 'rotate-180'
                        }`}
                    >
                      ⌃
                    </span>
                  </button>

                  {/* Dropdown hover bridge prevents accidental closing. */}
                  <div
                    className={`absolute left-1/2 top-full z-[100] min-w-[230px] -translate-x-1/2 pt-2 transition-all duration-200 ${openDropdown === item.label
                        ? 'visible translate-y-0 opacity-100'
                        : 'invisible -translate-y-1 opacity-0 pointer-events-none'
                      }`}
                  >
                    <div className="rounded-xl border border-white/10 bg-[rgba(10,16,28,0.97)] p-2 shadow-2xl backdrop-blur-2xl">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          id={`sol-${sub.label
                            .toLowerCase()
                            .replace(/\s+/g, '-')}`}
                          className="block rounded-lg px-3.5 py-2.5 text-[13.5px] text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  id={`nav-${item.label.toLowerCase()}`}
                  className="inline-flex items-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* RIGHT CONTROLS */}
          <div className="ml-auto flex items-center gap-3">
            {/* DESKTOP USER MENU */}
            {user ? (
              <div className="relative hidden lg:block">
                <button
                  id="user-avatar-btn"
                  type="button"
                  onClick={() =>
                    setUserMenuOpen((value) => !value)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#4f9cf9] text-sm font-bold text-white shadow-[0_4px_20px_rgba(79,156,249,0.25)] transition-all hover:scale-105 hover:bg-[#2d7ef4]"
                  aria-label="Open user menu"
                  aria-expanded={userMenuOpen}
                >
                  {initials}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-[100] w-[250px] rounded-xl border border-white/10 bg-[rgba(10,16,28,0.97)] p-2 shadow-2xl backdrop-blur-2xl">
                    <div className="border-b border-white/10 px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#4f9cf9] text-sm font-bold text-white">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {userName}
                          </p>

                          {userEmail && (
                            <p className="truncate text-xs text-white/40">
                              {userEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-1 block w-full rounded-lg px-3 py-2.5 text-sm text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
                    >
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={authHref}
                id="auth-icon-btn"
                title={authLabel}
                aria-label={authLabel}
                className="hidden h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/80 transition-all hover:bg-white/[0.08] hover:text-white lg:inline-flex"
              >
                <UserCircle size={20} strokeWidth={1.8} />
              </Link>
            )}

            {/* LANGUAGE SELECTOR */}
            <button
              id="lang-btn"
              type="button"
              className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white/70 transition-all hover:bg-white/[0.08] hover:text-white lg:inline-flex"
              aria-label="Select Language"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>

              <span>EN</span>

              <span className="inline-block rotate-180 text-[9px]">
                ⌃
              </span>
            </button>

            {/* MOBILE HAMBURGER */}
            <button
              id="hamburger"
              type="button"
              className="flex flex-col justify-center gap-[5px] rounded-md p-2 transition-all hover:bg-white/[0.08] lg:hidden"
              onClick={() =>
                setDrawerOpen((value) => !value)
              }
              aria-label={
                drawerOpen ? 'Close Menu' : 'Open Menu'
              }
              aria-expanded={drawerOpen}
            >
              <span
                className={`block h-0.5 w-[22px] origin-center rounded bg-white transition-all duration-300 ${drawerOpen
                    ? 'translate-y-[7px] rotate-45'
                    : ''
                  }`}
              />

              <span
                className={`block h-0.5 w-[22px] rounded bg-white transition-all duration-300 ${drawerOpen ? 'opacity-0' : ''
                  }`}
              />

              <span
                className={`block h-0.5 w-[22px] origin-center rounded bg-white transition-all duration-300 ${drawerOpen
                    ? '-translate-y-[7px] -rotate-45'
                    : ''
                  }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <aside
        id="mobile-drawer"
        className={`drawer-scroll fixed right-0 top-0 z-[2000] h-full w-[300px] overflow-y-auto border-l border-white/10 bg-[rgba(8,12,20,0.97)] px-6 pb-10 pt-20 backdrop-blur-2xl transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        aria-hidden={!drawerOpen}
      >
        <button
          id="drawer-close"
          type="button"
          className="absolute right-5 top-5 rounded-md px-2 py-0.5 text-3xl text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
          onClick={closeDrawer}
          aria-label="Close Menu"
        >
          ×
        </button>

        <nav
          className="flex flex-col gap-1"
          aria-label="Mobile Navigation"
        >
          {NAV_ITEMS.map((item) =>
            item.dropdown ? (
              <details key={item.label} className="group">
                <summary className="list-none cursor-pointer rounded-lg px-4 py-3 text-[15px] text-white/70 transition-all hover:bg-white/[0.08] hover:text-white">
                  {item.label}
                </summary>

                {item.dropdown.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    className="block rounded-lg px-8 py-2.5 text-sm text-white/50 transition-all hover:bg-white/[0.08] hover:text-white"
                    onClick={closeDrawer}
                  >
                    {sub.label}
                  </Link>
                ))}
              </details>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-lg px-4 py-3 text-[15px] text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
                onClick={closeDrawer}
              >
                {item.label}
              </Link>
            )
          )}

          {/* MOBILE USER MENU */}
          <div className="mt-5 border-t border-white/10 pt-5">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4f9cf9] text-sm font-bold text-white">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {userName}
                    </p>

                    {userEmail && (
                      <p className="truncate text-xs text-white/40">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="flex w-full items-center rounded-lg px-4 py-3 text-[15px] text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
                  onClick={closeDrawer}
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-4 py-3 text-left text-[15px] text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href={authHref}
                id="mobile-auth-btn"
                title={authLabel}
                aria-label={authLabel}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-[15px] text-white/80 transition-all hover:bg-white/[0.08] hover:text-white"
                onClick={closeDrawer}
              >
                <UserCircle size={19} strokeWidth={1.8} />
                <span>{authLabel}</span>
              </Link>
            )}
          </div>
        </nav>
      </aside>

      {/* MOBILE BACKDROP */}
      {drawerOpen && (
        <div
          id="drawer-backdrop"
          className="fixed inset-0 z-[1500] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* DESKTOP USER MENU BACKDROP */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40 hidden lg:block"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  )
}