import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

function NotFoundPage() {
  return (
    <DashboardLayout>
      <div style={{ minHeight: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2563eb', marginBottom: 12 }}>404</h1>
        <h3 style={{ color: '#1e293b', marginBottom: 10 }}>Oops! Path is invalid.</h3>
        <p className="text-muted" style={{ fontSize: 18, marginBottom: 24 }}>The page you are looking for doesn't exist.</p>
        <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
      </div>
    </DashboardLayout>
  );
}

export default NotFoundPage;
