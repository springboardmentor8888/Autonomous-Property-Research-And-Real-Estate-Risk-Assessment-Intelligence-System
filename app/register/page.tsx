"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!password || !confirmPassword) {
      alert("Please enter your password");
      return;
    }

    // For Milestone 1: go to dashboard after registration
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-2">

        {/* LEFT - IMAGE */}
        <div className="hidden md:block">
          <img
            src="/real-estate.jpg"
            alt="Real Estate Property"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT - REGISTER FORM */}
        <div className="p-8">

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Create Account
            </h1>

            <p className="mt-2 text-gray-500">
              Register for the Real Estate Due Diligence Agent
            </p>
          </div>

          <form
            className="mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {/* Email */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                required
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
                placeholder="Create a password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {/* Confirm Password */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {/* Role */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>

              <select
                required
                defaultValue=""
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="" disabled>
                  Select your role
                </option>

                <option value="buyer">Buyer</option>
                <option value="agent">Real Estate Agent</option>
                <option value="legal-reviewer">Legal Reviewer</option>
                <option value="financial-institution">
                  Financial Institution
                </option>
                <option value="administrator">
                  Administrator
                </option>
              </select>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full mt-7 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800"
            >
              Register
            </button>

          </form>

          {/* Login */}
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </button>
          </p>

        </div>
      </div>
    </main>
  );
}