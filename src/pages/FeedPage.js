import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedPage.css';

function FeedPage() {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState('');
  const [newReply, setNewReply] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Update URL to point to composer service
  const composerUrl = 'http://54.157.239.255:5001/api';
  
  // Get userId from localStorage (set during login)
  const userId = "123"; // localStorage.getItem('user_id');
  const token = "placeholder-token"; // localStorage.getItem('token');

  // Configure axios defaults
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  useEffect(() => {
    if (!userId) {
      setError('Please log in to view conversations');
      return;
    }
    fetchFeed();
  }, [page, userId]);

  const fetchFeed = async () => {
    try {
        const response = await axios.get(`${composerUrl}/convos`, {
            params: {
                user_id: '1', // Placeholder user_id
                limit: 10,
                random: false
            }
        });
        
        // Set feed to the conversations array from the response
        setFeed(response.data.conversations);
        setError('');
    } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to load conversations. Please try again.');
        setFeed([]);
    }
};

  const handleReplyChange = (conversationId, value) => {
    setNewReply(prev => ({
      ...prev,
      [conversationId]: value
    }));
  };

  const handleReplySubmit = async (conversationId) => {
    const replyContent = newReply[conversationId];
    if (!replyContent?.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    try {
      await axios.put(`${composerUrl}/convos/${conversationId}`, {
        reply: replyContent,
        userId: userId // Include userId in the request
      }, axiosConfig);

      // Clear the reply input for this conversation
      setNewReply(prev => ({
        ...prev,
        [conversationId]: ''
      }));
      
      // Refresh the feed to show the new reply
      await fetchFeed();
      setError('');
    } catch (error) {
      console.error('Error adding reply:', error);
      if (error.response?.status === 401) {
        setError('Please log in again to continue.');
      } else {
        setError('Failed to add reply. Please try again.');
      }
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await axios.delete(`${composerUrl}/convos/${conversationId}`, axiosConfig);
      await fetchFeed();
      setError('');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      if (error.response?.status === 401) {
        setError('Please log in again to continue.');
      } else {
        setError('Failed to delete conversation. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
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
                        <div key={conversation.id} className="feed-item">
                            <p>Conversation ID: {conversation.id}</p>
                            <p>User ID: {conversation.user_id}</p>
                            <p>Start Date: {formatDate(conversation.start_date)}</p>
                            <p>Last Update: {formatDate(conversation.last_update)}</p>
                            
                            {/* Display messages */}
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

                            {/* Reply Input */}
                            <div className="reply-input-section">
                                <textarea
                                    value={newReply[conversation.id] || ''}
                                    onChange={(e) => handleReplyChange(conversation.id, e.target.value)}
                                    placeholder="Write a reply..."
                                    className="reply-textarea"
                                />
                                <div className="button-group">
                                    <button 
                                        className="reply-button"
                                        onClick={() => handleReplySubmit(conversation.id)}
                                    >
                                        Reply
                                    </button>
                                    <button 
                                        className="delete-button"
                                        onClick={() => handleDeleteConversation(conversation.id)}
                                    >
                                        Delete Conversation
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Pagination Controls */}
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

/*
.JS WITHOUT THE FULL CONVERSATION INTEGRATION - JUST FOR VIEWING THE REPLY FUNCTIONALITY

// src/pages/FeedPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedPage.css';

function FeedPage() {
  const [feed, setFeed] = useState(null);
  const [replies, setReplies] = useState({});
  const [newReplies, setNewReplies] = useState({}); // Object to store reply input state for each conversation
  const [error, setError] = useState('');
  
  const remote_url = 'http://54.165.240.60:5000/api';

  useEffect(() => {
    fetchFeed();
    fetchReplies();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${remote_url}/get_convos`);
      setFeed(response.data);
      // Initialize newReplies state for each conversation
      const initialReplies = response.data.reduce((acc, convo) => {
        acc[convo.id] = '';
        return acc;
      }, {});
      setNewReplies(initialReplies);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setFeed([]);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await axios.get(`${remote_url}/get_replies`);
      const repliesMap = response.data.reduce((acc, reply) => {
        if (!acc[reply.conversation_id]) {
          acc[reply.conversation_id] = [];
        }
        acc[reply.conversation_id].push(reply);
        return acc;
      }, {});
      setReplies(repliesMap);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleReplyChange = (conversationId, value) => {
    setNewReplies(prev => ({
      ...prev,
      [conversationId]: value
    }));
  };

  const handleReplySubmit = async (conversationId) => {
    const replyContent = newReplies[conversationId];
    if (!replyContent?.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    try {
      await axios.post(`${remote_url}/add_reply`, {
        conversation_id: conversationId,
        content: replyContent,
        user_id: 1 // Replace with actual user ID from authentication
      });

      // Clear only the submitted conversation's input
      setNewReplies(prev => ({
        ...prev,
        [conversationId]: ''
      }));
      await fetchReplies();
    } catch (error) {
      console.error('Error adding reply:', error);
      setError('Failed to add reply. Please try again.');
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await axios.delete(`${remote_url}/delete_reply/${replyId}`);
      await fetchReplies();
    } catch (error) {
      console.error('Error deleting reply:', error);
      setError('Failed to delete reply. Please try again.');
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-card">
        {error && <p className="error-message">{error}</p>}
        
        {feed === null ? (
          <p className="feed-message">
            Uh-oh, there seems to be an issue. We're working on getting you
            connected soon!
          </p>
        ) : feed.length > 0 ? (
          feed.map((item, index) => (
            <div key={index} className="feed-item">
              <p>Conversation ID: {item.id}</p>
              <p>User ID: {item.user_id}</p>
              <p>Start Date: {new Date(item.start_date).toLocaleString()}</p>
              <p>Last Date: {new Date(item.last_date).toLocaleString()}</p>
              
              //Replies Section
              <div className="replies-section">
                {replies[item.id]?.map((reply) => (
                  <div key={reply.id} className="reply-item">
                    <p>{reply.content}</p>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteReply(reply.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              //Reply Input
              <div className="reply-input-section">
                <textarea
                  value={newReplies[item.id] || ''}
                  onChange={(e) => handleReplyChange(item.id, e.target.value)}
                  placeholder="Write a reply..."
                  className="reply-textarea"
                />
                <button 
                  className="reply-button"
                  onClick={() => handleReplySubmit(item.id)}
                >
                  Reply
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="feed-message">No content available at the moment.</p>
        )}
      </div>
    </div>
  );
}

export default FeedPage;

*/
