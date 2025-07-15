import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- add this import
import RegisterModal from '../components/RegisterModal';
import LoginModal from '../components/LoginModal';
import homeschoolLogo from '../data/logo.png';
import dashboardPreview from '../data/preview.png';
// Use SVG or PNG icons in feature cards as before
import './LandingPage.css';

function LandingPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); // <-- useNavigate hook

  console.log("LandingPage rendered");

  // Auth check (calls /api/users/me, expects token cookie)
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleOpenRegister = () => setShowRegister(true);
  const handleOpenLogin = () => setShowLogin(true);

  // Only go to dashboard if logged in
  const handleLogoClick = () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="landing-wrapper">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-row">
          <div
            className="navbar-left"
            style={{ cursor: isAuthenticated ? "pointer" : "default" }}
            onClick={handleLogoClick}
          >
            <img src={homeschoolLogo} alt="Track My Homeschool" className="navbar-logo" />
            <span className="navbar-title">Track My Homeschool</span>
          </div>
          <div className="navbar-menu">
            <span>Student Progress</span>
            <span>GPA Reports</span>
            <span>Daily Logs</span>
            <span>State Requirements</span>
          </div>
          <div className="navbar-actions navbar-actions-shift">
            <button className="btn btn-outline-primary" onClick={handleOpenLogin}>Login</button>
            <button className="btn btn-primary" onClick={handleOpenRegister}>Sign Up</button>
          </div>
        </div>
      </nav>

      {/* AUTH MODALS */}
      <RegisterModal
        show={showRegister}
        handleClose={() => setShowRegister(false)}
        onOpenLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
      <LoginModal
        show={showLogin}
        handleClose={() => setShowLogin(false)}
        onOpenRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      {/* HERO SECTION */}
      <section className="landing-intro">
        <div className="intro-content">
          <h1>Structure. Simplicity. Success.</h1>
          <button
            className="btn btn-primary"
            onClick={handleOpenRegister}
          >
            Sign Up
          </button>
          <p>4-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <div className="features-row">
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="34" height="34" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <h3>Track academic progress</h3>
          <p>Monitor student performance with interactive charts and analytics</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="34" height="34" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3"></path>
              <circle cx="12" cy="12" r="9"></circle>
            </svg>
          </div>
          <h3>Log homeschool hours</h3>
          <p>Easily record learning activities and meet state requirements</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="34" height="34" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <path d="M14 2v6h6"></path>
              <path d="M16 13H8"></path>
              <path d="M16 17H8"></path>
              <path d="M10 9H8"></path>
            </svg>
          </div>
          <h3>Generate GPA reports</h3>
          <p>Create professional transcripts ready for college applications</p>
        </div>
      </div>

      {/* TAGS/QUICK FEATURES BAR */}
      <div className="tags-row">
        <span>Fast setup</span> &nbsp;|&nbsp;
        <span>Parent &amp; Student friendly</span> &nbsp;|&nbsp;
        <span>US State compliant</span>
      </div>

      {/* DASHBOARD PREVIEW */}
      <div className="dashboard-preview-section dashboard-preview-larger">
        <img src={dashboardPreview} className="dashboard-preview-img" alt="Dashboard preview" />
      </div>

      {/* PRICING SECTION */}
      <section id="pricing" className="bg-teal-50" style={{marginTop: "2.3rem", paddingBottom: "0.1rem"}}>
        <div className="container">
          <h2 className="text-center" style={{marginTop: "0", marginBottom: "2.1rem"}}>Simple, Affordable Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="text-xl">Monthly Subscription</h3>
              <div style={{margin: "0.7rem 0"}}>
                <span className="text-4xl">$2.99</span>
                <span style={{color:"#7e8798", fontSize:"1.04rem"}}>/month</span>
              </div>
              <ul>
                <li>Unlimited students</li>
                <li>Full transcript generation</li>
                <li>Diploma creation</li>
                <li>State requirement tracking</li>
              </ul>
              <button className="btn btn-primary" onClick={handleOpenLogin}>
                Subscribe Monthly
              </button>
            </div>
            <div className="pricing-card" style={{position: "relative"}}>
              <div className="best-value">Best Value</div>
              <h3 className="text-xl">Annual Subscription</h3>
              <div style={{margin: "0.7rem 0"}}>
                <span className="text-4xl">$20</span>
                <span style={{color:"#7e8798", fontSize:"1.04rem"}}>/year</span>
              </div>
              <p style={{color: "#16a34a", fontWeight: 500, marginBottom: "0.7rem"}}>Save over 33%</p>
              <ul>
                <li>Unlimited students</li>
                <li>Full transcript generation</li>
                <li>Diploma creation</li>
                <li>State requirement tracking</li>
              </ul>
              <button className="btn btn-primary" onClick={handleOpenLogin}>
                Subscribe Yearly
              </button>
            </div>
          </div>
          <p className="text-center" style={{marginTop: "1.2rem", color: "#45526e"}}>
            All plans start with a 4-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-teal-800">
        <div className="footer-multicolumn">
          <div className="footer-col">
            <h3>Track My Homeschool</h3>
            <p className="text-teal-100">
              The comprehensive platform for homeschool record-keeping, planning, and reporting.
            </p>
          </div>
          <div className="footer-col">
            <h3>Features</h3>
            <ul>
              <li>Student Progress</li>
              <li>GPA Reports</li>
              <li>Daily Logs</li>
              <li>State Compliance</li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Resources</h3>
            <ul>
              <li>FAQ</li>
              <li>Blog</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Contact</h3>
            <p className="text-teal-100">Have questions? Contact our support team.</p>
            <button className="btn btn-outline-light mt-4">Contact Us</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Track My Homeschool. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
