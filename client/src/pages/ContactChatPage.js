import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Button, Form, Spinner } from 'react-bootstrap';

function ContactChatPage() {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      setLoading(true);
      const { data: userData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, { withCredentials: true });
      setUser(userData);

      const { data: msgData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/contact`, { withCredentials: true });
      setMessages(msgData);
      setLoading(false);
    };
    fetchUserAndMessages();
  }, []);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      // Always send to "admin"
      await axios.post(`${process.env.REACT_APP_API_URL}/api/contact`, {
        message: msg,
        receiver: 'admin',
      }, { withCredentials: true });
      setMessages(prev => [...prev, {
        message: msg,
        sender: user.username,
        receiver: 'admin',
        date: new Date().toISOString(),
      }]);
      setMsg('');
    } catch {
      // Handle error (show toast etc)
    }
    setSending(false);
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
      <div style={{ maxWidth: 600, margin: '40px auto', minHeight: 500 }}>
        <Card className="shadow rounded-3 p-3" style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
          <h4 className="mb-3 text-primary text-center">Contact Support Chat</h4>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              background: '#f6f8fa',
              padding: 14,
              borderRadius: 12,
              marginBottom: 12,
              maxHeight: 350
            }}
          >
            {messages.length === 0 && (
              <div className="text-center text-muted">No messages yet. Start the conversation!</div>
            )}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`d-flex mb-3 ${m.sender === (user?.username || user?.email) ? 'justify-content-end' : 'justify-content-start'}`}
                style={{ width: '100%' }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    background: m.sender === (user?.username || user?.email) ? '#e0f3ff' : '#f4f4f6',
                    color: '#222',
                    borderRadius: 16,
                    padding: '10px 16px',
                    boxShadow: m.sender === (user?.username || user?.email)
                      ? '0 2px 8px rgba(0,110,255,0.05)'
                      : '0 2px 8px rgba(0,0,0,0.05)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: 15 }}>{m.message}</div>
                  <div style={{ fontSize: 12, marginTop: 3, color: '#888', textAlign: 'right' }}>
                    {m.sender === (user?.username || user?.email) ? 'You' : 'Admin'}
                    {m.date ? ' · ' + new Date(m.date).toLocaleTimeString() : ''}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <Form onSubmit={handleSend} className="d-flex">
            <Form.Control
              type="text"
              placeholder="Type your message..."
              value={msg}
              onChange={e => setMsg(e.target.value)}
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !msg.trim()} style={{ marginLeft: 8 }}>
              Send
            </Button>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ContactChatPage;
