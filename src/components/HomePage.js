import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  FaYoutube,
  FaFileUpload,
  FaKeyboard,
  FaLightbulb,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import "./HomePage.css";

function HomePage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const history = useHistory();

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      history.push(`/transcript?url=${encodeURIComponent(url)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualInput = () => {
    history.push("/create");
  };

  const features = [
    {
      icon: <FaYoutube />,
      title: "YouTube Integration",
      description: "Generate notes from any YouTube video automatically",
    },
    {
      icon: <FaFileUpload />,
      title: "File Upload",
      description: "Upload your own content for processing",
    },
    {
      icon: <FaKeyboard />,
      title: "Manual Input",
      description: "Type or paste your own text for processing",
    },
    {
      icon: <FaLightbulb />,
      title: "AI-Powered",
      description: "Advanced AI for high-quality content generation",
    },
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>Transform Content into Knowledge</h1>
        <p className="hero-subtitle">
          Generate summaries, presentations, and flashcards from YouTube videos
          or your own content
        </p>

        <div className="input-container">
          <form onSubmit={handleUrlSubmit} className="url-form">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="url-input"
            />
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              Generate
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button onClick={handleManualInput} className="manual-input-button">
            Enter Text Manually
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        {isLoading && (
          <LoadingSpinner
            size="large"
            text="Processing your request..."
            spinnerType="wave"
          />
        )}
      </section>

      <section className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Input Content</h3>
            <p>Paste a YouTube URL or enter your text</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Processing</h3>
            <p>Our AI analyzes and processes your content</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Generate</h3>
            <p>Get your summaries, flashcards, or presentations</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
