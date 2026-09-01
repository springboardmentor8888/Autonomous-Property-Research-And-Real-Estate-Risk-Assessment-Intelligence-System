import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../utils/api';
import './Login.css';

/**
 * Login Page — Pale Light Split-Screen Layout
 * Left panel highlights real estate risk monitoring features with Royal Orange tags.
 * Right panel contains secure JWT authentication form.
 */
export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) return setError('Email address is required.');
    if (!form.password) return setError('Password is required.');

    setLoading(true);
    try {
      const data = await post('/auth/login', form);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-split animate-fade-in-up">
        {/* Left Panel: Risk Monitoring Feature Highlights */}
        <div className="login-split__visual">
          <div className="tag-royal-orange">
            <span className="login-split__tag-dot" /> Autonomous Agent Security Node
          </div>

          <h1 className="login-split__headline">
            Real Estate Risk Intelligence &amp; Title Chain Auditing
          </h1>

          <p className="login-split__subtext">
            Sign in to your enterprise account to run automated property pre-screenings, 
            instant encumbrance audits, and 50-state land registry compliance checks.
          </p>

          {/* Feature Highlights with Royal Orange Badges */}
          <div className="login-split__features">
            <div className="login-split__feature-card glass-card">
              <span className="tag-royal-orange">99.8% Audit Accuracy</span>
              <h3 className="login-split__feature-title">Automated Title Chain Risk Scoring</h3>
              <p className="login-split__feature-desc">
                Instant identification of unreleased liens, break in title chains, and legal encumbrance flags.
              </p>
            </div>

            <div className="login-split__feature-card glass-card">
              <span className="tag-royal-orange">Live Registry Sync</span>
              <h3 className="login-split__feature-title">50-State Public Registry Access</h3>
              <p className="login-split__feature-desc">
                Direct API integration with county clerk land records and municipal GIS zoning classification nodes.
              </p>
            </div>

            <div className="login-split__feature-card glass-card">
              <span className="tag-royal-orange">Role-Based Security</span>
              <h3 className="login-split__feature-title">Enterprise Governance &amp; Audit Logs</h3>
              <p className="login-split__feature-desc">
                Role-gated dashboards tailored for Buyers, Agents, Legal Reviewers, Financial Institutions, and Admins.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Secure JWT Sign-In Container */}
        <div className="login-split__form-wrapper">
          <div className="glass-card login-card">
            <div className="login-card__header">
              <span className="tag-pacific-blue">Secure Authentication</span>
              <h2 className="login-card__title">Agent Portal Sign In</h2>
              <p className="login-card__subtitle">Enter your user credentials below</p>
            </div>

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

              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">Email Address</label>
                <input
                  id="login-email"
                  className="form-input"
                  type="email"
                  name="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="login-password" className="form-label">Password</label>
                <input
                  id="login-password"
                  className="form-input"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Authenticating System...' : 'Sign In to Agent Portal'}
              </button>
            </form>

            <div className="auth-footer">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-spanish-orange" style={{ fontWeight: 700 }}>
                Register Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
