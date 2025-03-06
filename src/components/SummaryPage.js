import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  FaArrowLeft,
  FaRegCopy,
  FaDownload,
  FaRegEdit,
  FaRegSave,
  FaTimes,
  FaCog,
  FaCheck,
  FaRedo,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBoundary from "./ErrorBoundary";
import api from "../services/api";
import "./SummaryPage.css";

function SummaryPage() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState({
    style: "concise",
    length: "medium",
    tone: "formal",
    language: "en",
    includeKeyPoints: true,
    includeSources: false,
  });

  const location = useLocation();
  const history = useHistory();
  const content = location.state?.text;
  const videoInfo = location.state?.videoInfo;

  const generateSummary = useCallback(async () => {
    if (!content) {
      setError("No content provided for summarization");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.ai.generateSummary(content, settings);
      setSummary(response.summary);
      setEditedSummary(response.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [content, settings]);

  useEffect(() => {
    if (!content) {
      history.push("/");
    } else {
      generateSummary();
    }
  }, [content, generateSummary, history]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedSummary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setError("Failed to copy summary");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([editedSummary], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `summary-${videoInfo?.title || "content"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download summary");
    }
  };

  const handleSaveEdit = () => {
    setSummary(editedSummary);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        text="Generating summary..."
        size="large"
        spinnerType="wave"
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="summary-page">
        <div className="summary-header">
          <button
            className="back-button"
            onClick={history.goBack}
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
          <div className="summary-actions">
            <button
              className="action-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <FaRegSave /> : <FaRegEdit />}{" "}
              {isEditing ? "Save" : "Edit"}
            </button>
            <button
              className={`action-button ${copySuccess ? "success" : ""}`}
              onClick={handleCopy}
            >
              {copySuccess ? <FaCheck /> : <FaRegCopy />}{" "}
              {copySuccess ? "Copied!" : "Copy"}
            </button>
            <button className="action-button" onClick={handleDownload}>
              <FaDownload /> Download
            </button>
            <button
              className="action-button"
              onClick={generateSummary}
              disabled={isLoading}
            >
              <FaRedo /> Regenerate
            </button>
            <button
              className="action-button settings"
              onClick={() => setShowSettings(!showSettings)}
            >
              <FaCog /> Settings
            </button>
          </div>
        </div>
        {error && (
          <div className="error-message" role="alert">
            {error}{" "}
            <button onClick={generateSummary} className="retry-button">
              Retry
            </button>
          </div>
        )}
        <div className="summary-content">
          {isEditing ? (
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="summary-editor"
              placeholder="Summary content..."
              spellCheck="true"
            />
          ) : (
            <div className="summary-text">
              {summary.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
        {isEditing && (
          <div className="edit-actions">
            <button
              className="cancel-button"
              onClick={() => {
                setIsEditing(false);
                setEditedSummary(summary);
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
              <h2>Summary Settings</h2>
              <div className="settings-group">
                <label>Style</label>
                <select
                  value={settings.style}
                  onChange={(e) =>
                    setSettings({ ...settings, style: e.target.value })
                  }
                >
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                  <option value="bullet-points">Bullet Points</option>
                </select>
              </div>
              <div className="settings-actions">
                <button onClick={() => setShowSettings(false)}>Close</button>
                <button onClick={generateSummary} className="primary">
                  Regenerate Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default SummaryPage;
