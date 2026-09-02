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
              Create your account
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Start researching properties with REDDA.
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Full Name
              </label>

              <div className="flex items-center gap-3 border border-slate-700 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                <User
                  size={19}
                  className="text-slate-400"
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

              <div className="flex items-center gap-3 border border-slate-700 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
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
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Password
              </label>

              <div className="flex items-center gap-3 border border-slate-700 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                <Lock
                  size={19}
                  className="text-slate-400"
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

              <p className="text-xs text-slate-500 mt-2">
                Password must contain at least 6 characters.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Confirm Password
              </label>

              <div className="flex items-center gap-3 border border-slate-700 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                <Lock
                  size={19}
                  className="text-slate-400"
                />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="outline-none w-full bg-transparent text-slate-800 placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition duration-200"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <div className="text-center mt-7 pt-6 border-t border-slate-300">
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

        <p className="text-center text-xs text-slate-500 mt-6">
          AI-powered property intelligence for smarter decisions.
        </p>

      </div>
    </div>
  );
}

export default Register;