import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  // Update the URL to point to the composer service instead of directly to the auth service
  const composerUrl = 'http://54.157.239.255:5001';
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

    // Keep test credentials for development
    if (isLogin && username === 'root' && password === 'root') {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('username', username);
      localStorage.setItem('user_id', '123');
      setMessage('Login successful!');
      navigate('/');
      return;
    }

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin
      ? { username, password }
      : { username, email, password };

    try {
      console.log("sending request to " + composerUrl + endpoint);
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
        // Success case - use placeholder values where needed
        localStorage.setItem('token', 'placeholder-token');
        localStorage.setItem('username', username);
        localStorage.setItem('user_id', '123');
        
        setMessage(data.message || (isLogin ? 'Login successful!' : 'Registration successful!'));
        navigate('/');
      } else {
        // Error case
        const errorMessage = data.error || 'An error occurred. Please try again.';
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('Auth error:', error);
      // For development: allow login even if server is down
      localStorage.setItem('token', 'placeholder-token');
      localStorage.setItem('username', username);
      localStorage.setItem('user_id', '123');
      setMessage('Development mode: Login successful');
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>
          <img src="/logo.png" alt="App Logo" style={{ width: '100px', height: 'auto' }} />
        </h2>
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
  );
}

export default AuthPage;








/*
SPRINT 1 AUTH CODE 

import React, { useState } from 'react';
import './AuthPages.css'; // Reuse the same CSS for the unified page

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup
  const [username, setUsername] = useState(''); // For both login and signup
  const [email, setEmail] = useState(''); // For signup
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const Lport = 5000;
  const local_url = 'http://127.0.0.1:5000';
  const remote_url = 'http://3.86.58.152:5000';

  // Handle form submit for both login and signup
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register'; // Toggle API endpoint
    const payload = isLogin
      ? { username, password } // Login payload
      : { username, email, password }; // Signup payload

    try {
      console.log("sending request to " + remote_url + endpoint)
      const response = await fetch(remote_url + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(isLogin ? 'Login successful!' : 'Signup successful!');
        if (isLogin) {
          localStorage.setItem('token', data.token);
          // Redirect to feed or other page after login
        }
      } else {
        setMessage(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setMessage('Server error. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
        <form onSubmit={handleAuth}>
          //Common username field for both login and signup
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          //Only show email input if the user is signing up
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

        //Toggle between login and signup
        <h3 onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Don't have an account? Sign up"
            : 'Already have an account? Login'}
        </h3>

        //Display message after submission
        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
}

export default AuthPage;
*/