import React from 'react';
import './HeroNavbar.css';

function HeroNavbar({ onOpenRegister, onOpenLogin }) {
  return (
    <nav className="hero-navbar">
      <div className="nav-left">
        <img src="/logo.png" alt="Logo" className="nav-logo" />
        <span className="nav-title">Track My Homeschool</span>
      </div>

      <div className="nav-center d-none d-md-flex">
  <a href="/login">Student Progress</a>
  <a href="/login">GPA Reports</a>
  <a href="/login">Daily Logs</a>
  <a href="/login">State Requirements</a>
</div>

      <div className="nav-right">
        <button className="btn btn-outline-dark me-2" onClick={onOpenLogin}>Login</button>
        <button className="btn btn-primary" onClick={onOpenRegister}>Sign Up</button>
      </div>
    </nav>
  );
}

export default HeroNavbar;
