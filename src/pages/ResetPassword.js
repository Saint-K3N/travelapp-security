import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import { verifyResetCode, resetPassword } from '../services/authService';
import '../styles/Profile.css';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [oobCode, setOobCode] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [codeValid, setCodeValid] = useState(false);

  useEffect(() => {
    const code = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    if (!code || mode !== 'resetPassword') {
      setError('Invalid or expired password reset link.');
      setLoading(false);
      return;
    }

    setOobCode(code);
    verifyCode(code);
  }, [searchParams]);

  const verifyCode = async (code) => {
    try {
      const userEmail = await verifyResetCode(code);
      setEmail(userEmail);
      setCodeValid(true);
    } catch (err) {
      console.error('Error verifying reset code:', err);
      
      if (err.code === 'auth/expired-action-code') {
        setError('This password reset link has expired. Please request a new one.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('This password reset link is invalid or has already been used.');
      } else {
        setError('Unable to verify reset link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(oobCode, newPassword);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (err.code === 'auth/expired-action-code') {
        setError('This password reset link has expired. Please request a new one.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('This password reset link is invalid or has already been used.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile">
        <div className="container">
          <div className="login-container">
            <div className="login-box">
              <p>Verifying reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="profile">
        <div className="container">
          <div className="login-container">
            <div className="login-box">
              <FaCheckCircle style={{ fontSize: '4rem', color: '#28a745', marginBottom: '1rem' }} />
              <h2>Password Reset Successful!</h2>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                Your password has been successfully reset.
              </p>
              <p style={{ marginBottom: '1.5rem', color: '#6c757d', fontSize: '0.95rem' }}>
                You can now login with your new password.
              </p>
              <div style={{ 
                backgroundColor: '#d4edda', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                border: '1px solid #28a745',
                fontSize: '0.9rem',
                color: '#155724'
              }}>
                Redirecting to login page in 3 seconds...
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="btn-primary btn-full"
              >
                Go to Login Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!codeValid) {
    return (
      <div className="profile">
        <div className="container">
          <div className="login-container">
            <div className="login-box">
              <FaExclamationTriangle style={{ fontSize: '4rem', color: '#dc3545', marginBottom: '1rem' }} />
              <h2>Invalid Reset Link</h2>
              <div style={{
                backgroundColor: '#fee',
                color: '#c33',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.95rem'
              }}>
                {error}
              </div>
              <p style={{ marginBottom: '1.5rem', color: '#6c757d', fontSize: '0.95rem' }}>
                Please request a new password reset link from the login page.
              </p>
              <button 
                onClick={() => navigate('/profile')}
                className="btn-primary btn-full"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="container">
        <div className="login-container">
          <div className="login-box">
            <FaLock className="login-icon" />
            <h2>Reset Your Password</h2>
            <p style={{ marginBottom: '1rem' }}>
              Resetting password for: <strong>{email}</strong>
            </p>
            
            {error && (
              <div style={{
                backgroundColor: '#fee',
                color: '#c33',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="newPassword">
                  <FaLock /> New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    required
                    minLength="6"
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
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaLock /> Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength="6"
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
              </div>

              <button 
                type="submit" 
                className="btn-primary btn-full"
                disabled={submitting}
              >
                {submitting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <button 
              onClick={() => navigate('/profile')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4A90E2',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline',
                padding: '0.5rem 0',
                marginTop: '1rem'
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;