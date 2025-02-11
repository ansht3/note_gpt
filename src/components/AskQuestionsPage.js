import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  FaArrowLeft,
  FaSync,
  FaDownload,
  FaCopy,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import "./AskQuestionsPage.css";

function AskQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    difficulty: "mixed", // easy, medium, hard, mixed
    type: "all", // multiple-choice, open-ended, true-false, all
    count: 10,
    topics: [], // Generated from content
  });
  const [showSettings, setShowSettings] = useState(false);

  const location = useLocation();
  const history = useHistory();
  const content = location.state?.transcript || location.state?.text;

  useEffect(() => {
    if (!content) {
      setError("No content provided for question generation");
      return;
    }
    generateQuestions();
  }, [content]);

  const generateQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          settings,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate questions");
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateQuestions = () => {
    generateQuestions();
  };

  const handleCopyQuestions = async () => {
    try {
      const formattedQuestions = questions
        .map(
          (q, index) =>
            `${index + 1}. ${q.question}\n${
              q.type === "multiple-choice"
                ? q.options
                    .map(
                      (opt, i) => `   ${String.fromCharCode(97 + i)}) ${opt}`
                    )
                    .join("\n")
                : ""
            }\n`
        )
        .join("\n");

      await navigator.clipboard.writeText(formattedQuestions);
      // Optional: Add success toast notification
    } catch (err) {
      setError("Failed to copy questions");
    }
  };

  const handleDownloadQuestions = () => {
    try {
      const formattedQuestions = questions
        .map(
          (q, index) =>
            `Question ${index + 1}:\n${q.question}\n${
              q.type === "multiple-choice"
                ? "\nOptions:\n" +
                  q.options
                    .map((opt, i) => `${String.fromCharCode(97 + i)}) ${opt}`)
                    .join("\n")
                : ""
            }\n${q.explanation ? `\nExplanation: ${q.explanation}\n` : ""}\n`
        )
        .join("\n---\n\n");

      const blob = new Blob([formattedQuestions], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "generated-questions.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download questions");
    }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    generateQuestions();
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        size="large"
        text="Generating questions..."
        spinnerType="wave"
      />
    );
  }

  return (
    <div className="questions-page">
      <div className="questions-header">
        <button
          className="back-button"
          onClick={() => history.goBack()}
          title="Go back"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="questions-actions">
          <button
            className="action-button"
            onClick={handleRegenerateQuestions}
            title="Regenerate questions"
          >
            <FaSync /> Regenerate
          </button>
          <button
            className="action-button"
            onClick={handleCopyQuestions}
            title="Copy to clipboard"
          >
            <FaCopy /> Copy
          </button>
          <button
            className="action-button"
            onClick={handleDownloadQuestions}
            title="Download questions"
          >
            <FaDownload /> Download
          </button>
          <button
            className="action-button settings"
            onClick={() => setShowSettings(!showSettings)}
            title="Question settings"
          >
            <FaCog /> Settings
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="questions-content">
        {questions.map((question, index) => (
          <div key={index} className="question-card">
            <div className="question-header">
              <span className="question-number">Question {index + 1}</span>
              <span className="question-type">{question.type}</span>
              <span className="question-difficulty">{question.difficulty}</span>
            </div>
            <p className="question-text">{question.question}</p>
            {question.type === "multiple-choice" && (
              <div className="question-options">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="option">
                    <span className="option-letter">
                      {String.fromCharCode(97 + optIndex)}
                    </span>
                    {option}
                  </div>
                ))}
              </div>
            )}
            {question.explanation && (
              <div className="question-explanation">
                <FaQuestionCircle />
                <p>{question.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h2>Question Settings</h2>
            {/* Add settings form components here */}
          </div>
        </div>
      )}
    </div>
  );
}

export default AskQuestionsPage;
