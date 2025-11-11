import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlane, FaUser, FaCloudSun, FaDollarSign, FaShare } from 'react-icons/fa';
import '../styles/Navbar.css';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaPlane /> TravelCompanion
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className={`navbar-link ${isActive('/')}`}>
              <FaHome className="navbar-icon" />
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/travel-plans" className={`navbar-link ${isActive('/travel-plans')}`}>
              <FaPlane className="navbar-icon" />
              Travel Plans
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/weather" className={`navbar-link ${isActive('/weather')}`}>
              <FaCloudSun className="navbar-icon" />
              Weather
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/currency" className={`navbar-link ${isActive('/currency')}`}>
              <FaDollarSign className="navbar-icon" />
              Currency
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/share" className={`navbar-link ${isActive('/share')}`}>
              <FaShare className="navbar-icon" />
              Share
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/profile" className={`navbar-link ${isActive('/profile')}`}>
              <FaUser className="navbar-icon" />
              Profile
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;