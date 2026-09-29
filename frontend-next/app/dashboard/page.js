
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
      change: 'Total properties assessed',
      icon: '⌂',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Risk Audit Reports',
      value: '4,910',
      change: 'Reports generated',
      icon: '▤',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Legal Title Audits',
      value: '1,240',
      change: 'Title audits completed',
      icon: '◈',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Active Alerts',
      value: '3',
      change: 'Alerts requiring review',
      icon: '!',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ]

  const quickActions = [
    {
      title: 'Search Property',
      description:
        'Find a property by address and start a due diligence assessment.',
      icon: '⌕',
      buttonText: 'Search Property',
      action: () => router.push('/property-search'),
      accent: 'from-blue-500/20 to-cyan-500/5',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Risk Assessment',
      description:
        'Review property risks, zoning information, and other assessment details.',
      icon: '◈',
      buttonText: 'Start Assessment',
      action: () => router.push('/property-search'),
      accent: 'from-purple-500/20 to-indigo-500/5',
      iconColor: 'text-purple-400',
    },
  ]

  return (
    <main className="min-h-screen bg-[#080c16] px-4 pb-16 pt-28 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* Dashboard Header */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              PropDue Intelligence Platform
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Monitor your property research and due diligence activities.
            </p>
          </div>

          <button
            onClick={() => router.push('/property-search')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <span className="text-lg">+</span>
            Search Property
            <span aria-hidden="true">→</span>
          </button>
        </header>

        {/* Welcome Card */}
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#101d3a] via-[#0d1428] to-[#0b1020] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/10 text-xl font-bold text-blue-300">
                {userInitials}
              </div>

              <div>
                <p className="mb-1 text-sm text-slate-400">
                  Welcome back,
                </p>

                <h2 className="text-2xl font-bold">
                  {userName}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Your property intelligence workspace is ready.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-300 sm:self-center">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Account Active
            </div>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Overview
            </h2>

            <span className="text-xs text-slate-500">
              Platform statistics
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="group rounded-2xl border border-white/10 bg-[#0d1424] p-5 transition hover:border-white/20 hover:bg-[#111a2e]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    {metric.label}
                  </p>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${metric.bg} ${metric.color}`}
                  >
                    {metric.icon}
                  </div>
                </div>

                <p className={`text-3xl font-bold tracking-tight ${metric.color}`}>
                  {metric.value}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {metric.change}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Choose an action to continue your property research.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {quickActions.map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br ${item.accent} p-6 transition hover:border-white/20`}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#0b1020]/70 text-2xl">
                  <span className={item.iconColor}>
                    {item.icon}
                  </span>
                </div>

                <h3 className="text-lg font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>

                <button
                  onClick={item.action}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {item.buttonText}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Property Search CTA */}
        <section className="rounded-2xl border border-blue-400/20 bg-[#0d1629] p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
                Get Started
              </p>

              <h2 className="text-xl font-bold sm:text-2xl">
                Ready to assess a property?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Search for a property to begin reviewing its ownership,
                zoning, flood risk, tax history, and other due diligence details.
              </p>
            </div>

            <button
              onClick={() => router.push('/property-search')}
              className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Click Here to Search Property →
            </button>
          </div>
        </section>

      </div>
    </main>
  )
}



// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import AddressValidator from '@/app/components/AddressValidator'

// function getInitials(name) {
//   if (!name) return 'U'

//   return name
//     .trim()
//     .split(' ')
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((word) => word.charAt(0).toUpperCase())
//     .join('')
// }

// export default function DashboardPage() {
//   const router = useRouter()

//   const [token, setToken] = useState(null)
//   const [user, setUser] = useState(null)

//   useEffect(() => {
//     const storedToken = localStorage.getItem('token')
//     const storedUser = localStorage.getItem('user')

//     if (!storedToken) {
//       router.replace('/login')
//       return
//     }

//     setToken(storedToken)

//     if (storedUser) {
//       try {
//         setUser(JSON.parse(storedUser))
//       } catch (error) {
//         console.error('Failed to parse user data:', error)
//         localStorage.removeItem('user')
//       }
//     }
//   }, [router])

//   if (!token) {
//     return null
//   }

//   const userName = user?.fullName || 'User'
//   const userInitials = getInitials(userName)

//   const metrics = [
//     { label: 'Assessed Properties', value: '12,482', change: '+14% this month', color: 'text-[#4f9cf9]', icon: '🏠' },
//     { label: 'Risk Audit Reports',  value: '4,910',  change: '99.8% Accuracy',  color: 'text-[#00E5FF]', icon: '📄' },
//     { label: 'Legal Title Audits',  value: '1,240',  change: '0 Title Defect Escapes', color: 'text-[#E040FB]', icon: '🛡' },
//     { label: 'Active Alerts',       value: '3',      change: 'Encumbrance Flagged', color: 'text-[#F59E0B]', icon: '⚠' },
//   ]


//   return (

//       <main className="min-h-screen bg-[#0a0e16] pt-[88px] px-4 pb-16"> <div className="max-w-5xl mx-auto">

//         {/* Dashboard Header */}
//         <div className="mb-8">
//           <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9] mb-1">Infosys RiskIntelligence Node</p>
//           <h1 className="text-2xl font-semibold text-white">Autonomous Risk Assessment Console</h1>
//           <p className="text-white/40 text-sm mt-1">System Active • Connected to State Public Registry API Nodes</p>
//         </div>

//         {/* Welcome Card */}
//         {user && (
//           <section className="mb-8 bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5">
//             <div className="flex items-center gap-4">
//               <div className="w-14 h-14 rounded-full bg-[#4f9cf9]/10 border border-[#4f9cf9]/40 flex items-center justify-center flex-shrink-0">
//                 <span className="text-[#7eb6ff] font-semibold text-lg">{userInitials}</span>
//               </div>
//               <div>
//                 <p className="text-sm text-white/40 mb-1">Welcome back</p>
//                 <h2 className="text-xl font-semibold text-white">{userName}</h2>
//                 <p className="text-sm text-white/40 mt-1">Your property risk intelligence workspace is ready.</p>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* Metrics Grid */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           {metrics.map((metric) => (
//             <div key={metric.label} className="bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-xl p-5">
//               <div className="flex items-center justify-between mb-3">
//                 <span className="text-xs text-white/40 uppercase tracking-wider">{metric.label}</span>
//                 <span className="text-lg">{metric.icon}</span>
//               </div>
//               <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
//               <p className="text-xs text-white/30 mt-1">{metric.change}</p>
//             </div>
//           ))}
//         </div>

//         {/* Address Validator */}
//         <section className="bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
//           <AddressValidator />
//         </section>

//       </div>
//     </main> 
//   )
// }