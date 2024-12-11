// GoogleOAuthButton.js


// GoogleOAuthButton.js
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const GoogleOAuthButton = ({ composerUrl, setMessage, setIsLoggedIn, API_KEY }) => {
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
            'Accept': 'application/json',
            'Authorization': `Bearer ${credentialResponse.credential}`,
            'X-API-KEY': API_KEY
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        });
    
        console.log('Backend response status:', response.status);
        const data = await response.json();
        console.log('Backend response data:', data);
    
        if (response.status === 200 || response.status === 201) {
          localStorage.setItem('token', data.token);
          if (data.user.username) {
            localStorage.setItem('username', data.user.username);
            console.log('Username set in localStorage:', data.user.username);
          }
          if (data.user.id) {
            localStorage.setItem('user_id', data.user.id);
            console.log('User ID set in localStorage:', data.user.id);
          }          
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