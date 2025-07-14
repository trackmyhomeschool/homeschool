import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import './RegisterModal.css';

function RegisterModal({ show, handleClose, onOpenLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    state: ''
  });

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false
  });
  const [isEditing, setIsEditing] = useState(false); // <-- CHANGED

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/states`)
      .then(res => setStateOptions(res.data || []))
      .catch(err => console.error('Error fetching states:', err));
  }, []);

  // Password validation function
  const validatePassword = (pwd) => ({
    length: pwd.length >= 6,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
    if (name === 'password') {
      setPasswordValid(validatePassword(value));
    }
  };

  const sendOtp = async () => {
    try {
      setResendDisabled(true);
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/send-otp`, { email: formData.email });
      setIsOtpSent(true);
      setIsEditing(false); // <-- CHANGED
      setSuccess('OTP sent to your email');
      setTimeout(() => setResendDisabled(false), 15000); // 15 seconds cooldown
    } catch (err) {
      setError('Failed to send OTP');
      setResendDisabled(false);
    }
  };

  const verifyOtpAndRegister = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    const valid = validatePassword(formData.password);
    if (!valid.length || !valid.upper || !valid.lower || !valid.special) {
      setError('Password does not meet all requirements.');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-otp`, {
        ...formData,
        otp
      }, { withCredentials: true });

      setSuccess('Registration successful!');
      setError('');
      setOtpAttempts(0);

      setTimeout(() => {
        setFormData({ firstName: '', lastName: '', email: '', username: '', password: '', state: '' });
        setOtp('');
        setIsOtpSent(false);
        setPasswordValid({ length: false, upper: false, lower: false, special: false });
        setIsEditing(false); // <-- CHANGED
        handleClose();
        onOpenLogin();
      }, 1000);

    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed';

      setOtpAttempts(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setError('Too many incorrect attempts. Please try again.');
          setTimeout(() => {
            setOtpAttempts(0);
            setOtp('');
            setError('');
            setSuccess('');
            setIsOtpSent(false);
            setIsEditing(false); // <-- CHANGED
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              username: '',
              password: '',
              state: ''
            });
            setPasswordValid({ length: false, upper: false, lower: false, special: false });
          }, 3000);
        } else {
          const attemptsLeft = 3 - newCount;
          setError(`${msg}. You have ${attemptsLeft} attempt(s) left.`);
        }
        return newCount;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const valid = validatePassword(formData.password);
    if (!valid.length || !valid.upper || !valid.lower || !valid.special) {
      setError('Password does not meet all requirements.');
      return;
    }
    await sendOtp();
  };

  const handleTryAgain = () => {
    setOtpAttempts(0);
    setOtp('');
    setError('');
    setSuccess('');
    setIsOtpSent(false);
    setIsEditing(false); // <-- CHANGED
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      state: ''
    });
    setPasswordValid({ length: false, upper: false, lower: false, special: false });
  };

  const handleEditDetails = () => {
    setIsEditing(true); // <-- CHANGED
    setSuccess('');
    setError('');
  };

  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName="custom-modal-width" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Sign Up</Modal.Title>
      </Modal.Header>

      <Form onSubmit={(e) => (isOtpSent && !isEditing) ? verifyOtpAndRegister(e) : handleSubmit(e)}>
        <Modal.Body>
          <Row className="mb-3">
            <Col>
              <Form.Control
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isOtpSent && !isEditing}
              />
            </Col>
            <Col>
              <Form.Control
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isOtpSent && !isEditing}
              />
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Control
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isOtpSent && !isEditing}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isOtpSent && !isEditing}
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
                disabled={isOtpSent && !isEditing}
              />
              <InputGroup.Text
                onClick={() => setShowPassword(prev => !prev)}
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          {!isOtpSent && (
            <div className="mb-2" style={{ fontSize: '0.95rem' }}>
              {!passwordValid.upper && (
                <span style={{ color: 'red' }}>• At least 1 uppercase letter<br /></span>
              )}
              {!passwordValid.lower && (
                <span style={{ color: 'red' }}>• At least 1 lowercase letter<br /></span>
              )}
              {!passwordValid.special && (
                <span style={{ color: 'red' }}>• At least 1 special character<br /></span>
              )}
              {!passwordValid.length && (
                <span style={{ color: 'red' }}>• Minimum 6 characters<br /></span>
              )}
            </div>
          )}

          <Form.Group>
            <Form.Select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              disabled={isOtpSent && !isEditing}
            >
              <option value="">Select your state</option>
              {stateOptions.map((state) => (
                <option key={state._id} value={state._id}>
                  {state.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* OTP and controls */}
          {isOtpSent && !isEditing && (
            <>
              <Form.Group className="mt-3">
                <Form.Control
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </Form.Group>

              {/* Row for Edit Details and Resend OTP */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <Button
                  variant="link"
                  className="p-0"
                  style={{ fontWeight: 500 }}
                  onClick={handleEditDetails}
                >
                  Edit Details
                </Button>
                <Button
                  variant="link"
                  className="p-0"
                  onClick={sendOtp}
                  disabled={otpAttempts >= 3 || resendDisabled}
                >
                  Resend OTP
                </Button>
              </div>

              {otpAttempts >= 3 && (
                <div className="d-flex justify-content-center mt-2">
                  <Button variant="secondary" onClick={handleTryAgain}>
                    Try Again
                  </Button>
                </div>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between align-items-center">
          <span
            style={{ cursor: 'pointer', color: '#0d6efd' }}
            onClick={() => {
              handleClose();
              onOpenLogin();
            }}
          >
            Already have an account?
          </span>
          <Button variant="primary" type="submit">
            {(isOtpSent && !isEditing) ? 'Verify & Register' : 'Sign Up'}
          </Button>
        </Modal.Footer>

        {error && <p className="text-danger text-center mt-2">{error}</p>}
        {success && <p className="text-success text-center mt-2">{success}</p>}
      </Form>
    </Modal>
  );
}

export default RegisterModal;
