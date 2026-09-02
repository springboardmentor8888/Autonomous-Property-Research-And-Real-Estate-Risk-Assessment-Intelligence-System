import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/20">
            <ShieldCheck
              size={34}
              className="text-white"
            />
          </div>

          <h1 className="text-3xl font-bold text-white mt-4">
            REDDA
          </h1>

          <p className="text-slate-400 mt-1">
            Real Estate Due Diligence Agent
          </p>
        </div>

        <div className="bg-[#fff1eb] rounded-2xl shadow-2xl p-8">

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
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

              <div className="flex items-center gap-3 border border-slate-700 rounded-lg px-4 py-3 bg-transparent focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                <Mail
                  size={19}
                  className="text-slate-400"
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
                  onClick={() =>
                    alert("Password reset will be available soon.")
                  }
                  className="text-sm text-green-600 hover:text-green-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="flex items-center gap-3 border border-slate-700 rounded-lg px-4 py-3 bg-transparent focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                <Lock
                  size={19}
                  className="text-slate-400"
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
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-green-600"
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
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition duration-200"
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

        <p className="text-center text-xs text-slate-500 mt-6">
          AI-powered property intelligence for smarter decisions.
        </p>

      </div>
    </div>
  );
}

export default Login;