const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Setup Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/users';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });
exports.uploadUserImage = upload.single('profilePicture');


// PATCH /api/users/update-credits
exports.updateCredits = async (req, res) => {
  try {
    const { minCreditsRequired, hoursPerCredit } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Validate input
    if (
      minCreditsRequired === undefined ||
      hoursPerCredit === undefined ||
      isNaN(Number(minCreditsRequired)) ||
      isNaN(Number(hoursPerCredit)) ||
      Number(minCreditsRequired) < 0 ||
      Number(hoursPerCredit) < 1
    ) {
      return res.status(400).json({ message: 'Invalid credit values' });
    }

    // Update user's credits fields
    req.user.minCreditsRequired = Number(minCreditsRequired);
    req.user.hoursPerCredit = Number(hoursPerCredit);
    await req.user.save();

    res.json({
      success: true,
      minCreditsRequired: req.user.minCreditsRequired,
      hoursPerCredit: req.user.hoursPerCredit,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update credits', error: err.message });
  }
};



// ✅ Route handler
exports.updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profilePicture = `/uploads/users/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Profile picture updated successfully', image: user.profilePicture });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload image', error: err.message });
  }
};
