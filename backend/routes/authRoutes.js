const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { login, logout,getMe,sendOtp,verifyOtpAndRegister,findUserEmail,verifyResetOtp,sendResetOtp,resetPassword} = require('../controllers/authController');

router.post('/login', login);
router.post('/logout', logout);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpAndRegister);
router.post('/find-user-email', findUserEmail);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/send-reset-otp', sendResetOtp);
router.get('/me', protect, getMe);

module.exports = router;
