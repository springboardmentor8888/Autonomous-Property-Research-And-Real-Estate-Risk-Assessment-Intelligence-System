'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authApi } from '@/lib/api';
import { setSession, clearSession } from '@/lib/session';
import { toastError } from '@/lib/useToast';

const ROLE_OPTIONS = [
  { value: 'BUYER', label: 'Buyer' },
  { value: 'REAL_ESTATE_AGENT', label: 'Real Estate Agent' },
  { value: 'LEGAL_REVIEWER', label: 'Legal Reviewer' },
  { value: 'FINANCIAL_INSTITUTION', label: 'Financial Institution' },
];

// Mirror of the backend RegisterRequest constraints (email format,
// password >= 8 chars) plus form-level checks.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldName = 'name' | 'email' | 'password' | 'confirmPassword' | 'role';
type Errors = Partial<Record<FieldName, string>>;

interface Values {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

function validate(v: Values): Errors {
  const errors: Errors = {};

  if (!v.name.trim()) {
    errors.name = 'Full name is required.';
  } else if (v.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (v.name.trim().length > 60) {
    errors.name = 'Name must be 60 characters or fewer.';
  }

  if (!v.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(v.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!v.password) {
    errors.password = 'Password is required.';
  } else if (v.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!v.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (v.password !== v.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!ROLE_OPTIONS.some((o) => o.value === v.role)) {
    errors.role = 'Please select a valid role.';
  }

  return errors;
}

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('BUYER');
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [attempted, setAttempted] = useState(false);

  const errors = validate({ name, email, password, confirmPassword, role });
  const showError = (field: FieldName) =>
    (touched[field] || attempted) && errors[field] ? errors[field] : undefined;

  const markTouched = (field: FieldName) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setAttempted(true);
    if (Object.keys(errors).length > 0) {
      toastError('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    try {
      // Clear any expired session before registration attempt
      clearSession();

      const res = await authApi.register({ email: email.trim(), password, name: name.trim(), role });
      setSession(res.token, res.email, res.role);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toastError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm grid md:grid-cols-2">

        {/* LEFT - REGISTER FORM */}
        <div className="flex flex-col justify-center p-8 md:p-12">

          <div className="mb-8">
            <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              R
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Get started with property due diligence
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="label-base">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => markTouched('name')}
                placeholder="Jane Doe"
                aria-invalid={!!showError('name')}
                className={`input-base ${showError('name') ? 'border-red-400' : ''}`}
                disabled={loading}
              />
              {showError('name') && (
                <p className="mt-1 text-xs text-red-600">{showError('name')}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label-base">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched('email')}
                placeholder="you@company.com"
                aria-invalid={!!showError('email')}
                className={`input-base ${showError('email') ? 'border-red-400' : ''}`}
                disabled={loading}
              />
              {showError('email') && (
                <p className="mt-1 text-xs text-red-600">{showError('email')}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="label-base">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onBlur={() => markTouched('role')}
                className="input-base"
                disabled={loading}
                required
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Administrator role cannot be self-registered. Contact system admin for admin access.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="label-base">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => markTouched('password')}
                  placeholder="Min. 8 characters"
                  aria-invalid={!!showError('password')}
                  className={`input-base ${showError('password') ? 'border-red-400' : ''}`}
                  disabled={loading}
                />
                {showError('password') && (
                  <p className="mt-1 text-xs text-red-600">{showError('password')}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirm" className="label-base">Confirm</label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => markTouched('confirmPassword')}
                  placeholder="Repeat password"
                  aria-invalid={!!showError('confirmPassword')}
                  className={`input-base ${showError('confirmPassword') ? 'border-red-400' : ''}`}
                  disabled={loading}
                />
                {showError('confirmPassword') && (
                  <p className="mt-1 text-xs text-red-600">{showError('confirmPassword')}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* RIGHT - IMAGE PANEL */}
        <div className="relative hidden md:block">
          <img
            src="/real-estate.jpg"
            alt="Real estate property"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/60 to-slate-900/40" />
          <div className="relative flex h-full flex-col justify-end p-12 text-white">
            <span className="pill bg-white/10 text-white">Get Started</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Smarter property due diligence
            </h2>
            <p className="mt-2 max-w-sm text-sm text-white/80">
              Validate addresses, surface risk, and generate comprehensive reports — all in one place.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
