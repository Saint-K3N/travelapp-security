import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEdit, FaSave, FaTimes, FaSignOutAlt, FaSignInAlt, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { loginUser, logoutUser, getUserData, updateUserProfile, checkUserExists } from '../services/authService';
import { 
  isAccountLocked, 
  recordFailedAttempt, 
  resetAttempts, 
  getRemainingAttempts,
  formatTime 
} from '../services/LoginAttemptService';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    profilePic: 'https://via.placeholder.com/150'
  });
  const [editForm, setEditForm] = useState({ ...profile });
  const [previewImage, setPreviewImage] = useState(profile.profilePic);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Account lockout states
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  // Debug: Log state changes
  useEffect(() => {
    console.log('State updated - remainingAttempts:', remainingAttempts, 'isLocked:', isLocked, 'lockoutTime:', lockoutTime);
  }, [remainingAttempts, isLocked, lockoutTime]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        
        // Reset attempts on successful auth
        if (loginForm.email) {
          resetAttempts(loginForm.email);
        }
        
        // Fetch user data from Firestore
        try {
          const userData = await getUserData(user.uid);
          if (userData) {
            const profileData = {
              username: userData.username || user.displayName || 'User',
              email: userData.email || user.email,
              profilePic: userData.profilePic || 'https://via.placeholder.com/150'
            };
            setProfile(profileData);
            setEditForm(profileData);
            setPreviewImage(profileData.profilePic);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loginForm.email]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || lockoutTime <= 0) return;

    const timer = setInterval(() => {
      setLockoutTime((prevTime) => {
        if (prevTime <= 1) {
          setIsLocked(false);
          setRemainingAttempts(3);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockoutTime]);

  // Check lockout status on component mount and when email changes
  useEffect(() => {
    if (loginForm.email) {
      const lockStatus = isAccountLocked(loginForm.email);
      if (lockStatus.locked) {
        setIsLocked(true);
        setLockoutTime(lockStatus.remainingTime);
      } else {
        const remaining = getRemainingAttempts(loginForm.email);
        setRemainingAttempts(remaining);
      }
    }
  }, [loginForm.email]);

  // Clear success messages after they're shown
  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.removeItem('registrationSuccess');
      sessionStorage.removeItem('registrationEmail');
      sessionStorage.removeItem('emailVerified');
    }
  }, [isLoggedIn]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
    setError('');
    
    // Only check lockout status when email changes, don't reset attempts display
    if (name === 'email' && value) {
      const lockStatus = isAccountLocked(value);
      if (lockStatus.locked) {
        setIsLocked(true);
        setLockoutTime(lockStatus.remainingTime);
        setError(`Account is locked. Please wait ${formatTime(lockStatus.remainingTime)} before trying again.`);
      } else {
        setIsLocked(false);
        setLockoutTime(0);
        // Only update remaining attempts if it's different from current
        const remaining = getRemainingAttempts(value);
        if (remaining !== remainingAttempts) {
          setRemainingAttempts(remaining);
        }
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check if account is locked
    const lockStatus = isAccountLocked(loginForm.email);
    if (lockStatus.locked) {
      setIsLocked(true);
      setLockoutTime(lockStatus.remainingTime);
      setError(`Account is locked. Please wait ${formatTime(lockStatus.remainingTime)} before trying again.`);
      return;
    }

    setLoading(true);

    try {
      // First, check if user exists in Firestore
      const userExists = await checkUserExists(loginForm.email);
      
      if (!userExists) {
        // User not found - don't trigger lockout system
        setError('No such user found. Please check your email or register a new account.');
        setRemainingAttempts(3); // Keep at 3 attempts
        setLoading(false);
        return;
      }

      // User exists, attempt login
      await loginUser(loginForm.email, loginForm.password);
      
      // Reset attempts on successful login
      resetAttempts(loginForm.email);
      setLoginForm({ email: '', password: '' });
      setRemainingAttempts(3);
      setError('');
    } catch (err) {
      console.error('Login error:', err);
      
      // At this point, we know user exists, so this must be wrong password
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        // Wrong password - trigger lockout system
        console.log('Wrong password detected, recording failed attempt for:', loginForm.email); // Debug
        const attemptResult = recordFailedAttempt(loginForm.email);
        console.log('Attempt result:', attemptResult); // Debug
        
        if (attemptResult.locked) {
          console.log('Setting locked state with time:', attemptResult.remainingTime); // Debug
          setIsLocked(true);
          setLockoutTime(attemptResult.remainingTime);
          setError(`Too many failed attempts. Account locked for 2 minutes.`);
        } else {
          console.log('Setting remaining attempts to:', attemptResult.remainingAttempts); // Debug
          setRemainingAttempts(attemptResult.remainingAttempts);
          setError(`Incorrect password. ${attemptResult.remainingAttempts} attempt${attemptResult.remainingAttempts !== 1 ? 's' : ''} remaining.`);
        }
      } else if (err.code === 'auth/invalid-email') {
        // Invalid email format
        setError('Invalid email address format.');
        setRemainingAttempts(3);
      } else {
        // Other auth errors - trigger lockout system as safety measure
        const attemptResult = recordFailedAttempt(loginForm.email);
        
        if (attemptResult.locked) {
          setIsLocked(true);
          setLockoutTime(attemptResult.remainingTime);
          setError(`Too many failed attempts. Account locked for 2 minutes.`);
        } else {
          setRemainingAttempts(attemptResult.remainingAttempts);
          setError(`Login failed. ${attemptResult.remainingAttempts} attempt${attemptResult.remainingAttempts !== 1 ? 's' : ''} remaining.`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setProfile({
        username: '',
        email: '',
        profilePic: 'https://via.placeholder.com/150'
      });
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed. Please try again.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleImageChange = (e) => {
    const { value } = e.target;
    setEditForm({ ...editForm, profilePic: value });
    setPreviewImage(value || 'https://via.placeholder.com/150');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (currentUser) {
        await updateUserProfile(currentUser.uid, editForm);
        setProfile(editForm);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({ ...profile });
    setPreviewImage(profile.profilePic);
    setIsEditing(false);
    setError('');
  };

  if (loading && !currentUser) {
    return (
      <div className="profile">
        <div className="container">
          <div className="login-container">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="profile">
        <div className="container">
          <div className="login-container">
            <div className="login-box">
              <FaUser className="login-icon" />
              <h2>Welcome Back!</h2>
              <p>Please login to access your profile</p>

              {/* Registration Success Message */}
              {sessionStorage.getItem('registrationSuccess') === 'true' && (
                <div style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.95rem',
                  border: '1px solid #28a745',
                  textAlign: 'left'
                }}>
                  <strong>✓ Registration Successful!</strong>
                  <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    We've sent a verification email to:
                  </p>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {sessionStorage.getItem('registrationEmail')}
                  </p>
                  <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>
                    Please check your inbox and click the verification link before logging in.
                  </p>
                </div>
              )}
              
              {/* Email Verified Success Message */}
              {sessionStorage.getItem('emailVerified') === 'true' && (
                <div style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.95rem',
                  border: '1px solid #28a745'
                }}>
                  <strong>✓ Email Verified!</strong>
                  <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                    Your account is now active. You can log in below.
                  </p>
                </div>
              )}
              
              {/* Account Locked Warning */}
              {isLocked && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.95rem',
                  border: '2px solid #ffc107',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaExclamationTriangle style={{ fontSize: '1.5rem' }} />
                  <div>
                    <strong>Account Temporarily Locked</strong>
                    <div style={{ marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#d39e00' }}>
                      {formatTime(lockoutTime)}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Too many failed login attempts. Please wait before trying again.
                    </div>
                  </div>
                </div>
              )}
              
              {error && !isLocked && (
                <div className="error-message" style={{
                  backgroundColor: error.includes('verify your email') ? '#fff3cd' : '#fee',
                  color: error.includes('verify your email') ? '#856404' : '#c33',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  border: error.includes('verify your email') ? '1px solid #ffc107' : 'none'
                }}>
                  {error.includes('verify your email') ? (
                    <>
                      <strong>⚠️ Email Not Verified</strong>
                      <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        {error}
                      </p>
                      <p style={{ marginBottom: 0, fontSize: '0.85rem', fontStyle: 'italic' }}>
                        Check your inbox for the verification email. Don't forget to check spam/junk folders!
                      </p>
                    </>
                  ) : (
                    error
                  )}
                </div>
              )}
              
              {/* Remaining Attempts Warning */}
              {!isLocked && remainingAttempts < 3 && remainingAttempts > 0 && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  border: '1px solid #ffc107'
                }}>
                  <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                  <strong>Warning:</strong> {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before account lockout
                </div>
              )}
              
              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope /> Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    placeholder="Enter your email"
                    required
                    disabled={isLocked}
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
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password"
                      required
                      disabled={isLocked}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLocked}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        color: '#6c757d',
                        fontSize: '1.1rem',
                        opacity: isLocked ? 0.5 : 1
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary btn-full" 
                  disabled={loading || isLocked}
                >
                  <FaSignInAlt /> {loading ? 'Logging in...' : isLocked ? 'Account Locked' : 'Login'}
                </button>
              </form>
              <button 
                onClick={() => navigate('/forgot-password')}
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
                Forgot Password?
              </button>

              <div className="credentials-hint">
                <p><strong>Demo Account:</strong></p>
                <p>Create an account first or use Firebase Authentication</p>
                <button 
                  onClick={() => navigate('/register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4A90E2',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    textDecoration: 'underline',
                    padding: '0.5rem 0',
                    marginTop: '0.5rem'
                  }}
                >
                  Don't have an account? Sign up here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="container">
        <div className="page-header">
          <h1>My Profile</h1>
          <button className="btn-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {successMessage && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            borderLeft: '4px solid #28a745'
          }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            borderLeft: '4px solid #c33'
          }}>
            {error}
          </div>
        )}

        <div className="profile-content-single">
          <div className="profile-card">
            <div className="profile-picture-section">
              <img 
                src={previewImage} 
                alt="Profile" 
                className="profile-picture"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
              {!isEditing && (
                <button 
                  className="btn-edit-profile"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="profile-form">
                <div className="form-group">
                  <label htmlFor="username">
                    <FaUser /> Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="profilePic">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    id="profilePic"
                    name="profilePic"
                    value={editForm.profilePic}
                    onChange={handleImageChange}
                    placeholder="https://example.com/image.jpg"
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
                    value={editForm.email}
                    onChange={handleEditChange}
                    disabled
                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                    Email cannot be changed
                  </small>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleCancel}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <FaUser className="info-icon" />
                  <div>
                    <label>Username</label>
                    <p>{profile.username}</p>
                  </div>
                </div>

                <div className="info-item">
                  <FaEnvelope className="info-icon" />
                  <div>
                    <label>Email</label>
                    <p>{profile.email}</p>
                  </div>
                </div>

                <div className="info-item">
                  <FaLock className="info-icon" />
                  <div>
                    <label>Password</label>
                    <p>••••••••</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;