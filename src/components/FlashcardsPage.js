import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaRedo,
  FaCog,
  FaDownload,
  FaPlus,
  FaBookmark,
  FaShare,
  FaPrint,
  FaCheck,
  FaTimes,
  FaVolumeUp,
  FaVolumeMute,
  FaRandom,
  FaStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import "./FlashcardsPage.css";

function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [studyMode, setStudyMode] = useState("review"); // review, quiz, spaced
  const [settings, setSettings] = useState({
    cardStyle: "basic",
    autoFlip: false,
    flipDuration: 5,
    showProgress: true,
    enableSound: true,
    enableAnimations: true,
    darkMode: false,
    fontSize: "medium",
    language: "en",
  });
  const [stats, setStats] = useState({
    totalCards: 0,
    reviewed: 0,
    correct: 0,
    incorrect: 0,
    timeSpent: 0,
  });
  const [bookmarkedCards, setBookmarkedCards] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [studySession, setStudySession] = useState({
    startTime: null,
    endTime: null,
    cardsReviewed: new Set(),
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
    startStudySession();
  }, [text]);

  useEffect(() => {
    if (settings.autoFlip && isFlipped) {
      const timer = setTimeout(() => {
        handleNext();
      }, settings.flipDuration * 1000);
      return () => clearTimeout(timer);
    }
  }, [isFlipped, settings.autoFlip, settings.flipDuration]);

  const startStudySession = () => {
    setStudySession({
      startTime: new Date(),
      endTime: null,
      cardsReviewed: new Set(),
    });
  };

  const endStudySession = () => {
    setStudySession((prev) => ({
      ...prev,
      endTime: new Date(),
    }));
    updateStats();
  };

  const updateStats = useCallback(() => {
    const timeSpent = studySession.endTime
      ? (studySession.endTime - studySession.startTime) / 1000
      : 0;

    setStats((prev) => ({
      ...prev,
      timeSpent: prev.timeSpent + timeSpent,
      cardsReviewed: studySession.cardsReviewed.size,
    }));
  }, [studySession]);

  const generateFlashcards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

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
      setStats((prev) => ({ ...prev, totalCards: data.flashcards.length }));
      setSuccess("Flashcards generated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => {
      const nextIndex = (prev + 1) % flashcards.length;
      updateStudySession(nextIndex);
      return nextIndex;
    });
  }, [flashcards.length]);

  const handlePrevious = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => {
      const prevIndex = (prev - 1 + flashcards.length) % flashcards.length;
      updateStudySession(prevIndex);
      return prevIndex;
    });
  }, [flashcards.length]);

  const updateStudySession = (index) => {
    setStudySession((prev) => ({
      ...prev,
      cardsReviewed: new Set([...prev.cardsReviewed, index]),
    }));
  };

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    if (!isFlipped) {
      updateStudySession(currentIndex);
    }
  }, [currentIndex, isFlipped]);

  const handleShuffle = useCallback(() => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSuccess("Cards shuffled!");
    setTimeout(() => setSuccess(null), 2000);
  }, [flashcards]);

  const handleBookmark = useCallback((index) => {
    setBookmarkedCards((prev) => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(index)) {
        newBookmarks.delete(index);
      } else {
        newBookmarks.add(index);
      }
      return newBookmarks;
    });
  }, []);

  const handleDownload = useCallback(() => {
    try {
      const content = flashcards
        .map(
          (card, i) =>
            `Card ${i + 1}\nQ: ${card.front}\nA: ${card.back}\n${
              card.explanation ? `Explanation: ${card.explanation}\n` : ""
            }${bookmarkedCards.has(i) ? "[Bookmarked]\n" : ""}`
        )
        .join("\n---\n\n");

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flashcards.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess("Flashcards downloaded successfully!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError("Failed to download flashcards");
    }
  }, [flashcards, bookmarkedCards]);

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank");
    const content = flashcards
      .map(
        (card, i) => `
        <div class="print-card">
          <h3>Card ${i + 1}</h3>
          <p><strong>Q:</strong> ${card.front}</p>
          <p><strong>A:</strong> ${card.back}</p>
          ${
            card.explanation
              ? `<p><strong>Explanation:</strong> ${card.explanation}</p>`
              : ""
          }
          ${
            bookmarkedCards.has(i)
              ? '<span class="bookmark-badge">Bookmarked</span>'
              : ""
          }
        </div>
      `
      )
      .join("<hr>");

    printWindow.document.write(`
      <html>
        <head>
          <title>Flashcards</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .print-card { margin-bottom: 20px; }
            .bookmark-badge { color: gold; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [flashcards, bookmarkedCards]);

  const handleShare = async () => {
    try {
      const shareData = {
        title: "My Flashcards",
        text: `Check out these ${flashcards.length} flashcards!`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        setSuccess("Flashcards shared successfully!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setSuccess("Link copied to clipboard!");
      }
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError("Failed to share flashcards");
    }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    if (newSettings.darkMode !== settings.darkMode) {
      document.body.classList.toggle("dark-mode", newSettings.darkMode);
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        size="large"
        text="Generating flashcards..."
        spinnerType="wave"
      />
    );
  }

  return (
    <div
      className="flashcards-container"
      role="main"
      aria-label="Flashcards Study Area"
    >
      <div className="flashcards-header">
        <div className="header-left">
          <button
            className="nav-back-button"
            onClick={() => history.goBack()}
            title="Go back"
            aria-label="Go back"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 tabIndex={0}>Flashcards</h1>
        </div>

        <div className="action-buttons-container">
          <button
            className="action-button"
            onClick={handleShuffle}
            title="Shuffle cards"
            aria-label="Shuffle cards"
          >
            <FaRandom /> <span className="hide-mobile">Shuffle</span>
          </button>
          <button
            className="action-button"
            onClick={handleDownload}
            title="Download flashcards"
            aria-label="Download flashcards"
          >
            <FaDownload /> <span className="hide-mobile">Download</span>
          </button>
          <button
            className="action-button"
            onClick={handlePrint}
            title="Print flashcards"
            aria-label="Print flashcards"
          >
            <FaPrint /> <span className="hide-mobile">Print</span>
          </button>
          <button
            className="action-button"
            onClick={handleShare}
            title="Share flashcards"
            aria-label="Share flashcards"
          >
            <FaShare /> <span className="hide-mobile">Share</span>
          </button>
          <button
            className="action-button"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute" : "Mute"}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <button
            className="action-button--settings"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            aria-label="Settings"
          >
            <FaCog /> <span className="hide-mobile">Settings</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flashcards-error" role="alert">
          <FaTimes /> {error}
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="success-message" role="status">
          <FaCheck /> {success}
        </div>
      )}

      {flashcards.length === 0 ? (
        <div className="flashcards-empty-state">
          <h2>No flashcards generated yet</h2>
          <p>Please provide some content to generate flashcards.</p>
        </div>
      ) : (
        <>
          <div className="flashcard-progress" aria-label="Progress">
            <div className="progress-bar" aria-hidden="true">
              <div
                className="progress-bar__fill"
                style={{
                  width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                }}
              />
            </div>
            <span>
              {currentIndex + 1} / {flashcards.length}
            </span>
          </div>

          {/* Statistics Panel */}
          <div className="flashcard-stats" aria-label="Statistics">
            <span>Total: {stats.totalCards}</span>
            <span>
              Reviewed: {stats.cardsReviewed || studySession.cardsReviewed.size}
            </span>
            <span>Time: {Math.round(stats.timeSpent)}s</span>
          </div>

          {/* Card Flip Animation Structure */}
          <div
            className={`flashcard ${isFlipped ? "flashcard--flipped" : ""} ${
              settings.cardStyle === "dark" ? "flashcard--dark" : ""
            }`}
            tabIndex={0}
            aria-label={
              isFlipped ? "Flashcard answer side" : "Flashcard question side"
            }
            onClick={handleFlip}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && handleFlip()
            }
          >
            <div className="flashcard__inner">
              <div className="flashcard__front" aria-hidden={isFlipped}>
                <h2>{flashcards[currentIndex].front}</h2>
                <button
                  className={`bookmark-button${
                    bookmarkedCards.has(currentIndex) ? " bookmarked" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark(currentIndex);
                  }}
                  title={
                    bookmarkedCards.has(currentIndex)
                      ? "Remove bookmark"
                      : "Bookmark"
                  }
                  aria-label={
                    bookmarkedCards.has(currentIndex)
                      ? "Remove bookmark"
                      : "Bookmark"
                  }
                >
                  <FaStar />
                </button>
              </div>
              <div className="flashcard__back" aria-hidden={!isFlipped}>
                <h2>{flashcards[currentIndex].back}</h2>
                {flashcards[currentIndex].explanation && (
                  <p className="explanation">
                    {flashcards[currentIndex].explanation}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flashcard-controls">
            <button
              className="flashcard-control-button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              aria-label="Previous card"
            >
              <FaArrowLeft /> Previous
            </button>
            <button
              className="flashcard-control-button"
              onClick={handleFlip}
              aria-label={isFlipped ? "Show question" : "Show answer"}
            >
              {isFlipped ? "Show Question" : "Show Answer"}
            </button>
            <button
              className="flashcard-control-button"
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              aria-label="Next card"
            >
              Next <FaArrowRight />
            </button>
          </div>
        </>
      )}

      {showSettings && (
        <div
          className="settings-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Flashcard Settings"
        >
          <div className="settings-content">
            <h2>Flashcard Settings</h2>
            <div className="settings-group">
              <h3>Card Style</h3>
              <select
                value={settings.cardStyle}
                onChange={(e) =>
                  handleSettingsChange({
                    ...settings,
                    cardStyle: e.target.value,
                  })
                }
                aria-label="Card style"
              >
                <option value="basic">Basic</option>
                <option value="dark">Dark</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div className="settings-group">
              <h3>Study Options</h3>
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoFlip}
                  onChange={(e) =>
                    handleSettingsChange({
                      ...settings,
                      autoFlip: e.target.checked,
                    })
                  }
                  aria-label="Auto-flip cards"
                />
                Auto-flip cards
              </label>
              <label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.flipDuration}
                  onChange={(e) =>
                    handleSettingsChange({
                      ...settings,
                      flipDuration: parseInt(e.target.value),
                    })
                  }
                  aria-label="Flip duration in seconds"
                />
                Flip duration (seconds)
              </label>
            </div>
            <div className="settings-group">
              <h3>Display Options</h3>
              <label>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) =>
                    handleSettingsChange({
                      ...settings,
                      darkMode: e.target.checked,
                    })
                  }
                  aria-label="Dark mode"
                />
                Dark mode
              </label>
              <label>
                <select
                  value={settings.fontSize}
                  onChange={(e) =>
                    handleSettingsChange({
                      ...settings,
                      fontSize: e.target.value,
                    })
                  }
                  aria-label="Font size"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
                Font size
              </label>
            </div>
            <div className="settings-actions">
              <button
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                Close
              </button>
              <button onClick={generateFlashcards} aria-label="Apply changes">
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardsPage;
