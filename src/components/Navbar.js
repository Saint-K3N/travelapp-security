import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlane, FaUser, FaCloudSun, FaDollarSign, FaShare, FaUserShield } from 'react-icons/fa';
import '../styles/Navbar.css';
import { auth } from '../config/firebase';
import { checkIfAdmin } from '../services/authService';

function Navbar() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        setIsLoggedIn(true);
        const adminStatus = await checkIfAdmin(user.uid);
        setIsAdmin(adminStatus);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };
    
    // Check on mount
    checkAdminStatus();
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(checkAdminStatus);
    
    return () => unsubscribe();
  }, []);

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
          {isLoggedIn && isAdmin && (
            <li className="navbar-item">
              <Link to="/admin" className={`navbar-link ${isActive('/admin')}`}>
                <FaUserShield className="navbar-icon" />
                Admin
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;