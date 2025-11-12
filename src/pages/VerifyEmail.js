import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { verifyEmail } from '../services/authService';
import '../styles/Profile.css';

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const code = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    if (!code || mode !== 'verifyEmail') {
      setError('Invalid or missing verification link.');
      setLoading(false);
      return;
    }

    verifyEmailCode(code);
  }, [searchParams]);

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      navigate('/profile');
    }
  }, [success, countdown, navigate]);

  const verifyEmailCode = async (code) => {
    try {
      await verifyEmail(code);
      setSuccess(true);
      
      // Store verification success message
      sessionStorage.setItem('emailVerified', 'true');
    } catch (err) {
      console.error('Email verification error:', err);
      
      if (err.code === 'auth/expired-action-code') {
        setError('This verification link has expired. Please request a new verification email.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('This verification link is invalid or has already been used.');
      } else {
        setError('Failed to verify email. Please try again or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile">
        <div className="container">
          <div className="login-container">
            <div className="login-box">
              <FaSpinner style={{ fontSize: '4rem', color: '#4A90E2', marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
              <h2>Verifying Your Email...</h2>
              <p style={{ color: '#6c757d' }}>Please wait while we verify your email address.</p>
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
              <h2>Email Verified Successfully! ✓</h2>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
                Your email has been successfully verified.
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
                <strong>✓ Account Activated!</strong>
                <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  You can now log in to your account.
                </p>
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                color: '#6c757d'
              }}>
                Redirecting to login in <strong style={{ color: '#4A90E2', fontSize: '1.2rem' }}>{countdown}</strong> seconds...
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

  return (
    <div className="profile">
      <div className="container">
        <div className="login-container">
          <div className="login-box">
            <FaExclamationTriangle style={{ fontSize: '4rem', color: '#dc3545', marginBottom: '1rem' }} />
            <h2>Verification Failed</h2>
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
              If you need a new verification link, please try logging in and we'll send you a new one.
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

export default VerifyEmail;