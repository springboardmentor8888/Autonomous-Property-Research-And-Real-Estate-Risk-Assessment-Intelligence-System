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
  { label: 'Leadership', href: '#leadership' },
  { label: 'People', href: '#people' },
  { label: 'ESG', href: '#esg' },
  { label: 'Newsroom', href: '#newsroom' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('user')
      if (!savedUser) {
        setUser(null)
        return
      }
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse user data:', error)
        setUser(null)
      }
    }

    loadUser()
    window.addEventListener('auth-change', loadUser)
    return () => window.removeEventListener('auth-change', loadUser)
  }, [pathname])

  const userName = user?.fullName || user?.name || 'User'
  const userEmail = user?.email || ''

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
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

  const authHref = pathname === '/login' ? '/register' : '/login'
  const authLabel = pathname === '/login' ? 'Sign Up' : 'Login'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null)
        setDrawerOpen(false)
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const closeDrawer = () => {
    setDrawerOpen(false)
    setOpenDropdown(null)
    setUserMenuOpen(false)
  }

  return (
    <>
      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ${scrolled ? 'bg-[rgba(8,12,20,0.88)] backdrop-blur-xl border-b border-white/10 shadow-xl' : ''}`}>
        <div className="max-w-[1440px] mx-auto h-full px-8 flex items-center gap-10">

          {/* LOGO */}
          <Link href="/" id="logo-link" className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity">
            <span className="text-[22px] text-accent leading-none">⬡</span>
            <span className="text-[20px] font-semibold tracking-tight text-white">PropDue</span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => item.dropdown ? (
              <div key={item.label} className="relative" onMouseEnter={() => setOpenDropdown(item.label)} onMouseLeave={() => setOpenDropdown(null)}>
                <button id={`btn-${item.label.toLowerCase()}`} type="button" className="inline-flex items-center gap-1 px-3.5 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.08] rounded-md transition-all" aria-haspopup="true" aria-expanded={openDropdown === item.label}>
                  {item.label}
                  <span className={`text-[9px] inline-block transition-transform duration-200 ${openDropdown === item.label ? 'rotate-0' : 'rotate-180'}`}>⌃</span>
                </button>

                <div className={`absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 min-w-[210px] bg-[rgba(10,16,28,0.93)] backdrop-blur-2xl border border-white/10 rounded-xl p-2 shadow-2xl transition-all duration-200 ${openDropdown === item.label ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1 pointer-events-none'}`}>
                  {item.dropdown.map((sub) => (
                    <Link key={sub.label} href={sub.href} id={`sol-${sub.label.toLowerCase().replace(/\s+/g, '-')}`} className="block px-3.5 py-2.5 text-[13.5px] text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all" onClick={() => setOpenDropdown(null)}>
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.label} href={item.href} id={`nav-${item.label.toLowerCase()}`} className="inline-flex items-center px-3.5 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.08] rounded-md transition-all whitespace-nowrap">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-3 ml-auto">

            {/* LOGGED-IN USER */}
            {user ? (
              <div className="relative hidden lg:block">
                <button id="user-avatar-btn" type="button" onClick={() => setUserMenuOpen((v) => !v)} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#4f9cf9] text-white font-bold text-sm border border-white/20 hover:bg-[#2d7ef4] hover:scale-105 transition-all shadow-[0_4px_20px_rgba(79,156,249,0.25)]" aria-label="Open user menu" aria-expanded={userMenuOpen}>
                  {initials}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] w-[250px] bg-[rgba(10,16,28,0.97)] backdrop-blur-2xl border border-white/10 rounded-xl p-2 shadow-2xl z-[100]">
                    <div className="px-3 py-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#4f9cf9] text-white font-bold text-sm flex-shrink-0">{initials}</div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{userName}</p>
                          {userEmail && <p className="text-xs text-white/40 truncate">{userEmail}</p>}
                        </div>
                      </div>
                    </div>

                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="block w-full px-3 py-2.5 mt-1 text-sm text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all">Dashboard</Link>
                    <button type="button" onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={authHref} id="auth-icon-btn" title={authLabel} aria-label={authLabel} className="hidden lg:inline-flex items-center justify-center w-10 h-10 text-white/80 hover:text-white hover:bg-white/[0.08] border border-white/10 rounded-md transition-all">
                <UserCircle size={20} strokeWidth={1.8} />
              </Link>
            )}

            {/* LANGUAGE SELECTOR */}
            <button id="lang-btn" type="button" className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.08] rounded-md transition-all" aria-label="Select Language">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>EN</span>
              <span className="text-[9px] rotate-180 inline-block">⌃</span>
            </button>

            {/* HAMBURGER */}
            <button id="hamburger" type="button" className="lg:hidden flex flex-col justify-center gap-[5px] p-2 rounded-md hover:bg-white/[0.08] transition-all" onClick={() => setDrawerOpen((v) => !v)} aria-label={drawerOpen ? 'Close Menu' : 'Open Menu'} aria-expanded={drawerOpen}>
              <span className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-300 origin-center ${drawerOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-300 origin-center ${drawerOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <aside id="mobile-drawer" className={`fixed top-0 right-0 h-full w-[300px] z-[2000] pt-20 px-6 pb-10 overflow-y-auto drawer-scroll bg-[rgba(8,12,20,0.97)] backdrop-blur-2xl border-l border-white/10 transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!drawerOpen}>
        <button id="drawer-close" type="button" className="absolute top-5 right-5 text-3xl text-white/70 hover:text-white hover:bg-white/[0.08] px-2 py-0.5 rounded-md transition-all" onClick={closeDrawer} aria-label="Close Menu">×</button>

        <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
          {NAV_ITEMS.map((item) => item.dropdown ? (
            <details key={item.label} className="group">
              <summary className="list-none px-4 py-3 text-[15px] text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg cursor-pointer transition-all">{item.label}</summary>
              {item.dropdown.map((sub) => (
                <Link key={sub.label} href={sub.href} className="block px-8 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all" onClick={closeDrawer}>{sub.label}</Link>
              ))}
            </details>
          ) : (
            <Link key={item.label} href={item.href} className="block px-4 py-3 text-[15px] text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all" onClick={closeDrawer}>{item.label}</Link>
          ))}

          {/* MOBILE USER */}
          <div className="mt-5 pt-5 border-t border-white/10">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#4f9cf9] text-white font-bold text-sm">{initials}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                    {userEmail && <p className="text-xs text-white/40 truncate">{userEmail}</p>}
                  </div>
                </div>

                <Link href="/dashboard" className="w-full flex items-center px-4 py-3 text-[15px] text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all" onClick={closeDrawer}>Dashboard</Link>
                <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-3 text-[15px] text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all">Sign Out</button>
              </div>
            ) : (
              <Link href={authHref} id="mobile-auth-btn" title={authLabel} aria-label={authLabel} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[15px] text-white/80 hover:text-white hover:bg-white/[0.08] border border-white/10 rounded-lg transition-all" onClick={closeDrawer}>
                <UserCircle size={19} strokeWidth={1.8} />
                <span>{authLabel}</span>
              </Link>
            )}
          </div>
        </nav>
      </aside>

      {/* MOBILE BACKDROP */}
      {drawerOpen && <div id="drawer-backdrop" className="fixed inset-0 z-[1500] bg-black/50 backdrop-blur-sm lg:hidden" onClick={closeDrawer} />}

      {/* DESKTOP USER MENU BACKDROP */}
      {userMenuOpen && <div className="fixed inset-0 z-40 hidden lg:block" onClick={() => setUserMenuOpen(false)} />}
    </>
  )
}




