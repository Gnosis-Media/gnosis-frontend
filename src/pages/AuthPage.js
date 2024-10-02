import React, { useState } from 'react';
import './AuthPages.css'; // Reuse the same CSS for the unified page

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup
  const [username, setUsername] = useState(''); // For both login and signup
  const [email, setEmail] = useState(''); // For signup
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const Lport = 5000;

  // Handle form submit for both login and signup
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register'; // Toggle API endpoint
    const payload = isLogin
      ? { username, password } // Login payload
      : { username, email, password }; // Signup payload

    try {
      const response = await fetch(`http://127.0.0.1:${Lport}${endpoint}`, {
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
          {/* Common username field for both login and signup */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* Only show email input if the user is signing up */}
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

        {/* Toggle between login and signup */}
        <h3 onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Don't have an account? Sign up"
            : 'Already have an account? Login'}
        </h3>

        {/* Display message after submission */}
        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
}

export default AuthPage;
