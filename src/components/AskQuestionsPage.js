import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  FaArrowLeft,
  FaSync,
  FaDownload,
  FaCopy,
  FaCog,
  FaQuestionCircle,
  FaCheck,
  FaTimes,
  FaFilter,
  FaSort,
  FaBookmark,
  FaShare,
  FaPrint,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import "./AskQuestionsPage.css";

function AskQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [settings, setSettings] = useState({
    difficulty: "mixed",
    type: "all",
    count: 10,
    topics: [],
    includeExplanations: true,
    language: "en",
    timeLimit: 0, // 0 means no time limit
    randomizeOrder: true,
    includeImages: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: [],
    type: [],
    topics: [],
  });
  const [stats, setStats] = useState({
    totalQuestions: 0,
    byDifficulty: {},
    byType: {},
    byTopic: {},
  });

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

  useEffect(() => {
    updateStats();
    applyFilters();
  }, [questions, filters]);

  // Update stats
  const updateStats = useCallback(() => {
    const newStats = {
      totalQuestions: questions.length,
      byDifficulty: {},
      byType: {},
      byTopic: {},
    };

    questions.forEach((q) => {
      newStats.byDifficulty[q.difficulty] =
        (newStats.byDifficulty[q.difficulty] || 0) + 1;
      newStats.byType[q.type] = (newStats.byType[q.type] || 0) + 1;
      q.topics?.forEach((topic) => {
        newStats.byTopic[topic] = (newStats.byTopic[topic] || 0) + 1;
      });
    });

    setStats(newStats);
  }, [questions]);

  const applyFilters = useCallback(() => {
    let filtered = [...questions];

    if (filters.difficulty.length > 0) {
      filtered = filtered.filter((q) =>
        filters.difficulty.includes(q.difficulty)
      );
    }
    if (filters.type.length > 0) {
      filtered = filtered.filter((q) => filters.type.includes(q.type));
    }
    if (filters.topics.length > 0) {
      filtered = filtered.filter((q) =>
        q.topics?.some((topic) => filters.topics.includes(topic))
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredQuestions(filtered);
  }, [questions, filters, sortConfig]);

  // Generate questions
  const generateQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

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
      setSuccess("Questions generated successfully!");

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
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
      const selectedQs =
        selectedQuestions.size > 0
          ? questions.filter((_, i) => selectedQuestions.has(i))
          : questions;

      const formattedQuestions = selectedQs
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
            }\n${q.explanation ? `\nExplanation: ${q.explanation}\n` : ""}`
        )
        .join("\n\n");

      await navigator.clipboard.writeText(formattedQuestions);
      setSuccess("Questions copied to clipboard!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to copy questions");
    }
  };

  const handleDownloadQuestions = () => {
    try {
      const selectedQs =
        selectedQuestions.size > 0
          ? questions.filter((_, i) => selectedQuestions.has(i))
          : questions;

      const formattedQuestions = selectedQs
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
      setSuccess("Questions downloaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to download questions");
    }
  };

  const handlePrintQuestions = () => {
    const printWindow = window.open("", "_blank");
    const selectedQs =
      selectedQuestions.size > 0
        ? questions.filter((_, i) => selectedQuestions.has(i))
        : questions;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Generated Questions</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; padding: 20px; }
              .question { margin-bottom: 20px; }
              .options { margin-left: 20px; }
              .explanation { margin-top: 10px; font-style: italic; }
            }
          </style>
        </head>
        <body>
          ${selectedQs
            .map(
              (q, index) => `
            <div class="question">
              <h3>Question ${index + 1}</h3>
              <p>${q.question}</p>
              ${
                q.type === "multiple-choice"
                  ? `
                <div class="options">
                  ${q.options
                    .map(
                      (opt, i) => `
                    <p>${String.fromCharCode(97 + i)}) ${opt}</p>
                  `
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
              ${
                q.explanation
                  ? `
                <div class="explanation">
                  <strong>Explanation:</strong> ${q.explanation}
                </div>
              `
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Share questions
  const handleShareQuestions = async () => {
    try {
      const selectedQs =
        selectedQuestions.size > 0
          ? questions.filter((_, i) => selectedQuestions.has(i))
          : questions;

      const shareData = {
        title: "Generated Questions",
        text: `Check out these ${selectedQs.length} questions!`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        setSuccess("Questions shared successfully!");
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        setSuccess("Link copied to clipboard!");
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to share questions");
    }
  };

  const handleQuestionSelect = (index) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map((_, i) => i)));
    }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    generateQuestions();
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        size="large"
        text="Generating questions..."
        spinnerType="circle"
      />
    );
  }

  return (
    <div className="questions-page">
      <div className="questions-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => history.goBack()}
            title="Go back"
          >
            <FaArrowLeft /> Back
          </button>
          <h1>Generated Questions</h1>
        </div>

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
            disabled={questions.length === 0}
          >
            <FaCopy /> Copy
          </button>
          <button
            className="action-button"
            onClick={handleDownloadQuestions}
            title="Download questions"
            disabled={questions.length === 0}
          >
            <FaDownload /> Download
          </button>
          <button
            className="action-button"
            onClick={handlePrintQuestions}
            title="Print questions"
            disabled={questions.length === 0}
          >
            <FaPrint /> Print
          </button>
          <button
            className="action-button"
            onClick={handleShareQuestions}
            title="Share questions"
            disabled={questions.length === 0}
          >
            <FaShare /> Share
          </button>
          <button
            className="action-button"
            onClick={() => setShowFilters(!showFilters)}
            title="Filter questions"
          >
            <FaFilter /> Filter
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
          <FaTimes /> {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {success && (
        <div className="success-message" role="alert">
          <FaCheck /> {success}
        </div>
      )}

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <h3>Difficulty</h3>
            {Object.entries(stats.byDifficulty).map(([diff, count]) => (
              <label key={diff}>
                <input
                  type="checkbox"
                  checked={filters.difficulty.includes(diff)}
                  onChange={(e) => {
                    const newFilters = { ...filters };
                    if (e.target.checked) {
                      newFilters.difficulty.push(diff);
                    } else {
                      newFilters.difficulty = newFilters.difficulty.filter(
                        (d) => d !== diff
                      );
                    }
                    setFilters(newFilters);
                  }}
                />
                {diff} ({count})
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h3>Type</h3>
            {Object.entries(stats.byType).map(([type, count]) => (
              <label key={type}>
                <input
                  type="checkbox"
                  checked={filters.type.includes(type)}
                  onChange={(e) => {
                    const newFilters = { ...filters };
                    if (e.target.checked) {
                      newFilters.type.push(type);
                    } else {
                      newFilters.type = newFilters.type.filter(
                        (t) => t !== type
                      );
                    }
                    setFilters(newFilters);
                  }}
                />
                {type} ({count})
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="questions-stats">
        <div className="stat-item">
          <span className="stat-label">Total Questions:</span>
          <span className="stat-value">{stats.totalQuestions}</span>
        </div>
        {Object.entries(stats.byDifficulty).map(([diff, count]) => (
          <div key={diff} className="stat-item">
            <span className="stat-label">{diff}:</span>
            <span className="stat-value">{count}</span>
          </div>
        ))}
      </div>

      <div className="questions-content">
        <div className="questions-toolbar">
          <button
            className="select-all-button"
            onClick={handleSelectAll}
            title="Select all questions"
          >
            {selectedQuestions.size === questions.length
              ? "Deselect All"
              : "Select All"}
          </button>
          <div className="sort-options">
            <button onClick={() => handleSort("difficulty")}>
              <FaSort /> Difficulty
            </button>
            <button onClick={() => handleSort("type")}>
              <FaSort /> Type
            </button>
          </div>
        </div>

        {filteredQuestions.map((question, index) => (
          <div
            key={index}
            className={`question-card ${
              selectedQuestions.has(index) ? "selected" : ""
            }`}
            onClick={() => handleQuestionSelect(index)}
          >
            <div className="question-header">
              <span className="question-number">Question {index + 1}</span>
              <span className="question-type">{question.type}</span>
              <span className="question-difficulty">{question.difficulty}</span>
              <button
                className="bookmark-button"
                onClick={(e) => {
                  e.stopPropagation();
                  // Implement bookmark functionality
                }}
                title="Bookmark question"
              >
                <FaBookmark />
              </button>
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
            <div className="settings-group">
              <h3>Difficulty</h3>
              <select
                value={settings.difficulty}
                onChange={(e) =>
                  handleSettingsChange({
                    ...settings,
                    difficulty: e.target.value,
                  })
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div className="settings-group">
              <h3>Question Type</h3>
              <select
                value={settings.type}
                onChange={(e) =>
                  handleSettingsChange({ ...settings, type: e.target.value })
                }
              >
                <option value="all">All Types</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="open-ended">Open Ended</option>
                <option value="true-false">True/False</option>
              </select>
            </div>
            <div className="settings-group">
              <h3>Number of Questions</h3>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.count}
                onChange={(e) =>
                  handleSettingsChange({
                    ...settings,
                    count: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="settings-group">
              <h3>Additional Options</h3>
              <label>
                <input
                  type="checkbox"
                  checked={settings.includeExplanations}
                  onChange={(e) =>
                    handleSettingsChange({
                      ...settings,
                      includeExplanations: e.target.checked,
                    })
                  }
                />
                Include Explanations
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.randomizeOrder}
                  onChange={(e) =>
                    handleSettingsChange({
                      ...settings,
                      randomizeOrder: e.target.checked,
                    })
                  }
                />
                Randomize Order
              </label>
            </div>
            <div className="settings-actions">
              <button onClick={() => setShowSettings(false)}>Close</button>
              <button onClick={generateQuestions}>Apply Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AskQuestionsPage;
