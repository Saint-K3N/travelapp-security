import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaCalendar, FaShare, FaLock, FaCopy, FaCheck } from 'react-icons/fa';
import { FacebookShareButton, TwitterShareButton, FacebookIcon, TwitterIcon } from 'react-share';
import DatePicker from 'react-datepicker';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  addTravelPlan, 
  getUserTravelPlans, 
  updateTravelPlan, 
  deleteTravelPlan 
} from '../services/travelPlansService';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/TravelPlans.css';

function TravelPlans() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [shareModalPlan, setShareModalPlan] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    country: '',
    description: '',
    startDate: new Date(),
    endDate: new Date()
  });

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'France', 'Germany', 
    'Italy', 'Spain', 'Japan', 'China', 'Australia', 'Brazil', 
    'Mexico', 'India', 'South Korea', 'Thailand', 'Singapore',
    'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'New Zealand',
    'Switzerland', 'Netherlands', 'Sweden', 'Norway', 'Denmark'
  ].sort();

  // Check login status and load plans
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        await loadTravelPlans(user.uid);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setPlans([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadTravelPlans = async (userId) => {
    try {
      const userPlans = await getUserTravelPlans(userId);
      setPlans(userPlans);
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Failed to load travel plans');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must be logged in to create travel plans');
      return;
    }
    
    try {
      if (editingId) {
        await updateTravelPlan(editingId, formData);
        // Reload plans
        await loadTravelPlans(currentUser.uid);
        setEditingId(null);
      } else {
        await addTravelPlan(currentUser.uid, formData);
        // Reload plans
        await loadTravelPlans(currentUser.uid);
      }

      setFormData({
        title: '',
        country: '',
        description: '',
        startDate: new Date(),
        endDate: new Date()
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error saving plan:', err);
      setError('Failed to save travel plan. Please try again.');
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      title: plan.title,
      country: plan.country,
      description: plan.description,
      startDate: plan.startDate,
      endDate: plan.endDate
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this travel plan?')) {
      try {
        await deleteTravelPlan(id);
        // Reload plans
        if (currentUser) {
          await loadTravelPlans(currentUser.uid);
        }
      } catch (err) {
        console.error('Error deleting plan:', err);
        setError('Failed to delete travel plan. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      country: '',
      description: '',
      startDate: new Date(),
      endDate: new Date()
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const openShareModal = (plan) => {
    setShareModalPlan(plan);
  };

  const closeShareModal = () => {
    setShareModalPlan(null);
    setCopied(false);
  };

  const copyToClipboard = () => {
    const text = `🌍 ${shareModalPlan.title}

📍 Destination: ${shareModalPlan.country}
📅 ${formatDate(shareModalPlan.startDate)} → ${formatDate(shareModalPlan.endDate)}

${shareModalPlan.description || 'Planning an amazing adventure!'}

#TravelCompanion #Travel #${shareModalPlan.country.replace(/\s/g, '')}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="travel-plans">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="travel-plans">
        <div className="container">
          <div className="login-required">
            <FaLock className="lock-icon" />
            <h2>Login Required</h2>
            <p>Please login to access your travel plans</p>
            <button className="btn-primary" onClick={() => navigate('/profile')}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="travel-plans">
      <div className="container">
        <div className="page-header">
          <h1>My Travel Plans</h1>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <FaPlus /> {showForm ? 'Cancel' : 'Add New Plan'}
          </button>
        </div>

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

        {showForm && (
          <div className="form-container">
            <h2>{editingId ? 'Edit Travel Plan' : 'Create New Travel Plan'}</h2>
            <form onSubmit={handleSubmit} className="travel-form">
              <div className="form-group">
                <label htmlFor="title">Trip Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Vacation to Paris"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your travel plans..."
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <DatePicker
                    selected={formData.startDate}
                    onChange={(date) => handleDateChange(date, 'startDate')}
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                    className="date-picker"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <DatePicker
                    selected={formData.endDate}
                    onChange={(date) => handleDateChange(date, 'endDate')}
                    dateFormat="MMMM d, yyyy"
                    minDate={formData.startDate}
                    className="date-picker"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Plan' : 'Create Plan'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="plans-grid">
          {plans.length === 0 ? (
            <div className="no-plans">
              <FaMapMarkerAlt />
              <h3>No travel plans yet</h3>
              <p>Start planning your next adventure by clicking "Add New Plan"</p>
            </div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.title}</h3>
                  <div className="plan-actions">
                    <button 
                      className="btn-icon btn-share-icon"
                      onClick={() => openShareModal(plan)}
                      title="Share"
                    >
                      <FaShare />
                    </button>
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(plan)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(plan.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="plan-country">
                  <FaMapMarkerAlt /> {plan.country}
                </div>
                
                {plan.description && (
                  <p className="plan-description">{plan.description}</p>
                )}
                
                <div className="plan-dates">
                  <div className="date-item">
                    <FaCalendar />
                    <span>{formatDate(plan.startDate)}</span>
                  </div>
                  <span className="date-separator">→</span>
                  <div className="date-item">
                    <FaCalendar />
                    <span>{formatDate(plan.endDate)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Share Modal */}
        {shareModalPlan && (
          <div className="modal-overlay" onClick={closeShareModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeShareModal}>×</button>
              <h3>Share Travel Plan</h3>
              <p className="modal-plan-title">{shareModalPlan.title}</p>
              
              <div className="modal-share-buttons">
                <button className="modal-btn-copy" onClick={copyToClipboard}>
                  {copied ? <FaCheck /> : <FaCopy />}
                  <span>{copied ? 'Copied!' : 'Copy Travel Details'}</span>
                </button>

                <div className="share-divider">
                  <span>Or share directly</span>
                </div>

                <FacebookShareButton
                  url="https://travelcompanion.com"
                  quote={`Check out my travel plan: ${shareModalPlan.title} to ${shareModalPlan.country}!`}
                >
                  <button className="modal-btn-share facebook">
                    <FacebookIcon size={32} round />
                    <span>Share on Facebook</span>
                  </button>
                </FacebookShareButton>

                <TwitterShareButton
                  url="https://travelcompanion.com"
                  title={`Planning a trip: ${shareModalPlan.title} to ${shareModalPlan.country}!`}
                  hashtags={['TravelCompanion', 'Travel', shareModalPlan.country.replace(/\s/g, '')]}
                >
                  <button className="modal-btn-share twitter">
                    <TwitterIcon size={32} round />
                    <span>Share on Twitter</span>
                  </button>
                </TwitterShareButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TravelPlans;