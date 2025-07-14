import React, { useState } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginModal({ show, handleClose, onOpenRegister }) {
  const [formData, setFormData] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetStep, setResetStep] = useState(0); // 0: login, 1: enter username, 2: enter otp, 3: enter new password
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetPasswordShown, setResetPasswordShown] = useState(false);
  const [resetPasswordValid, setResetPasswordValid] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false
  });
  const [otpSuccess, setOtpSuccess] = useState('');
  const navigate = useNavigate();

  // --- LOGIN HANDLING ---
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, formData, {
        withCredentials: true
      });
      setSuccess('Login successful!');
      setError('');
      setFormData({ emailOrUsername: '', password: '' });
      handleClose();
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials');
      setSuccess('');
    }
  };

  // --- RESET PASSWORD HANDLING ---
  const handleResetStep0 = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Trim input before sending to backend
      const trimmedInput = resetUsername.trim();
      if (!trimmedInput) {
        setError('Please enter your username or email.');
        return;
      }
      // 1. Find user by username/email
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/find-user-email`, {
        usernameOrEmail: trimmedInput
      });
      console.log("DEBUG: /find-user-email response:", res.data);

      if (!res.data || !res.data.email) {
        setError('User not found (no email in response).');
        return;
      }
      setResetEmail(res.data.email);

      // 2. Send OTP to email
      const sendOtpRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/send-reset-otp`, { email: res.data.email });
      console.log("DEBUG: /send-reset-otp response:", sendOtpRes.data);

      setResetStep(2); // move to OTP
      setSuccess('OTP sent to your email!');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Try again.');
      }
      console.error("DEBUG: Error in reset step 0:", err);
    }
  };

  const handleResetStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-reset-otp`, {
        email: resetEmail,
        otp: resetOtp
      });
      setResetStep(3); // move to new password
      setSuccess('OTP verified! Now set a new password.');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  // Password validation logic (reused for reset & signup)
  const validatePassword = (pwd) => ({
    length: pwd.length >= 6,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  });

  const handleResetPasswordChange = (e) => {
    const val = e.target.value;
    setResetNewPassword(val);
    setResetPasswordValid(validatePassword(val));
    setError('');
    setSuccess('');
  };

  const handleResetStep3 = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const valid = validatePassword(resetNewPassword);
    if (!valid.length || !valid.upper || !valid.lower || !valid.special) {
      setError('Password does not meet all requirements.');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        email: resetEmail,
        newPassword: resetNewPassword
      });
      setSuccess('Password reset successful! Please login.');
      setTimeout(() => {
        setResetStep(0);
        setResetUsername('');
        setResetEmail('');
        setResetOtp('');
        setResetNewPassword('');
        setResetPasswordValid({
          length: false,
          upper: false,
          lower: false,
          special: false
        });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  // --- MODAL BODY ---
  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName="custom-modal-width">
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>

      <Form onSubmit={
        resetStep === 0 ? handleSubmit :
        resetStep === 1 ? handleResetStep0 :
        resetStep === 2 ? handleResetStep2 :
        handleResetStep3
      }>
        <Modal.Body>
          {/* --- NORMAL LOGIN FORM --- */}
          {resetStep === 0 && (
            <>
              <Form.Group className="mb-3">
                <Form.Control
                  name="emailOrUsername"
                  placeholder="Email or Username"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <InputGroup.Text
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{ cursor: 'pointer' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button
                  variant="link"
                  className="p-0"
                  style={{ fontSize: '0.97rem' }}
                  onClick={() => {
                    setResetStep(1);
                    setError('');
                    setSuccess('');
                  }}
                >
                  Forgot/Reset Password?
                </Button>
              </div>
            </>
          )}

          {/* --- RESET STEP 1: Enter Username --- */}
          {resetStep === 1 && (
            <>
              <Form.Group className="mb-3">
                <Form.Control
                  placeholder="Enter your username or email"
                  value={resetUsername}
                  onChange={e => setResetUsername(e.target.value)}
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setResetStep(0)}>Back</Button>
                <Button type="submit" variant="primary">Send OTP</Button>
              </div>
            </>
          )}

          {/* --- RESET STEP 2: Enter OTP --- */}
          {resetStep === 2 && (
            <>
              <Form.Group className="mb-3">
                <Form.Control
                  placeholder="Enter OTP sent to your email"
                  value={resetOtp}
                  onChange={e => setResetOtp(e.target.value)}
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setResetStep(0)}>Back</Button>
                <Button type="submit" variant="primary">Verify OTP</Button>
              </div>
            </>
          )}

          {/* --- RESET STEP 3: New Password --- */}
          {resetStep === 3 && (
            <>
              <Form.Group className="mb-2">
                <InputGroup>
                  <Form.Control
                    type={resetPasswordShown ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={resetNewPassword}
                    onChange={handleResetPasswordChange}
                    required
                  />
                  <InputGroup.Text
                    onClick={() => setResetPasswordShown(prev => !prev)}
                    style={{ cursor: 'pointer' }}
                  >
                    {resetPasswordShown ? '🙈' : '👁️'}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
              {/* Password validations */}
              <div className="mb-2" style={{ fontSize: '0.95rem' }}>
                <span style={{ color: resetPasswordValid.upper ? 'green' : 'red' }}>• At least 1 uppercase letter</span><br />
                <span style={{ color: resetPasswordValid.lower ? 'green' : 'red' }}>• At least 1 lowercase letter</span><br />
                <span style={{ color: resetPasswordValid.special ? 'green' : 'red' }}>• At least 1 special character</span><br />
                <span style={{ color: resetPasswordValid.length ? 'green' : 'red' }}>• Minimum 6 characters</span>
              </div>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setResetStep(0)}>Back</Button>
                <Button type="submit" variant="primary">Set Password</Button>
              </div>
            </>
          )}
        </Modal.Body>

        {/* Footer for login and create account */}
        {resetStep === 0 && (
          <Modal.Footer className="d-flex justify-content-between align-items-center">
            <span
              style={{ cursor: 'pointer', color: '#0d6efd' }}
              onClick={() => {
                handleClose();
                onOpenRegister();
              }}
            >
              Create Account
            </span>
            <Button variant="primary" type="submit">Login</Button>
          </Modal.Footer>
        )}

        {error && <p className="text-danger text-center mt-2">{error}</p>}
        {(success || otpSuccess) && <p className="text-success text-center mt-2">{success || otpSuccess}</p>}
      </Form>
    </Modal>
  );
}

export default LoginModal;
