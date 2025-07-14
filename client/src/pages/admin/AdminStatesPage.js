import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminStatesPage() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/states`, { withCredentials: true })
      .then(res => setStates(res.data))
      .catch(() => setStates([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <Card className="shadow rounded-3 p-4">
        <h2 className="mb-4 text-center">All States</h2>
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner />
          </div>
        ) : (
          <Table responsive bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>State Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {states.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted">
                    No states found.
                  </td>
                </tr>
              )}
              {states.map((state, i) => (
                <tr key={state._id}>
                  <td>{i + 1}</td>
                  <td>{state.name}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/admin/states/${state._id}/edit`)}
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
    </div>
  );
}
