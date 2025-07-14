const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const DailyLog = require('../models/DailyLog');

router.use('/chat', require('./adminChat')); // or merge manually

// Hardcoded admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'supersecret123';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});


// Get all users with their student count
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().lean();

    const usersWithCounts = await Promise.all(users.map(async user => {
      const studentCount = await Student.countDocuments({ user: user._id });
      return { ...user, studentCount };
    }));

    res.json(usersWithCounts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Delete user and their students
router.delete('/users/:id', async (req, res) => {
  try {
    // 1. Find all student IDs for the user
    const students = await Student.find({ user: req.params.id }, '_id');
    const studentIds = students.map(s => s._id);

    // 2. Delete all daily logs for these students
    if (studentIds.length > 0) {
      await DailyLog.deleteMany({ student: { $in: studentIds } });
    }

    // 3. Delete all students for this user
    await Student.deleteMany({ user: req.params.id });

    // 4. Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and all associated students and logs deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

module.exports = router;
