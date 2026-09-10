'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authApi } from '@/lib/api';
import { setSession, clearSession } from '@/lib/session';
import { toastError } from '@/lib/useToast';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toastError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      // Clear any expired session before login attempt
      clearSession();
      
      const res = await authApi.login(email, password);
      setSession(res.token, res.email, res.role);
      
      // Redirect based on role
      if (res.role === 'ADMINISTRATOR') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      toastError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm grid md:grid-cols-2">

        {/* LEFT - LOGIN FORM */}
        <div className="flex flex-col justify-center p-8 md:p-12">

          <div className="mb-8">
            <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              R
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to your due diligence workspace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
              <label htmlFor="password" className="label-base">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              Create one
            </button>
          </p>
          
          <p className="mt-4 text-center text-sm text-slate-600">
            Administrator?{' '}
            <button
              type="button"
              onClick={() => router.push('/admin/login')}
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              Admin Login
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
            <span className="pill bg-white/10 text-white">Property Research</span>
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