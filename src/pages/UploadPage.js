import React, { useState, useEffect } from 'react';
import './UploadPage.css';

function UploadPage() {
  const [content, setContent] = useState(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadId, setUploadId] = useState(null);
  
  // Update URL to point to composer service
  const composerUrl = 'http://localhost:5001/api';
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Poll for upload status if there's an active upload
    let statusInterval;
    if (uploadId && uploadStatus !== 'Completed' && uploadStatus !== 'Failed') {
      statusInterval = setInterval(checkUploadStatus, 2000); // Check every 2 seconds
    }

    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [uploadId, uploadStatus]);

  const checkUploadStatus = async () => {
    if (!uploadId) return;

    try {
      const response = await fetch(`${composerUrl}/upload_status/${uploadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      setUploadStatus(data.status);

      if (data.status === 'Completed') {
        setMessage('File uploaded successfully!');
        setUploadId(null); // Clear upload ID
      } else if (data.status === 'Failed') {
        setMessage('Upload failed. Please try again.');
        setUploadId(null); // Clear upload ID
      }
    } catch (error) {
      console.error('Error checking upload status:', error);
      setMessage('Error checking upload status');
      setUploadStatus('Failed');
      setUploadId(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (e.g., limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMessage('File size must be less than 10MB');
        setContent(null);
        setFileName('');
        return;
      }
      setContent(file);
      setFileName(file.name);
      setMessage(''); // Clear any previous messages
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage('Please log in to upload files');
      return;
    }

    if (!content) {
      setMessage('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', content);
    formData.append('user_id', userId);

    try {
      const response = await fetch(`${composerUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.status === 202) { // Accepted
        setUploadId(data.upload_id);
        setUploadStatus('Accepted');
        setMessage('Upload started...');
      } else {
        setMessage(data.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('Upload failed. Please check your connection and try again.');
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'Accepted':
        return 'Upload in progress...';
      case 'Completed':
        return 'Upload completed successfully!';
      case 'Failed':
        return 'Upload failed. Please try again.';
      default:
        return message;
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Content</h2>
        {!userId ? (
          <p className="error-message">Please log in to upload files</p>
        ) : (
          <form onSubmit={handleUpload}>
            <label htmlFor="file-upload" className="custom-file-upload">
              Choose File
            </label>

            <input
              id="file-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              required
              // Optionally restrict file types
              accept=".txt,.pdf,.doc,.docx"
            />

            {fileName && (
              <div className="file-preview">
                <h3>Selected File: {fileName}</h3>
              </div>
            )}

            <button 
              type="submit" 
              disabled={!content || uploadStatus === 'Accepted'}
            >
              {uploadStatus === 'Accepted' ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        )}

        {/* Status display */}
        {(message || uploadStatus) && (
          <div className={`status-message ${uploadStatus?.toLowerCase() || ''}`}>
            {getStatusMessage()}
          </div>
        )}

        {/* Progress indicator for active uploads */}
        {uploadStatus === 'Accepted' && (
          <div className="upload-progress">
            <div className="progress-bar"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
