import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <main className="hero-page">
      <section className="hero-content">
        <p className="hero-eyebrow">Enterprise Real Estate Intelligence</p>

        <h1 className="hero-title">
          Your Complete
          <span className="hero-title-accent"> Due Diligence</span>
          <br />
          Partner
        </h1>

        <p className="hero-subtitle">
          Automated property evaluation across ownership records, tax history,
          zoning regulations, flood zones, permits, and environmental data.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">
            Search a Property
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Learn More
          </Link>
        </div>
      </section>
    </main>
  );
}
