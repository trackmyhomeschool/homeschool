import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';

function StateRequirementsPage() {
  const [user, setUser] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [localCredits, setLocalCredits] = useState('');
  const [localHours, setLocalHours] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch user info and then state info
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const userRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, { withCredentials: true });
        setUser(userRes.data);
        setLocalCredits(userRes.data.minCreditsRequired);
        setLocalHours(userRes.data.hoursPerCredit);

        const stateRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/states/${userRes.data.state}`, { withCredentials: true });
        setStateData(stateRes.data);
      } catch (e) {
        setError('Failed to load user or state info.');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const isLocal = stateData && (stateData.creditDefinition || '').toLowerCase() === 'local';

  const handleSave = async () => {
    setSaveLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.patch(
  `${process.env.REACT_APP_API_URL}/api/users/update-credits`,
  {
    minCreditsRequired: localCredits,
    hoursPerCredit: localHours
  },
  { withCredentials: true }
);

      setUser(prev => ({
        ...prev,
        minCreditsRequired: localCredits,
        hoursPerCredit: localHours
      }));
      setEditMode(false);
      setSuccess('Updated successfully!');
    } catch (e) {
      setError('Failed to update requirements.');
    }
    setSaveLoading(false);
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

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="danger" className="mt-4">{error}</Alert>
      </DashboardLayout>
    );
  }

  if (!user || !stateData) return null;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 520, margin: '40px auto' }}>
        <Card className="shadow rounded-3 p-4">
          <h2 className="mb-4 text-center">State Requirements</h2>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control value={stateData.name} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Minimum Credits Required to Graduate</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={editMode ? localCredits : user.minCreditsRequired}
                onChange={e => setLocalCredits(e.target.value)}
                disabled={!editMode}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hours Per Credit</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={editMode ? localHours : user.hoursPerCredit}
                onChange={e => setLocalHours(e.target.value)}
                disabled={!editMode}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Credit Definition</Form.Label>
              <Form.Control value={stateData.creditDefinition} disabled />
            </Form.Group>

            {isLocal && !editMode && (
              <Button variant="warning" onClick={() => setEditMode(true)} className="w-100">
                Edit
              </Button>
            )}
            {isLocal && editMode && (
              <Button
                variant="success"
                onClick={handleSave}
                className="w-100"
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </Form>
          {success && <Alert variant="success" className="mt-3 text-center">{success}</Alert>}
          {isLocal && <p className="text-secondary mt-3 text-center">You can edit these fields because your state uses a local Carnegie Unit.</p>}
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default StateRequirementsPage;
