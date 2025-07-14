import React, { useEffect, useState, useRef } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import axios from "axios";
import { Card, Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";

// Utility to normalize a resource JS object to the schema shape
function normalizeResource(r) {
  let lat, lng;
  if (r.location && typeof r.location.lat === "number" && typeof r.location.lng === "number") {
    lat = r.location.lat;
    lng = r.location.lng;
  } else if (typeof r.lat === "number" && typeof r.lng === "number") {
    lat = r.lat;
    lng = r.lng;
  }
  return {
    ...r,
    location: { lat, lng },
    state: r.state || null,
    city: r.city || null,
    address: r.address || null,
    title: r.title || null,
    website: r.website || null,
  };
}

function EditResourceModal({ show, onHide, resource, onSave }) {
  const [form, setForm] = useState(resource || {});

  useEffect(() => { setForm(resource || {}); }, [resource]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleLocChange = e => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      location: { ...f.location, [name]: parseFloat(value) }
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave({ ...form, location: { lat: Number(form.location?.lat), lng: Number(form.location?.lng) } });
  };

  if (!form) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{form._id ? "Edit" : "Add"} Resource</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
            <Form.Control name="title" value={form.title || ""} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>State</Form.Label>
            <Form.Control name="state" value={form.state || ""} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>City</Form.Label>
            <Form.Control name="city" value={form.city || ""} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Address</Form.Label>
            <Form.Control name="address" value={form.address || ""} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Latitude</Form.Label>
            <Form.Control
              type="number"
              step="any"
              name="lat"
              value={form.location?.lat || ""}
              onChange={handleLocChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Longitude</Form.Label>
            <Form.Control
              type="number"
              step="any"
              name="lng"
              value={form.location?.lng || ""}
              onChange={handleLocChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Website</Form.Label>
            <Form.Control name="website" value={form.website || ""} onChange={handleChange} />
          </Form.Group>
          <Button type="submit" variant="primary" className="mt-2 w-100">
            Save
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

const AdminResourceManagerPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editResource, setEditResource] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  // Fetch resources
  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/homeschoolresources`, { withCredentials: true });
      setResources(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) window.location.href = "/admin";
      setResources([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, []);

  // Edit/Save resource
  const handleEdit = resource => {
    setEditResource(resource);
    setModalShow(true);
  };

  const handleSave = async (updated) => {
    setMsg(""); setUploading(true);
    try {
      if (updated._id) {
        // Update
        await axios.put(`${process.env.REACT_APP_API_URL}/api/homeschoolresources/${updated._id}`, normalizeResource(updated), { withCredentials: true });
        setMsg("Resource updated.");
      } else {
        // Add new (rare for admin, but allowed)
        await axios.post(`${process.env.REACT_APP_API_URL}/api/homeschoolresources`, normalizeResource(updated), { withCredentials: true });
        setMsg("Resource added.");
      }
      setModalShow(false);
      fetchResources();
    } catch (err) {
      if (err.response && err.response.status === 401) window.location.href = "/admin";
      setMsg("Save failed.");
    }
    setUploading(false);
  };

  // Upload JSON for bulk add
  const handleFileUpload = async e => {
    setMsg(""); setUploading(true);
    try {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      let data = [];
      try {
        data = JSON.parse(text);
      } catch {
        setMsg("Invalid JSON format.");
        setUploading(false);
        return;
      }
      // Normalize array or single object
      const toUpload = Array.isArray(data)
        ? data.map(normalizeResource)
        : [normalizeResource(data)];
      await axios.post(`${process.env.REACT_APP_API_URL}/api/homeschoolresources/bulk`, toUpload, { withCredentials: true });
      setMsg("Import successful!");
      fetchResources();
    } catch (err) {
      if (err.response && err.response.status === 401) window.location.href = "/admin";
      setMsg("Import failed.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{
        maxWidth: 960,
        margin: "auto",
        padding: 24
      }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 style={{ fontWeight: 700, letterSpacing: 1 }}>Resource Database</h2>
          <div>
            <Button as="label" variant="success" style={{ fontWeight: 600 }}>
              <span role="img" aria-label="upload" style={{ marginRight: 6 }}>📁</span>
              Import JSON
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                hidden
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </Button>
            <Button
              className="ms-3"
              variant="primary"
              onClick={() => { setEditResource({}); setModalShow(true); }}
              disabled={uploading}
            >
              + Add Resource
            </Button>
          </div>
        </div>
        {msg && <Alert variant="info" className="mb-2">{msg}</Alert>}
        <Card className="p-0 shadow-sm">
          {loading ? (
            <div className="py-5 text-center">
              <Spinner />
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead style={{ background: "#e7effc" }}>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>State</th>
                  <th>City</th>
                  <th>Website</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td>{r.state}</td>
                    <td>{r.city}</td>
                    <td>
                      {r.website && (
                        <a href={r.website} target="_blank" rel="noopener noreferrer">
                          {r.website.replace(/^https?:\/\//, "").slice(0, 22)}...
                        </a>
                      )}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleEdit(r)}
                        style={{ borderRadius: 20, fontWeight: 600 }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
        <EditResourceModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          resource={editResource}
          onSave={handleSave}
        />
      </div>
  );
};

export default AdminResourceManagerPage;
