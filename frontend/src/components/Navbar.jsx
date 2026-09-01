import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="app-header">
      <div className="nav-container">
        <Link to="/" className="brand" aria-label="Go to home page">
          <span className="brand-mark">⬡</span>
          <span className="brand-name">PropDue</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Login
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Register
          </NavLink>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-secondary">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary">
            Create Account
          </Link>
        </div>
      </div>
    </header>
  );
}
