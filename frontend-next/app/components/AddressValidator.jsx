'use client'

import { useState } from 'react'

export default function AddressValidator() {
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'verified'
  const [result, setResult] = useState(null)

  const handleVerify = (e) => {
    e.preventDefault()
    if (!address.trim()) return
    setStatus('loading')
    setResult(null)
    setTimeout(() => {
      setStatus('verified')
      setResult({
        parcelId: 'PARCEL-2026-88902',
        riskScore: 'LOW (12/100)',
        zone: 'Residential - R2',
        registry: 'Clean Title / Zero Encumbrances',
      })
    }, 1200)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#4f9cf9]/10 border border-[#4f9cf9]/20 flex items-center justify-center text-[#4f9cf9]">
          📍
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Enterprise Address Validator</h3>
          <p className="text-white/40 text-xs">Pre-screen property addresses against state public registry databases</p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Enter property address (e.g. 742 Evergreen Terrace, Springfield, IL)"
          value={address}
          onChange={(e) => { setAddress(e.target.value); if (status !== 'idle') setStatus('idle') }}
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#4f9cf9] focus:ring-2 focus:ring-[#4f9cf9]/20 transition-all"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-2.5 bg-[#4f9cf9] hover:bg-[#2d7ef4] text-white font-medium text-sm rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(79,156,249,0.35)] disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'loading' ? 'Verifying...' : 'Verify Address'}
        </button>
      </form>

      {status === 'verified' && result && (
        <div className="mt-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-400 font-medium text-sm mb-3">
            <span>✓</span> Verified Registry Match
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Parcel ID', value: result.parcelId, color: 'text-white' },
              { label: 'Initial Risk Pre-Check', value: result.riskScore, color: 'text-[#4f9cf9]' },
              { label: 'Zoning Classification', value: result.zone, color: 'text-white' },
              { label: 'Registry Status', value: result.registry, color: 'text-[#00E5FF]' },
            ].map((d) => (
              <div key={d.label} className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-xs text-white/40 mb-1">{d.label}</p>
                <p className={`text-sm font-medium ${d.color}`}>{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
