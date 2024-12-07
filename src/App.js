import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import UploadPage from './pages/UploadPage';
import FeedPage from './pages/FeedPage';
import AuthPage from './pages/AuthPage';
import ConversationPage from './pages/ConversationPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for token in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    
    // Log out of Google
    try {
      googleLogout();
    } catch (error) {
      console.error('Error logging out of Google:', error);
    }
    
    // Update logged in state
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div>
        {/* Navigation bar with logo, shown only if user is logged in */}
        {isLoggedIn && (
          <nav className="navbar">
            <div className="logo">
              <Link to="/">
                <img src="/logo.png" alt="App Logo" />
              </Link>
            </div>
            <ul className="nav-links">
              <li><Link to="/upload">Upload</Link></li>
              <li><Link onClick={handleLogout}>Sign Out</Link></li>
            </ul>
          </nav>
        )}

        {/* Routes */}
        <Routes>
          {/* Protected Routes that require login */}
          <Route path="/" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FeedPage /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute isLoggedIn={isLoggedIn}><UploadPage /></ProtectedRoute>} />
          <Route path="/conversation/:conversationId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ConversationPage /></ProtectedRoute>} />
          {/* Auth Route */}
          <Route path="/Login/Signup" element={<AuthPage setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;