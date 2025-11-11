import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { registerUser } from '../services/authService';
import '../styles/Register.css';

function Register() {
  const navigate = useNavigate();
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('At least 6 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least 1 uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least 1 lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('At least 1 number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least 1 special character (!@#$%^&*...)');
    }
    
    return errors;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({ ...registerForm, [name]: value });
    setError('');

    // Real-time password validation
    if (name === 'password') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email format
    if (!validateEmail(registerForm.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    const passwordValidationErrors = validatePassword(registerForm.password);
    if (passwordValidationErrors.length > 0) {
      setError('Password does not meet requirements');
      setPasswordErrors(passwordValidationErrors);
      return;
    }

    // Check if passwords match
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check if username is provided
    if (!registerForm.username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);

    try {
      await registerUser(registerForm.email, registerForm.password, registerForm.username);
      // Registration successful, navigate to profile
      navigate('/profile');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered. Please login instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="register-container">
          <div className="register-box">
            <FaUserPlus className="register-icon" />
            <h2>Create Account</h2>
            <p>Sign up to start planning your travel adventures</p>
            
            {error && (
              <div className="register-error">
                {error}
              </div>
            )}
            
            <form onSubmit={handleRegister} className="register-form">
              <div className="form-group">
                <label htmlFor="username">
                  <FaUser /> Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={registerForm.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <FaLock /> Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6c757d',
                      fontSize: '1.1rem'
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {registerForm.password && (
                  <div className="password-requirements">
                    <div className="requirements-title">
                      Password Requirements:
                    </div>
                    {passwordErrors.length > 0 ? (
                      <ul>
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="all-met">
                        ✓ All requirements met!
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaLock /> Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6c757d',
                      fontSize: '1.1rem'
                    }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                  <div className="password-match-indicator error">
                    Passwords do not match
                  </div>
                )}
                
                {registerForm.confirmPassword && registerForm.password === registerForm.confirmPassword && (
                  <div className="password-match-indicator success">
                    ✓ Passwords match
                  </div>
                )}
              </div>

              <button type="submit" className="btn-register" disabled={loading}>
                <FaUserPlus /> {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="login-link">
              <p>Already have an account?</p>
              <button 
                onClick={() => navigate('/profile')}
              >
                Login here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;