import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt } from 'react-icons/fa';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const confirm = window.confirm('Are you sure you want to delete this user and their data?');
    if (!confirm) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      console.error('Delete failed:', err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{
        textAlign: 'center',
        fontSize: '1.8rem',
        color: '#2c3e50',
        marginBottom: '30px'
      }}>
        User Management
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : users.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No users found.</p>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          maxWidth: '800px',
          margin: 'auto'
        }}>
          {users.map(user => (
            <div key={user._id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f7f9fc',
              border: '1px solid #dde4eb',
              borderRadius: '8px',
              padding: '12px 20px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{ flex: 1, fontWeight: '600', color: '#34495e' }}>
                {user.username}
              </div>
              <div style={{ color: '#555' }}>{user.studentCount} student{user.studentCount !== 1 ? 's' : ''}</div>
              <button onClick={() => handleDelete(user._id)} title="Delete User"
                style={{
                  marginLeft: '15px',
                  backgroundColor: 'royalblue',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                <FaTrashAlt /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UsersPage;
