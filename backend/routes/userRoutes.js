// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const State = require('../models/State');
const protect = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('state');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user info', error: err.message });
  }
});

// Start trial route
router.post('/start-trial', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.trialEndsAt && user.trialEndsAt > new Date())
      return res.status(400).json({ message: "Trial already active." });

    // Set trial for 4 days from today
    user.trialEndsAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    user.isSubscribed = false;
    user.subscriptionStatus = null;
    user.subscriptionId = null;
    await user.save();
    res.json({ message: "Trial started!", trialEndsAt: user.trialEndsAt });
  } catch (err) {
    res.status(500).json({ message: "Failed to start trial." });
  }
});



router.get('/all', protect, async (req, res) => {
  const users = await User.find({}, 'firstName lastName email trialEndsAt isSubscribed subscriptionStatus subscriptionEndsAt cancelAtPeriodEnd');
  res.json(users);
});

const { uploadUserImage, updateProfilePicture } = require('../controllers/userController');

router.post('/upload-profile', protect, uploadUserImage, updateProfilePicture);

router.patch('/update-credits', protect, userController.updateCredits);
module.exports = router;
