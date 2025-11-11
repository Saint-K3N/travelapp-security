import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TravelPlans from './pages/TravelPlans';
import Weather from './pages/Weather';
import Currency from './pages/Currency';
import Share from './pages/Share';
import Profile from './pages/Profile';
import Register from './pages/Register';
import './styles/global.css';
import './App.css';

function App() {
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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;