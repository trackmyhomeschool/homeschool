import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, Button, Form, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function AdminChatPage() {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({});
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const { username } = useParams();

  useEffect(() => {
    async function fetchChat() {
      setLoading(true);
      try {
        // RELATIVE URL + credentials
        const { data: msgData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/chat/chats/${username}`, { withCredentials: true });
        setMessages(msgData.messages || []);
        setUserInfo(msgData.user || {});
      } catch (err) {
        if (err.response && err.response.status === 401) {
          window.location.href = '/admin';
        }
        setMessages([]);
        setUserInfo({});
      }
      setLoading(false);
    }
    fetchChat();
  }, [username]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/chat/chats/${username}`, {
  message: msg,
}, { withCredentials: true });
      setMessages(prev => [...prev, {
        message: msg,
        receiver: username,
        sender: 'admin',
        date: new Date().toISOString(),
      }]);
      setMsg('');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        window.location.href = '/admin';
      }
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', minHeight: 500 }}>
      <Card className="shadow rounded-3 p-3" style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
        <h5 className="mb-3 text-primary text-center">
          {userInfo.name || username}'s Chat
        </h5>
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
            <div className="text-center text-muted">No messages yet.</div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`d-flex mb-3 ${m.sender === 'admin' ? 'justify-content-end' : 'justify-content-start'}`}
              style={{ width: '100%' }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  background: m.sender === 'admin' ? '#e0f3ff' : '#f4f4f6',
                  color: '#222',
                  borderRadius: 16,
                  padding: '10px 16px',
                  boxShadow: m.sender === 'admin'
                    ? '0 2px 8px rgba(0,110,255,0.05)'
                    : '0 2px 8px rgba(0,0,0,0.05)',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontSize: 15 }}>{m.message}</div>
                <div style={{ fontSize: 12, marginTop: 3, color: '#888', textAlign: 'right' }}>
                  {m.sender === 'admin' ? 'Admin' : userInfo.name || username}
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
  );
}

export default AdminChatPage;
