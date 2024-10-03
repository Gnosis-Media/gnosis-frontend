// src/pages/FeedPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedPage.css';

function FeedPage() {
  const [feed, setFeed] = useState(null); // Feed starts as null, simulating no database connection
  const cPort = 5002;
  const local_url = 'http://127.0.0.1:5000/api/get_convos';
  const remote_url = 'http://54.165.240.60:5000/api/get_convos';


  useEffect(() => {
    // Fetch conversations from the Flask API
    const fetchFeed = async () => {
      try {
        const response = await axios.get(
          remote_url
        ); // Replace localhost if necessary
        setFeed(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setFeed([]); // Simulate no data fetched due to database issue
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="feed-container">
      <div className="feed-card">
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
