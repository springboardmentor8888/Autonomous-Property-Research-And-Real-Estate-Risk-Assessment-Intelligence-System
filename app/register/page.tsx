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

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('BUYER');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toastError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      toastError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toastError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // Clear any expired session before registration attempt
      clearSession();
      
      const res = await authApi.register({ email, password, name, role });
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="label-base">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="input-base"
                disabled={loading}
              />
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
                placeholder="you@company.com"
                className="input-base"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="role" className="label-base">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-base"
                  disabled={loading}
                />
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
                  placeholder="Repeat password"
                  className="input-base"
                  disabled={loading}
                />
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
