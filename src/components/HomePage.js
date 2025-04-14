import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import {
  FaYoutube,
  FaFileUpload,
  FaKeyboard,
  FaLightbulb,
  FaRocket,
  FaBrain,
  FaChalkboardTeacher,
  FaBookReader,
} from "react-icons/fa";
import apiClient from '../utils/axiosConfig';
import LoadingSpinner from "./LoadingSpinner";
import "./HomePage.css";

function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const history = useHistory();

  const handleError = (error) => {
    setLoading(false);
    setError(error.response?.data?.message || error.message || "An error occurred");
    console.error("API error:", error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/videos/transcript', {
        url: url
      });
      
      setLoading(false);
      // Handle successful response
    } catch (error) {
      handleError(error);
    }
  };

  const features = [
    {
      icon: <FaYoutube />,
      title: "YouTube Integration",
      description: "Generate notes from any YouTube video automatically",
    },
    {
      icon: <FaBrain />,
      title: "AI-Powered Analysis",
      description: "Advanced AI for comprehensive content understanding",
    },
    {
      icon: <FaChalkboardTeacher />,
      title: "Smart Presentations",
      description: "Create engaging presentations with key insights",
    },
    {
      icon: <FaBookReader />,
      title: "Study Tools",
      description: "Generate flashcards and study materials instantly",
    },
  ];

  const tools = [
    {
      icon: <FaRocket />,
      title: "Summarization",
      description: "Get concise summaries of long content",
      path: "/summary",
    },
    {
      icon: <FaFileUpload />,
      title: "Presentation Creator",
      description: "Transform content into professional slides",
      path: "/presentation",
    },
    {
      icon: <FaKeyboard />,
      title: "Flashcard Generator",
      description: "Create effective study flashcards",
      path: "/flashcards",
    },
    {
      icon: <FaLightbulb />,
      title: "Quiz Maker",
      description: "Generate practice questions and quizzes",
      path: "/quiz",
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
          <form onSubmit={handleSubmit} className="url-form">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="url-input"
              aria-label="YouTube URL input"
            />
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
              aria-label="Generate content"
            >
              Generate
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            onClick={() => history.push('/manual-input')}
            className="manual-input-button"
            aria-label="Enter text manually"
          >
            Enter Text Manually
          </button>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
        </div>

        {loading && (
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
            <div key={index} className="feature-card" role="article">ndex} className="feature-card" role="article">or && (
              <div className="feature-icon">{feature.icon}</div></div>              <div className="error-message" role="alert">
              <h3>{feature.title}</h3>ure.title}</h3>
              <p>{feature.description}</p>ature.description}</p>
            </div>div>
          ))}
        </div>        </div>
      </section>

      <section className="tools-section">tools-section">
        <h2>Available Tools</h2>ur request..."
        <div className="tools-grid">id"> spinnerType="wave"
          {tools.map((tool, index) => (ls.map((tool, index) => (
            <button<button
              key={index}{index}        </section>
              className="tool-card"              className="tool-card"
              onClick={() => history.push(tool.path)}.path)}ures-section">
              aria-label={`Use ${tool.title}`}Use ${tool.title}`}
            >
              <div className="tool-icon">{tool.icon}</div>icon}</div>es.map((feature, index) => (
              <h3>{tool.title}</h3>"article">
              <p>{tool.description}</p>div>
            </button>
          ))}
        </div>>
      </section>>

      <section className="how-it-works">ssName="how-it-works">
        <h2>How It Works</h2>        <h2>How It Works</h2>
        <div className="steps-container">n className="tools-section">
          <div className="step">ailable Tools</h2>
            <div className="step-number">1</div>r">1</div>lassName="tools-grid">
            <h3>Input Content</h3>     {tools.map((tool, index) => (
            <p>Paste a YouTube URL or enter your text</p>a YouTube URL or enter your text</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>push(tool.path)}
            <h3>AI Processing</h3>
            <p>Our AI analyzes and processes your content</p>Our AI analyzes and processes your content</p>
          </div>
          <div className="step">    );
  }
}

export default HomePage;
