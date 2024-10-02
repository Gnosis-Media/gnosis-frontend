// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import FeedPage from './pages/FeedPage';
import './App.css'; // Import your styles
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <Router>
      <div>
        {/* Navigation bar with logo */}
        <nav className="navbar">
          <div className="logo">
            <img src="/logo.png" alt="App Logo" /> {/* Ensure the path is correct */}
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/upload">Upload</Link></li>
            <li><Link to="/Login/Signup">Login/Signup</Link></li>
          </ul>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<FeedPage />} /> {/* Home page as feed */}
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/Login/Signup" element={<AuthPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
