import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { Button, Form, Card } from 'react-bootstrap';
import './ActivitiesPage.css';
import { useNavigate } from 'react-router-dom';

function ActivitiesPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [activeTab, setActiveTab] = useState('see');
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({ heading: '', details: '' });
  const [user, setUser] = useState(null); // For premium/trial check
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user && !user.isTrial && !user.isPremium) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/students`, { withCredentials: true })
      .then(res => {
        setStudents(res.data || []);
        if (res.data.length > 0) setSelectedStudentId(res.data[0]._id);
      })
      .catch(err => console.error('Error fetching students:', err));
  }, []);

  useEffect(() => {
    if (activeTab === 'see' && selectedStudentId) fetchActivities();
    // eslint-disable-next-line
  }, [activeTab, selectedStudentId]);

  const fetchActivities = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/students/${selectedStudentId}/activities`, { withCredentials: true })
      .then(res => setActivities(res.data || []))
      .catch(err => console.error('Error fetching activities:', err));
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    axios.post(`${process.env.REACT_APP_API_URL}/api/students/${selectedStudentId}/activities`, {
      date: today,
      heading: newActivity.heading,
      details: newActivity.details
    }, { withCredentials: true })
      .then(() => {
        setNewActivity({ heading: '', details: '' });
        setActiveTab('see');
        fetchActivities();
      })
      .catch(err => console.error('Error adding activity:', err));
  };

  const handleDeleteActivity = (activityId) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/students/${selectedStudentId}/activities/${activityId}`, { withCredentials: true })
      .then(fetchActivities)
      .catch(err => console.error('Error deleting activity:', err));
  };

  // Optionally show nothing if user check not loaded yet
  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="activities-container" style={{ maxWidth: 700, margin: '40px auto', background: '#f6faff', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
        {user && !user.isTrial && !user.isPremium && (
          <div style={{
            marginBottom: 24,
            padding: '14px 20px',
            borderRadius: 8,
            background: '#ffe9e6',
            color: '#c23c2a',
            fontWeight: 500,
            border: '1px solid #ffc1b5',
            textAlign: 'center'
          }}>
            Access denied. Please upgrade to premium to use this feature.
          </div>
        )}

        <h2 className="text-center mb-4" style={{ color: '#2176ff', fontWeight: 700 }}>Student Activities</h2>
        <div className="d-flex justify-content-center gap-4 mb-3">
          <Button variant={activeTab === 'see' ? 'primary' : 'outline-primary'} onClick={() => setActiveTab('see')}>See Activity</Button>
          <Button variant={activeTab === 'add' ? 'success' : 'outline-success'} onClick={() => setActiveTab('add')}>Add Activity</Button>
        </div>

        <div className="d-flex justify-content-center mb-4">
          <Form.Select style={{ width: '300px' }} value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
            ))}
          </Form.Select>
        </div>

        {activeTab === 'see' && (
          <div className="activity-list d-flex flex-wrap gap-3 justify-content-center">
            {activities.length === 0 ? <p>No activities found.</p> : (
              activities.map((activity) => (
                <Card key={activity._id} style={{ width: '22rem', position: 'relative' }}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteActivity(activity._id)}
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      padding: 0,
                      minWidth: 0,
                      minHeight: 0,
                      fontSize: 18,
                      lineHeight: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </Button>
                  <Card.Body>
                    <Card.Title>{activity.heading}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{activity.date}</Card.Subtitle>
                    <Card.Text>{activity.details}</Card.Text>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <Form onSubmit={handleAddActivity} className="mx-auto" style={{ maxWidth: '600px' }}>
            <Form.Group className="mb-3">
              <Form.Label>Activity Heading</Form.Label>
              <Form.Control
                value={newActivity.heading}
                onChange={(e) => setNewActivity({ ...newActivity, heading: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Activity Details</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={newActivity.details}
                onChange={(e) => setNewActivity({ ...newActivity, details: e.target.value })}
                required
              />
            </Form.Group>

            <div className="text-center">
              <Button type="submit" variant="success">Submit Activity</Button>
            </div>
          </Form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ActivitiesPage;
