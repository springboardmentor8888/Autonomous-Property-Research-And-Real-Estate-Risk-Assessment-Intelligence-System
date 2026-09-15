import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      alert("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      alert("Please enter your email address.");
      return;
    }

    if (!password) {
      alert("Please create a password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      alert("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("reddaLoggedIn", "true");
      localStorage.setItem("reddaUserName", trimmedName);
      localStorage.setItem("reddaUserEmail", trimmedEmail);

      navigate("/dashboard", { replace: true });

      setLoading(false);
    }, 600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-8">

      <style>
        {`
          @keyframes backgroundMove {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.06);
            }
            100% {
              transform: scale(1);
            }
          }

          .register-background {
            animation: backgroundMove 18s ease-in-out infinite;
          }
        `}
      </style>

      <div
        className="register-background absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/login-bg.png')",
        }}
      />

      <div className="absolute inset-0 bg-slate-950/35" />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/65" />

      <div className="relative z-10 w-full max-w-xl">

        <div className="text-center mb-6">

          <div className="mx-auto w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center shadow-2xl shadow-green-600/40">

            <ShieldCheck
              size={35}
              strokeWidth={2.5}
              className="text-white"
            />

          </div>

          <h1 className="text-4xl font-bold text-white mt-3 tracking-tight drop-shadow-lg">
            REDDA
          </h1>

          <p className="text-white/90 mt-1 text-base drop-shadow-md">
            Real Estate Due Diligence Agent
          </p>

        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-2xl shadow-2xl px-8 py-8 md:px-10">

          <div className="mb-6">

            <h2 className="text-3xl font-bold text-slate-900">
              Create your account
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Start researching properties with REDDA.
            </p>

          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >

            <div>

              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Full Name
              </label>

              <div className="flex items-center gap-3 border border-slate-400 rounded-xl px-4 py-3.5 bg-white/40 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition">

                <User
                  size={20}
                  className="text-slate-400 flex-shrink-0"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="outline-none w-full bg-transparent text-slate-800 placeholder:text-slate-400"
                />

              </div>

            </div>

            <div>

              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Email Address
              </label>

              <div className="flex items-center gap-3 border border-slate-400 rounded-xl px-4 py-3.5 bg-white/40 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition">

                <Mail
                  size={20}
                  className="text-slate-400 flex-shrink-0"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="outline-none w-full bg-transparent text-slate-800 placeholder:text-slate-400"
                />

              </div>

            </div>

            <div>

              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Password
              </label>

              <div className="flex items-center gap-3 border border-slate-400 rounded-xl px-4 py-3.5 bg-white/40 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition">

                <Lock
                  size={20}
                  className="text-slate-400 flex-shrink-0"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="outline-none w-full bg-transparent text-slate-800 placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

              <p className="text-xs text-slate-500 mt-1.5">
                Password must contain at least 6 characters.
              </p>

            </div>

            <div>

              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Confirm Password
              </label>

              <div className="flex items-center gap-3 border border-slate-400 rounded-xl px-4 py-3.5 bg-white/40 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition">

                <Lock
                  size={20}
                  className="text-slate-400 flex-shrink-0"
                />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="outline-none w-full bg-transparent text-slate-800 placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3.5 rounded-xl font-semibold transition duration-200 shadow-lg shadow-green-600/25 mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <div className="text-center mt-6 pt-5 border-t border-slate-300">

            <p className="text-sm text-slate-500">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="inline-block mt-1 text-green-600 font-semibold hover:text-green-700 hover:underline"
            >
              Sign in
            </Link>

          </div>

        </div>

        <p className="text-center text-xs text-white/80 mt-5 drop-shadow-md">
          AI-powered property intelligence for smarter decisions.
        </p>

      </div>

    </div>
  );
}

export default Register;