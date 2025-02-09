import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import "./TranscriptPage.css";

function TranscriptPage() {
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const videoUrl = params.get("url");

        if (!videoUrl) {
          throw new Error("No video URL provided");
        }

        const response = await fetch(
          `/api/transcript?url=${encodeURIComponent(videoUrl)}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setTranscript(data.transcript);
        setEditedTranscript(data.transcript);
        setVideoInfo(data.videoInfo);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranscript();
  }, [location]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedTranscript);
      // Optional: Add success toast notification
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

  const handleGenerateContent = (type) => {
    const paths = {
      summary: "/summary",
      presentation: "/presentation",
      flashcards: "/flashcards",
      quiz: "/quiz",
    };

    history.push(paths[type], { transcript: editedTranscript });
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        text="Fetching transcript..."
        size="large"
        spinnerType="wave"
      />
    );
  }

  return (
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
            className="action-button"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            <FaRegCopy />
            Copy
          </button>
          <button
            className="action-button"
            onClick={handleDownload}
            title="Download transcript"
          >
            <FaDownload />
            Download
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="transcript-content">
        {isEditing ? (
          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="transcript-editor"
            placeholder="Transcript content..."
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
          <button
            className="option-card"
            onClick={() => handleGenerateContent("summary")}
          >
            <FaFileAlt />
            <h3>Summary</h3>
            <p>Generate a concise summary</p>
          </button>
          <button
            className="option-card"
            onClick={() => handleGenerateContent("presentation")}
          >
            <FaPlay />
            <h3>Presentation</h3>
            <p>Create presentation slides</p>
          </button>
          <button
            className="option-card"
            onClick={() => handleGenerateContent("flashcards")}
          >
            <FaFileAlt />
            <h3>Flashcards</h3>
            <p>Generate study flashcards</p>
          </button>
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
    </div>
  );
}

export default TranscriptPage;
