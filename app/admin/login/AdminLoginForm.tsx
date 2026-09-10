'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authApi } from '@/lib/api';
import { setSession } from '@/lib/session';
import { toastError } from '@/lib/useToast';

export default function AdminLoginForm() {
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

      // Verify the user has ADMINISTRATOR role (backend RBAC is the
      // source of truth; this is only for immediate UX feedback).
      if (res.role !== 'ADMINISTRATOR') {
        toastError('Access denied. Administrator privileges required.');
        return;
      }

      setSession(res.token, res.email, res.role);
      router.replace('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      toastError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="admin-email" className="label-base">Email address</label>
          <input
            id="admin-email"
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
          <label htmlFor="admin-password" className="label-base">Password</label>
          <input
            id="admin-password"
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
    </div>
  );
}
