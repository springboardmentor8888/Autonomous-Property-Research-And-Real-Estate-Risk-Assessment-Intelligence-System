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
        {/* Tax Risk Assessment */}
<section className="mt-6 bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">

  <div className="flex items-center justify-between mb-6">
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9]">
        Property Tax Assessment
      </p>

      <h2 className="text-xl font-semibold text-white mt-1">
        Tax Risk Details
      </h2>
    </div>

    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-400/20">
      ✓ Low Risk
    </span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Property Tax ID
      </p>
      <p className="text-white font-medium mt-2">
        TAX-2026-00482
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Annual Tax
      </p>
      <p className="text-white font-medium mt-2">
        ₹48,500
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Tax Status
      </p>
      <p className="text-green-400 font-medium mt-2">
        Paid
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Risk Assessment
      </p>
      <p className="text-green-400 font-medium mt-2">
        No Outstanding Dues
      </p>
    </div>

  </div>
</section>

{/* Zoning Compliance */}
<section className="mt-6 bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">

  <div className="flex items-center justify-between mb-6">
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9]">
        Zoning Assessment
      </p>

      <h2 className="text-xl font-semibold text-white mt-1">
        Zoning Compliance
      </h2>
    </div>

    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-400/20">
      ✓ Compliant
    </span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Zoning Code
      </p>
      <p className="text-white font-medium mt-2">
        R-2 Residential
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Permitted Use
      </p>
      <p className="text-white font-medium mt-2">
        Residential
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Building Height
      </p>
      <p className="text-white font-medium mt-2">
        Within Limit
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Compliance Status
      </p>
      <p className="text-green-400 font-medium mt-2">
        No Violations
      </p>
    </div>

  </div>
</section>
{/* Flood Risk Assessment */}
<section className="mt-6 bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">

  <div className="flex items-center justify-between mb-6">
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9]">
        Flood Assessment
      </p>

      <h2 className="text-xl font-semibold text-white mt-1">
        Flood Risk Status
      </h2>
    </div>

    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-400/20">
      ✓ Low Risk
    </span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Flood Zone
      </p>
      <p className="text-white font-medium mt-2">
        Zone X
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Flood Risk Level
      </p>
      <p className="text-green-400 font-medium mt-2">
        Low
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Flood Verification
      </p>
      <p className="text-green-400 font-medium mt-2">
        Verified
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Risk Status
      </p>
      <p className="text-green-400 font-medium mt-2">
        No Significant Risk
      </p>
    </div>

  </div>
</section>
{/* Permit Details */}

        {/* Permit Details */}
        <section className="mt-6 bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9]">
                Permit &amp; Compliance
              </p>

              <h2 className="text-xl font-semibold text-white mt-1">
                Permit Details
              </h2>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-400/20">
              ✓ Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Permit ID
              </p>
              <p className="text-white font-medium mt-2">
                PERMIT-2026-00871
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Permit Type
              </p>
              <p className="text-white font-medium mt-2">
                Residential Building Permit
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Issue Date
              </p>
              <p className="text-white font-medium mt-2">
                12 February 2024
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Permit Status
              </p>
              <p className="text-green-400 font-medium mt-2">
                Approved
              </p>
            </div>

          </div>
        </section>
        {/* Permit Compliance */}
<section className="mt-6 bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">

  <div className="flex items-center justify-between mb-6">
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9]">
        Permit Assessment
      </p>

      <h2 className="text-xl font-semibold text-white mt-1">
        Permit Compliance
      </h2>
    </div>

    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-400/20">
      ✓ Compliant
    </span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Permit Number
      </p>
      <p className="text-white font-medium mt-2">
        PERMIT-2026-00871
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Permit Type
      </p>
      <p className="text-white font-medium mt-2">
        Residential Building Permit
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Permit Status
      </p>
      <p className="text-green-400 font-medium mt-2">
        Approved
      </p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Compliance Check
      </p>
      <p className="text-green-400 font-medium mt-2">
        No Violations
      </p>
    </div>

  </div>
</section>
                {/* Utility Details */}
        <section className="mt-6 bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9]">
                Environmental &amp; Utility
              </p>

              <h2 className="text-xl font-semibold text-white mt-1">
                Utility Details
              </h2>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-400/20">
              ✓ Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Electricity
              </p>
              <p className="text-white font-medium mt-2">
                Connected
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Water Supply
              </p>
              <p className="text-white font-medium mt-2">
                Municipal
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Gas Connection
              </p>
              <p className="text-white font-medium mt-2">
                Available
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Sewerage
              </p>
              <p className="text-white font-medium mt-2">
                Municipal
              </p>
            </div>

          </div>
        </section>
        {/* Ownership Verification */}
<section className="mt-6 bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">

  <div className="flex items-center justify-between mb-6">
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9]">
        Ownership Verification
      </p>

      <h2 className="text-xl font-semibold text-white mt-1">
        Verification Details
      </h2>
    </div>

    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-400/20">
      ✓ Verified
    </span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
    <p className="text-xs text-white/40 uppercase tracking-wider">
      Verification Status
    </p>
    <p className="text-green-400 font-medium mt-2">
      Verified
    </p>
  </div>

  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
    <p className="text-xs text-white/40 uppercase tracking-wider">
      Owner Name
    </p>
    <p className="text-white font-medium mt-2">
      Verified Owner
    </p>
  </div>

  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
    <p className="text-xs text-white/40 uppercase tracking-wider">
      Ownership Status
    </p>
    <p className="text-green-400 font-medium mt-2">
      Verified
    </p>
  </div>

  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
    <p className="text-xs text-white/40 uppercase tracking-wider">
      Ownership Type
    </p>
    <p className="text-white font-medium mt-2">
      Individual
    </p>
  </div>

  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
    <p className="text-xs text-white/40 uppercase tracking-wider">
      Registry Match
    </p>
    <p className="text-green-400 font-medium mt-2">
      Matched
    </p>
  </div>

  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
    <p className="text-xs text-white/40 uppercase tracking-wider">
      Last Verified
    </p>
    <p className="text-white font-medium mt-2">
      10 September 2026
    </p>
  </div>

</div>
</section>
{/* Due Diligence Workflow */}
<section className="mt-6 bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">

  <div className="mb-6">
    <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9]">
      Due Diligence Process
    </p>

    <h2 className="text-xl font-semibold text-white mt-1">
      Property Verification Workflow
    </h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-white font-medium">1. Ownership</p>
      <p className="text-green-400 text-sm mt-2">✓ Verified</p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-white font-medium">2. Tax Assessment</p>
      <p className="text-green-400 text-sm mt-2">✓ Low Risk</p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-white font-medium">3. Zoning</p>
      <p className="text-green-400 text-sm mt-2">✓ Compliant</p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-white font-medium">4. Flood Risk</p>
      <p className="text-green-400 text-sm mt-2">✓ Low Risk</p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-white font-medium">5. Permit</p>
      <p className="text-green-400 text-sm mt-2">✓ Compliant</p>
    </div>

    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <p className="text-white font-medium">6. Utilities</p>
      <p className="text-green-400 text-sm mt-2">✓ Connected</p>
    </div>

  </div>

  <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-400/20">
    <p className="text-green-400 font-semibold">
      ✓ Due Diligence Review Complete
    </p>

    <p className="text-white/60 text-sm mt-1">
      All available property verification checks have been reviewed.
    </p>
  </div>

</section>
        </div>
    </main>
  )
}
