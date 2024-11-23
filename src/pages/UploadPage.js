import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UploadPage.css';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadId, setUploadId] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  
  
  const composerUrl = 'http://3.83.44.95:80';
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  // console.log(axiosConfig);

  // Fix the useEffect dependency warning
  useEffect(() => {
    const checkStatus = async () => {
      if (!uploadId) return;

      try {
        const response = await axios.get(`${composerUrl}/api/upload_status/${uploadId}`, axiosConfig);
        console.log(response);
        const data = response.data;
        
        setUploadStatus(data.status);

        if (data.status === 'COMPLETED') {
          setMessage('File processed successfully!');
          setUploadResult(data.result);
          setUploadId(null);
        } else if (data.status === 'FAILED') {
          setMessage(data.result?.error || 'Upload failed. Please try again.');
          setUploadId(null);
          setUploadStatus(null);
        }
      } catch (error) {
        console.error('Error checking upload status:', error);
        setMessage('Error checking upload status');
        setUploadStatus('FAILED');
        setUploadId(null);
      }
    };

    let statusInterval;
    if (uploadId && uploadStatus === 'PROCESSING') {
      statusInterval = setInterval(checkStatus, 2000);
    }

    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
      };
    }, [uploadId, uploadStatus, composerUrl, axiosConfig]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (16MB limit)
      if (selectedFile.size > 16 * 1024 * 1024) {
        setMessage('File size must be less than 16MB');
        setFile(null);
        setFileName('');
        return;
      }

      // Check file type
      const fileType = selectedFile.name.split('.').pop().toLowerCase();
      const allowedTypes = ['txt', 'pdf', 'doc', 'docx'];
      if (!allowedTypes.includes(fileType)) {
        setMessage('Only .txt, .pdf, .doc, and .docx files are allowed');
        setFile(null);
        setFileName('');
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage('');
      setUploadResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    try {
      setMessage('Starting upload...');
      setUploadStatus('PROCESSING');

      const response = await axios.post(`${composerUrl}/api/upload`, formData, axiosConfig);
      const data = response.data;
      
      if (response.status === 202) {
        setUploadId(data.upload_id);
        setMessage('Processing file...');
      } else {
        setMessage(data.error || 'Upload failed. Please try again.');
        setUploadStatus('FAILED');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('Upload failed. Please check your connection and try again.');
      setUploadStatus('FAILED');
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Document</h2>
        
        <form onSubmit={handleUpload}>
          <label htmlFor="file-upload" className="custom-file-upload">
            Choose File
          </label>

          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            accept=".txt,.pdf,.doc,.docx"
            style={{ display: 'none' }}
          />

          {fileName && (
            <div className="file-preview">
              <p>Selected File: {fileName}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!file || uploadStatus === 'PROCESSING'}
            className="upload-button"
          >
            {uploadStatus === 'PROCESSING' ? 'Processing...' : 'Upload'}
          </button>
        </form>

        {message && (
          <div className={`status-message ${uploadStatus?.toLowerCase()}`}>
            {message}
          </div>
        )}

        {uploadStatus === 'PROCESSING' && (
          <div className="upload-progress">
            <div className="progress-bar"></div>
          </div>
        )}

        {uploadResult && (
          <div className="upload-result">
            <h3>Upload Complete!</h3>
            <p>File: {uploadResult.filename}</p>
            <p>Chunks Processed: {uploadResult.chunk_count}</p>
            <div className="preview-box">
              <h4>Content Preview:</h4>
              <p>{uploadResult.preview}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;