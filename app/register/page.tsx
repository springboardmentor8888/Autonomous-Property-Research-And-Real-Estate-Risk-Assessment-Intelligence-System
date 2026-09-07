'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authApi } from '@/lib/api';
import { setSession } from '@/lib/session';
import { toastError, toastSuccess } from '@/lib/useToast';

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      const res = await authApi.register({ email, password, name });
      setSession(res.token, res.email);
      toastSuccess('Registration successful!');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toastError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT - REGISTER FORM */}
        <div className="p-8 md:p-10 flex flex-col justify-center">

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Create Account
            </h1>

            <p className="mt-2 text-gray-500">
              Join Real Estate Due Diligence Agent
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            className="mt-8"
          >

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 chars)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
                disabled={loading}
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-7 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}

            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </button>
          </p>

        </div>

        {/* RIGHT - IMAGE */}
        <div className="relative hidden md:block min-h-[550px]">

          <img
            src="/real-estate.jpg"
            alt="Real Estate Property"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8">

            <div className="text-white text-center">

              <h2 className="text-4xl font-bold">
                Real Estate
              </h2>

              <p className="mt-4 text-lg">
                Secure and smarter property due diligence
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
