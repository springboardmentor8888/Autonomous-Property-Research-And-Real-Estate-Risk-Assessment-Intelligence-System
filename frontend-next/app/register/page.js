'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BASE_URL = '/api'

async function post(endpoint, body) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || data?.error || `Request failed (${res.status})`)
  return data
}

const ROLES = [
  { value: 'BUYER',                label: 'Buyer',                  description: 'Access property pre-screenings, title risk summaries, and buyer due-diligence reports.', admin: false },
  { value: 'REAL_ESTATE_AGENT',    label: 'Real Estate Agent',      description: 'Manage property listings with automated compliance verification & risk disclosures.', admin: false },
  { value: 'LEGAL_REVIEWER',       label: 'Legal Reviewer',         description: 'Perform deep deed title chain audits, encumbrance reviews, and legal risk scoring.', admin: false },
  { value: 'FINANCIAL_INSTITUTION',label: 'Financial Institution',  description: 'Access institutional property valuation, loan risk scoring, and mortgage pre-check tools.', admin: false },
  { value: 'ADMIN',                label: 'Administrator',          description: 'Full enterprise platform administration, security policies, and user role management.', admin: true },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'BUYER' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedRole = ROLES.find((r) => r.value === form.role) || ROLES[0]

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.fullName.trim()) return setError('Full Name is required.')
    if (!form.email.trim()) return setError('Work Email is required.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    try {
      await post('/auth/register', form)
      setSuccess('Enterprise account created! Redirecting...')
      setTimeout(() => router.push('/login'), 1500)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-[#4f9cf9] focus:ring-2 focus:ring-[#4f9cf9]/20 transition-all"

  return (
    <main className="min-h-screen bg-[#0a0e16] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9] mb-2">Enterprise Onboarding</p>
          <h1 className="text-3xl font-semibold text-white mb-2">Create Enterprise Account</h1>
          <p className="text-white/50 text-sm">Join Infosys RiskIntelligence for automated property research</p>
        </div>

        <div className="bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm">
              <span>⚠</span> {error}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg px-4 py-3 text-sm">
              <span>✓</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-fullName" className="text-xs font-bold tracking-widest uppercase text-white/50">Full Name</label>
              <input id="reg-fullName" name="fullName" type="text" placeholder="e.g. Alexander Wright"
                value={form.fullName} onChange={handleChange} required autoComplete="name" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-xs font-bold tracking-widest uppercase text-white/50">Work Email Address</label>
              <input id="reg-email" name="email" type="email" placeholder="alexander@company.com"
                value={form.email} onChange={handleChange} required autoComplete="email" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-xs font-bold tracking-widest uppercase text-white/50">Password</label>
              <input id="reg-password" name="password" type="password" placeholder="Min. 8 characters"
                value={form.password} onChange={handleChange} required minLength={8} autoComplete="new-password" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-role" className="text-xs font-bold tracking-widest uppercase text-white/50">Enterprise Access Role</label>
              <select id="reg-role" name="role" value={form.role} onChange={handleChange}
                className={`${inputClass} cursor-pointer`}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-[#0B132B]">{r.label} ({r.value})</option>
                ))}
              </select>
              <div className={`mt-1 px-4 py-3 rounded-lg text-sm border-l-2 ${selectedRole.admin ? 'bg-purple-500/10 border-[#E040FB] text-purple-200' : 'bg-[#4f9cf9]/10 border-[#4f9cf9] text-blue-200'}`}>
                <strong>{selectedRole.label} Role:</strong> {selectedRole.description}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full mt-2 py-3 px-6 bg-[#4f9cf9] hover:bg-[#2d7ef4] text-white font-semibold rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(79,156,249,0.35)] disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Creating Account...' : 'Register Enterprise Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4f9cf9] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
