'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authApi } from '@/lib/api';
import { setSession } from '@/lib/session';
import { toastError } from '@/lib/useToast';

export default function AdminLogin() {
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
      const res = await authApi.login(email, password);
      
      // Verify the user has ADMINISTRATOR role
      if (res.role !== 'ADMINISTRATOR') {
        toastError('Access denied. Administrator privileges required.');
        return;
      }
      
      setSession(res.token, res.email, res.role);
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      toastError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
            A
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Administrator Login
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Secure access to system administration
          </p>
        </div>

        <div className="card p-8">
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
                placeholder="admin@propertyrisk.com"
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

          <p className="mt-6 text-center text-sm text-slate-600">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              Back to user login
            </button>
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Pre-configured admin accounts:</p>
          <p className="font-mono">admin1@propertyrisk.com</p>
          <p className="font-mono">admin2@propertyrisk.com</p>
          <p className="font-mono">Password: Admin@123</p>
        </div>
      </div>
    </main>
  );
}