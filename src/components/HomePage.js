import React, { useState } from "react";
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

      // Validate YouTube URL
      const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeRegex.test(url)) {
        throw new Error("Please enter a valid YouTube URL");
      }

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
          <form onSubmit={handleUrlSubmit} className="url-form">
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
              disabled={isLoading}
              aria-label="Generate content"
            >
              Generate
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            onClick={handleManualInput}
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
            <div key={index} className="feature-card" role="article">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tools-section">
        <h2>Available Tools</h2>
        <div className="tools-grid">
          {tools.map((tool, index) => (
            <button
              key={index}
              className="tool-card"
              onClick={() => history.push(tool.path)}
              aria-label={`Use ${tool.title}`}
            >
              <div className="tool-icon">{tool.icon}</div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
            </button>
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
