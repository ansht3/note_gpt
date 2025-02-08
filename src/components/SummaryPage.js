import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  FaDownload,
  FaCopy,
  FaEdit,
  FaArrowLeft,
  FaSliders,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import "./SummaryPage.css";

function SummaryPage() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [settings, setSettings] = useState({
    length: "medium",
    style: "concise",
    format: "paragraphs",
  });

  const location = useLocation();
  const history = useHistory();
  const transcript = location.state?.transcript;

  useEffect(() => {
    if (!transcript) {
      setError("No transcript provided");
      setIsLoading(false);
      return;
    }
    generateSummary();
  }, [transcript]);

  const generateSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          settings,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSummary(data.summary);
      setEditedSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedSummary);
      // Optional: Add success toast notification
    } catch (err) {
      setError("Failed to copy summary");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([editedSummary], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "summary.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download summary");
    }
  };

  const handleSaveEdit = () => {
    setSummary(editedSummary);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="summary-loading">
        <LoadingSpinner
          text="Generating summary..."
          size="large"
          spinnerType="wave"
        />
      </div>
    );
  }

  return (
    <div className="summary-page">
      <div className="summary-header">
        <button
          className="back-button"
          onClick={() => history.goBack()}
          title="Go back"
        >
          <FaArrowLeft /> Back
        </button>
        <h1>Summary</h1>
        <div className="summary-actions">
          <button
            className="action-button"
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Save changes" : "Edit summary"}
          >
            <FaEdit />
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            className="action-button"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            <FaCopy />
            Copy
          </button>
          <button
            className="action-button"
            onClick={handleDownload}
            title="Download summary"
          >
            <FaDownload />
            Download
          </button>
          <button
            className="action-button settings"
            onClick={() => {
              /* Add settings modal logic */
            }}
            title="Summary settings"
          >
            <FaSliders />
            Settings
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="summary-content">
        {isEditing ? (
          <textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="summary-editor"
            placeholder="Summary content..."
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
            Cancel
          </button>
          <button className="save-button" onClick={handleSaveEdit}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

export default SummaryPage;
