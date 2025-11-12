/**
 * SessionTimeoutWarning Component
 * Displays a warning modal when the user's session is about to expire
 * Gives the user the option to extend the session or logout
 */

import React from 'react';
import { FaExclamationTriangle, FaClock } from 'react-icons/fa';
import '../styles/SessionTimeoutWarning.css';

const SessionTimeoutWarning = ({ 
  show, 
  timeRemaining, 
  onExtendSession, 
  onLogout,
  formatTimeRemaining 
}) => {
  if (!show) return null;

  const inactivityRemaining = timeRemaining?.inactivityRemaining || 0;
  const formattedTime = formatTimeRemaining(inactivityRemaining);

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-modal">
        <div className="session-warning-header">
          <FaExclamationTriangle className="warning-icon" />
          <h2>Session Expiring Soon</h2>
        </div>
        
        <div className="session-warning-body">
          <div className="warning-clock">
            <FaClock className="clock-icon" />
            <span className="time-display">{formattedTime}</span>
          </div>
          
          <p>
            Your session will expire in <strong>{formattedTime}</strong> due to inactivity.
          </p>
          
          <p className="warning-message">
            You will be automatically logged out for your security. 
            Click "Stay Logged In" to continue your session.
          </p>
        </div>
        
        <div className="session-warning-actions">
          <button 
            className="btn-extend-session"
            onClick={onExtendSession}
          >
            Stay Logged In
          </button>
          
          <button 
            className="btn-logout-now"
            onClick={onLogout}
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
