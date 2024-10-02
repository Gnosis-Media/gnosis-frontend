// src/pages/FeedPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedPage.css';

function FeedPage() {
  const [feed, setFeed] = useState(null); // Feed starts as null, simulating no database connection
  const cPort = 5002;
  useEffect(() => {
    // Fetch conversations from the Flask API
    const fetchFeed = async () => {
      try {
        const response = await axios.get(
          `http://localhost:${cPort}/api/get_convos`
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
              <h3>Conversation ID: {item.id}</h3>
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

/*
// src/pages/FeedPage.js
import './FeedPage.css';  // This imports the CSS for the feed page
import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa'; // Example icon from react-icons (you can use any)

function FeedPage() {
  const [feed, setFeed] = useState(null); // Feed starts as null, simulating no database connection

  useEffect(() => {
    // Simulate a failed database connection or no data fetched
    const fetchFeed = async () => {
      try {
        // Simulate fetch from conversationsDB (replace this with actual API call)
        const response = await fetch('https://api.example.com/feed');
        if (!response.ok) {
          throw new Error('Failed to fetch feed'); // Simulate database error
        }
        const data = await response.json();
        setFeed(data);
      } catch (error) {
        setFeed([]); // Simulate no data fetched due to database issue
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="feed-container">
      <div className="feed-card">
        {feed === null ? (
          <div className="empty-feed">
            <FaExclamationTriangle className="empty-icon" /> {/* Icon above the message }
            <p className="empty-message">Uh-oh, there seems to be an issue. We're working on getting you connected soon!</p>
          </div>
        ) : feed.length > 0 ? (
          feed.map((item, index) => (
            <div key={index} className="feed-item">
              <h3>{item.title}</h3>
              <p>{item.content}</p>
            </div>
          ))
        ) : (
          <p className="empty-message">No content available at the moment. But we're working on it!</p>
        )}
      </div>
    </div>
  );
}

export default FeedPage; 







import React, { useState, useEffect } from 'react';

function FeedPage() {
  const [feed, setFeed] = useState(null); // Feed starts as null, simulating no database connection

  useEffect(() => {
    // Simulate a failed database connection or no data fetched
    const fetchFeed = async () => {
      try {
        // Simulate fetch from conversationsDB (replace this with actual API call)
        const response = await fetch('https://api.example.com/feed');
        if (!response.ok) {
          throw new Error('Failed to fetch feed'); // Simulate database error
        }
        const data = await response.json();
        setFeed(data);
      } catch (error) {
        setFeed([]); // Simulate no data fetched due to database issue
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="feed-container">
      <div className="feed">
        {feed === null ? (
          <p className="feed-message">Uh-oh, there seems to be an issue. We're working on getting you connected soon!</p>
        ) : feed.length > 0 ? (
          feed.map((item, index) => (
            <div key={index} className="feed-card">
              <h3>{item.title}</h3>
              <p>{item.content}</p>
            </div>
          ))
        ) : (
          <p>No content available at the moment.</p>
        )}
      </div>
    </div>
  );
}

export default FeedPage; */
