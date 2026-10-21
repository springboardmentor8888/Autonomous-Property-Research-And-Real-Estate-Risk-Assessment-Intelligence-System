'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BASE_URL = '/api'

function splitValidationMessage(message) {
  const fields = {}
  const generalMessages = []

  for (const part of String(message || '').split(/;\s*/)) {
    const separator = part.indexOf(':')

    if (separator > 0) {
      const field = part.slice(0, separator).trim().toLowerCase()
      const fieldMessage = part.slice(separator + 1).trim()

      if (fieldMessage) {
        fields[field] = fieldMessage
        continue
      }
    }

    if (part.trim()) generalMessages.push(part.trim())
  }

  return { fields, general: generalMessages.join('; ') }
}

async function post(endpoint, body) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      data?.detail ||
      `Request failed (${response.status})`

    throw new Error(message)
  }

  return data
}

function getFieldError(errors, field) {
  return errors[field] || errors[field.toLowerCase()] || ''
}

export default function LoginPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({ ...previous, [name]: value }))
    setFieldErrors((previous) => ({
      ...previous,
      [name]: '',
      [name.toLowerCase()]: '',
    }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})
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

      localStorage.setItem('user', JSON.stringify(userData))
      window.dispatchEvent(new Event('auth-change'))

      const role = String(data.role || '')
        .replace(/^ROLE_/, '')
        .toUpperCase()

      router.push(role === 'ADMINISTRATOR' ? '/admin/dashboard' : '/dashboard')
    } catch (requestError) {
      const parsed = splitValidationMessage(
        requestError.message || 'Sign in failed. Please check your details.'
      )
      setFieldErrors(parsed.fields)
      setError(parsed.general)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'login-glass-input w-full rounded-full border border-white/20 bg-[#3b343b]/85 px-5 py-3 text-sm text-white outline-none placeholder:text-white/70 focus:border-white/50 focus:ring-2 focus:ring-white/20'

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 py-16 text-white">
      <style>{`
        .login-glass-input,
        .login-glass-input:-webkit-autofill,
        .login-glass-input:-webkit-autofill:hover,
        .login-glass-input:-webkit-autofill:focus,
        .login-glass-input:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff;
          transition: background-color 999999s ease-in-out 0s;
          box-shadow: 0 0 0 1000px rgba(59, 52, 59, 0.96) inset !important;
        }
      `}</style>

      {/* Purple and magenta concentric loops at the upper left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-210px] top-[-300px] h-[620px] w-[850px] rounded-[50%] border-[30px] border-fuchsia-600/70 blur-[13px] sm:left-[-170px] sm:top-[-330px] sm:h-[780px] sm:w-[1050px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-205px] top-[-295px] h-[610px] w-[840px] rounded-[50%] border-[12px] border-violet-500/90 blur-[4px] sm:left-[-165px] sm:top-[-325px] sm:h-[770px] sm:w-[1040px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-190px] top-[-280px] h-[580px] w-[810px] rounded-[50%] border border-pink-400/50 blur-[1px] sm:left-[-150px] sm:top-[-310px] sm:h-[740px] sm:w-[1010px]"
      />

      {/* Yellow and lime loops sweeping across the lower right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-310px] right-[-350px] h-[470px] w-[1000px] rotate-[14deg] rounded-[50%] border-[28px] border-yellow-400/80 blur-[12px] sm:bottom-[-300px] sm:right-[-320px] sm:h-[560px] sm:w-[1180px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-300px] right-[-345px] h-[450px] w-[990px] rotate-[14deg] rounded-[50%] border-[10px] border-lime-300/90 blur-[4px] sm:bottom-[-290px] sm:right-[-315px] sm:h-[540px] sm:w-[1170px]"
      />

      {/* Soft magenta light behind the glass */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[34%] top-[43%] h-[330px] w-[440px] rounded-full bg-fuchsia-600/25 blur-[120px]"
      />

      {/* Enlarged glass login card */}
      <section className="relative z-10 grid w-full max-w-[1100px] overflow-hidden rounded-2xl border border-white/30 bg-white/[0.16] shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:grid-cols-[1.15fr_3px_0.85fr]">
        {/* Intro panel */}
        <div className="flex min-h-[375px] flex-col justify-between p-9 sm:p-12">
          <Link
            href="/"
            className="w-fit text-2xl font-extrabold tracking-tight text-white"
          >
            PropDue
          </Link>

          <div className="my-8">
            <p className="text-2xl font-light leading-tight text-white">
              Property
            </p>
            <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
              Due Diligence
            </h1>

            <p className="mt-4 max-w-sm text-xs leading-[1.45] text-white/90">
              Research properties, review risk assessments, and access due
              diligence reports in one secure workspace.
            </p>
          </div>

          <p className="text-[11px] text-white/85">propdue.com</p>
        </div>

        {/* Vertical divider on desktop */}
        <div className="mx-9 h-px bg-white/95 md:my-9 md:mx-0 md:h-auto md:w-[3px] md:rounded-full" />

        {/* Login form */}
        <div className="flex flex-col justify-center px-9 py-9 sm:px-12 md:px-10">
          <h2 className="mb-6 text-center text-lg font-medium text-white">
            Login
          </h2>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="sr-only">
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                aria-invalid={Boolean(getFieldError(fieldErrors, 'email'))}
                aria-describedby={
                  getFieldError(fieldErrors, 'email')
                    ? 'login-email-error'
                    : undefined
                }
                className={inputClass}
              />
              {getFieldError(fieldErrors, 'email') && (
                <p
                  id="login-email-error"
                  className="px-3 pt-1 text-xs text-red-200"
                >
                  {getFieldError(fieldErrors, 'email')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                aria-invalid={Boolean(getFieldError(fieldErrors, 'password'))}
                aria-describedby={
                  getFieldError(fieldErrors, 'password')
                    ? 'login-password-error'
                    : undefined
                }
                className={inputClass}
              />
              {getFieldError(fieldErrors, 'password') && (
                <p
                  id="login-password-error"
                  className="px-3 pt-1 text-xs text-red-200"
                >
                  {getFieldError(fieldErrors, 'password')}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mx-auto mt-1 rounded-full border border-white/25 bg-white/[0.28] px-8 py-2 text-sm font-medium text-white shadow-md backdrop-blur-md transition hover:bg-white/[0.38] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-300/40 bg-red-900/40 px-4 py-3 text-sm text-red-100 backdrop-blur-md"
              >
                {error}
              </div>
            )}
          </form>

          <p className="mt-5 text-center text-xs text-white/85">
            Need an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-white underline decoration-white/60 underline-offset-2 hover:decoration-white"
            >
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}