import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About TravelCompanion</h3>
            <p>
              Your ultimate travel planning companion. Plan your trips, check weather conditions,
              convert currencies, and share your adventures with friends and family.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/travel-plans">Travel Plans</Link></li>
              <li><Link to="/weather">Weather Forecast</Link></li>
              <li><Link to="/currency">Currency Exchange</Link></li>
              <li><Link to="/share">Share Your Journey</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>Email: uiexperiencecoursework@gmail.com</p>
            <p>Phone: +1PLEASEDONTCALL</p>
            <p>Address: INTI International College Penang, Malaysia</p>
          </div>
          
          <div className="footer-section">
            <h3>Follow Us</h3>
            <p>Stay connected with us on social media</p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook className="social-icon" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="social-icon" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter className="social-icon" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="social-icon" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 TravelCompanion. All rights reserved. | Designed with ❤️ for travelers</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;