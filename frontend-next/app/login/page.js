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
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed (${res.status})`
    )
  }

  return data
}

export default function LoginPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    if (!form.email.trim()) {
      setError('Work email is required.')
      return
    }

    if (!form.password) {
      setError('Password is required.')
      return
    }

    setLoading(true)

    try {
      const data = await post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      })


      localStorage.setItem('token', data.token)

      const userData = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      }

      localStorage.setItem(
        'user',
        JSON.stringify(userData)
      )


      window.dispatchEvent(
        new Event('auth-change')
      )

      router.push('/dashboard')

    } catch (err) {
      setError(
        err.message ||
        'Invalid enterprise credentials. Please check your details.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (

    <main className="min-h-screen bg-[#0a0e16] flex items-center justify-center px-4 py-20"> <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col gap-8 px-8">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9]">Enterprise Security Node</p>
        <h2 className="text-4xl font-light leading-tight text-white">Autonomous Property<br /><span className="font-semibold">Risk Assessment</span>{' '}Platform</h2>
        <p className="text-white/60 leading-relaxed">Log in to access real-time title deed audits, environmental hazard analysis, and GIS parcel verification.</p>

        <div className="grid gap-4">
          {[{ icon: '✓', value: '99.8%', label: 'Risk Audit Accuracy', color: 'text-[#4f9cf9]' }, { icon: '⚡', value: 'Instant', label: 'Automated Public Registry Checks', color: 'text-[#00E5FF]' }, { icon: '🛡', value: '50-State', label: 'Legal Compliance Auditing', color: 'text-[#E040FB]' }].map((m) => (
            <div key={m.label} className="flex items-center gap-4 bg-white/[0.04] border border-white/10 rounded-xl p-4">
              <span className={`text-2xl font-bold ${m.color}`}>{m.value}</span>
              <span className="text-sm text-white/50">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="bg-[rgba(11,19,43,0.65)] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4f9cf9] mb-2">Secure Authentication</p>
        <h1 className="text-2xl font-semibold text-white mb-1">Sign In to Platform</h1>
        <p className="text-white/50 text-sm mb-6">Enter your enterprise credentials below</p>

        {error && <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm"><span>⚠</span>{error}</div>}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-xs font-bold tracking-widest uppercase text-white/50">Work Email Address</label>
            <input id="login-email" name="email" type="email" placeholder="name@company.com" value={form.email} onChange={handleChange} required autoComplete="email" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-[#4f9cf9] focus:ring-2 focus:ring-[#4f9cf9]/20 transition-all" />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-xs font-bold tracking-widest uppercase text-white/50">Enterprise Password</label>
            <input id="login-password" name="password" type="password" placeholder="••••••••••••" value={form.password} onChange={handleChange} required autoComplete="current-password" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-[#4f9cf9] focus:ring-2 focus:ring-[#4f9cf9]/20 transition-all" />
          </div>

          {/* Login Button */}
          <button type="submit" disabled={loading} className="w-full mt-2 py-3 px-6 bg-[#4f9cf9] hover:bg-[#2d7ef4] text-white font-semibold rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(79,156,249,0.35)] disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">Need an enterprise account? <Link href="/register" className="text-[#4f9cf9] hover:underline">Register Enterprise Account</Link></p>
      </div>

    </div>

    </main>
  )
}