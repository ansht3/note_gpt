import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  FaFileAlt,
  FaRegCopy,
  FaDownload,
  FaRegEdit,
  FaPlay,
  FaArrowLeft,
  FaRegSave,
  FaTimes,
  FaCog,
  FaCheck,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBoundary from "./ErrorBoundary";
import api from "../services/api";
import "./TranscriptPage.css";

function TranscriptPage() {
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: "medium",
    lineSpacing: "normal",
    showTimestamps: false,
    highlightKeywords: true,
  });
  const [copySuccess, setCopySuccess] = useState(false);

  const location = useLocation();
  const history = useHistory();

  const fetchTranscript = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams(location.search);
      const videoUrl = params.get("url");

      if (!videoUrl) {
        throw new Error("No video URL provided");
      }

      const response = await api.videos.getTranscript(videoUrl);
      setTranscript(response.transcript);
      setEditedTranscript(response.transcript);
      setVideoInfo(response.videoInfo);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    fetchTranscript();
  }, [fetchTranscript]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedTranscript);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError("Failed to copy transcript");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([editedTranscript], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcript-${videoInfo?.title || "video"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download transcript");
    }
  };

  const handleSaveEdit = () => {
    setTranscript(editedTranscript);
    setIsEditing(false);
  };

  const handleGenerateContent = async (type) => {
    try {
      setIsLoading(true);
      const paths = {
        summary: "/summary",
        presentation: "/presentation",
        flashcards: "/flashcards",
        quiz: "/quiz",
      };

      // Pre-process content if needed
      const processedContent = editedTranscript.trim();

      history.push(paths[type], {
        text: processedContent,
        videoInfo,
        settings,
      });
    } catch (err) {
      setError(`Failed to generate ${type}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        text="Processing transcript..."
        size="large"
        spinnerType="wave"
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="transcript-page">
        <div className="transcript-header">
          <button
            className="back-button"
            onClick={() => history.goBack()}
            title="Go back"
          >
            <FaArrowLeft /> Back
          </button>

          {videoInfo && (
            <div className="video-info">
              <h1>{videoInfo.title}</h1>
              <p className="video-metadata">
                {videoInfo.author} • {videoInfo.duration}
              </p>
            </div>
          )}

          <div className="transcript-actions">
            <button
              className="action-button"
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "Save changes" : "Edit transcript"}
            >
              {isEditing ? <FaRegSave /> : <FaRegEdit />}
              {isEditing ? "Save" : "Edit"}
            </button>
            <button
              className={`action-button ${copySuccess ? "success" : ""}`}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copySuccess ? <FaCheck /> : <FaRegCopy />}
              {copySuccess ? "Copied!" : "Copy"}
            </button>
            <button
              className="action-button"
              onClick={handleDownload}
              title="Download transcript"
            >
              <FaDownload />
              Download
            </button>
            <button
              className="action-button settings"
              onClick={() => setShowSettings(!showSettings)}
              title="Transcript settings"
            >
              <FaCog />
              Settings
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
            <button onClick={fetchTranscript} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <div
          className={`transcript-content ${settings.fontSize} ${settings.lineSpacing}`}
        >
          {isEditing ? (
            <textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              className="transcript-editor"
              placeholder="Transcript content..."
              spellCheck="true"
              aria-label="Edit transcript"
            />
          ) : (
            <div className="transcript-text">
              {transcript.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        <div className="generate-options">
          <h2>Generate Content</h2>
          <div className="options-grid">
            {[
              {
                type: "summary",
                icon: <FaFileAlt />,
                label: "Summary",
                description: "Generate a concise summary",
              },
              {
                type: "presentation",
                icon: <FaPlay />,
                label: "Presentation",
                description: "Create presentation slides",
              },
              {
                type: "flashcards",
                icon: <FaFileAlt />,
                label: "Flashcards",
                description: "Generate study flashcards",
              },
            ].map(({ type, icon, label, description }) => (
              <button
                key={type}
                className="option-card"
                onClick={() => handleGenerateContent(type)}
                disabled={isLoading}
              >
                {icon}
                <h3>{label}</h3>
                <p>{description}</p>
              </button>
            ))}
          </div>
        </div>

        {isEditing && (
          <div className="edit-actions">
            <button
              className="cancel-button"
              onClick={() => {
                setIsEditing(false);
                setEditedTranscript(transcript);
              }}
            >
              <FaTimes /> Cancel
            </button>
            <button className="save-button" onClick={handleSaveEdit}>
              <FaRegSave /> Save Changes
            </button>
          </div>
        )}

        {showSettings && (
          <div className="settings-modal">
            <div className="settings-content">
              <h2>Transcript Settings</h2>
              {/* Add settings controls here */}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default TranscriptPage;
