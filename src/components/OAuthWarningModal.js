import React from 'react';
import { FaExclamationTriangle, FaTimes, FaShieldAlt, FaKey, FaLock } from 'react-icons/fa';
import '../styles/OAuthWarningModal.css';

function OAuthWarningModal({ platform, onConfirm, onCancel }) {
  return (
    <div className="oauth-modal-overlay" onClick={onCancel}>
      <div className="oauth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>
          <FaTimes />
        </button>

        <div className="modal-header">
          <FaShieldAlt className="modal-icon" />
          <h2>Connect to {platform}?</h2>
        </div>

        <div className="modal-content">
          <div className="warning-banner">
            <FaExclamationTriangle />
            <p>You are about to authorize TravelCompanion to access your {platform} account</p>
          </div>

          <div className="permissions-section">
            <h3>This app will be able to:</h3>
            <ul className="permissions-list">
              <li>
                <FaKey className="permission-icon" />
                <span>Access your basic profile information</span>
              </li>
              <li>
                <FaKey className="permission-icon" />
                <span>Post content on your behalf</span>
              </li>
              {platform === 'Facebook' && (
                <li>
                  <FaKey className="permission-icon" />
                  <span>Access your email address</span>
                </li>
              )}
              {platform === 'Twitter' && (
                <li>
                  <FaKey className="permission-icon" />
                  <span>Read and write tweets</span>
                </li>
              )}
            </ul>
          </div>

          <div className="security-info">
            <FaLock className="security-icon" />
            <div>
              <h4>Your security is important</h4>
              <p>
                We will never access your password. You can revoke access at any time 
                from your {platform} account settings.
              </p>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn-authorize" onClick={onConfirm}>
              Authorize & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OAuthWarningModal;