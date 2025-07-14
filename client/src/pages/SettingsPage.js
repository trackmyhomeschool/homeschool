import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Spinner, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function SettingsPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err) {
        setError('Failed to load user information. Please try again.');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleImageSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/upload-profile`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg('Profile picture updated successfully!');
      setTimeout(() => setSuccessMsg(null), 2000);
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setError('Failed to upload profile picture. Please try again.');
    }
  };

  const getProfilePictureUrl = () => {
    if (user?.profilePicture?.startsWith('/uploads')) {
      return `${process.env.REACT_APP_API_URL}${user.profilePicture}`;
    }
    return '/images/default-avatar.jpg';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
          <Spinner animation="border" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 520, margin: '40px auto' }}>
        <Card className="shadow rounded-3 p-4">
          <h2 className="mb-4 text-center text-primary fw-bold">Account Settings</h2>
          {error && (
            <Alert variant="danger" className="mb-3 text-center">
              {error}
            </Alert>
          )}
          {successMsg && (
            <Alert variant="success" className="mb-3 text-center">
              {successMsg}
            </Alert>
          )}

          {!user ? (
            <div className="text-center text-muted">Loading profile...</div>
          ) : (
            <>
              {/* Profile Picture Section */}
              <div
                className="d-flex flex-column align-items-center mb-4"
                style={{ position: 'relative' }}
                onDoubleClick={handleImageSelect}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="rounded-circle shadow"
                  style={{
                    width: 110,
                    height: 110,
                    objectFit: 'cover',
                    border: '4px solid #0d6efd',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onError={e => (e.target.src = '/images/default-avatar.jpg')}
                />
                {isHovering && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -30,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#fff',
                      color: '#0d6efd',
                      borderRadius: 8,
                      padding: '2px 14px',
                      fontSize: 13,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                      border: '1px solid #eee',
                      zIndex: 3,
                    }}
                  >
                    Double click to change photo
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="d-none"
                />
              </div>

              {/* User Info */}
              <div style={{
                background: '#f8fafc',
                borderRadius: 12,
                padding: '22px 25px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                marginBottom: 24
              }}>
                <div className="d-flex justify-content-between mb-2">
                  <div className="fw-semibold text-muted">First Name</div>
                  <div className="">{user.firstName}</div>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <div className="fw-semibold text-muted">Last Name</div>
                  <div className="">{user.lastName}</div>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <div className="fw-semibold text-muted">Email</div>
                  <div className="">{user.email}</div>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <div className="fw-semibold text-muted">Username</div>
                  <div className="">{user.username}</div>
                </div>
                <div className="d-flex justify-content-between">
                  <div className="fw-semibold text-muted">State</div>
                  <div className="">{user.state?.name || user.state || ''}</div>
                </div>
              </div>

              {/* Contact Us Button */}
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="outline-primary"
                  size="lg"
                  style={{ borderRadius: 14, minWidth: 170, fontWeight: 600 }}
                  onClick={() => navigate('/contact')}
                >
                  Contact Us
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
