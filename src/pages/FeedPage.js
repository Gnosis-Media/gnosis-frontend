import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FeedPage.css';

function FeedPage() {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  
  const composerUrl = 'http://localhost:5001';
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const axiosConfig = { headers };

  useEffect(() => {
    if (!userId) {
      setError('Please log in to view conversations');
      return;
    }
    fetchFeed();
  }, [page, userId]);

  const fetchFeed = async () => {
    try {      
      const response = await axios.get(`${composerUrl}/api/convos`, {
        params: {
          user_id: userId,
          limit: 10,
          random: true
        },
        ...axiosConfig
      });
      setFeed(response.data.conversations);
      setError('');
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
      setFeed([]);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/conversation/${conversationId}`);
  };

  return (
    <div className="feed-container">
      <div className="feed-card">
        {error && <p className="error-message">{error}</p>}
        
        {!userId ? (
          <p className="feed-message">Please log in to view conversations.</p>
        ) : feed === null ? (
          <p className="feed-message">Loading conversations...</p>
        ) : feed.length > 0 ? (
          <>
            {feed.map((conversation) => (
              <div 
                key={conversation.id} 
                className="feed-item clickable"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="conversation-preview">
                  <div className="conversation-header">
                    <span className="conversation-date">
                      {formatDate(conversation.start_date)}
                    </span>
                  </div>
                  {conversation.messages && conversation.messages.length > 0 && (
                    <div className={`message ${conversation.messages[0].sender}`}>
                      <p className="message-text">{conversation.messages[0].message_text}</p>
                    </div>
                  )}
                  <div className="message-count">
                    {conversation.messages.length} messages
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pagination-controls">
              <button 
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="feed-message">No conversations available.</p>
        )}
      </div>
    </div>
  );
}

export default FeedPage;