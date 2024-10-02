// src/pages/UploadPage.js
import React, { useState } from 'react';
import './UploadPage.css'; // Import the CSS file for styling

function UploadPage() {
  const [content, setContent] = useState(null);
  const [fileName, setFileName] = useState(''); // Store the file name for preview
  const [message, setMessage] = useState(''); // Store any messages (success/error)

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setContent(file);

    if (file) {
      setFileName(file.name); // Set the file name to be displayed
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('file', content);

    try {
      const response = await fetch('http://localhost:5000/api/upload', { // Ensure this points to your Flask server
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('File uploaded successfully!');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Upload failed. Please try again.');
      console.error('Upload failed', error);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Content</h2>
        <form onSubmit={handleUpload}>
          {/* Custom-styled button for file selection */}
          <label htmlFor="file-upload" className="custom-file-upload">
            Choose File
          </label>

          {/* Hidden file input */}
          <input
            id="file-upload"
            type="file"
            style={{ display: 'none' }} // Hide the default file input
            onChange={handleFileChange}
            required
          />

          {/* Display file name as preview */}
          {fileName && (
            <div>
              <h3>Selected File: {fileName}</h3>
            </div>
          )}

          <button type="submit">Upload</button>
        </form>

        {/* Display message */}
        {message && <h3>{message}</h3>}


      </div>
    </div>
  );
}

export default UploadPage;