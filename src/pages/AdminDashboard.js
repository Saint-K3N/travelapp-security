import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserShield, FaTrash, FaSearch, FaExclamationTriangle, FaShieldAlt, FaLock, FaUnlock } from 'react-icons/fa';
import { auth } from '../config/firebase';
import { getAllUsers, updateUserRole, deleteUserByAdmin, checkIfAdmin } from '../services/authService';
import { getLockoutInfo } from '../services/lockoutService';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [lockoutData, setLockoutData] = useState({});

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/profile');
        return;
      }

      try {
        const adminStatus = await checkIfAdmin(user.uid);
        if (!adminStatus) {
          setError('Access Denied: Admin privileges required');
          setTimeout(() => navigate('/profile'), 2000);
          return;
        }
        setIsAdmin(true);
        await fetchUsers();
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin status');
        setTimeout(() => navigate('/profile'), 2000);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const usersList = await getAllUsers();
      
      if (!usersList || usersList.length === 0) {
        setUsers([]);
        setFilteredUsers([]);
        setError('No users found in the system');
        return;
      }
      
      setUsers(usersList);
      setFilteredUsers(usersList);
      
      // Fetch lockout data for all users
      const lockoutInfo = {};
      usersList.forEach(user => {
        if (user.email) {
          try {
            lockoutInfo[user.email] = getLockoutInfo(user.email);
          } catch (err) {
            console.error(`Error getting lockout info for ${user.email}:`, err);
            lockoutInfo[user.email] = { attempts: 0, isLocked: false };
          }
        }
      });
      setLockoutData(lockoutInfo);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${err.message || 'Unknown error'}`);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = users.filter(user => {
      const email = user.email?.toLowerCase() || '';
      const username = user.username?.toLowerCase() || '';
      const role = user.role?.toLowerCase() || '';
      const verificationStatus = user.emailVerified ? 'verified' : 'not verified';
      const lockStatus = lockoutData[user.email]?.isLocked ? 'locked' : 'unlocked';
      
      return email.includes(term) || 
             username.includes(term) || 
             role.includes(term) ||
             verificationStatus.includes(term) ||
             lockStatus.includes(term);
    });
    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError('');
      setSuccessMessage('');
      
      await updateUserRole(userId, newRole);
      setSuccessMessage(`User role updated to ${newRole}`);
      
      await fetchUsers();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update user role');
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setError('');
      setSuccessMessage('');
      
      await deleteUserByAdmin(userToDelete.uid);
      setSuccessMessage('User deleted successfully');
      
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      await fetchUsers();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const formatLockoutTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h1>Loading Admin Dashboard...</h1>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!isAdmin && error) {
    return (
      <div className="admin-dashboard">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <FaExclamationTriangle style={{ fontSize: '4rem', marginBottom: '1rem' }} />
              <h1>{error}</h1>
              <p className="hero-subtitle">Redirecting...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1><FaShieldAlt /> Admin Dashboard</h1>
            <p className="hero-subtitle">
              Manage users and their roles across the platform
            </p>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          {successMessage && (
            <div className="success-banner">
              ✓ {successMessage}
            </div>
          )}

          {error && !loading && (
            <div className="error-banner">
              ✗ {error}
            </div>
          )}

          <div className="stats-grid" style={{ marginBottom: '3rem' }}>
            <div className="stat-item">
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-item">
              <h3>{users.filter(u => u.role === 'admin').length}</h3>
              <p>Admins</p>
            </div>
            <div className="stat-item">
              <h3>{users.filter(u => u.emailVerified).length}</h3>
              <p>Verified Emails</p>
            </div>
            <div className="stat-item">
              <h3>{users.filter(u => !u.emailVerified).length}</h3>
              <p>Unverified Emails</p>
            </div>
            <div className="stat-item">
              <h3>{users.filter(u => lockoutData[u.email]?.isLocked).length}</h3>
              <p>Locked Accounts</p>
            </div>
          </div>

          <div className="search-section">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by email, username, role, verification status, or lock status..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="users-table-container">
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Email Verified</th>
                    <th>Failed Attempts</th>
                    <th>Lock Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-users">
                        {searchTerm ? 'No users found matching your search' : 'No users found'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const userLockout = lockoutData[user.email] || { attempts: 0, isLocked: false };
                      return (
                        <tr key={user.uid} className={userLockout.isLocked ? 'locked-row' : ''}>
                          <td data-label="Username">{user.username || 'N/A'}</td>
                          <td data-label="Email">{user.email}</td>
                          <td data-label="Role">
                            <select
                              value={user.role || 'user'}
                              onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                              className={`role-select ${user.role}`}
                              disabled={user.uid === auth.currentUser?.uid}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td data-label="Email Verified">
                            <span className={`badge ${user.emailVerified ? 'verified' : 'not-verified'}`}>
                              {user.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                            </span>
                          </td>
                          <td data-label="Failed Attempts">
                            <span className={`attempts-badge ${userLockout.attempts >= 3 ? 'max-attempts' : ''}`}>
                              {userLockout.attempts} / 3
                            </span>
                          </td>
                          <td data-label="Lock Status">
                            {userLockout.isLocked ? (
                              <span className="badge locked" title={`Locked until: ${formatLockoutTime(userLockout.lockoutUntil)}`}>
                                <FaLock /> Locked
                              </span>
                            ) : (
                              <span className="badge unlocked">
                                <FaUnlock /> Unlocked
                              </span>
                            )}
                          </td>
                          <td data-label="Created At">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td data-label="Actions">
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteClick(user)}
                              disabled={user.uid === auth.currentUser?.uid}
                              title={user.uid === auth.currentUser?.uid ? "Cannot delete your own account" : "Delete user"}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <FaExclamationTriangle className="warning-icon" />
              <h2>Delete User</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this user?</p>
              <div className="user-details">
                <p><strong>Username:</strong> {userToDelete?.username}</p>
                <p><strong>Email:</strong> {userToDelete?.email}</p>
              </div>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-confirm-delete" onClick={handleDeleteConfirm}>
                Delete User
              </button>
              <button className="btn-cancel" onClick={handleDeleteCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;