import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FeedPage.css';

function FeedPage() {
  const [feed, setFeed] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  
  const feedContainerRef = useRef(null);
  const lastScrollPosition = useRef(0);
  const navigate = useNavigate();
  
  const composerUrl = 'http://3.83.44.95:80';
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const fetchFeed = async (pageNum, shouldRefresh = false) => {
    try {
      console.log(`Fetching page ${pageNum}, refresh: ${shouldRefresh}`);
      setIsLoading(true);
      
      const response = await axios.get(`${composerUrl}/api/convos`, {
        params: {
          user_id: userId,
          limit: 10,
          page: pageNum,
          refresh: shouldRefresh
        },
        headers
      });

      const newConversations = response.data.conversations;
      console.log(`Received ${newConversations.length} conversations for page ${pageNum}`);
      setTotalPages(response.data.total_pages || 1);

      if (pageNum === 1) {
        setFeed(newConversations);
      } else {
        setFeed(prev => [...prev, ...newConversations]);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    console.log('Refreshing feed...');
    setIsRefreshing(true);
    setPage(1);
    await fetchFeed(1, true);
    
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = useCallback((e) => {
    const container = e.target;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight * 100;
    
    console.log(`Scroll percentage: ${scrollPercentage.toFixed(2)}%`);

    if (scrollPercentage > 70 && !isLoading && !isLoadingMore && page < totalPages) {
      console.log('Loading more conversations...');
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }

    lastScrollPosition.current = scrollTop;
  }, [isLoading, isLoadingMore, page, totalPages]);

  const handleTouchStart = (e) => {
    const { scrollTop } = feedContainerRef.current;
    if (scrollTop === 0) {
      setPullStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling) return;

    const container = feedContainerRef.current;
    const touch = e.touches[0];
    const pullDistance = touch.clientY - pullStartY;

    if (pullDistance > 0 && container.scrollTop === 0) {
      container.classList.add('pulling');
      if (pullDistance > 100) {
        handleRefresh();
        setIsPulling(false);
        container.classList.remove('pulling');
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPulling) {
      feedContainerRef.current.classList.remove('pulling');
      setIsPulling(false);
    }
  };

  const handleLogoClick = useCallback(() => {
    console.log('Logo clicked, refreshing feed...');
    handleRefresh();
  }, []);

  useEffect(() => {
    const logo = document.querySelector('.navbar-logo');
    if (logo) {
      logo.addEventListener('click', handleLogoClick);
    }

    return () => {
      if (logo) {
        logo.removeEventListener('click', handleLogoClick);
      }
    };
  }, [handleLogoClick]);

  useEffect(() => {
    if (!userId) {
      setError('Please log in to view conversations');
      return;
    }
    console.log(`Page changed to ${page}, fetching new data...`);
    fetchFeed(page);
  }, [page, userId]);

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
    <div 
      className="feed-container"
      ref={feedContainerRef}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isRefreshing && (
        <div className="refresh-indicator">
          Refreshing your feed...
        </div>
      )}

      <div className="feed-card">
        {error && <p className="error-message">{error}</p>}
        
        {!userId ? (
          <p className="feed-message">Please log in to view conversations.</p>
        ) : feed.length === 0 && !isLoading ? (
          <p className="feed-message">No conversations available.</p>
        ) : (
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
            
            {(isLoading || isLoadingMore) && (
              <div className="loading-indicator">
                Loading more conversations...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FeedPage;