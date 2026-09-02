'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AddressValidator from '@/app/components/AddressValidator'

export default function DashboardPage() {
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    if (!token) router.replace('/login')
  }, [token, router])

  if (!token) return null

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const metrics = [
    { label: 'Assessed Properties', value: '12,482', change: '+14% this month', color: 'text-[#4f9cf9]', icon: '🏠' },
    { label: 'Risk Audit Reports',  value: '4,910',  change: '99.8% Accuracy',  color: 'text-[#00E5FF]', icon: '📄' },
    { label: 'Legal Title Audits',  value: '1,240',  change: '0 Title Defect Escapes', color: 'text-[#E040FB]', icon: '🛡' },
    { label: 'Active Alerts',       value: '3',      change: 'Encumbrance Flagged', color: 'text-[#F59E0B]', icon: '⚠' },
  ]

  return (
    <main className="min-h-screen bg-[#0a0e16] pt-[88px] px-4 pb-16">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9] mb-1">
              Infosys RiskIntelligence Node
            </p>
            <h1 className="text-2xl font-semibold text-white">Autonomous Risk Assessment Console</h1>
            <p className="text-white/40 text-sm mt-1">System Active • Connected to State Public Registry API Nodes</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white text-sm rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m) => (
            <div key={m.label} className="bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">{m.label}</span>
                <span className="text-lg">{m.icon}</span>
              </div>
              <span className={`text-2xl font-bold ${m.color}`}>{m.value}</span>
              <p className="text-xs text-white/30 mt-1">{m.change}</p>
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
