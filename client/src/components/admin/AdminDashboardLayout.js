import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaUsers, FaDatabase, FaGlobeAmericas,
  FaCreditCard, FaHeadset, FaBars, FaSignOutAlt
} from 'react-icons/fa';
import './AdminDashboardLayout.css';

const adminLinks = [
  { name: 'Users', icon: <FaUsers />, path: '/admin/users' },
  { name: 'Subscriptions', icon: <FaCreditCard />, path: '/admin/subscriptions' },
  { name: 'States', icon: <FaGlobeAmericas />, path: '/admin/states' },
  { name: 'Resource Database', icon: <FaDatabase />, path: '/admin/resources' },
  { name: 'Customer Support', icon: <FaHeadset />, path: '/admin/support' },
];

function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin');
  };

  return (
    <div className={`admin-dashboard-wrapper ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Hamburger for mobile, always far left */}
      {isMobile && (
        <div className="admin-mobile-toggle" style={{ zIndex: 1200 }}>
          <FaBars onClick={() => setSidebarOpen(prev => !prev)} />
        </div>
      )}

      <aside className="admin-sidebar admin-scrollable-sidebar">
        <div className={`admin-sidebar-header admin-sidebar-logo${isMobile || !sidebarOpen ? ' admin-logo-left' : ''}`}>
          <h2>
            <span className="admin-title-line">Track My</span>
            <span className="admin-title-line">Homeschool</span>
          </h2>
          <p className="admin-tagline">Structure. Simplicity. Success.</p>
        </div>

        <nav className="admin-menu">
          {adminLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              className="admin-nav-link"
              style={{ marginLeft: 10, marginRight: 6 }}
            >
              {link.icon} {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-logout-row" onClick={handleLogout}>
            <span className="admin-logout-user">admin</span>
            <FaSignOutAlt className="admin-logout-icon" />
          </div>
        </div>
      </aside>

      <main className="admin-dashboard-main admin-scrollable-main">
        <header
          className={`admin-dashboard-topbar${isMobile || !sidebarOpen ? ' admin-topbar-left' : ''}`}
        >
          <div className="admin-dashboard-title">Admin Dashboard</div>
        </header>

        <section className="admin-dashboard-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default AdminDashboardLayout;
