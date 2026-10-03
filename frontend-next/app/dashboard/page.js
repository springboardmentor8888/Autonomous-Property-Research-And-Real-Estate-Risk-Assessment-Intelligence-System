'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function getInitials(name) {
  if (!name) return 'U'

  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

export default function DashboardPage() {
  const router = useRouter()

  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!storedToken) {
      router.replace('/login')
      return
    }

    setToken(storedToken)

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [router])

  if (!token) {
    return null
  }

  const userName = user?.fullName || 'User'
  const userInitials = getInitials(userName)

  const metrics = [
    {
      label: 'Assessed Properties',
      value: '12,482',
      description: 'Total properties assessed',
      icon: '⌂',
      accent: 'blue',
    },
    {
      label: 'Risk Audit Reports',
      value: '4,910',
      description: 'Reports generated',
      icon: '▤',
      accent: 'cyan',
    },
    {
      label: 'Legal Title Audits',
      value: '1,240',
      description: 'Title audits completed',
      icon: '◈',
      accent: 'purple',
    },
    {
      label: 'Active Alerts',
      value: '3',
      description: 'Alerts requiring review',
      icon: '!',
      accent: 'amber',
    },
  ]

  const quickActions = [
    {
      title: 'Search Property',
      description:
        'Find a property by address and start a complete due diligence assessment.',
      icon: '⌕',
      buttonText: 'Search Property',
      action: () => router.push('/property-search'),
      accent:
        'from-blue-500/[0.14] via-blue-500/[0.04] to-transparent',
      iconColor: 'text-blue-300',
      borderColor: 'hover:border-blue-400/30',
    },
    {
      title: 'Risk Assessment',
      description:
        'Review ownership, zoning, flood risk, tax history, permits and environmental information.',
      icon: '◈',
      buttonText: 'Start Assessment',
      action: () => router.push('/property-search'),
      accent:
        'from-cyan-500/[0.12] via-blue-500/[0.04] to-transparent',
      iconColor: 'text-cyan-300',
      borderColor: 'hover:border-cyan-400/30',
    },
  ]

  const accentStyles = {
    blue: {
      icon: 'border-blue-400/20 bg-blue-400/[0.08] text-blue-300',
      value: 'text-blue-300',
      glow: 'bg-blue-500/[0.06]',
    },
    cyan: {
      icon: 'border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300',
      value: 'text-cyan-300',
      glow: 'bg-cyan-500/[0.06]',
    },
    purple: {
      icon: 'border-purple-400/20 bg-purple-400/[0.08] text-purple-300',
      value: 'text-purple-300',
      glow: 'bg-purple-500/[0.06]',
    },
    amber: {
      icon: 'border-amber-400/20 bg-amber-400/[0.08] text-amber-300',
      value: 'text-amber-300',
      glow: 'bg-amber-500/[0.06]',
    },
  }

  return (
    <main className="min-h-screen bg-[#080c16] px-4 pb-16 pt-28 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/[0.035] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-500/[0.025] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* =========================================================
            HEADER
        ========================================================== */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
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
                Monitor property research, due diligence activity and
                real-estate risk intelligence from one workspace.
              </p>
            </div>

            <button
              onClick={() => router.push('/property-search')}
              className="group inline-flex items-center justify-center gap-3 rounded-xl border border-blue-400/20 bg-blue-500/[0.10] px-5 py-3 text-sm font-semibold text-blue-200 shadow-lg shadow-blue-950/20 transition-all duration-200 hover:border-blue-300/40 hover:bg-blue-500/[0.18] hover:text-white"
            >
              <span className="text-lg leading-none text-blue-300">
                +
              </span>

              Search Property

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </header>

        {/* =========================================================
            WELCOME CARD
        ========================================================== */}
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

        {/* =========================================================
            OVERVIEW
        ========================================================== */}
        <section className="mb-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400/80">
                Intelligence Overview
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Platform Activity
              </h2>
            </div>

            <span className="hidden text-xs text-slate-600 sm:block">
              Current platform statistics
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const style = accentStyles[metric.accent]

              return (
                <div
                  key={metric.label}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1322] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-[#0e1728]"
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${style.glow}`}
                  />

                  <div className="relative">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <p className="max-w-[150px] text-xs font-medium uppercase tracking-wider text-slate-500">
                        {metric.label}
                      </p>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg font-bold ${style.icon}`}
                      >
                        {metric.icon}
                      </div>
                    </div>

                    <p
                      className={`text-3xl font-bold tracking-tight ${style.value}`}
                    >
                      {metric.value}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {metric.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* =========================================================
            QUICK ACTIONS
        ========================================================== */}
        <section className="mb-10">
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400/80">
              Workspace
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Start a property investigation or continue your risk assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {quickActions.map((item) => (
              <div
                key={item.title}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br ${item.accent} p-6 transition-all duration-200 hover:-translate-y-0.5 ${item.borderColor}`}
              >
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-blue-500/[0.035] blur-3xl" />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.09] bg-[#090f1d]/70 text-2xl shadow-inner">
                      <span className={item.iconColor}>
                        {item.icon}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Action
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 min-h-[52px] max-w-xl text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>

                  <button
                    onClick={item.action}
                    className="group/button mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-blue-400/20 hover:bg-blue-500/[0.10] hover:text-white"
                  >
                    {item.buttonText}

                    <span className="transition-transform duration-200 group-hover/button:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            DUE DILIGENCE CTA
        ========================================================== */}
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
                Ready to assess a property?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Search for a property and review its ownership, zoning,
                flood risk, tax history, permits, environmental information
                and other due diligence details.
              </p>
            </div>

            <button
              onClick={() => router.push('/property-search')}
              className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition-all duration-200 hover:bg-blue-500 hover:shadow-blue-500/10"
            >
              Search Property

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </section>

        {/* =========================================================
            FOOTER STATUS
        ========================================================== */}
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-5 text-[11px] text-slate-600 sm:flex-row">
          <span>
            PropDue Property Intelligence Platform
          </span>

          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            System Ready
          </span>
        </div>
      </div>
    </main>
  )
}