import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaDownload, FaCog } from "react-icons/fa";
import api from "../services/api";
import LoadingSpinner from "./LoadingSpinner";
import "./PresentationPage.css";

function PresentationPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState([]);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    theme: "professional",
    slidesPerTopic: 2,
    includeImages: false,
  });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    theme: "professional",
    slidesPerTopic: 2,
    includeImages: false,
  });

  const generatePresentation = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const text = location.state?.text || "";
      if (!text) {
        throw new Error("No content provided for presentation generation");
      }

      const response = await api.ai.generateSlides(text, settings);
      if (response.success) {
        setSlides(response.slides);
      } else {
        throw new Error(response.error || "Failed to generate presentation");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPresentation = async () => {
    try {
      // Implementation for downloading presentation
      // You'll need to add pptx generation logic here
      console.log("Downloading presentation...");
    } catch (err) {
      setError("Failed to download presentation");
    }
  };

  const renderSlides = () => {
    return slides.map((slide, index) => (
      <div
        key={index}
        className={`slide ${index === currentSlideIndex ? "active" : ""}`}
      >
        <h2 className="slide-title">{slide.title}</h2>
        <div className="slide-content">
          {slide.content.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    ));
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <div className="presentation-page">
      <div className="presentation-header">
        <h1>AI Presentation Generator</h1>
        <div className="presentation-actions">
          <button
            className="settings-button"
            onClick={() => {
              /* Add settings modal logic */
            }}
          >
            <FaCog /> Settings
          </button>
          {slides.length > 0 && (
            <button className="download-button" onClick={downloadPresentation}>
              <FaDownload /> Download PPTX
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isGenerating ? (
        <LoadingSpinner
          text="Generating your presentation..."
          size="large"
          spinnerType="wave"
        />
      ) : slides.length > 0 ? (
        <div className="slides-container">
          {renderSlides()}
          <div className="slide-controls">
            <button onClick={previousSlide} disabled={currentSlideIndex === 0}>
              Previous
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlideIndex === slides.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>Click generate to create your presentation</p>
          <button
            className="generate-button"
            onClick={generatePresentation}
            disabled={!location.state?.text}
          >
            Generate Presentation
          </button>
        </div>
      )}
    </div>
  );
}

export default PresentationPage;
