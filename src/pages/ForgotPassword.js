import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { sendPasswordReset } from '../services/authService';
import '../styles/Profile.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="profile">
        <div className="container">
          <div className="login-container">
            <div className="login-box">
              <FaCheckCircle style={{ fontSize: '4rem', color: '#28a745', marginBottom: '1rem' }} />
              <h2>Check Your Email</h2>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                We've sent a password reset link to:
              </p>
              <p style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>
                {email}
              </p>
              <div style={{ 
                backgroundColor: '#d4edda', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                border: '1px solid #28a745',
                fontSize: '0.9rem',
                color: '#155724',
                textAlign: 'left',
                lineHeight: '1.6'
              }}>
                <strong>Next Steps:</strong>
                <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>Check your email inbox</li>
                  <li>Click the reset link in the email</li>
                  <li>Create your new password</li>
                </ol>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1.5rem' }}>
                Didn't receive the email? Check your spam folder.
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
            <FaEnvelope className="login-icon" />
            <h2>Forgot Password?</h2>
            <p style={{ marginBottom: '1.5rem', color: '#6c757d' }}>
              Enter your email address and we'll send you a link to reset your password.
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
                <label htmlFor="email">
                  <FaEnvelope /> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;