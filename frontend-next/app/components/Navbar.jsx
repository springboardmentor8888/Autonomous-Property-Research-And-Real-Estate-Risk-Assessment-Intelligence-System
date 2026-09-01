'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'We Are', href: '/we-are' },
  {
    label: 'Solutions',
    dropdown: [
      { label: 'Property Search',    href: '/property-search' },
      { label: 'Due Diligence',      href: '#due-diligence'   },
      { label: 'Risk Assessment',    href: '#risk-assessment' },
      { label: 'Report Generation',  href: '#reports'         },
      { label: 'Comparable Analysis',href: '#comparables'     },
    ],
  },
  {
    label: 'Clients',
    dropdown: [
      { label: 'Buyers',                href: '#buyers'    },
      { label: 'Real Estate Agents',    href: '#agents'    },
      { label: 'Legal Reviewers',       href: '#legal'     },
      { label: 'Financial Institutions',href: '#banks'     },
      { label: 'Investors',             href: '#investors' },
    ],
  },
  { label: 'Leadership', href: '#leadership' },
  { label: 'People',     href: '#people'     },
  { label: 'ESG',        href: '#esg'        },
  { label: 'Newsroom',   href: '#newsroom'   },
  { label: 'Contact',    href: '#contact'    },
]

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [drawerOpen,   setDrawerOpen]   = useState(false)

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  /* Escape key closes everything */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpenDropdown(null); setDrawerOpen(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* ── Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(8,12,20,0.88)] backdrop-blur-xl border-b border-white/10 shadow-xl'
            : ''
        }`}
      >
        <div className="max-w-[1440px] mx-auto h-full px-8 flex items-center gap-10">

          {/* Logo */}
          <Link
            href="/"
            id="logo-link"
            className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <span className="text-[22px] text-accent leading-none">⬡</span>
            <span className="text-[20px] font-semibold tracking-tight text-white">PropDue</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) =>
              item.dropdown ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    id={`btn-${item.label.toLowerCase()}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.08] rounded-md transition-all"
                    aria-haspopup="true"
                    aria-expanded={openDropdown === item.label}
                  >
                    {item.label}
                    <span
                      className={`text-[9px] inline-block transition-transform duration-200 ${
                        openDropdown === item.label ? 'rotate-0' : 'rotate-180'
                      }`}
                    >
                      ⌃
                    </span>
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 min-w-[210px]
                      bg-[rgba(10,16,28,0.93)] backdrop-blur-2xl border border-white/10
                      rounded-xl p-2 shadow-2xl transition-all duration-200
                      ${openDropdown === item.label
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-1 pointer-events-none'}`}
                  >
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        id={`sol-${sub.label.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-3.5 py-2.5 text-[13.5px] text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  id={`nav-${item.label.toLowerCase()}`}
                  className="inline-flex items-center px-3.5 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.08] rounded-md transition-all whitespace-nowrap"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Language selector */}
            <button
              id="lang-btn"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.08] rounded-md transition-all"
              aria-label="Select Language"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>EN</span>
              <span className="text-[9px] rotate-180 inline-block">⌃</span>
            </button>

            {/* Hamburger */}
            <button
              id="hamburger"
              className="lg:hidden flex flex-col justify-center gap-[5px] p-2 rounded-md hover:bg-white/[0.08] transition-all"
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label={drawerOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={drawerOpen}
            >
              <span className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-300 origin-center ${drawerOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-300 origin-center ${drawerOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <aside
        id="mobile-drawer"
        className={`fixed top-0 right-0 h-full w-[300px] z-[2000] pt-20 px-6 pb-10 overflow-y-auto drawer-scroll
          bg-[rgba(8,12,20,0.97)] backdrop-blur-2xl border-l border-white/10
          transition-transform duration-300 ease-in-out
          ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!drawerOpen}
      >
        <button
          id="drawer-close"
          className="absolute top-5 right-5 text-3xl text-white/70 hover:text-white hover:bg-white/[0.08] px-2 py-0.5 rounded-md transition-all"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close Menu"
        >
          ×
        </button>

        <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
          {NAV_ITEMS.map((item) =>
            item.dropdown ? (
              <details key={item.label} className="group">
                <summary className="list-none px-4 py-3 text-[15px] text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg cursor-pointer transition-all">
                  {item.label}
                </summary>
                {item.dropdown.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    className="block px-8 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {sub.label}
                  </Link>
                ))}
              </details>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="block px-4 py-3 text-[15px] text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all"
                onClick={() => setDrawerOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </aside>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          id="drawer-backdrop"
          className="fixed inset-0 z-[1500] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}
    </>
  )
}
