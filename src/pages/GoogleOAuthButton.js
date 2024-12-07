// GoogleOAuthButton.js


// GoogleOAuthButton.js
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const GoogleOAuthButton = ({ composerUrl, setMessage, setIsLoggedIn }) => {
  const navigate = useNavigate();
  
  // Determine the base URL based on environment
  const baseUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'http://gnosis-frontend-app-w4153.s3-website-us-east-1.amazonaws.com';

  const handleSuccess = async (credentialResponse) => {
    console.log('Google login successful, credential received:', credentialResponse);
    
    try {
      console.log('Sending credential to backend:', composerUrl + '/api/auth/google');
      const response = await fetch(`${composerUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
        credentials: 'include' // Add this to handle cookies if needed
      });

      console.log('Backend response status:', response.status);
      const data = await response.json();
      console.log('Backend response data:', data);

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem('token', data.token);
        if (data.username) localStorage.setItem('username', data.username);
        if (data.user_id) localStorage.setItem('user_id', data.user_id);
        setIsLoggedIn(true);
        navigate('/');
      } else {
        console.error('Backend error:', data);
        setMessage(data.error || 'Server responded with an error. Please try again.');
      }
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error making request to backend:', {
        error: error.message,
        stack: error.stack
      });
      setMessage('Could not connect to the server. Please check your connection and try again.');
    }
  };

  const handleError = (error) => {
    console.error('Google login error:', error);
    setMessage('Google login failed. Please try again.');
  };

  return (
    <div className="oauth-buttons">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="filled_blue"
        size="large"
        text="continue_with"
        shape="pill"
        width="100%"
        useOneTap
        flow="implicit"
        ux_mode="popup"
        auto_select={false}
        redirect_uri={baseUrl}
        cookiePolicy={'single_host_origin'}
      />
    </div>
  );
};

export default GoogleOAuthButton;

/*
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const GoogleOAuthButton = ({ composerUrl, setMessage }) => {
  const navigate = useNavigate();
  
  // Determine the base URL based on environment
  const baseUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'http://gnosis-frontend-app-w4153.s3-website-us-east-1.amazonaws.com';

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${composerUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem('token', data.token);
        if (data.username) {
          localStorage.setItem('username', data.username);
        }
        if (data.user_id) {
          localStorage.setItem('user_id', data.user_id);
        }
        navigate('/');
      } else {
        setMessage(data.error || 'Google login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      setMessage('An error occurred during Google login. Please try again.');
    }
  };

  const handleError = () => {
    setMessage('Google login failed. Please try again.');
  };

  return (
    <div className="oauth-buttons">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="filled_blue"
        size="large"
        text="continue_with"
        shape="pill"
        width="100%"
        useOneTap
        flow="implicit"
        ux_mode="popup"
        auto_select={false}
        redirect_uri={baseUrl}
      />
    </div>
  );
};

export default GoogleOAuthButton;*/
