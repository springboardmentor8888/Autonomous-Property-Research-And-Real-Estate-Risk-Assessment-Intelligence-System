import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("reddaLoggedIn");

    if (loggedIn === "true") {
      navigate("/dashboard", { replace: true });
    }

    const savedEmail = localStorage.getItem("reddaRememberedEmail");

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      alert("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      alert("Please enter your password.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("reddaLoggedIn", "true");
      localStorage.setItem("reddaUserEmail", trimmedEmail);

      if (rememberMe) {
        localStorage.setItem("reddaRememberedEmail", trimmedEmail);
      } else {
        localStorage.removeItem("reddaRememberedEmail");
      }

      navigate("/dashboard", { replace: true });
      setLoading(false);
    }, 600);
  };

  const openForgotPassword = () => {
    setResetEmail(email);
    setResetSuccess(false);
    setResetError("");
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetSuccess(false);
    setResetError("");
    setResetLoading(false);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    const trimmedEmail = resetEmail.trim();

    if (!trimmedEmail) {
      setResetError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setResetError("Please enter a valid email address.");
      return;
    }

    setResetError("");
    setResetLoading(true);

    setTimeout(() => {
      setResetLoading(false);
      setResetSuccess(true);
    }, 1000);
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

          .login-background {
            animation: backgroundMove 18s ease-in-out infinite;
          }
        `}
      </style>

      <div
        className="login-background absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/login-bg.png')",
        }}
      />

      <div className="absolute inset-0 bg-slate-950/35" />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/65" />

      <div className="relative z-10 w-full max-w-xl">

        <div className="text-center mb-7">

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

          <div className="mb-7">

            <h2 className="text-3xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Sign in to continue your property research.
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

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

              <div className="flex items-center justify-between mb-2">

                <label className="text-sm font-semibold text-slate-800">
                  Password
                </label>

                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                >
                  Forgot password?
                </button>

              </div>

              <div className="flex items-center gap-3 border border-slate-400 rounded-xl px-4 py-3.5 bg-white/40 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition">

                <Lock
                  size={20}
                  className="text-slate-400 flex-shrink-0"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            </div>

            <div className="flex items-center gap-2">

              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
                className="w-4 h-4 accent-green-600 cursor-pointer"
              />

              <label
                htmlFor="remember"
                className="text-sm text-slate-600 cursor-pointer"
              >
                Remember me
              </label>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3.5 rounded-xl font-semibold transition duration-200 shadow-lg shadow-green-600/25"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>

          <div className="text-center mt-7 pt-6 border-t border-slate-300">

            <p className="text-sm text-slate-500">
              Don't have an account?
            </p>

            <Link
              to="/register"
              className="inline-block mt-1 text-green-600 font-semibold hover:text-green-700 hover:underline"
            >
              Create an account
            </Link>

          </div>

        </div>

        <p className="text-center text-xs text-white/80 mt-6 drop-shadow-md">
          AI-powered property intelligence for smarter decisions.
        </p>

      </div>

      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeForgotPassword}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-7">

            <button
              type="button"
              onClick={closeForgotPassword}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X size={20} />
            </button>

            {!resetSuccess ? (
              <>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 mb-5">
                  <Lock
                    size={26}
                    className="text-green-600"
                  />
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Forgot Password?
                </h2>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Enter your registered email address and we'll
                  send you instructions to reset your password.
                </p>

                <form
                  onSubmit={handleResetPassword}
                  className="mt-6"
                >

                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Email Address
                  </label>

                  <div className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-3.5 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition">

                    <Mail
                      size={20}
                      className="text-slate-400 flex-shrink-0"
                    />

                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetError("");
                      }}
                      placeholder="Enter your email"
                      autoFocus
                      className="outline-none w-full bg-transparent text-slate-800 placeholder:text-slate-400"
                    />

                  </div>

                  {resetError && (
                    <p className="text-sm text-red-500 mt-2">
                      {resetError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full mt-5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3.5 rounded-xl font-semibold transition shadow-lg shadow-green-600/20"
                  >
                    {resetLoading
                      ? "Sending..."
                      : "Send Reset Link"}
                  </button>

                </form>

                <button
                  type="button"
                  onClick={closeForgotPassword}
                  className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-green-600 transition"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </button>
              </>
            ) : (
              <div className="text-center py-5">

                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2
                    size={34}
                    className="text-green-600"
                  />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mt-5">
                  Check Your Email
                </h2>

                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  If an account exists for
                </p>

                <p className="font-semibold text-slate-800 mt-1 break-all">
                  {resetEmail}
                </p>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  you will receive instructions to reset your
                  password.
                </p>

                <button
                  type="button"
                  onClick={closeForgotPassword}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold transition"
                >
                  Back to Sign In
                </button>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default Login;