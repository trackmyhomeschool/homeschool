import React, { useEffect, useState } from 'react';
import { Card, Spinner, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminAllChatsPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/chat/chats`, { withCredentials: true });
        setChats(data);
      } catch (err) {
        setChats([]);
      }
      setLoading(false);
    }
    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 540, margin: '40px auto' }}>
      <Card className="shadow rounded-3 p-2">
        <h4 className="mb-4 text-primary text-center">User Chats</h4>
        <ListGroup variant="flush">
          {chats.length === 0 && (
            <ListGroup.Item className="text-center text-muted">No conversations yet.</ListGroup.Item>
          )}
          {chats.map(chat => (
            <ListGroup.Item
              key={chat.username}
              action
              style={{ cursor: 'pointer', borderRadius: 12, marginBottom: 6, background: '#f8fafc' }}
              onClick={() => navigate(`/admin/support/${chat.username}`)}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <div className="fw-semibold">{chat.name || chat.username}</div>
                <div style={{ fontSize: 13, color: '#888' }}>
                  {chat.lastMessage?.slice(0, 40) || ''}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#aaa', minWidth: 78, textAlign: 'right' }}>
                {chat.lastTime ? new Date(chat.lastTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' }) : ''}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </div>
  );
}

export default AdminAllChatsPage;
