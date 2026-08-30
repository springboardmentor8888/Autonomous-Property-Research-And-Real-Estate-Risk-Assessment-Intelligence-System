import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Brain,
  Save,
} from "lucide-react";

function Settings() {
  const [name, setName] = useState("REDDA User");
  const [email, setEmail] = useState("user@redda.com");

  const [notifications, setNotifications] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(true);

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center">
            <SettingsIcon
              size={24}
              className="text-gray-600"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Settings
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your REDDA account and application preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <User
              size={21}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Profile
            </h2>

            <p className="text-sm text-gray-500">
              Manage your account information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <Bell
              size={21}
              className="text-orange-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Notifications
            </h2>

            <p className="text-sm text-gray-500">
              Control property and risk alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border rounded-lg p-4">

          <div>
            <h3 className="font-medium text-gray-800">
              Risk Alerts
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Receive notifications when high-risk properties are detected.
            </p>
          </div>

          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative w-12 h-6 rounded-full transition ${
              notifications
                ? "bg-green-600"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                notifications
                  ? "left-7"
                  : "left-1"
              }`}
            />
          </button>

        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Brain
              size={21}
              className="text-green-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              AI Preferences
            </h2>

            <p className="text-sm text-gray-500">
              Configure REDDA AI analysis behaviour.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border rounded-lg p-4">

          <div>
            <h3 className="font-medium text-gray-800">
              AI Property Analysis
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Enable automated AI analysis for property research.
            </p>
          </div>

          <button
            onClick={() => setAiAnalysis(!aiAnalysis)}
            className={`relative w-12 h-6 rounded-full transition ${
              aiAnalysis
                ? "bg-green-600"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                aiAnalysis
                  ? "left-7"
                  : "left-1"
              }`}
            />
          </button>

        </div>
      </div>

      {/* Security */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Shield
              size={21}
              className="text-purple-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Security
            </h2>

            <p className="text-sm text-gray-500">
              Manage account security.
            </p>
          </div>

        </div>

        <button className="border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-lg text-sm font-medium text-gray-700">
          Change Password
        </button>

      </div>

      {/* Save Button */}
      <div className="flex justify-end">

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          <Save size={18} />
          Save Settings
        </button>

      </div>

    </div>
  );
}

export default Settings;