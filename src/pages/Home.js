import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaCloudSun, FaDollarSign, FaShare, FaUser, FaGlobe } from 'react-icons/fa';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to TravelCompanion</h1>
            <p className="hero-subtitle">
              Your all-in-one travel planning platform. Organize trips, check weather, 
              convert currencies, and share your adventures!
            </p>
            <Link to="/travel-plans" className="cta-button">
              Start Planning <FaPlane />
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Explore Our Features</h2>
          <div className="features-grid">
            <Link to="/travel-plans" className="feature-card">
              <div className="feature-icon">
                <FaPlane />
              </div>
              <h3>Travel Plans</h3>
              <p>Create and manage your travel itineraries with ease. Add destinations, dates, and details.</p>
            </Link>

            <Link to="/weather" className="feature-card">
              <div className="feature-icon">
                <FaCloudSun />
              </div>
              <h3>Weather Forecast</h3>
              <p>Check real-time weather conditions for any destination worldwide before you travel.</p>
            </Link>

            <Link to="/currency" className="feature-card">
              <div className="feature-icon">
                <FaDollarSign />
              </div>
              <h3>Currency Exchange</h3>
              <p>Convert currencies instantly with live exchange rates to plan your budget.</p>
            </Link>

            <Link to="/share" className="feature-card">
              <div className="feature-icon">
                <FaShare />
              </div>
              <h3>Share Journey</h3>
              <p>Share your travel experiences on social media platforms with friends and family.</p>
            </Link>

            <Link to="/profile" className="feature-card">
              <div className="feature-icon">
                <FaUser />
              </div>
              <h3>Your Profile</h3>
              <p>Manage your account settings, preferences, and personal information securely.</p>
            </Link>

            <div className="feature-card">
              <div className="feature-icon">
                <FaGlobe />
              </div>
              <h3>Global Coverage</h3>
              <p>Access information for destinations worldwide with comprehensive travel data.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>195+</h3>
              <p>Countries Covered</p>
            </div>
            <div className="stat-item">
              <h3>10K+</h3>
              <p>Happy Travelers</p>
            </div>
            <div className="stat-item">
              <h3>50K+</h3>
              <p>Trips Planned</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Support Available</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;