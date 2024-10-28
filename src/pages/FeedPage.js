import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedPage.css';

function FeedPage() {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState('');
  const [newReply, setNewReply] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const remote_url = 'http://54.165.240.60:8000/api'; // Updated port to match API
  const userId = 1; // Replace with actual user authentication

  useEffect(() => {
    fetchFeed();
  }, [page]);

  const fetchFeed = async () => {
    try {
      // Using the correct endpoint with userId and pagination
      const response = await axios.get(`${remote_url}/convos`, {
        params: {
          userId: userId,
          page: page,
          per_page: 10
        }
      });
      
      if (response.status === 204) {
        setFeed([]);
        return;
      }

      setFeed(response.data.conversations);
      setTotalPages(response.data.total_pages);
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
      await axios.put(`${remote_url}/convos/${conversationId}`, {
        reply: replyContent
      });

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
      setError('Failed to add reply. Please try again.');
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await axios.delete(`${remote_url}/convos/${conversationId}`);
      await fetchFeed();
      setError('');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation. Please try again.');
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-card">
        {error && <p className="error-message">{error}</p>}
        
        {feed === null ? (
          <p className="feed-message">Loading conversations...</p>
        ) : feed.length > 0 ? (
          <>
            {feed.map((item) => (
              <div key={item.id} className="feed-item">
                <p>Conversation ID: {item.id}</p>
                <p>User ID: {item.user_id}</p>
                <p>Start Date: {new Date(item.start_date).toLocaleString()}</p>
                <p>Last Update: {new Date(item.last_update).toLocaleString()}</p>
                
                {/* Display existing reply if any */}
                {item.reply && (
                  <div className="reply-section">
                    <p className="reply-content">{item.reply}</p>
                  </div>
                )}

                {/* Reply Input */}
                <div className="reply-input-section">
                  <textarea
                    value={newReply[item.id] || ''}
                    onChange={(e) => handleReplyChange(item.id, e.target.value)}
                    placeholder="Write a reply..."
                    className="reply-textarea"
                  />
                  <div className="button-group">
                    <button 
                      className="reply-button"
                      onClick={() => handleReplySubmit(item.id)}
                    >
                      Reply
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteConversation(item.id)}
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
