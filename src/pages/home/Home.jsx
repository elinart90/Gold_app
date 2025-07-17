import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Home.css';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {/* Header with dynamic navigation */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="home-logo">GoldTrack GH</h1>
          <nav className="home-nav">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <Link to="/logout" className="nav-link">Logout</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="nav-link">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-main">
        <section className="hero-section">
          <div className="hero-content">
            {user ? (
              <>
                <h2>Welcome back, {user.name}!</h2>
                <p className="hero-text">
                  Ready to track your gold transactions today?
                </p>
                <div className="hero-actions">
                  <Link to="/dashboard" className="btn-primary">
                    Go to Dashboard
                  </Link>
                  <Link to="/new-transaction" className="btn-secondary">
                    New Transaction
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2>Track Your Gold Sales Nationwide</h2>
                <p className="hero-text">
                  A reliable platform for gold agents across Ghana to manage weight, 
                  pricing, and transactions in real-time.
                </p>
                <div className="hero-actions">
                  <Link to="/signup" className="btn-primary">
                    Get Started
                  </Link>
                  <Link to="/features" className="btn-secondary">
                    Learn More
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h3>Why Choose GoldTrack GH?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>Real-time Tracking</h4>
              <p>Monitor all your transactions as they happen</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Secure Platform</h4>
              <p>Bank-level security for all your transactions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h4>Mobile Friendly</h4>
              <p>Access your dashboard from any device</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-links">
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          </div>
          <div className="copyright">
            &copy; {new Date().getFullYear()} GoldTrack GH. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}