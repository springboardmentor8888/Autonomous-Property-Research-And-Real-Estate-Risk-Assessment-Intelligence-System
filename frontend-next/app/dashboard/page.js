'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AddressValidator from '@/app/components/AddressValidator'

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
    { label: 'Assessed Properties', value: '12,482', change: '+14% this month', color: 'text-[#4f9cf9]', icon: '🏠' },
    { label: 'Risk Audit Reports',  value: '4,910',  change: '99.8% Accuracy',  color: 'text-[#00E5FF]', icon: '📄' },
    { label: 'Legal Title Audits',  value: '1,240',  change: '0 Title Defect Escapes', color: 'text-[#E040FB]', icon: '🛡' },
    { label: 'Active Alerts',       value: '3',      change: 'Encumbrance Flagged', color: 'text-[#F59E0B]', icon: '⚠' },
  ]


  return (

      <main className="min-h-screen bg-[#0a0e16] pt-[88px] px-4 pb-16"> <div className="max-w-5xl mx-auto">

        {/* Dashboard Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9] mb-1">Infosys RiskIntelligence Node</p>
          <h1 className="text-2xl font-semibold text-white">Autonomous Risk Assessment Console</h1>
          <p className="text-white/40 text-sm mt-1">System Active • Connected to State Public Registry API Nodes</p>
        </div>

        {/* Welcome Card */}
        {user && (
          <section className="mb-8 bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#4f9cf9]/10 border border-[#4f9cf9]/40 flex items-center justify-center flex-shrink-0">
                <span className="text-[#7eb6ff] font-semibold text-lg">{userInitials}</span>
              </div>
              <div>
                <p className="text-sm text-white/40 mb-1">Welcome back</p>
                <h2 className="text-xl font-semibold text-white">{userName}</h2>
                <p className="text-sm text-white/40 mt-1">Your property risk intelligence workspace is ready.</p>
              </div>
            </div>
          </section>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">{metric.label}</span>
                <span className="text-lg">{metric.icon}</span>
              </div>
              <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
              <p className="text-xs text-white/30 mt-1">{metric.change}</p>
            </div>
          ))}
        </div>

        {/* Address Validator */}
        <section className="bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <AddressValidator />
        </section>

      </div>
    </main> 
  )
}