'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function getInitials(name) {
  if (!name) return 'U'

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

function getHistoryKey(user) {
  const identity = user?.id ?? user?.email ?? 'guest'
  return `propdue:recent-properties:${String(identity).toLowerCase()}`
}

function getPropertyAddress(property) {
  return (
    property?.formattedAddress ||
    property?.address ||
    property?.fullAddress ||
    'Property assessment'
  )
}

function formatSearchDate(value) {
  if (!value) return ''

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString()
}

export default function DashboardPage() {
  const router = useRouter()

  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState(null)
  const [recentProperties, setRecentProperties] = useState([])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login')
      return
    }

    let savedUser = null

    try {
      savedUser = JSON.parse(localStorage.getItem('user') || 'null')
      setUser(savedUser)
    } catch (error) {
      console.error('Failed to parse user data:', error)
      localStorage.removeItem('user')
    }

    try {
      const history = JSON.parse(
        localStorage.getItem(getHistoryKey(savedUser)) || '[]'
      )

      if (Array.isArray(history) && history.length > 0) {
        setRecentProperties(history)
      } else {
        // Fallback for a property saved before search history was added.
        const selectedProperty = JSON.parse(
          sessionStorage.getItem('selectedProperty') || 'null'
        )

        if (selectedProperty) {
          setRecentProperties([selectedProperty])
        }
      }
    } catch (error) {
      console.error('Failed to read recent properties:', error)
    }

    setIsReady(true)
  }, [router])

  function openPropertyReport(property) {
    // Detail pages use selectedProperty to identify the property to load.
    sessionStorage.setItem('selectedProperty', JSON.stringify(property))
    router.push('/due-diligence-report')
  }

  if (!isReady) return null

  const userName = user?.fullName || user?.name || 'User'
  const userInitials = getInitials(userName)

  const researchTools = [
    {
      title: 'Ownership Records',
      description: 'Review current and previous ownership details.',
      href: '/ownership',
      icon: '◈',
    },
    {
      title: 'Tax History',
      description: 'Review property tax records and payment history.',
      href: '/tax-history',
      icon: '$',
    },
    {
      title: 'Zoning',
      description: 'Review land-use classification and compliance.',
      href: '/zoning',
      icon: '⌖',
    },
    {
      title: 'Flood Zone',
      description: 'Review flood classification and risk information.',
      href: '/flood-zone',
      icon: '≈',
    },
    {
      title: 'Permits & Environment',
      description: 'Review permits and environmental records.',
      href: '/permit-environmental',
      icon: '▤',
    },
    {
      title: 'Full Due Diligence Report',
      description: 'View the complete report for the selected property.',
      href: '/due-diligence-report',
      icon: '↗',
    },
  ]

  return (
    <main className="min-h-screen bg-[#080c16] px-4 pb-16 pt-28 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/[0.035] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-500/[0.025] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-blue-400/60" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
              PropDue Intelligence Platform
            </p>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Continue your property research and access your due diligence
            workspace.
          </p>
        </header>

        {/* WELCOME CARD */}
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#111d37] via-[#0d1528] to-[#0a101e] p-6 shadow-2xl shadow-black/20 sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-500/[0.08] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-cyan-500/[0.035] blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-400/[0.08] text-xl font-bold text-blue-200 shadow-inner">
                {userInitials}
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Welcome back
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {userName}
                </h2>
                <p className="mt-1.5 text-sm text-slate-400">
                  Your property intelligence workspace is ready.
                </p>
              </div>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-2 text-xs font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Account Active
            </div>
          </div>
        </section>

        {/* RECENT PROPERTIES */}
        <section className="mb-8">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400/80">
                Your Workspace
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Recent Properties
              </h2>
            </div>

            <button
              type="button"
              onClick={() => router.push('/property-search')}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.08]"
            >
              Search Property <span aria-hidden="true">→</span>
            </button>
          </div>

          {recentProperties.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentProperties.map((property, index) => {
                const location = [
                  property.city,
                  property.state,
                  property.postalCode || property.zipCode,
                ]
                  .filter(
                    (value) => value && value !== 'Not available'
                  )
                  .join(', ')

                return (
                  <article
                    key={
                      property.propertyId ??
                      `${getPropertyAddress(property)}-${index}`
                    }
                    className="flex flex-col justify-between gap-5 rounded-2xl border border-white/[0.08] bg-[#0c1322] p-6 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {index === 0
                          ? 'Most recently searched'
                          : 'Recent search'}
                      </p>

                      <h3 className="mt-2 break-words text-lg font-semibold text-white">
                        {getPropertyAddress(property)}
                      </h3>

                      {location && (
                        <p className="mt-1 text-sm text-slate-400">
                          {location}
                        </p>
                      )}

                      {property.propertyType &&
                        property.propertyType !== 'Not available' && (
                          <p className="mt-2 text-xs text-slate-500">
                            Property type: {property.propertyType}
                          </p>
                        )}

                      {property.searchedAt && (
                        <p className="mt-2 text-xs text-slate-500">
                          Searched: {formatSearchDate(property.searchedAt)}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openPropertyReport(property)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20"
                    >
                      Open Report <span aria-hidden="true">→</span>
                    </button>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6">
              <h3 className="text-base font-semibold text-white">
                No recent properties
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Search for a property. Successful searches will appear here,
                with the newest one at the top.
              </p>
              <button
                type="button"
                onClick={() => router.push('/property-search')}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Search Property <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </section>

        {/* DUE DILIGENCE QUICK LINKS */}
        <section className="mb-8">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400/80">
              Due Diligence
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              Property research tools
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {researchTools.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => router.push(item.href)}
                className="group flex h-full items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#0c1322] p-5 text-left transition hover:border-blue-400/25 hover:bg-[#0e1728]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/[0.08] text-lg font-semibold text-blue-200">
                  {item.icon}
                </span>
                <span>
                  <span className="block font-semibold text-white transition group-hover:text-blue-200">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">
                    {item.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* PRIMARY ACTION */}
        <section className="relative overflow-hidden rounded-2xl border border-blue-400/[0.16] bg-gradient-to-r from-[#0d1a32] via-[#0d1629] to-[#0b1221] p-6 shadow-xl shadow-blue-950/10 sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-500/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-500/[0.035] blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-6 bg-blue-400/60" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300">
                  Property Due Diligence
                </p>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Start a property review
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Find a property and bring its available records together in one
                due diligence workflow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/property-search')}
              className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition-all duration-200 hover:bg-blue-500"
            >
              Search Property
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-5 text-[11px] text-slate-600 sm:flex-row">
          <span>PropDue Property Intelligence Platform</span>
          <span>Recent searches are saved in this browser.</span>
        </footer>
      </div>
    </main>
  )
}