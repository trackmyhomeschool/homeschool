const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const protect = require('../middleware/authMiddleware'); // assuming you have this

// Send message (user to admin or admin to user)
router.post('/', protect, async (req, res) => {
  try {
    const { message, receiver } = req.body;
    if (!message || !receiver) return res.status(400).json({ error: 'Missing message or receiver' });

    const sender = req.user.username || req.user.email; // For user, use username; for admin, use "admin"

    const msg = new ContactMessage({
      message,
      sender,
      receiver,
    });
    await msg.save();

    res.json({ success: true, msg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Fetch all messages for this user (user <-> admin)
router.get('/', protect, async (req, res) => {
  try {
    const username = req.user.username || req.user.email;
    // Get all messages where this user is sender or receiver
    const messages = await ContactMessage.find({
      $or: [
        { sender: username },
        { receiver: username }
      ]
    }).sort('date');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
