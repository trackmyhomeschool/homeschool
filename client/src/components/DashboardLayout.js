import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaBook,
  FaChartBar,
  FaTrophy,
  FaMap,
  FaCog,
  FaFileAlt,
  FaSearch,
  FaBars,
  FaSignOutAlt
} from 'react-icons/fa';
import axios from 'axios';

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [user, setUser] = useState({ email: 'Loading...' });
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {

      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout failed:', err.message);
    }
    navigate('/');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // to:

        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          withCredentials: true
        });
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user info');
        setUser({ email: 'unknown@user.com' });
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getUserImage = () => {
    if (!user?.profilePicture) return '/images/default-avatar.jpg';
    return user.profilePicture.startsWith('/uploads')
      ? `${process.env.REACT_APP_API_URL}${user.profilePicture}`
      : user.profilePicture;
  };

  // Add this utility for premium/trial check:
  const isPremiumOrTrial = user.isTrial || user.isPremium;

  return (
    <div className={`dashboard-wrapper ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {isMobile && (
        <div className="mobile-toggle">
          <FaBars onClick={() => setSidebarOpen(prev => !prev)} />
        </div>
      )}

      <aside className="sidebar scrollable-sidebar">
        <div className="sidebar-header sidebar-logo">
          <h2>
            <span className="title-line">Track My</span>
            <span className="title-line">Homeschool</span>
          </h2>
          <p className="tagline">Structure. Simplicity. Success.</p>
        </div>

        {/* Scrollable Menu */}
        <div className="sidebar-menu-scroll">
          <nav className="menu">
            <NavLink to="/dashboard"><FaTachometerAlt /> Dashboard</NavLink>
            <NavLink to="/students"><FaUserGraduate /> Students</NavLink>
            <NavLink to="/logs"><FaBook /> Daily Logs</NavLink>

            {/* Reports: freeze if not premium/trial */}
            {isPremiumOrTrial ? (
              <NavLink to="/reports"><FaFileAlt /> Reports</NavLink>
            ) : (
              <div className="sidebar-btn-disabled"><FaFileAlt /> Reports <span className="lock-icon">🔒</span></div>
            )}

            {/* Activities: freeze if not premium/trial */}
            {isPremiumOrTrial ? (
              <NavLink to="/activities"><FaTrophy /> Activities</NavLink>
            ) : (
              <div className="sidebar-btn-disabled"><FaTrophy /> Activities <span className="lock-icon">🔒</span></div>
            )}

            <NavLink to="/requirements"><FaChartBar /> State Requirements</NavLink>
            <NavLink to="/map"><FaMap /> Homeschool Map</NavLink>
            <NavLink to="/settings"><FaCog /> Settings</NavLink>
          </nav>
        </div>

        {/* Bottom sticky section */}
        <div className="sidebar-bottom-actions">
          <button className="premium-btn" onClick={() => navigate("/upgrade")}>
            <FaTrophy style={{ marginRight: 8 }} />
            Upgrade to Premium
          </button>
          <div className="sidebar-footer">
            <div className="footer-content">
              <img
                src={getUserImage()}
                alt="avatar"
                className="footer-avatar"
                onClick={() => navigate('/settings')}
                onError={(e) => { e.target.src = '/images/default-avatar.jpg'; }}
              />
              <div className="user-email">{user.email}</div>
              <FaSignOutAlt className="logout-icon" title="Logout" onClick={handleLogout} />
            </div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main scrollable-main">
        <header className="dashboard-topbar">
          <div className="search-container">
            <input type="text" placeholder="Search" className="search-input" />
            <FaSearch className="search-icon-end" />
          </div>
          <div className="profile-info">
            <img
              src={getUserImage()}
              alt="user"
              className="avatar"
              onClick={() => navigate('/settings')}
              onError={(e) => { e.target.src = '/images/default-avatar.jpg'; }}
            />
          </div>
        </header>

        <section className="dashboard-content">{children}</section>
      </main>
    </div>
  );
}

export default DashboardLayout;

