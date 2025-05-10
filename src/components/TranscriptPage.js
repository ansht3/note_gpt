import React, { useState, useEffect, useCallback, useRef } from "react";
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
  FaLanguage,
  FaBookmark,
  FaShare,
  FaEllipsisH,
  FaRobot,
  FaBrain,
  FaChartBar,
  FaQuestionCircle,
  FaRegBookmark,
  FaBookmark as FaBookmarkSolid,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBoundary from "./ErrorBoundary";
import api from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
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
    autoTranslate: false,
    showAIInsights: true,
    darkMode: false,
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translationProgress, setTranslationProgress] = useState(0);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const location = useLocation();
  const history = useHistory();
  const { currentLanguage, t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const transcriptRef = useRef(null);

  const fetchTranscript = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams(location.search);
      const videoUrl = params.get("url");

      if (!videoUrl) {
        throw new Error(t("errors.noVideoUrl"));
      }

      const response = await api.videos.getTranscript(videoUrl);
      setTranscript(response.transcript);
      setEditedTranscript(response.transcript);
      setVideoInfo(response.videoInfo);

      // Check if video is bookmarked
      const bookmarkedVideos = JSON.parse(
        localStorage.getItem("bookmarkedVideos") || "[]"
      );
      setIsBookmarked(bookmarkedVideos.includes(videoUrl));

      // Fetch AI insights if enabled
      if (settings.showAIInsights) {
        fetchAIInsights(response.transcript);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [location.search, settings.showAIInsights, t]);

  const fetchAIInsights = async (text) => {
    try {
      const insights = await api.ai.getInsights(text);
      setAIInsights(insights);
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
    }
  };

  useEffect(() => {
    fetchTranscript();
  }, [fetchTranscript]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedTranscript);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError(t("errors.copyFailed"));
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
      setError(t("errors.downloadFailed"));
    }
  };

  const handleSaveEdit = () => {
    setTranscript(editedTranscript);
    setIsEditing(false);
    // Save to history
    const history = JSON.parse(
      localStorage.getItem("transcriptHistory") || "[]"
    );
    history.unshift({
      id: Date.now(),
      title: videoInfo?.title,
      content: editedTranscript,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(
      "transcriptHistory",
      JSON.stringify(history.slice(0, 50))
    );
  };

  const handleGenerateContent = async (type) => {
    try {
      setIsLoading(true);
      const paths = {
        summary: "/summary",
        presentation: "/presentation",
        flashcards: "/flashcards",
        quiz: "/quiz",
        mindmap: "/mindmap",
        notes: "/notes",
      };

      // Pre-process content if needed
      const processedContent = editedTranscript.trim();

      history.push(paths[type], {
        text: processedContent,
        videoInfo,
        settings,
      });
    } catch (err) {
      setError(
        t(
          `errors.generate${type.charAt(0).toUpperCase() + type.slice(1)}Failed`
        )
      );
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

  const toggleBookmark = () => {
    const bookmarkedVideos = JSON.parse(
      localStorage.getItem("bookmarkedVideos") || "[]"
    );
    if (isBookmarked) {
      const newBookmarks = bookmarkedVideos.filter(
        (url) => url !== location.search
      );
      localStorage.setItem("bookmarkedVideos", JSON.stringify(newBookmarks));
    } else {
      bookmarkedVideos.push(location.search);
      localStorage.setItem(
        "bookmarkedVideos",
        JSON.stringify(bookmarkedVideos)
      );
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: videoInfo?.title,
          text: `Check out this transcript: ${videoInfo?.title}`,
          url: window.location.href,
        });
      } else {
        setShowShareModal(true);
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleTranslate = async (targetLanguage) => {
    try {
      setTranslationProgress(0);
      const translatedText = await api.translation.translate(
        editedTranscript,
        targetLanguage
      );
      setEditedTranscript(translatedText);
      setSelectedLanguage(targetLanguage);
      setTranslationProgress(100);
    } catch (err) {
      setError(t("errors.translationFailed"));
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        text={t("loading.processingTranscript")}
        size="large"
        spinnerType="wave"
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className={`transcript-page ${isDarkMode ? "dark-mode" : ""}`}>
        <div className="transcript-header">
          <div className="header-left">
            <button
              className="back-button"
              onClick={() => history.goBack()}
              title={t("actions.goBack")}
            >
              <FaArrowLeft /> {t("actions.back")}
            </button>

            {videoInfo && (
              <div className="video-info">
                <h1>{videoInfo.title}</h1>
                <p className="video-metadata">
                  {videoInfo.author} • {videoInfo.duration}
                </p>
              </div>
            )}
          </div>

          <div className="transcript-actions">
            <button
              className="action-button"
              onClick={() => setIsEditing(!isEditing)}
              title={
                isEditing
                  ? t("actions.saveChanges")
                  : t("actions.editTranscript")
              }
            >
              {isEditing ? <FaRegSave /> : <FaRegEdit />}
              {isEditing ? t("actions.save") : t("actions.edit")}
            </button>
            <button
              className={`action-button ${copySuccess ? "success" : ""}`}
              onClick={handleCopy}
              title={t("actions.copyToClipboard")}
            >
              {copySuccess ? <FaCheck /> : <FaRegCopy />}
              {copySuccess ? t("actions.copied") : t("actions.copy")}
            </button>
            <button
              className="action-button"
              onClick={handleDownload}
              title={t("actions.downloadTranscript")}
            >
              <FaDownload />
              {t("actions.download")}
            </button>
            <button
              className="action-button"
              onClick={toggleBookmark}
              title={t("actions.bookmark")}
            >
              {isBookmarked ? <FaBookmarkSolid /> : <FaRegBookmark />}
              {t("actions.bookmark")}
            </button>
            <button
              className="action-button"
              onClick={handleShare}
              title={t("actions.share")}
            >
              <FaShare />
              {t("actions.share")}
            </button>
            <button
              className="action-button settings"
              onClick={() => setShowSettings(!showSettings)}
              title={t("actions.settings")}
            >
              <FaCog />
              {t("actions.settings")}
            </button>
            <button
              className="action-button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              title={t("actions.more")}
            >
              <FaEllipsisH />
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
            <button onClick={fetchTranscript} className="retry-button">
              {t("actions.retry")}
            </button>
          </div>
        )}

        <div className="transcript-container">
          <div
            className={`transcript-content ${settings.fontSize} ${settings.lineSpacing}`}
            ref={transcriptRef}
          >
            {isEditing ? (
              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                className="transcript-editor"
                placeholder={t("placeholders.transcriptContent")}
                spellCheck="true"
                aria-label={t("labels.editTranscript")}
              />
            ) : (
              <div className="transcript-text">
                {transcript.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>

          {showAIInsights && aiInsights && (
            <div className="ai-insights-panel">
              <h3>{t("ai.insights")}</h3>
              <div className="insights-content">
                <div className="insight-section">
                  <h4>{t("ai.keyPoints")}</h4>
                  <ul>
                    {aiInsights.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div className="insight-section">
                  <h4>{t("ai.topics")}</h4>
                  <div className="topic-tags">
                    {aiInsights.topics.map((topic, index) => (
                      <span key={index} className="topic-tag">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="generate-options">
          <h2>{t("generate.title")}</h2>
          <div className="options-grid">
            {[
              {
                type: "summary",
                icon: <FaFileAlt />,
                label: t("generate.summary"),
                description: t("generate.summaryDesc"),
              },
              {
                type: "presentation",
                icon: <FaPlay />,
                label: t("generate.presentation"),
                description: t("generate.presentationDesc"),
              },
              {
                type: "flashcards",
                icon: <FaFileAlt />,
                label: t("generate.flashcards"),
                description: t("generate.flashcardsDesc"),
              },
              {
                type: "mindmap",
                icon: <FaBrain />,
                label: t("generate.mindmap"),
                description: t("generate.mindmapDesc"),
              },
              {
                type: "quiz",
                icon: <FaQuestionCircle />,
                label: t("generate.quiz"),
                description: t("generate.quizDesc"),
              },
              {
                type: "notes",
                icon: <FaChartBar />,
                label: t("generate.notes"),
                description: t("generate.notesDesc"),
              },
            ].map(({ type, icon, label, description }) => (
              <button
                key={type}
                className="generate-option"
                onClick={() => handleGenerateContent(type)}
                title={description}
              >
                <div className="option-icon">{icon}</div>
                <div className="option-content">
                  <h3>{label}</h3>
                  <p>{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {showSettings && (
          <div className="settings-modal">
            <div className="settings-content">
              <h2>{t("settings.title")}</h2>
              <div className="settings-group">
                <h3>{t("settings.display")}</h3>
                <div className="setting-item">
                  <label>{t("settings.fontSize")}</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) =>
                      handleSettingsChange({ fontSize: e.target.value })
                    }
                  >
                    <option value="small">{t("settings.small")}</option>
                    <option value="medium">{t("settings.medium")}</option>
                    <option value="large">{t("settings.large")}</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>{t("settings.lineSpacing")}</label>
                  <select
                    value={settings.lineSpacing}
                    onChange={(e) =>
                      handleSettingsChange({ lineSpacing: e.target.value })
                    }
                  >
                    <option value="compact">{t("settings.compact")}</option>
                    <option value="normal">{t("settings.normal")}</option>
                    <option value="spacious">{t("settings.spacious")}</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showTimestamps}
                      onChange={(e) =>
                        handleSettingsChange({
                          showTimestamps: e.target.checked,
                        })
                      }
                    />
                    {t("settings.showTimestamps")}
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.highlightKeywords}
                      onChange={(e) =>
                        handleSettingsChange({
                          highlightKeywords: e.target.checked,
                        })
                      }
                    />
                    {t("settings.highlightKeywords")}
                  </label>
                </div>
              </div>
              <div className="settings-group">
                <h3>{t("settings.language")}</h3>
                <div className="setting-item">
                  <label>{t("settings.translation")}</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleTranslate(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.autoTranslate}
                      onChange={(e) =>
                        handleSettingsChange({
                          autoTranslate: e.target.checked,
                        })
                      }
                    />
                    {t("settings.autoTranslate")}
                  </label>
                </div>
              </div>
              <div className="settings-group">
                <h3>{t("settings.ai")}</h3>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showAIInsights}
                      onChange={(e) =>
                        handleSettingsChange({
                          showAIInsights: e.target.checked,
                        })
                      }
                    />
                    {t("settings.showAIInsights")}
                  </label>
                </div>
              </div>
              <div className="settings-actions">
                <button
                  className="close-button"
                  onClick={() => setShowSettings(false)}
                >
                  {t("actions.close")}
                </button>
              </div>
            </div>
          </div>
        )}

        {showShareModal && (
          <div className="share-modal">
            <div className="share-content">
              <h2>{t("share.title")}</h2>
              <div className="share-options">
                <button onClick={() => handleShare("copy")}>
                  {t("share.copyLink")}
                </button>
                <button onClick={() => handleShare("email")}>
                  {t("share.email")}
                </button>
                <button onClick={() => handleShare("social")}>
                  {t("share.social")}
                </button>
              </div>
              <button
                className="close-button"
                onClick={() => setShowShareModal(false)}
              >
                {t("actions.close")}
              </button>
            </div>
          </div>
        )}

        {showMoreOptions && (
          <div className="more-options-menu">
            <button onClick={() => handleGenerateContent("mindmap")}>
              <FaBrain /> {t("generate.mindmap")}
            </button>
            <button onClick={() => handleGenerateContent("quiz")}>
              <FaQuestionCircle /> {t("generate.quiz")}
            </button>
            <button onClick={() => handleGenerateContent("notes")}>
              <FaChartBar /> {t("generate.notes")}
            </button>
            <button onClick={() => setShowAIInsights(!showAIInsights)}>
              <FaRobot /> {t("ai.toggleInsights")}
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default TranscriptPage;
