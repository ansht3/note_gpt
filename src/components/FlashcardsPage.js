import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaRedo,
  FaCog,
  FaDownload,
  FaPlus,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import "./FlashcardsPage.css";

function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studyMode, setStudyMode] = useState("review"); // review, quiz, spaced
  const [settings, setSettings] = useState({
    cardStyle: "basic", // basic, detailed, minimal
    autoFlip: false,
    flipDuration: 5,
    showProgress: true,
  });

  const location = useLocation();
  const history = useHistory();
  const text = location.state?.text;

  useEffect(() => {
    if (!text) {
      setError("No content provided for flashcard generation");
      setIsLoading(false);
      return;
    }
    generateFlashcards();
  }, [text]);

  const generateFlashcards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          settings,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setFlashcards(data.flashcards);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleDownload = () => {
    try {
      const content = flashcards
        .map((card, i) => `Card ${i + 1}\nQ: ${card.front}\nA: ${card.back}\n`)
        .join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flashcards.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download flashcards");
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        text="Generating flashcards..."
        size="large"
        spinnerType="wave"
      />
    );
  }

  return (
    <div className="flashcards-page">
      <div className="flashcards-header">
        <button
          className="back-button"
          onClick={() => history.goBack()}
          title="Go back"
        >
          <FaArrowLeft /> Back
        </button>
        <h1>Flashcards</h1>
        <div className="flashcards-actions">
          <button
            className="action-button"
            onClick={handleShuffle}
            title="Shuffle cards"
          >
            <FaRedo />
            Shuffle
          </button>
          <button
            className="action-button"
            onClick={handleDownload}
            title="Download flashcards"
          >
            <FaDownload />
            Download
          </button>
          <button
            className="action-button settings"
            onClick={() => {
              /* Add settings modal logic */
            }}
            title="Flashcard settings"
          >
            <FaCog />
            Settings
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {flashcards.length > 0 && (
        <div className="flashcards-container">
          <div
            className={`flashcard ${isFlipped ? "flipped" : ""}`}
            onClick={handleFlip}
          >
            <div className="flashcard-inner">
              <div className="flashcard-front">
                <p>{flashcards[currentIndex].front}</p>
              </div>
              <div className="flashcard-back">
                <p>{flashcards[currentIndex].back}</p>
              </div>
            </div>
          </div>

          <div className="flashcard-controls">
            <button
              className="control-button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <FaArrowLeft /> Previous
            </button>
            <div className="flashcard-progress">
              {currentIndex + 1} / {flashcards.length}
            </div>
            <button
              className="control-button"
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
            >
              Next <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {flashcards.length === 0 && !isLoading && (
        <div className="empty-state">
          <p>No flashcards available</p>
          <button className="generate-button" onClick={generateFlashcards}>
            <FaPlus /> Generate Flashcards
          </button>
        </div>
      )}
    </div>
  );
}

export default FlashcardsPage;
