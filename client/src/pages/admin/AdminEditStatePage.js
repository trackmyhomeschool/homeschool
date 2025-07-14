import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CREDIT_DEFS = [
  "Carnegie Unit",
  "fixed hours",
  "local"
];

export default function AdminEditStatePage() {
  const { id } = useParams();
  const [stateData, setStateData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    creditDefinition: "",
    hoursPerCredit: "",
    minCreditsRequired: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/states/${id}`, { withCredentials: true })
      .then(res => {
        setStateData(res.data);
        setForm({
          creditDefinition: res.data.creditDefinition,
          hoursPerCredit: res.data.hoursPerCredit,
          minCreditsRequired: res.data.minCreditsRequired
        });
      })
      .catch(() => setError("Failed to load state data."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => {
    setForm(f => ({
      ...f,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/states/${id}`,
        {
          creditDefinition: form.creditDefinition,
          hoursPerCredit: parseFloat(form.hoursPerCredit),
          minCreditsRequired: parseFloat(form.minCreditsRequired)
        },
        { withCredentials: true }
      );
      setEditMode(false);
      setSuccess("State updated successfully!");
      setStateData(s => ({
        ...s,
        ...form
      }));
    } catch {
      setError("Failed to update state.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4 text-center">{error}</Alert>
    );
  }

  if (!stateData) return null;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <Card className="shadow rounded-3 p-4">
        <h2 className="mb-4 text-center">Edit State</h2>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>State Name</Form.Label>
            <Form.Control value={stateData.name} disabled />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Credit Definition</Form.Label>
            <Form.Select
              name="creditDefinition"
              value={form.creditDefinition}
              onChange={handleChange}
              disabled={!editMode}
            >
              {CREDIT_DEFS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Hours Per Credit</Form.Label>
            <Form.Control
              name="hoursPerCredit"
              type="number"
              step="0.01"
              min="0"
              value={form.hoursPerCredit}
              onChange={handleChange}
              disabled={!editMode}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Min Credits Required to Graduate</Form.Label>
            <Form.Control
              name="minCreditsRequired"
              type="number"
              step="0.01"
              min="0"
              value={form.minCreditsRequired}
              onChange={handleChange}
              disabled={!editMode}
            />
          </Form.Group>
          {!editMode && (
            <Button variant="primary" className="w-100" onClick={() => setEditMode(true)}>
              Edit
            </Button>
          )}
          {editMode && (
            <Button
              variant="success"
              className="w-100"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </Form>
        {success && <Alert variant="success" className="mt-3 text-center">{success}</Alert>}
      </Card>
    </div>
  );
}