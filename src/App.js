import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TravelPlans from './pages/TravelPlans';
import Weather from './pages/Weather';
import Currency from './pages/Currency';
import Share from './pages/Share';
import Profile from './pages/Profile';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import { useSession } from './hooks/useSession';
import AdminDashboard from './pages/AdminDashboard';
import AuditTrail from './components/AuditTrail';
import './styles/global.css';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Monitor session (handles automatic logout on timeout)
  useSession(isLoggedIn);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/travel-plans" element={<TravelPlans />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/currency" element={<Currency />} />
            <Route path="/share" element={<Share />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/audit-trail" element={<AuditTrail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;