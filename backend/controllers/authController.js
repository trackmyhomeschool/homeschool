const Otp = require('../models/Otp');
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const State = require('../models/State');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Login
exports.login = async (req, res) => {
  const { emailOrUsername, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        username: user.username,
        state: user.state
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
};


exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // --- Calculate trial and premium status ---
  let isTrial = false;
  let isPremium = false;

  // User is in trial if trialEndsAt exists and is in the future
  if (req.user.trialEndsAt && new Date(req.user.trialEndsAt) > new Date()) {
    isTrial = true;
  }

  // User is premium if isSubscribed is true and (no expiry or not expired)
  if (req.user.isSubscribed && (!req.user.subscriptionEndsAt || new Date(req.user.subscriptionEndsAt) > new Date())) {
    isPremium = true;
  }

  res.json({
    id: req.user._id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    username: req.user.username,
    state: req.user.state,
    minCreditsRequired: req.user.minCreditsRequired,
    hoursPerCredit: req.user.hoursPerCredit,
    profilePicture: req.user.profilePicture || '',
    isTrial,
    isPremium
  });
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email?.includes('@')) return res.status(400).json({ message: 'Invalid email' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.deleteMany({ email }); 
  await Otp.create({ email, otp });

  try {
    const response = await resend.emails.send({
      from: `TrackMyHomeschool <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <p>Hi there,</p>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <br/>
        <p>Thanks,<br/>Track My Homeschool Team</p>
      `,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Failed to send OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

exports.verifyOtpAndRegister = async (req, res) => {
  const { firstName, lastName, email, username, password, state, otp } = req.body;

  const validOtp = await Otp.findOne({ email, otp });
  if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(400).json({ message: 'Email or username already exists' });

  // Use state as ObjectId
  const stateDoc = await State.findById(state);
  if (!stateDoc) return res.status(400).json({ message: 'Selected state is invalid' });

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    firstName,
    lastName,
    email,
    username,
    password: hashedPassword,
    state: stateDoc._id,
    minCreditsRequired: stateDoc.minCreditsRequired,
    hoursPerCredit: stateDoc.hoursPerCredit
  });

  await Otp.deleteMany({ email }); // clean up OTPs

  res.status(201).json({ message: 'User registered successfully' });
};


// Find user's email from username or email (for password reset)
exports.findUserEmail = async (req, res) => {
  let { usernameOrEmail } = req.body;
  if (!usernameOrEmail) {
    return res.status(400).json({ message: 'Username or email is required.' });
  }
  usernameOrEmail = usernameOrEmail.trim(); // <--- key line!
  console.log('Trimmed reset input:', usernameOrEmail);

  try {
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail },
        { username: usernameOrEmail }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ email: user.email });
  } catch (err) {
    return res.status(500).json({ message: 'Error looking up user.', error: err.message });
  }
};



// Verify OTP for password reset (not for registration!)
exports.verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }
  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    // OTP is valid, allow next step
    await Otp.deleteMany({ email }); // cleanup
    res.json({ message: 'OTP verified.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to verify OTP.', error: err.message });
  }
};

const passwordValidation = (pwd) => {
  return (
    pwd.length >= 6 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  );
};

// Reset password for user with verified OTP
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }
  if (!passwordValidation(newPassword)) {
    return res.status(400).json({ message: 'Password does not meet security requirements.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to reset password.', error: err.message });
  }
};


exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  const existing = await User.findOne({ email });
  if (!existing) {
    return res.status(400).json({ message: 'Email not found.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.deleteMany({ email }); 
  await Otp.create({ email, otp });

  try {
    const response = await resend.emails.send({
      from: `TrackMyHomeschool <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: 'Your Password Reset OTP Code',
      html: `
        <p>Hello,</p>
        <p>Your OTP for resetting your password is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <br/>
        <p>— Track My Homeschool Team</p>
      `,
    });

    console.log('Reset OTP email sent:', response.id);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending reset OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
