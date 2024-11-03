import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const composerUrl = 'http://localhost:5001';
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

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
        if (isLogin) {
          // Store token and user info in local storage
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', username);
          localStorage.setItem('user_id', data.user.id);
          setMessage('Login successful!');
          navigate('/'); // Redirect to home page
        } else {
          setMessage('Registration successful! Please log in.');
          setIsLogin(true); // Switch to login mode
        }
      } else {
        const errorMessage = data.error || 'An error occurred. Please try again.';
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage('An error occurred. Please try again.');
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