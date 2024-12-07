// AuthPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleOAuthButton from './GoogleOAuthButton';
import './AuthPages.css';

function AuthPage({ setIsLoggedIn }) { // Add setIsLoggedIn prop
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const composerUrl = 'http://localhost:5000';  // use this for prod: http://54.147.235.198:80 
  const navigate = useNavigate();
  const GOOGLE_CLIENT_ID = "828323748695-mtijpl2s00v32vsnfag4ubfbmjara52n.apps.googleusercontent.com";

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (token) {
      localStorage.setItem('token', token);
      navigate('/');
    } else if (error) {
      setMessage(error);
    }
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin
      ? { username, password }
      : { username, email, password };

    try {
      const response = await fetch(composerUrl + endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.status === 200 || response.status === 201) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', username);
          localStorage.setItem('user_id', data.user.id);
          setMessage('Login successful!');
          navigate('/');
        } else {
          setMessage('Registration successful! Please log in.');
          setIsLogin(true);
        }
      } else {
        setMessage(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="auth-container">
        <div className="auth-card">
          <h2>
            <img src="/logo.png" alt="App Logo" style={{ width: '100px', height: 'auto' }} />
          </h2>
          
          <GoogleOAuthButton composerUrl={composerUrl} setMessage={setMessage} setIsLoggedIn={setIsLoggedIn} // Pass setIsLoggedIn to GoogleOAuthButton

          />
          
          <div className="divider">
            <span>OR</span>
          </div>

          <form onSubmit={handleAuth}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {!isLogin && (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
          </form>

          <h3>
            <button 
              className="toggle-auth-button" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </h3>

          {message && <p className="auth-message">{message}</p>}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default AuthPage;