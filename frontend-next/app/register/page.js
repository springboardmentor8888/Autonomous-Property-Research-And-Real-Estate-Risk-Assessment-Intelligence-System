'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BASE_URL = '/api'

const ROLES = [
  {
    value: 'BUYER',
    label: 'Buyer',
    description:
      'Access property pre-screenings, title risk summaries, and buyer due-diligence reports.',
  },
  {
    value: 'REAL_ESTATE_AGENT',
    label: 'Real Estate Agent',
    description:
      'Manage property listings with automated compliance verification and risk disclosures.',
  },
  {
    value: 'LEGAL_REVIEWER',
    label: 'Legal Reviewer',
    description:
      'Perform deed title chain audits, encumbrance reviews, and legal risk scoring.',
  },
  {
    value: 'FINANCIAL_INSTITUTION',
    label: 'Financial Institution',
    description:
      'Access institutional property valuation, loan risk scoring, and mortgage pre-check tools.',
  },
]

const PASSWORD_RULES = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    label: 'One uppercase letter (A–Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'One lowercase letter (a–z)',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'One number (0–9)',
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: 'One special character (#, @, $, !)',
    test: (password) => /[#@$!]/.test(password),
  },
]

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

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER',
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const selectedRole =
    ROLES.find((role) => role.value === form.role) || ROLES[0]

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    valid: rule.test(form.password),
  }))

  const passwordIsValid = passwordChecks.every((rule) => rule.valid)

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({ ...previous, [name]: value }))

    setFieldErrors((previous) => ({
      ...previous,
      [name]: '',
      [name.toLowerCase()]: '',
    }))

    setError('')
    setSuccess('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setFieldErrors({})
    setSuccess('')

    const validationErrors = {}

    if (!passwordIsValid) {
      validationErrors.password =
        'Please meet all password requirements before continuing.'
    }

    if (form.password !== form.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match.'
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      const data = await post('/auth/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
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

      setSuccess(
        'Enterprise account created successfully! Redirecting to dashboard...'
      )

      setTimeout(() => {
        router.push('/dashboard')
      }, 1200)
    } catch (requestError) {
      const parsed = splitValidationMessage(
        requestError.message || 'Registration failed. Please try again.'
      )

      setFieldErrors(parsed.fields)
      setError(parsed.general)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-full border border-white/20 bg-[#3b343b]/85 px-5 py-3 text-sm text-white outline-none placeholder:text-white/65 transition focus:border-white/50 focus:ring-2 focus:ring-white/20'

  const labelClass = 'text-sm font-medium text-white/85'

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 pb-10 pt-28 text-white">      <style>{`
        .register-glass-input,
        .register-glass-input:-webkit-autofill,
        .register-glass-input:-webkit-autofill:hover,
        .register-glass-input:-webkit-autofill:focus,
        .register-glass-input:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff;
          transition: background-color 999999s ease-in-out 0s;
          box-shadow: 0 0 0 1000px rgba(59, 52, 59, 0.96) inset !important;
        }

        .register-glass-select option {
          color: #ffffff;
          background: #211a27;
        }
      `}</style>

      {/* Purple and magenta light loops */}
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

      {/* Yellow and lime light loops */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-310px] right-[-350px] h-[470px] w-[1000px] rotate-[14deg] rounded-[50%] border-[28px] border-yellow-400/80 blur-[12px] sm:bottom-[-300px] sm:right-[-320px] sm:h-[560px] sm:w-[1180px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-300px] right-[-345px] h-[450px] w-[990px] rotate-[14deg] rounded-[50%] border-[10px] border-lime-300/90 blur-[4px] sm:bottom-[-290px] sm:right-[-315px] sm:h-[540px] sm:w-[1170px]"
      />

      {/* Magenta glow behind the glass */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[34%] top-[43%] h-[330px] w-[440px] rounded-full bg-fuchsia-600/25 blur-[120px]"
      />

      {/* Smaller glass registration card */}
      <section className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-2xl border border-white/30 bg-white/[0.16] shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:grid-cols-[0.85fr_3px_1.15fr]">
        {/* Intro panel */}
        <div className="hidden flex-col justify-between p-7 lg:flex">
          <Link
            href="/"
            className="w-fit text-xl font-extrabold tracking-tight text-white"
          >
            PropDue
          </Link>

          <div className="my-6">
            <p className="text-xl font-light leading-tight text-white">
              Welcome to
            </p>
            <h1 className="text-2xl font-bold leading-tight text-white">
              Property Due Diligence
            </h1>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/85">
              Create an account to access property research, risk assessments,
              and due diligence reports.
            </p>
          </div>

          <p className="text-[11px] text-white/80">propdue.com</p>
        </div>

        <div className="hidden bg-white/90 lg:my-7 lg:block" />

        {/* Registration form */}
        <div className="p-5 sm:p-7 lg:p-8">
          <div className="mb-5 text-center">
            <Link
              href="/"
              className="mb-3 inline-block text-xl font-extrabold tracking-tight text-white lg:hidden"
            >
              PropDue
            </Link>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Enterprise onboarding
            </p>
            <h2 className="mt-1.5 text-xl font-semibold text-white">
              Create account
            </h2>
            <p className="mt-1.5 text-xs text-white/70">
              Join PropDue for property research
            </p>
          </div>

          {success && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100"
            >
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-fullName" className={labelClass}>
                Full name
              </label>
              <input
                id="reg-fullName"
                name="fullName"
                type="text"
                placeholder="e.g. Abhimanyu Kumar Ray"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                required
                aria-invalid={Boolean(
                  getFieldError(fieldErrors, 'fullName') ||
                  getFieldError(fieldErrors, 'name')
                )}
                className={`register-glass-input ${inputClass}`}
              />
              {(getFieldError(fieldErrors, 'fullName') ||
                getFieldError(fieldErrors, 'name')) && (
                  <p className="text-xs text-red-200">
                    {getFieldError(fieldErrors, 'fullName') ||
                      getFieldError(fieldErrors, 'name')}
                  </p>
                )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="reg-email" className={labelClass}>
                Work email address
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                aria-invalid={Boolean(getFieldError(fieldErrors, 'email'))}
                className={`register-glass-input ${inputClass}`}
              />
              {getFieldError(fieldErrors, 'email') && (
                <p className="text-xs text-red-200">
                  {getFieldError(fieldErrors, 'email')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="reg-password" className={labelClass}>
                Password
              </label>

              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Choose a strong password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(
                    getFieldError(fieldErrors, 'password')
                  )}
                  aria-describedby={
                    form.password ? 'password-requirements' : undefined
                  }
                  className={`register-glass-input ${inputClass} pr-20`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute inset-y-0 right-4 text-xs font-semibold text-white/80 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {form.password.length > 0 && (
                <div
                  id="password-requirements"
                  className="mt-1.5 rounded-xl border border-white/20 bg-black/20 p-3 backdrop-blur-md"
                >
                  <p className="mb-2 text-xs font-semibold text-white">
                    Password must contain:
                  </p>

                  <ul className="flex flex-col gap-1.5">
                    {passwordChecks.map((rule) => (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-2 text-xs ${rule.valid ? 'text-emerald-200' : 'text-white/75'
                          }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${rule.valid
                            ? 'border-emerald-300 bg-emerald-400/20'
                            : 'border-white/40'
                            }`}
                          aria-hidden="true"
                        >
                          {rule.valid ? '✓' : ''}
                        </span>
                        {rule.label}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2 text-xs text-white/60">
                    Example: Vamsi@123
                  </p>
                </div>
              )}

              {getFieldError(fieldErrors, 'password') && (
                <p className="text-xs text-red-200">
                  {getFieldError(fieldErrors, 'password')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="reg-confirmPassword" className={labelClass}>
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="reg-confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(
                    getFieldError(fieldErrors, 'confirmPassword')
                  )}
                  className={`register-glass-input ${inputClass} pr-20`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  className="absolute inset-y-0 right-4 text-xs font-semibold text-white/80 hover:text-white"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {form.confirmPassword && (
                <p
                  className={`text-xs ${passwordsMatch ? 'text-emerald-200' : 'text-red-200'
                    }`}
                >
                  {passwordsMatch
                    ? 'Passwords match.'
                    : 'Passwords do not match.'}
                </p>
              )}

              {getFieldError(fieldErrors, 'confirmPassword') && (
                <p className="text-xs text-red-200">
                  {getFieldError(fieldErrors, 'confirmPassword')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="reg-role" className={labelClass}>
                Enterprise access role
              </label>

              <select
                id="reg-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className={`register-glass-select ${inputClass} cursor-pointer`}
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <div className="mt-1 rounded-xl border border-white/20 bg-white/[0.08] px-4 py-2.5 text-xs leading-relaxed text-white/85">
                <strong>{selectedRole.label}:</strong>{' '}
                {selectedRole.description}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-full border border-white/25 bg-white/[0.25] px-6 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/[0.35] hover:shadow-[0_0_25px_rgba(255,255,255,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Register account'}
            </button>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-3 text-sm text-red-100"
              >
                <span aria-hidden="true">⚠</span>
                <p>{error}</p>
              </div>
            )}
          </form>

          <p className="mt-5 text-center text-sm text-white/75">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}