import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { FaLink, FaUpload, FaFileAlt, FaSpinner } from "react-icons/fa";
import "./HomePage.css";
import api from "../services/api";

function HomePage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [activeTab, setActiveTab] = useState("link");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      switch (activeTab) {
        case "link":
          if (videoUrl) {
            const transcript = await api.videos.getTranscript(videoUrl);
            history.push(`/transcript`, { transcript: transcript.data });
          }
          break;
        case "upload":
          if (selectedFile) {
            const response = await api.videos.uploadVideo(selectedFile);
            history.push(`/transcript`, { transcript: response.data });
          }
          break;
        case "text":
          if (textContent) {
            const summary = await api.ai.generateSummary(textContent);
            history.push(`/summary`, { summary: summary.data });
          }
          break;
      }
    } catch (error) {
      console.error("Error processing content:", error);
      // Handle error appropriately
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="home-container">
      <div className="content-box">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "link" ? "active" : ""}`}
            onClick={() => setActiveTab("link")}
          >
            <FaLink /> Link
          </button>
          <button
            className={`tab ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <FaUpload /> Upload
          </button>
          <button
            className={`tab ${activeTab === "text" ? "active" : ""}`}
            onClick={() => setActiveTab("text")}
          >
            <FaFileAlt /> Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          {activeTab === "link" && (
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/your-online-url"
              className="url-input"
              disabled={isProcessing}
            />
          )}

          {activeTab === "upload" && (
            <div
              className={`upload-area ${dragActive ? "drag-active" : ""} ${
                selectedFile ? "has-file" : ""
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <>
                  <FaFileAlt className="file-icon" />
                  <p className="file-name">{selectedFile.name}</p>
                  <button
                    type="button"
                    className="remove-file"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <FaUpload className="upload-icon" />
                  <p>Drag and drop your file here or click to browse</p>
                  <input
                    type="file"
                    className="file-input"
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === "text" && (
            <textarea
              placeholder="Paste your text here..."
              className="text-input"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              disabled={isProcessing}
            />
          )}

          <button
            type="submit"
            className={`synthesize-btn ${isProcessing ? "processing" : ""}`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <FaSpinner className="spinner" /> Processing...
              </>
            ) : (
              "Synthesize Now"
            )}
          </button>
        </form>

        <div className="supported-links">
          <h3>Supported Summary Links</h3>
          <div className="link-types">
            <div className="link-type">
              <img src="/youtube-icon.png" alt="YouTube" />
              <span>YouTube Videos / Podcasts</span>
            </div>
            <div className="link-type">
              <img src="/google-podcast-icon.png" alt="Google Podcasts" />
              <span>Google Podcasts</span>
            </div>
            <div className="link-type">
              <img src="/webpage-icon.png" alt="Webpages" />
              <span>Webpages / Articles</span>
            </div>
            <div className="link-type">
              <img src="/pdf-icon.png" alt="PDF" />
              <span>Online PDFs</span>
            </div>
            <div className="link-type">
              <img src="/word-icon.png" alt="Word" />
              <span>Online Words</span>
            </div>
            <div className="link-type">
              <img src="/ppt-icon.png" alt="PowerPoint" />
              <span>Online PPTs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
