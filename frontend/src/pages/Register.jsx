import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../utils/api';
import './Register.css';

/**
 * 5 SRS Specified Platform Roles & Feature Subtitles
 */
const SRS_ROLES = [
  {
    value: 'BUYER',
    label: 'Buyer',
    subtitle: 'Search property listings, access risk reports, & view legal title summaries.',
  },
  {
    value: 'REAL_ESTATE_AGENT',
    label: 'Real Estate Agent',
    subtitle: 'Manage property portfolio, generate buyer pre-screenings, & upload disclosure docs.',
  },
  {
    value: 'LEGAL_REVIEWER',
    label: 'Legal Reviewer',
    subtitle: 'Audit title deed chains, evaluate encumbrance flags, & issue legal clearance certificates.',
  },
  {
    value: 'FINANCIAL_INSTITUTION',
    label: 'Financial Institution',
    subtitle: 'Access institutional risk scoring, mortgage underwriting pre-checks, & valuation metrics.',
  },
  {
    value: 'ADMIN',
    label: 'Administrator',
    subtitle: 'Full system configuration, security audit logs, & user access management.',
  },
];

/**
 * Register Page Component
 * Light theme registration form supporting all 5 SRS Roles.
 */
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'BUYER',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRoleInfo = SRS_ROLES.find((r) => r.value === form.role) || SRS_ROLES[0];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.fullName.trim()) return setError('Full Name is required.');
    if (!form.email.trim()) return setError('Email address is required.');
    if (form.password.length < 8)
      return setError('Password must be at least 8 characters long.');

    setLoading(true);
    try {
      await post('/auth/register', form);
      setSuccess('Registration successful! Redirecting to sign in portal…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-container animate-fade-in-up">
        {/* Header */}
        <div className="register-header">
          <span className="tag-royal-orange">Milestone 1 Onboarding</span>
          <h1 className="register-title">Register Enterprise Account</h1>
          <p className="register-subtitle">
            Real Estate Due Diligence Agent — Access System Node
          </p>
        </div>

        {/* Card */}
        <div className="glass-card register-card">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="alert alert-error" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" role="status">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {success}
              </div>
            )}

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="reg-fullName" className="form-label">Full Name</label>
              <input
                id="reg-fullName"
                className="form-input"
                type="text"
                name="fullName"
                placeholder="e.g. Sarah Jenkins"
                value={form.fullName}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">Email Address</label>
              <input
                id="reg-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="sarah@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">Password</label>
              <input
                id="reg-password"
                className="form-input"
                type="password"
                name="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {/* SRS Role Dropdown */}
            <div className="form-group">
              <label htmlFor="reg-role" className="form-label">SRS Platform Role</label>
              <select
                id="reg-role"
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                {SRS_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} ({r.value})
                  </option>
                ))}
              </select>

              {/* Dynamic Interactive Role Capability Badge */}
              <div className="register__role-badge">
                <div className="register__role-badge-header">
                  <span className="text-pacific-blue" style={{ fontWeight: 700 }}>
                    Selected Role: {selectedRoleInfo.label}
                  </span>
                </div>
                <p className="register__role-badge-desc">{selectedRoleInfo.subtitle}</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Creating Account...' : 'Register Enterprise Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already registered?{' '}
            <Link to="/login" className="text-spanish-orange" style={{ fontWeight: 700 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
