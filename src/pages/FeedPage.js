import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './FeedPage.css';

// const composerUrl = 'http://54.147.235.198:80';
const composerUrl = process.env.REACT_APP_COMPOSER_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

const FeedPage = () => {
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');
  const ITEMS_PER_PAGE = 20;
  const [error, setError] = useState(null);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-KEY': API_KEY
  };

  console.log(headers);

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [endReached, setEndReached] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false); // to handle initial load logic

  const navigate = useNavigate();
  const feedRef = useRef(null);

  const deduplicateAndSetConversations = (newConvos) => {
    setConversations(prev => {
      const existingMap = new Map(prev.map(c => [c.id, c]));
      newConvos.forEach(c => existingMap.set(c.id, c));
      return Array.from(existingMap.values());
    });
  };

  const fetchConversations = useCallback(async (refresh = false) => {
    if (loading || endReached) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        user_id: userId,
        limit: ITEMS_PER_PAGE.toString(),
        refresh: refresh.toString(),
      });
      if (nextCursor) params.append('cursor', nextCursor);

      const response = await fetch(`${composerUrl}/api/convos?${params.toString()}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        console.error('Failed to fetch conversations');
        setError('Failed to fetch conversations');
        setEndReached(true);
        setLoading(false);
        return;
      }

      const data = await response.json();

      // If conversations returned
      if (data.conversations && data.conversations.length > 0) {
        deduplicateAndSetConversations(data.conversations);
        setHasNext(data.has_next);
        setNextCursor(data.next_cursor);
        if (!data.has_next) {
          // No more data after these
          setEndReached(true);
        }
      } else {
        // No conversations returned
        if (!initialFetchDone) {
          // This is the initial fetch and nothing came back.
          // Attempt batch creation once
          const batchRes = await fetch(`${composerUrl}/api/composer/batch-convos`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ user_id: userId, num_convos: 10 })
          });

          if (batchRes.ok) {
            // Try once more after a short delay
            await new Promise(res => setTimeout(res, 1500));
            const retryRes = await fetch(`${composerUrl}/api/convos?${params.toString()}`, {
              method: 'GET',
              headers
            });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              if (retryData.conversations && retryData.conversations.length > 0) {
                deduplicateAndSetConversations(retryData.conversations);
                setHasNext(retryData.has_next);
                setNextCursor(retryData.next_cursor);
                if (!retryData.has_next) {
                  setEndReached(true);
                }
              } else {
                // Still no convos after batch attempt
                setEndReached(true);
                setHasNext(false);
              }
            } else {
              setEndReached(true);
              setHasNext(false);
            }
          } else {
            // Batch creation failed, no convos
            setEndReached(true);
            setHasNext(false);
          }
        } else {
          // Not initial fetch, just no new data this time
          // Means we've reached the end
          setEndReached(true);
          setHasNext(false);
          if (!initialFetchDone) {
            setError('No conversations found');
          }
        }
      }

      setInitialFetchDone(true);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Error fetching conversations');
      setEndReached(true);
    }

    setLoading(false);
  }, [userId, headers, nextCursor, loading, endReached, initialFetchDone]);

  useEffect(() => {
    // Initial load
    if (!initialFetchDone) {
      fetchConversations(true);
    }
  }, [fetchConversations, initialFetchDone]);

  const handleConversationClick = (conversationId) => {
    navigate(`/conversation/${conversationId}`);
  };

  const handleScroll = () => {
    if (!feedRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = feedRef.current;

    // Only load more if close to the bottom and we have more data to load
    if (
      hasNext &&
      !loading &&
      !endReached &&
      scrollHeight - scrollTop - clientHeight < 300 // within 300px of the bottom
    ) {
      fetchConversations(false);
    }
  };

  const shuffle_and_reload = async () => {
    try {
      const shuffleResponse = await fetch(`${composerUrl}/api/composer/shuffle-convos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId            
        })
      });

      if (!shuffleResponse.ok) {
        console.error('Failed to shuffle conversations');
      }

      // Reload only after shuffle is complete
      window.location.reload();
    } catch (error) {
      console.error('Failed to shuffle conversations:', error);
      // Optionally reload even if there's an error
      window.location.reload();
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-nav">
        <button 
          className="feed-header-button" 
          onClick={shuffle_and_reload}
        >
          Discover
        </button>
      </div>
      <div className="feed-content" ref={feedRef} onScroll={handleScroll}>
        {error ? (
          <div className="error-message">
            {error}
            <button onClick={() => window.location.reload()} className="retry-button">
              Refresh Page
            </button>
          </div>
        ) : (
          <>
            {conversations.map((convo) => (
              <div 
                key={convo.id} 
                className="conversation-item" 
                onClick={() => handleConversationClick(convo.id)}
              >
                <div className="conversation-title">
                  {convo.ai_profile?.display_name} {' '}            
                  <span className="author-name">
                    {convo.ai_profile?.name}
                  </span>
                </div>
                <div className="conversation-preview">
                  {convo.messages && convo.messages.length > 0 
                    ? `${convo.messages[0].message_text.substring(0,300)}...` 
                    : 'No messages yet'}
                </div>
              </div>
            ))}

            {loading && <div className="loading-indicator">Loading...</div>}

            {endReached && !loading && (
              <div className="end-message">
                <div>You've reached the end, click the button below to go to the top</div>
                <button onClick={shuffle_and_reload}>Go to top</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
