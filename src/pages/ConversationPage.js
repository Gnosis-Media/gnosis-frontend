import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ConversationPage.css';

function ConversationPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [error, setError] = useState('');
  
  // const composerUrl = 'http://54.147.235.198:80';
  const composerUrl = process.env.REACT_APP_COMPOSER_URL;
  const API_KEY = process.env.REACT_APP_API_KEY;
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-KEY': API_KEY
  };

  const axiosConfig = { headers };

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      const response = await axios.get(
        `${composerUrl}/api/convos/${conversationId}`,
        axiosConfig
      );
      setConversation(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setError('Failed to load conversation. Please try again.');
    }
  };

  const handleReplySubmit = async () => {
    if (!newReply?.trim()) {
      setError('Reply cannot be empty');
      return;
    }
  
    try {
      await axios.put(`${composerUrl}/api/convos/${conversationId}/reply`, {
        message: newReply,
        userId: userId
      }, axiosConfig);
  
      setNewReply('');
      await fetchConversation();
      setError('');
    } catch (error) {
      console.error('Error adding reply:', error);
      setError('Failed to add reply. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="conversation-container">
      <div className="conversation-card">
        <button className="back-button" onClick={handleBack}>
          Back to Feed
        </button>
        
        {error && <p className="error-message">{error}</p>}
        
        {!conversation ? (
          <p className="loading-message">Loading conversation...</p>
        ) : (
          <>
            <div className="conversation-header">
              <h2>Conversation {conversationId}</h2>
              <span className="conversation-date">
                Started: {formatDate(conversation.start_date)}
              </span>
            </div>

            <div className="messages-section">
              {conversation.messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <p className="message-text">{message.message_text}</p>
                  <small className="message-timestamp">
                    {formatDate(message.timestamp)}
                  </small>
                </div>
              ))}
            </div>

            <div className="reply-section">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write a reply..."
                className="reply-textarea"
              />
              <button 
                className="reply-button"
                onClick={handleReplySubmit}
              >
                Reply
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ConversationPage;