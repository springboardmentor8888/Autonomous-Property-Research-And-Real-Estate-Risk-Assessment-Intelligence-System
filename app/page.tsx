"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    // Login successful
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT - LOGIN FORM */}
        <div className="p-8 md:p-10 flex flex-col justify-center">

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-gray-500">
              Login to your Real Estate Due Diligence Agent
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-8"
          >

            {/* Email */}
            <div>
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
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full mt-7 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition"
            >
              Login
            </button>

          </form>

          {/* Register */}
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}

            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Create Account
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