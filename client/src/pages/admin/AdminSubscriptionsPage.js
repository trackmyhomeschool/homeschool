import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Table, Badge, Spinner } from 'react-bootstrap';

function getSubscriptionLabel(user) {
  // Priority: Cancelled > Trial > Subscribed > None
  if (user.cancelAtPeriodEnd || user.subscriptionStatus === 'canceled') {
    return <Badge bg="danger">Cancelled</Badge>;
  }
  if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
    return (
      <Badge bg="warning" text="dark">
        Trial (ends {new Date(user.trialEndsAt).toLocaleDateString()})
      </Badge>
    );
  }
  if (user.isSubscribed || user.subscriptionStatus === 'active') {
    if (user.subscriptionEndsAt) {
      return (
        <Badge bg="success">
          Subscribed (ends {new Date(user.subscriptionEndsAt).toLocaleDateString()})
        </Badge>
      );
    }
    return <Badge bg="success">Subscribed</Badge>;
  }
  return <Badge bg="secondary">No Subscription</Badge>;
}

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/users/all`, { withCredentials: true })
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 850, margin: '40px auto' }}>
      <Card className="shadow rounded-3 p-4">
        <h2 className="mb-4 text-center">User Subscriptions</h2>
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner />
          </div>
        ) : (
          <Table responsive bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Subscription Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((user, i) => (
                <tr key={user._id}>
                  <td>{i + 1}</td>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>{getSubscriptionLabel(user)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
