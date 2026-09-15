import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Brain,
  Save,
  Lock,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

function Settings() {
  const [name, setName] = useState(
    localStorage.getItem("reddaUserName") || "REDDA User"
  );

  const [email, setEmail] = useState(
    localStorage.getItem("reddaUserEmail") || "user@redda.com"
  );

  const [notifications, setNotifications] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("reddaUserName", name.trim());
    localStorage.setItem("reddaUserEmail", email.trim());

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleChangePassword = () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setPasswordSuccess("Password changed successfully.");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess("");
    }, 1500);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
  };

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/p2.png')",
      }}
    >
      <div className="relative z-10 w-full min-h-screen p-3 md:p-5">

        {/* Header */}
        <div className="mb-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <SettingsIcon
                  size={25}
                  className="text-gray-700"
                />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Settings
                </h1>

                <p className="mt-1 text-gray-600">
                  Manage your REDDA account and application preferences.
                </p>
              </div>
            </div>

            {/* Saved Status */}
            {saved && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-sm">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">
                  Settings saved successfully
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl">

          {/* Profile Settings */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 md:p-7 mb-6">

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                  <User
                    size={22}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile
                  </h2>

                  <p className="text-sm text-gray-500">
                    Manage your account information.
                  </p>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 md:p-7 mb-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                <Bell
                  size={22}
                  className="text-orange-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Notifications
                </h2>

                <p className="text-sm text-gray-500">
                  Control property and risk alerts.
                </p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border border-gray-200 rounded-xl p-5 bg-gray-50">

              <div className="flex gap-4">

                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Bell
                    size={19}
                    className="text-orange-600"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    Risk Alerts
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 max-w-xl">
                    Receive notifications when high-risk properties are
                    detected.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                aria-label="Toggle risk alerts"
                className={`relative w-14 h-7 rounded-full transition-all duration-300 shrink-0 ${
                  notifications
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                    notifications
                      ? "left-8"
                      : "left-1"
                  }`}
                />
              </button>

            </div>
          </div>

          {/* AI Settings */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 md:p-7 mb-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                <Brain
                  size={22}
                  className="text-green-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  AI Preferences
                </h2>

                <p className="text-sm text-gray-500">
                  Configure REDDA AI analysis behaviour.
                </p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border border-gray-200 rounded-xl p-5 bg-gray-50">

              <div className="flex gap-4">

                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Sparkles
                    size={19}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    AI Property Analysis
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 max-w-xl">
                    Enable automated AI analysis for property research.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setAiAnalysis(!aiAnalysis)}
                aria-label="Toggle AI property analysis"
                className={`relative w-14 h-7 rounded-full transition-all duration-300 shrink-0 ${
                  aiAnalysis
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                    aiAnalysis
                      ? "left-8"
                      : "left-1"
                  }`}
                />
              </button>

            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 md:p-7 mb-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                <Shield
                  size={22}
                  className="text-purple-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Security
                </h2>

                <p className="text-sm text-gray-500">
                  Manage account security.
                </p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border border-gray-200 rounded-xl p-5 bg-gray-50">

              <div className="flex gap-4">

                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Lock
                    size={19}
                    className="text-purple-600"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    Account Password
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Keep your REDDA account secure by updating your password.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="border border-gray-300 hover:bg-white hover:border-gray-400 px-5 py-3 rounded-xl text-sm font-semibold text-gray-700 transition flex items-center justify-center gap-2"
              >
                <Lock size={17} />
                Change Password
              </button>

            </div>
          </div>

          {/* Application Information */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 md:p-7 mb-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                <SettingsIcon
                  size={22}
                  className="text-gray-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Application
                </h2>

                <p className="text-sm text-gray-500">
                  REDDA application information.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Application
                </p>
                <p className="mt-1 font-semibold text-gray-800">
                  REDDA
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Module
                </p>
                <p className="mt-1 font-semibold text-gray-800">
                  Real Estate Intelligence
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  AI Engine
                </p>
                <p className="mt-1 font-semibold text-green-600">
                  Enabled
                </p>
              </div>

            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pb-6">

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-7 py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
            >
              <Save size={19} />
              Save Settings
            </button>

          </div>

        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closePasswordModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Lock
                    size={20}
                    className="text-purple-600"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Change Password
                  </h2>

                  <p className="text-xs text-gray-500">
                    Update your account password
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={19} className="text-gray-500" />
              </button>

            </div>

            {/* Modal Body */}
            <div className="p-6">

              {passwordError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  {passwordSuccess}
                </div>
              )}

              {/* Current Password */}
              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>

                <div className="relative">

                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>
              </div>

              {/* New Password */}
              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>

                <div className="relative">

                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(!showNewPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>

                <div className="relative">

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">

                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                >
                  Update Password
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;