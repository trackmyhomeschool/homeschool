const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware'); // Make sure admin auth in production!

// 1. Get all chats (threads) for admin, sorted by last message time
router.get('/chats', protect, async (req, res) => {
  try {
    // Find all messages where admin is sender OR receiver
    const messages = await ContactMessage.find({
      $or: [{ sender: 'admin' }, { receiver: 'admin' }]
    }).sort({ date: -1 });

    // Group by username (other participant, not 'admin')
    const chatMap = {};
    for (let msg of messages) {
      // The other participant (user) in this chat
      const other = msg.sender === 'admin' ? msg.receiver : msg.sender;
      if (!chatMap[other]) {
        chatMap[other] = {
          username: other,
          lastMessage: msg.message,
          lastTime: msg.date,
        };
      }
    }

    // Optionally add user info
    const chatList = await Promise.all(Object.values(chatMap).map(async (c) => {
      const user = await User.findOne({ username: c.username });
      return { ...c, name: user ? `${user.firstName} ${user.lastName}` : c.username };
    }));

    // Sort by most recent
    chatList.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
    res.json(chatList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat threads' });
  }
});

// 2. Get full chat with a specific user
router.get('/chats/:username', protect, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    const messages = await ContactMessage.find({
      $or: [
        { sender: username, receiver: 'admin' },
        { sender: 'admin', receiver: username }
      ]
    }).sort('date');
    res.json({
      user: user ? { username, name: `${user.firstName} ${user.lastName}` } : { username },
      messages
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 3. Admin sends a message to a user
router.post('/chats/:username', protect, async (req, res) => {
  try {
    const { username } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // You can add admin role check here if you want strict protection

    const newMsg = new ContactMessage({
      sender: 'admin',
      receiver: username,
      message,
      date: new Date()
    });
    await newMsg.save();
    res.json({ success: true, msg: newMsg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
