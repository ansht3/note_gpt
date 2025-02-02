import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { FaLink, FaUpload, FaFileAlt } from "react-icons/fa";
import "./HomePage.css";

function HomePage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [activeTab, setActiveTab] = useState("link");
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (videoUrl) {
      history.push(`/transcript?url=${encodeURIComponent(videoUrl)}`);
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
            />
          )}
          {activeTab === "upload" && (
            <div className="upload-area">
              <FaUpload />
              <p>Drag and drop your file here or click to browse</p>
              <input type="file" className="file-input" />
            </div>
          )}
          {activeTab === "text" && (
            <textarea
              placeholder="Paste your text here..."
              className="text-input"
            />
          )}
          <button type="submit" className="synthesize-btn">
            Synthesize Now
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
